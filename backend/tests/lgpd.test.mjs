// Exercita a migracao 027 e as consultas das rotas contra um Postgres em
// memoria. Nao substitui o banco real, mas pega erro de sintaxe, coluna
// inexistente e logica de UPDATE errada — que e o que quebraria no deploy.
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const db = newDb();

// Dependencias minimas que a 027 referencia.
db.public.registerFunction({
  name: 'gen_random_uuid', returns: 'uuid', impure: true,
  implementation: () => crypto.randomUUID()
});

db.public.none(`
  CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
  );
`);

const sql = fs.readFileSync(
  path.join(AQUI, '../src/migrations/027_interessados_lgpd.sql'), 'utf8'
);

// pg-mem nao implementa COMMENT ON nem tipo INET; trocamos por TEXT so para
// este teste. O que importa validar aqui e a estrutura e as consultas.
const sqlAdaptado = sql
  .replace(/^COMMENT ON[\s\S]*?;$/gm, '')
  .replace(/\bINET\b/g, 'TEXT');

let ok = [], falhas = [];
const passo = (nome, fn) => {
  try { const r = fn(); ok.push(nome); return r; }
  catch (e) { falhas.push([nome, e.message]); return null; }
};

passo('migracao 027 aplica', () => db.public.none(sqlAdaptado));

const orgId = passo('org de teste', () =>
  db.public.many(`INSERT INTO organizations (name) VALUES ('Casa Azul') RETURNING id`)[0].id);

// ── INSERT do cadastro, com todas as colunas que a rota usa ────────────────
const tok = 'tok-acesso-1', conf = 'tok-confirma-1';
passo('INSERT de cadastro (colunas da rota)', () => db.public.none(`
  INSERT INTO subscribers
    (email, nome, phone, organization_id, orgao,
     consent_prazos, consent_projetos, consent_whatsapp,
     consent_text, consent_policy_version, consent_ip, consent_user_agent, consent_at,
     confirm_token, confirm_token_expires, access_token, last_interaction_at)
  VALUES ('maria@exemplo.gov.br','Maria',NULL,'${orgId}','SEEC',
          true,false,false,'texto do aceite','2026-08','200.1.2.3','Mozilla/5.0',NOW(),
          '${conf}', (NOW() + INTERVAL '7 days')::timestamp, '${tok}', NOW())
`));

passo('CHECK rejeita e-mail com maiuscula', () => {
  try {
    db.public.none(`INSERT INTO subscribers (email, access_token) VALUES ('MAIUSCULA@x.com','t2')`);
    throw new Error('DEVERIA TER FALHADO — o CHECK nao pegou');
  } catch (e) {
    if (/DEVERIA/.test(e.message)) throw e;
    return true; // rejeitou, como esperado
  }
});

passo('UNIQUE rejeita e-mail duplicado', () => {
  try {
    db.public.none(`INSERT INTO subscribers (email, access_token) VALUES ('maria@exemplo.gov.br','t3')`);
    throw new Error('DEVERIA TER FALHADO — duplicata aceita');
  } catch (e) {
    if (/DEVERIA/.test(e.message)) throw e;
    return true;
  }
});

// ── SELECT do POST (checa existencia) ──────────────────────────────────────
passo('SELECT por e-mail (rota POST)', () => {
  const r = db.public.many(
    `SELECT id, confirmed_at, access_token FROM subscribers WHERE email = 'maria@exemplo.gov.br'`);
  if (r.length !== 1) throw new Error('esperava 1 linha, veio ' + r.length);
  if (r[0].confirmed_at) throw new Error('nao deveria estar confirmado ainda');
});

// ── log de consentimento ───────────────────────────────────────────────────
passo('INSERT no log de consentimento', () => {
  const id = db.public.many(`SELECT id FROM subscribers WHERE email='maria@exemplo.gov.br'`)[0].id;
  db.public.none(`
    INSERT INTO subscriber_consent_log
      (subscriber_id, evento, consent_prazos, consent_projetos, consent_whatsapp,
       consent_text, consent_policy_version, ip, user_agent, detalhe)
    VALUES ('${id}','granted',true,false,false,'texto','2026-08','200.1.2.3','UA',NULL)`);
});

// ── confirmacao (duplo opt-in) ─────────────────────────────────────────────
passo('UPDATE de confirmacao com token valido', () => {
  const r = db.public.many(`
    UPDATE subscribers
       SET confirmed_at = COALESCE(confirmed_at, NOW()),
           confirm_token = NULL, confirm_token_expires = NULL, revoked_at = NULL,
           last_interaction_at = NOW(), updated_at = NOW()
     WHERE confirm_token = '${conf}' AND confirm_token_expires > NOW()::timestamp
     RETURNING id, email, nome, access_token, consent_prazos, consent_projetos, consent_whatsapp`);
  if (r.length !== 1) throw new Error('token valido nao confirmou');
});

passo('confirmar de novo nao acha (token ja consumido)', () => {
  const r = db.public.many(`
    UPDATE subscribers SET confirmed_at = NOW()
     WHERE confirm_token = '${conf}' AND confirm_token_expires > NOW()::timestamp RETURNING id`);
  if (r.length !== 0) throw new Error('token reutilizavel!');
});

// ── revogacao ──────────────────────────────────────────────────────────────
passo('UPDATE de revogacao por access_token', () => {
  const r = db.public.many(`
    UPDATE subscribers
       SET revoked_at = NOW(), revoke_reason = 'teste',
           consent_prazos = FALSE, consent_projetos = FALSE, consent_whatsapp = FALSE,
           last_interaction_at = NOW(), updated_at = NOW()
     WHERE access_token = '${tok}' AND anonymized_at IS NULL
     RETURNING id, email`);
  if (r.length !== 1) throw new Error('revogacao nao encontrou a linha');
});

// ── PATCH: desmarcar tudo equivale a revogar ───────────────────────────────
passo('PATCH com tudo desmarcado marca revoked_at', () => {
  const r = db.public.many(`
    UPDATE subscribers
       SET consent_prazos = false, consent_projetos = false, consent_whatsapp = false,
           revoked_at = CASE WHEN false OR false THEN NULL ELSE NOW() END,
           last_interaction_at = NOW(), updated_at = NOW()
     WHERE access_token = '${tok}' AND anonymized_at IS NULL
     RETURNING id, revoked_at`);
  if (!r[0]?.revoked_at) throw new Error('deveria ter revogado');
});

passo('PATCH com uma finalidade marcada limpa revoked_at', () => {
  const r = db.public.many(`
    UPDATE subscribers
       SET consent_prazos = true, consent_projetos = false, consent_whatsapp = false,
           revoked_at = CASE WHEN true OR false THEN NULL ELSE NOW() END,
           last_interaction_at = NOW(), updated_at = NOW()
     WHERE access_token = '${tok}' AND anonymized_at IS NULL
     RETURNING id, revoked_at`);
  if (r[0]?.revoked_at) throw new Error('deveria ter reativado');
});

// ── exportacao (art. 18) ───────────────────────────────────────────────────
passo('SELECT de meus-dados com JOIN na organizacao', () => {
  const r = db.public.many(`
    SELECT s.id, s.email, s.nome, s.phone, s.orgao,
           s.consent_prazos, s.consent_projetos, s.consent_whatsapp,
           s.consent_text, s.consent_policy_version, s.consent_at,
           s.confirmed_at, s.revoked_at, s.created_at, s.last_interaction_at,
           o.name AS organizacao
      FROM subscribers s
      LEFT JOIN organizations o ON o.id = s.organization_id
     WHERE s.access_token = '${tok}' AND s.anonymized_at IS NULL`);
  if (r.length !== 1) throw new Error('nao achou');
  if (r[0].organizacao !== 'Casa Azul') throw new Error('JOIN nao trouxe a org: ' + r[0].organizacao);
});

passo('SELECT do historico do log', () => {
  const id = db.public.many(`SELECT id FROM subscribers WHERE email='maria@exemplo.gov.br'`)[0].id;
  const r = db.public.many(`
    SELECT evento, consent_prazos, consent_projetos, consent_whatsapp,
           consent_policy_version, created_at
      FROM subscriber_consent_log WHERE subscriber_id = '${id}' ORDER BY created_at`);
  if (r.length < 1) throw new Error('historico vazio');
});

// ── eliminacao (art. 18 VI) ────────────────────────────────────────────────
passo('DELETE anonimiza e some das buscas', () => {
  const r = db.public.many(`
    UPDATE subscribers
       SET email = 'anonimizado+' || id || '@invalido.local',
           nome = NULL, phone = NULL, orgao = NULL,
           consent_prazos = FALSE, consent_projetos = FALSE, consent_whatsapp = FALSE,
           consent_ip = NULL, consent_user_agent = NULL, consent_text = NULL,
           access_token = 'anonimizado-' || id,
           confirm_token = NULL, revoked_at = COALESCE(revoked_at, NOW()),
           anonymized_at = NOW(), updated_at = NOW()
     WHERE access_token = '${tok}' AND anonymized_at IS NULL
     RETURNING id`);
  if (r.length !== 1) throw new Error('nao anonimizou');

  const restou = db.public.many(
    `SELECT id FROM subscribers WHERE email = 'maria@exemplo.gov.br'`);
  if (restou.length !== 0) throw new Error('e-mail original ainda encontravel apos eliminacao');

  const porToken = db.public.many(
    `SELECT id FROM subscribers WHERE access_token = '${tok}'`);
  if (porToken.length !== 0) throw new Error('token antigo ainda funciona apos eliminacao');
});

passo('log sobrevive a anonimizacao (prova do atendimento)', () => {
  const r = db.public.many(`SELECT COUNT(*)::int AS n FROM subscriber_consent_log`);
  if (r[0].n < 1) throw new Error('log foi apagado junto — prova perdida');
});

console.log('\n' + '='.repeat(62));
ok.forEach(n => console.log('  ok    ' + n));
falhas.forEach(([n, m]) => console.log('  FALHA ' + n + '\n          ' + m));
console.log('='.repeat(62));
console.log(`${ok.length} passaram, ${falhas.length} falharam`);
process.exit(falhas.length ? 1 : 0);
