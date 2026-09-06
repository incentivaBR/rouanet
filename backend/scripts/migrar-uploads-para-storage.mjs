#!/usr/bin/env node
/**
 * Leva para o object storage os documentos que ainda estão no disco.
 *
 * Percorre `donations` procurando receipt_url e mecenato_url no formato
 * antigo (`/uploads/receipts/x.pdf`, `/uploads/mecenato/y.pdf`). Para cada um
 * cujo arquivo exista na pasta local, grava no armazenamento configurado
 * (S3_BUCKET etc.), calcula o SHA-256 e atualiza a linha com a chave nova e
 * o hash. É idempotente: linha já no formato novo é pulada; arquivo que não
 * existe no disco é listado no fim, sem alterar nada.
 *
 * Onde rodar: na máquina que TEM os arquivos. Na Railway isso é o container
 * em execução (`railway ssh`, depois `node scripts/migrar-uploads-para-storage.mjs`),
 * e só faz sentido antes de um deploy — o deploy seguinte apaga o disco.
 *
 * Uso:
 *   node scripts/migrar-uploads-para-storage.mjs           # migra
 *   node scripts/migrar-uploads-para-storage.mjs --so-ver  # lista sem mexer
 *
 * Exige DATABASE_URL (ou DB_*) e a configuração do S3 (ver
 * docs/operacao/armazenamento.md). Com backend local não há o que migrar e o
 * script para.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASTA = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
const SO_VER = process.argv.includes('--so-ver');

const { default: pool } = await import('../config/database.js');
const { configuracaoDoAmbiente, criaArmazenamento, resolveChave } = await import('../src/services/armazenamento.js');

const cfg = configuracaoDoAmbiente();
if (cfg.backend !== 's3') {
  console.error('S3_BUCKET não está definido: o armazenamento é o disco local e não há para onde migrar.');
  process.exit(1);
}
const arm = await criaArmazenamento({ cfg });

const CAMPOS = [
  { url: 'receipt_url',  hash: 'receipt_sha256',  prefixo: 'receipts' },
  { url: 'mecenato_url', hash: 'mecenato_sha256', prefixo: 'mecenato' }
];

const { rows } = await pool.query(
  `SELECT id, receipt_url, mecenato_url FROM donations
    WHERE receipt_url LIKE '/uploads/%' OR mecenato_url LIKE '/uploads/%'
    ORDER BY created_at`
);

let migrados = 0;
const ausentes = [];

for (const d of rows) {
  for (const campo of CAMPOS) {
    const valor = d[campo.url];
    if (!valor || !valor.startsWith('/uploads/')) continue;

    const chaveLegada = resolveChave(valor);            // receipts/x.pdf
    const local = path.join(PASTA, chaveLegada);
    if (!fs.existsSync(local)) { ausentes.push({ id: d.id, campo: campo.url, valor }); continue; }

    const buffer = fs.readFileSync(local);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(local).toLowerCase();
    const mime = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png' : 'image/jpeg';

    if (SO_VER) {
      console.log(`[veria] ${d.id} ${campo.url}: ${valor} → ${chaveLegada} (${buffer.length} bytes)`);
      continue;
    }

    // Mantém o nome do arquivo dentro do prefixo novo, para o hash e a chave
    // ficarem rastreáveis até o original.
    const gravado = await arm.guarda(chaveLegada, buffer, mime);
    await pool.query(
      `UPDATE donations SET ${campo.url} = $1, ${campo.hash} = $2 WHERE id = $3`,
      [gravado.chave, gravado.sha256, d.id]
    );
    migrados++;
    console.log(`[ok] ${d.id} ${campo.url}: ${valor} → ${gravado.chave} sha256=${hash.slice(0, 12)}…`);
  }
}

console.log(`\n${SO_VER ? 'Migraria' : 'Migrados'}: ${migrados}. Sem arquivo no disco: ${ausentes.length}.`);
for (const a of ausentes) console.log(`  [ausente] ${a.id} ${a.campo}: ${a.valor}`);
if (ausentes.length) {
  console.log('\nLinhas "ausentes" apontam para arquivos que já se perderam em deploys anteriores.');
  console.log('Não há como recuperá-los daqui; o destinador precisa reenviar o comprovante.');
}

await pool.end();
