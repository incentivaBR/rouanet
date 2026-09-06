/**
 * migrate.js — Runner de migrations, chamado na subida do servidor.
 *
 * Três regras, todas vindas do Raio-X de set/2026 (risco 08):
 *
 *   1. schema.sql, seeds.sql e a migration legada 003 só rodam em BANCO VAZIO.
 *      Antes rodavam em todo boot: o schema recriava tabelas que a migration
 *      014 tinha apagado, e o seed recriava um usuário de teste a cada deploy.
 *      Um banco que já tem `migrations_log` ou `users` está inicializado.
 *
 *   2. Cada migration roda numa TRANSAÇÃO própria, com o registro no
 *      `migrations_log` dentro da mesma transação. Ou o arquivo inteiro entra
 *      e fica registrado, ou nada entra. Nunca meia migration.
 *
 *   3. Migration que falha ABORTA a subida. Antes virava uma linha de log que
 *      ninguém lia, e o servidor subia com o banco diferente do que o código
 *      supõe. Na Railway, abortar é o comportamento seguro: o healthcheck não
 *      passa, o deploy é descartado e a versão anterior continua no ar.
 *
 * Os caminhos podem ser injetados para teste (ver tests/migracoes.test.mjs).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CONFIG_DIR     = __dirname;
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const LEGACY_DIR     = path.join(__dirname, '../../migrations');

/** Erro de migration: carrega o nome do arquivo para o log de boot dizer qual. */
export class ErroDeMigracao extends Error {
  constructor(arquivo, causa) {
    super(`migration ${arquivo}: ${causa.message}`);
    this.name = 'ErroDeMigracao';
    this.arquivo = arquivo;
    this.causa = causa;
  }
}

async function existeTabela(client, nome) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1 LIMIT 1`,
    [nome]
  );
  return rows.length > 0;
}

/**
 * Roda um SQL dentro de BEGIN/COMMIT. Em erro, ROLLBACK e relança com o nome
 * do arquivo. `registrar`, se dado, é executado na mesma transação — é o
 * INSERT no migrations_log, que assim só existe se a migration entrou.
 */
async function aplicaEmTransacao(client, sql, rotulo, registrar) {
  await client.query('BEGIN');
  try {
    await client.query(sql);
    if (registrar) await registrar();
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK').catch(() => {});
    throw new ErroDeMigracao(rotulo, erro);
  }
}

function leArquivo(caminho) {
  return fs.existsSync(caminho) ? fs.readFileSync(caminho, 'utf8') : null;
}

/**
 * O que já foi aplicado e o que ficou para trás.
 *
 * Depois de um boot bem-sucedido, `pendentes` tem que estar vazia — o runner
 * aborta antes de subir se algo falhou. Se aparecer nome aqui, o processo
 * subiu com PERMITE_BOOT_SEM_MIGRACOES=true e o banco está diferente do que o
 * código espera.
 */
export async function statusDasMigracoes({ migrationsDir = MIGRATIONS_DIR, db = pool } = {}) {
  const naPasta = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    : [];

  const { rows } = await db.query('SELECT filename FROM migrations_log');
  const aplicadas = new Set(rows.map(r => r.filename));

  return {
    total: naPasta.length,
    aplicadas: naPasta.filter(f => aplicadas.has(f)).length,
    ultima: naPasta.filter(f => aplicadas.has(f)).pop() || null,
    pendentes: naPasta.filter(f => !aplicadas.has(f))
  };
}

/**
 * @returns {Promise<{bootstrap: boolean, aplicadas: string[]}>}
 * @throws {ErroDeMigracao} na primeira migration que falhar
 */
export async function runMigrations({
  migrationsDir = MIGRATIONS_DIR,
  configDir     = CONFIG_DIR,
  legacyDir     = LEGACY_DIR,
  db            = pool,
  log           = console
} = {}) {
  const client = await db.connect();
  const aplicadas = [];
  let bootstrap = false;

  try {
    // 1. Banco vazio? Só então o schema base, o seed e a 003 legada entram.
    const inicializado = (await existeTabela(client, 'migrations_log'))
                      || (await existeTabela(client, 'users'));

    if (!inicializado) {
      bootstrap = true;
      for (const [arquivo, rotulo] of [
        [path.join(configDir, 'schema.sql'),             'schema.sql'],
        [path.join(configDir, 'seeds.sql'),              'seeds.sql'],
        [path.join(legacyDir, '003_multi_tenant.sql'),   '003_multi_tenant.sql (legada)']
      ]) {
        const sql = leArquivo(arquivo);
        if (sql === null) continue;
        await aplicaEmTransacao(client, sql, rotulo);
        log.log(`✅ Banco vazio — ${rotulo} aplicado`);
      }
    } else {
      log.log('ℹ️  Banco já inicializado — schema base e seeds não rodam de novo');
    }

    // 2. Tabela de controle
    if (!(await existeTabela(client, 'migrations_log'))) {
      await client.query(`
        CREATE TABLE migrations_log (
          id         SERIAL PRIMARY KEY,
          filename   TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMP  NOT NULL DEFAULT NOW()
        )
      `);
    }

    const { rows } = await client.query('SELECT filename FROM migrations_log');
    const jaAplicadas = new Set(rows.map(r => r.filename));

    // 3. Uma transação por arquivo, em ordem; a primeira falha interrompe.
    const arquivos = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const arquivo of arquivos) {
      if (jaAplicadas.has(arquivo)) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, arquivo), 'utf8');
      await aplicaEmTransacao(client, sql, arquivo, () =>
        client.query('INSERT INTO migrations_log (filename) VALUES ($1)', [arquivo])
      );
      aplicadas.push(arquivo);
      log.log(`✅ Migration aplicada: ${arquivo}`);
    }

    log.log(aplicadas.length === 0
      ? '✅ Banco atualizado — nenhuma migration pendente'
      : `✅ ${aplicadas.length} migration(s) aplicada(s) com sucesso`);

    return { bootstrap, aplicadas };
  } finally {
    client.release();
  }
}
