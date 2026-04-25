/**
 * migrate.js — Runner automático de migrations
 * Aplica apenas as migrations pendentes na ordem correta.
 * Chamado no startup do servidor (server.js).
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

async function applyFile(client, filePath, label) {
  if (!fs.existsSync(filePath)) return;
  const sql = fs.readFileSync(filePath, 'utf8');
  try {
    await client.query(sql);
    console.log(`✅ ${label}`);
  } catch (err) {
    console.error(`⚠️  ${label}:`, err.message);
  }
}

export async function runMigrations() {
  const client = await pool.connect();
  try {
    // Aplicar schema base e seeds (idempotente — usa IF NOT EXISTS / ON CONFLICT)
    await applyFile(client, path.join(CONFIG_DIR, 'schema.sql'),          'Schema base');
    await applyFile(client, path.join(CONFIG_DIR, 'seeds.sql'),           'Seeds');
    await applyFile(client, path.join(LEGACY_DIR, '003_multi_tenant.sql'), 'Migration 003 — Multi-tenant');

    // Criar tabela de controle se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id         SERIAL PRIMARY KEY,
        filename   TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP  NOT NULL DEFAULT NOW()
      )
    `);

    // Ler arquivos .sql ordenados
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let applied = 0;

    for (const file of files) {
      // Verificar se já foi aplicada
      const check = await client.query(
        'SELECT id FROM migrations_log WHERE filename = $1',
        [file]
      );
      if (check.rows.length > 0) continue;

      // Aplicar migration
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations_log (filename) VALUES ($1)',
          [file]
        );
        console.log(`✅ Migration aplicada: ${file}`);
        applied++;
      } catch (err) {
        console.error(`❌ Erro na migration ${file}:`, err.message);
        // Continua para a próxima — evita travar o servidor por migration antiga com conflito
      }
    }

    if (applied === 0) {
      console.log('✅ Banco atualizado — nenhuma migration pendente');
    } else {
      console.log(`✅ ${applied} migration(s) aplicada(s) com sucesso`);
    }

  } finally {
    client.release();
  }
}
