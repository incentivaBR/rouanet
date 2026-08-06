-- 027 — Cadastro de interessados, em conformidade com a LGPD
--
-- POR QUE UMA TABELA SEPARADA DE users
--
-- Quem se cadastra para receber comunicação não é usuário da plataforma: não
-- tem senha, não destinou nada, não tem CPF conosco. Guardar essa pessoa em
-- `users` obrigaria a criar registro com CPF e hash de senha falsos, e a base
-- de titulares ficaria misturada — o oposto do art. 6º III da LGPD
-- (necessidade: tratamento limitado ao mínimo necessário para a finalidade).
--
-- Aqui o mínimo é o e-mail. Nome é opcional. Telefone só entra se a pessoa
-- pedir WhatsApp. CPF NÃO é coletado: ninguém precisa de CPF para receber um
-- aviso de prazo do IR.
--
-- BASE LEGAL: consentimento (art. 7º I), livre, informado e inequívoco
-- (art. 5º XII), para finalidade específica (art. 8º §4º). Consentimento
-- genérico é nulo — por isso o consentimento é por canal e por finalidade, e
-- não uma caixinha única de "aceito tudo".
--
-- PROVA: o ônus de provar o consentimento é do controlador (art. 8º §2º).
-- Guardar um booleano `aceitou = true` não prova nada. Guardamos o TEXTO EXATO
-- exibido, a versão da política vigente naquele dia, o IP, o user-agent e o
-- carimbo de tempo — e num log imutável, não só no estado atual, porque o
-- estado atual não conta a história.
--
-- REVOGAÇÃO: art. 8º §5º — a revogação deve ser tão fácil quanto o
-- consentimento. Por isso todo e-mail carrega um link de descadastro que
-- funciona em um clique, sem login e sem formulário.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Interessados
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sempre em minúsculas, e é o banco que garante. Um índice único sobre
  -- LOWER(email) resolveria a duplicidade, mas obrigaria ON CONFLICT sobre
  -- expressão; com CHECK, a chave é uma coluna comum e qualquer caminho de
  -- código que esqueça o toLowerCase falha alto em vez de criar duplicata.
  email                  TEXT        NOT NULL UNIQUE
                                     CHECK (email = LOWER(email)),
  nome                   TEXT,
  phone                  TEXT,

  -- Qual white label capturou. Permite que a Casa Azul fale com quem se
  -- cadastrou pela Casa Azul, sem acesso à base de outra organização.
  organization_id        UUID        REFERENCES organizations(id) ON DELETE SET NULL,

  -- Segmentação declarada pela própria pessoa, opcional. Não é dado sensível:
  -- órgão de lotação não revela origem racial, convicção, saúde etc.
  orgao                  TEXT,

  -- ── Consentimento granular (art. 8º §4º) ────────────────────────────────
  -- Cada finalidade é uma decisão separada. Marcar uma não marca a outra.
  consent_prazos         BOOLEAN     NOT NULL DEFAULT FALSE,  -- avisos de prazo do IR
  consent_projetos       BOOLEAN     NOT NULL DEFAULT FALSE,  -- novos projetos aprovados
  consent_whatsapp       BOOLEAN     NOT NULL DEFAULT FALSE,  -- mesmo conteúdo, outro canal

  -- ── Prova do consentimento (art. 8º §2º) ────────────────────────────────
  consent_text           TEXT,        -- o texto exatamente como foi exibido
  consent_policy_version TEXT,        -- versão da Política vigente naquele dia
  consent_ip             INET,        -- real: o app roda com trust proxy
  consent_user_agent     TEXT,
  consent_at             TIMESTAMP,

  -- ── Duplo opt-in ────────────────────────────────────────────────────────
  -- Sem confirmação por e-mail, qualquer um cadastra o endereço de outra
  -- pessoa. O cadastro só vale depois do clique: até lá não recebe nada.
  confirm_token          TEXT,
  confirm_token_expires  TIMESTAMP,
  confirmed_at           TIMESTAMP,

  -- ── Revogação e direitos do titular ─────────────────────────────────────
  -- Token permanente: é a credencial do link de um clique que vai em todo
  -- e-mail. Também autentica a consulta e a exclusão pelo art. 18 sem exigir
  -- que a pessoa crie conta só para exercer um direito.
  access_token           TEXT        NOT NULL,
  revoked_at             TIMESTAMP,
  revoke_reason          TEXT,

  -- ── Retenção ────────────────────────────────────────────────────────────
  -- Quem nunca destinou não gera obrigação fiscal de guarda. O prazo de 5 anos
  -- da legislação tributária não se aplica a ele: manter esse dado indefinido
  -- seria conservação além do necessário (art. 15 e art. 16 da LGPD).
  last_interaction_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  anonymized_at          TIMESTAMP,

  created_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_access_token
  ON subscribers (access_token);

CREATE INDEX IF NOT EXISTS idx_subscribers_confirm_token
  ON subscribers (confirm_token) WHERE confirm_token IS NOT NULL;

-- Quem realmente pode receber comunicação agora: confirmou, não revogou, não
-- foi anonimizado. Qualquer rotina de envio deve partir deste índice.
CREATE INDEX IF NOT EXISTS idx_subscribers_ativos
  ON subscribers (organization_id)
  WHERE confirmed_at IS NOT NULL AND revoked_at IS NULL AND anonymized_at IS NULL;

-- Candidatos ao expurgo por inatividade.
CREATE INDEX IF NOT EXISTS idx_subscribers_retencao
  ON subscribers (last_interaction_at)
  WHERE anonymized_at IS NULL;

COMMENT ON TABLE subscribers IS
  'Interessados em receber comunicação. Base legal: consentimento (LGPD art. 7º I). Separada de users por minimização (art. 6º III) — não coleta CPF nem senha.';
COMMENT ON COLUMN subscribers.access_token IS
  'Credencial do link de um clique. Torna a revogação tão fácil quanto o consentimento (art. 8º §5º) e viabiliza os direitos do art. 18 sem exigir criação de conta.';
COMMENT ON COLUMN subscribers.consent_text IS
  'Texto exatamente como exibido no momento do aceite. O ônus da prova do consentimento é do controlador (art. 8º §2º) — booleano não prova.';

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Log imutável de consentimento
--
-- O estado atual diz o que vale hoje. Ele não diz que a pessoa consentiu em
-- março, revogou em maio e voltou em agosto — e é exatamente isso que uma
-- fiscalização da ANPD pergunta. Só se insere aqui; nunca se atualiza.
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriber_consent_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id   UUID        NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,

  -- granted | confirmed | revoked | updated | anonymized | exported
  evento          TEXT        NOT NULL,

  -- Fotografia do consentimento no instante do evento.
  consent_prazos   BOOLEAN,
  consent_projetos BOOLEAN,
  consent_whatsapp BOOLEAN,

  consent_text           TEXT,
  consent_policy_version TEXT,
  ip                     INET,
  user_agent             TEXT,
  detalhe                TEXT,

  created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_subscriber
  ON subscriber_consent_log (subscriber_id, created_at DESC);

COMMENT ON TABLE subscriber_consent_log IS
  'Histórico imutável de consentimento. Apenas INSERT. O estado atual não demonstra a trajetória, e é a trajetória que se prova perante a ANPD.';
