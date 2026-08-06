// Exercita as rotas de conferencia por HTTP, contra o Express de verdade.
//
// Os outros testes checam SQL. Este checa o que o cliente recebe: codigos de
// status, permissao, e a ordem de declaracao das rotas — /conferencia tem que
// ser fila, nao um identificador capturado por /:id.
//
// O banco e o pg-mem, injetado no lugar do pool via um adaptador minimo. Nao
// substitui o Postgres real, mas roda em qualquer maquina, sem servico.
import { newDb } from 'pg-mem';
import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';

process.env.JWT_SECRET = 'teste';
process.env.NODE_ENV = 'test';

// ── banco em memoria ───────────────────────────────────────────────────────
const db = newDb();
db.public.registerFunction({
  name: 'gen_random_uuid', returns: 'uuid', impure: true,
  implementation: () => crypto.randomUUID()
});

db.public.none(`
  CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT, slug TEXT, contact_email TEXT, contact_whatsapp TEXT,
    contact_person TEXT, mecenato_prazo_dias INT DEFAULT 10,
    primary_color TEXT, secondary_color TEXT, logo_url TEXT
  );
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT, cpf TEXT, email TEXT, phone TEXT
  );
  CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID, user_id UUID, role TEXT, is_active BOOLEAN DEFAULT true
  );
  CREATE TABLE official_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT, name TEXT
  );
  CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, organization_id UUID, official_fund_id UUID,
    donation_amount NUMERIC, ir_total NUMERIC, fiscal_year INT,
    pronac TEXT, projeto_titulo TEXT, status TEXT DEFAULT 'pending',
    receipt_url TEXT, receipt_filename TEXT, receipt_file_path TEXT,
    confirmed_at TIMESTAMP, proponente_notified_at TIMESTAMP,
    mecenato_url TEXT, mecenato_issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ALTER TABLE donations
    ADD COLUMN confirmed_by UUID,
    ADD COLUMN confirmation_note TEXT,
    ADD COLUMN rejected_at TIMESTAMP,
    ADD COLUMN rejected_by UUID,
    ADD COLUMN rejection_reason TEXT;
`);

const pgMem = db.adapters.createPg();
const poolFalso = new pgMem.Pool();

// ── injeta o pool falso antes que as rotas carreguem o de verdade ─────────
const { default: poolReal } = await import('../config/database.js');
poolReal.query = (...a) => poolFalso.query(...a);
poolReal.connect = async () => ({ query: (...a) => poolFalso.query(...a), release() {} });

const { default: donationsRoutes } = await import('../src/routes/donations.js');

// ── dados ──────────────────────────────────────────────────────────────────
const q = async (sql) => (await poolFalso.query(sql)).rows;
const [{ id: orgId }] = await q(
  `INSERT INTO organizations (name, slug, contact_email) VALUES ('Casa Azul','casa-azul','x@y.org') RETURNING id`);
const [{ id: destinadorId }] = await q(
  `INSERT INTO users (nome, cpf, email) VALUES ('Maria','12345678901','m@x.gov.br') RETURNING id`);
const [{ id: gestorId }] = await q(
  `INSERT INTO users (nome, email) VALUES ('Gestor','g@casaazul.org') RETURNING id`);
const [{ id: estranhoId }] = await q(
  `INSERT INTO users (nome, email) VALUES ('Estranho','e@outro.org') RETURNING id`);
await q(`INSERT INTO organization_users (organization_id, user_id, role, is_active)
         VALUES ('${orgId}','${gestorId}','org_admin', true)`);

const novaDestinacao = async (status = 'awaiting_confirmation') => (await q(
  `INSERT INTO donations (user_id, organization_id, donation_amount, ir_total, fiscal_year,
                          pronac, projeto_titulo, status, receipt_url, receipt_filename)
   VALUES ('${destinadorId}','${orgId}',3200,208342,2026,'2511274','Mostra Casa Azul',
           '${status}','/uploads/receipts/x.pdf','comprovante.pdf') RETURNING id`))[0].id;

const tokenDe = (userId, extra = {}) =>
  jwt.sign({ userId, orgId, ...extra }, 'teste', { expiresIn: '1h' });

// ── servidor ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.organization = { id: orgId }; next(); });
app.use('/api/donations', donationsRoutes);
const servidor = http.createServer(app);
await new Promise(r => servidor.listen(0, r));
const base = `http://127.0.0.1:${servidor.address().port}`;

const chamar = async (metodo, caminho, token, corpo) => {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  return { status: r.status, corpo: await r.json().catch(() => ({})) };
};

// ── casos ──────────────────────────────────────────────────────────────────
const ok = [], falhas = [];
const teste = async (nome, fn) => {
  try { await fn(); ok.push(nome); }
  catch (e) { falhas.push([nome, e.message]); }
};
const igual = (a, b, o) => { if (a !== b) throw new Error(`${o}: esperado ${b}, veio ${a}`); };

const tokenGestor = tokenDe(gestorId);
const tokenEstranho = tokenDe(estranhoId);
const tokenDestinador = tokenDe(destinadorId);

await teste('/conferencia e fila, nao capturada por /:id', async () => {
  const r = await chamar('GET', '/api/donations/conferencia', tokenGestor);
  igual(r.status, 200, 'status');
  if (!Array.isArray(r.corpo.aguardando)) throw new Error('sem lista — /:id capturou a rota');
});

await teste('sem token -> 401', async () => {
  const r = await chamar('GET', '/api/donations/conferencia', null);
  igual(r.status, 401, 'status');
});

await teste('quem nao administra a org -> 403', async () => {
  const r = await chamar('GET', '/api/donations/conferencia', tokenEstranho);
  igual(r.status, 403, 'status');
});

await teste('o proprio destinador nao confere a si mesmo -> 403', async () => {
  const id = await novaDestinacao();
  const r = await chamar('POST', `/api/donations/${id}/confirmar`, tokenDestinador);
  igual(r.status, 403, 'status');
});

await teste('fila traz CPF e valor para comparar com o extrato', async () => {
  await novaDestinacao();
  const r = await chamar('GET', '/api/donations/conferencia', tokenGestor);
  const item = r.corpo.aguardando[0];
  if (!item.cpf) throw new Error('sem CPF');
  if (!item.donation_amount) throw new Error('sem valor');
  if (!item.comprovante_url?.includes('/api/uploads/receipt/'))
    throw new Error('comprovante nao vem por caminho autenticado: ' + item.comprovante_url);
});

await teste('confirma e devolve a destinacao', async () => {
  const id = await novaDestinacao();
  const r = await chamar('POST', `/api/donations/${id}/confirmar`, tokenGestor, { observacao: 'conferido' });
  igual(r.status, 200, 'status');
  if (!r.corpo.donation?.confirmed_at) throw new Error('sem confirmed_at');
  const [d] = await q(`SELECT status, confirmed_by FROM donations WHERE id='${id}'`);
  if (!['confirmed', 'awaiting_mecenato'].includes(d.status))
    throw new Error('estado final inesperado: ' + d.status);
  if (d.confirmed_by !== gestorId) throw new Error('nao registrou quem confirmou');
});

await teste('confirmar duas vezes responde ja_confirmada, sem reprocessar', async () => {
  const id = await novaDestinacao();
  await chamar('POST', `/api/donations/${id}/confirmar`, tokenGestor);
  const r = await chamar('POST', `/api/donations/${id}/confirmar`, tokenGestor);
  igual(r.status, 200, 'status');
  igual(r.corpo.ja_confirmada, true, 'ja_confirmada');
});

await teste('recusa sem motivo -> 400', async () => {
  const id = await novaDestinacao();
  const r = await chamar('POST', `/api/donations/${id}/recusar`, tokenGestor, { motivo: 'nao' });
  igual(r.status, 400, 'status');
});

await teste('recusa devolve para pending com o motivo guardado', async () => {
  const id = await novaDestinacao();
  const r = await chamar('POST', `/api/donations/${id}/recusar`, tokenGestor,
    { motivo: 'O valor do comprovante nao confere com o declarado' });
  igual(r.status, 200, 'status');
  const [d] = await q(`SELECT status, rejection_reason, receipt_url FROM donations WHERE id='${id}'`);
  igual(d.status, 'pending', 'status no banco');
  if (!d.rejection_reason) throw new Error('motivo nao guardado');
  if (d.receipt_url !== null) throw new Error('comprovante recusado continuou anexado');
});

await teste('nao recusa o que ja foi confirmado -> 409', async () => {
  const id = await novaDestinacao();
  await chamar('POST', `/api/donations/${id}/confirmar`, tokenGestor);
  const r = await chamar('POST', `/api/donations/${id}/recusar`, tokenGestor,
    { motivo: 'mudei de ideia depois de confirmar' });
  igual(r.status, 409, 'status');
});

await teste('id invalido -> 400', async () => {
  const r = await chamar('POST', '/api/donations/nao-e-uuid/confirmar', tokenGestor);
  igual(r.status, 400, 'status');
});

await teste('destinacao inexistente -> 404', async () => {
  const r = await chamar('POST', '/api/donations/11111111-2222-3333-4444-555555555555/confirmar', tokenGestor);
  igual(r.status, 404, 'status');
});

await teste('a listagem do destinador mostra o motivo da recusa', async () => {
  const id = await novaDestinacao();
  await chamar('POST', `/api/donations/${id}/recusar`, tokenGestor,
    { motivo: 'Comprovante ilegivel — reenvie em PDF' });
  const r = await chamar('GET', '/api/donations?limit=50', tokenDestinador);
  igual(r.status, 200, 'status');
  const alvo = (r.corpo.donations || []).find(d => d.id === id);
  if (!alvo) throw new Error('destinacao nao apareceu na listagem');
  if (!alvo.recusa?.motivo)
    throw new Error('sem o motivo: a devolucao seria invisivel para quem transferiu');
});

servidor.close();

console.log('\n' + '='.repeat(64));
ok.forEach(n => console.log('  ok    ' + n));
falhas.forEach(([n, m]) => console.log('  FALHA ' + n + '\n          ' + m));
console.log('='.repeat(64));
console.log(`${ok.length} passaram, ${falhas.length} falharam`);
process.exit(falhas.length ? 1 : 0);
