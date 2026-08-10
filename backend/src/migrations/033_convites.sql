-- 033 — Convites de acesso a uma organização
--
-- Até aqui, criar um cliente e criar quem opera esse cliente eram coisas
-- separadas por um abismo: o cadastro público insere sempre `member`, e nenhum
-- ponto do sistema criava `org_admin`. Uma organização nova nascia com PRONAC,
-- conta de captação e nenhuma pessoa capaz de abrir a fila de conferência. O
-- dinheiro entrava e travava ali.
--
-- Este convite é o que liga as duas pontas — e é diferente do token de
-- confirmação de interessado, porque não confirma um e-mail: ele entrega o
-- poder de confirmar movimentação de dinheiro de terceiros.
--
-- Daí três decisões:
--
--   1. Guarda-se o HASH do token, nunca o token. Quem lê o banco não consegue
--      aceitar convite nenhum. O valor em claro existe só no e-mail enviado.
--   2. Prazo curto e uso único. Um convite esquecido numa caixa de entrada é
--      uma porta aberta para o papel mais poderoso da organização.
--   3. Trilha completa: quem convidou, quando, quem aceitou, de onde. Se uma
--      destinação for confirmada indevidamente, é a primeira pergunta.

CREATE TABLE IF NOT EXISTS org_invites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  nome            TEXT,
  role            TEXT NOT NULL DEFAULT 'org_admin'
                  CHECK (role IN ('org_admin', 'org_viewer', 'member')),

  -- SHA-256 do token. O valor em claro só existe no e-mail do convidado.
  token_hash      TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMP NOT NULL,

  invited_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

  accepted_at     TIMESTAMP,
  accepted_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_ip     TEXT,

  revoked_at      TIMESTAMP,
  revoked_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_convites_org   ON org_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_convites_hash  ON org_invites(token_hash);

-- Um convite pendente por e-mail e organização. Sem isto, reenviar o convite
-- cria uma segunda porta válida, e revogar a primeira não fecha a segunda.
CREATE UNIQUE INDEX IF NOT EXISTS idx_convite_pendente_unico
  ON org_invites (organization_id, LOWER(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
