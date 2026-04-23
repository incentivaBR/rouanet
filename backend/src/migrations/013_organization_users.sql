-- Migration 013: Vínculo usuário ↔ organização
-- Data: 2026-04-21
-- Garante isolamento multi-tenant e controle de acesso por org

-- ─────────────────────────────────────────────────────────────
-- 1. Vínculo direto do usuário com sua organização principal
--    Permite saber de qual tenant o usuário pertence.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Usuários existentes sem org → vincular à org padrão (www)
UPDATE users
  SET organization_id = (SELECT id FROM organizations WHERE slug = 'www')
WHERE organization_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Tabela organization_users — vínculo many-to-many com papel
--    Um usuário pode ter papéis em múltiplas orgs (ex: Artur
--    é superadmin da IncentivaBR e também gestor de um cliente).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN (
      'superadmin',   -- IncentivaBR — acesso total ao sistema
      'org_admin',    -- Gestor do cliente — acesso total à sua org
      'org_viewer',   -- Visualizador — só leitura dos dados da org
      'member'        -- Servidor público — usuário final da plataforma
    )),
  invited_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMP,
  is_active       BOOLEAN NOT NULL DEFAULT true,

  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_users_org     ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user    ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_role    ON organization_users(role);
CREATE INDEX IF NOT EXISTS idx_org_users_active  ON organization_users(organization_id, is_active);

-- ─────────────────────────────────────────────────────────────
-- 3. Inserir vínculos iniciais para usuários existentes
-- ─────────────────────────────────────────────────────────────

-- Artur (superadmin) → org IncentivaBR com papel superadmin
INSERT INTO organization_users (organization_id, user_id, role, accepted_at)
SELECT
  o.id,
  u.id,
  'superadmin',
  NOW()
FROM users u, organizations o
WHERE u.email = 'contato@incentivabr.com.br'
  AND o.slug = 'www'
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'superadmin';

-- Usuário de teste (João Silva) → org IncentivaBR como member
INSERT INTO organization_users (organization_id, user_id, role, accepted_at)
SELECT
  o.id,
  u.id,
  'member',
  NOW()
FROM users u, organizations o
WHERE u.cpf = '11122233344'
  AND o.slug = 'www'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 4. Tabela audit_log — registro de ações para LGPD e operação
--    Todo evento importante fica registrado com quem, quando e IP.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,        -- ex: 'user.login', 'donation.created', 'org.created'
  entity_type     TEXT,                 -- ex: 'user', 'donation', 'organization'
  entity_id       TEXT,                 -- UUID da entidade afetada
  details         JSONB,                -- dados adicionais do evento
  ip_address      TEXT,                 -- IP de origem (LGPD)
  user_agent      TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_org      ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_user     ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_log(created_at DESC);
