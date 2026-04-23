-- Migration 012: Fase 1 — Melhorias estruturais
-- Data: 2026-04-21
-- Inclui: domínio customizado, org_projects, plan_type, logo

-- ─────────────────────────────────────────────────────────────
-- 1. Domínio customizado por organização
--    Permite que destineai.com.br ou portal.ajufer.org.br
--    sejam mapeados para o slug correto no tenant middleware.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS custom_domain    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS website_url      TEXT,
  ADD COLUMN IF NOT EXISTS cnpj             VARCHAR(18),
  ADD COLUMN IF NOT EXISTS contracted_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS plan_type        TEXT NOT NULL DEFAULT 'free'
    CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise'));

-- Mapear domínio da plataforma principal
UPDATE organizations
  SET custom_domain = 'destineai.com.br',
      website_url   = 'https://destineai.com.br',
      logo_url      = '/assets/logo-incentivabr.png'
WHERE slug = 'www';

-- ─────────────────────────────────────────────────────────────
-- 2. Tabela org_projects — múltiplos projetos por organização
--    Substitui o campo único pronac na tabela organizations.
--    Um cliente pode ter vários projetos/fundos simultâneos.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identificação do projeto
  pronac            VARCHAR(7),                    -- PRONAC SALIC (Lei Rouanet)
  fund_code         TEXT,                          -- Código do fundo (FNC, FIA, PRONON, etc.)
  official_fund_id  UUID REFERENCES official_funds(id),

  -- Dados do proponente (quem recebe o recurso)
  proponente_nome   TEXT,
  proponente_cnpj   VARCHAR(18),

  -- Dados bancários do proponente para pagamento
  bank_name         TEXT,
  bank_code         VARCHAR(10),
  bank_agency       VARCHAR(20),
  bank_account      VARCHAR(30),
  pix_key           TEXT,
  pix_key_type      TEXT CHECK (pix_key_type IN ('cpf','cnpj','email','telefone','aleatoria')),

  -- Dados do projeto (cache do SALIC ou manual)
  titulo            TEXT,
  area              TEXT,
  segmento          TEXT,
  descricao         TEXT,
  uf                CHAR(2),

  -- Controle
  is_featured       BOOLEAN NOT NULL DEFAULT false,   -- projeto em destaque na org
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Garantir unicidade: mesma org não pode ter o mesmo PRONAC duas vezes
  UNIQUE (organization_id, pronac)
);

CREATE INDEX IF NOT EXISTS idx_org_projects_org      ON org_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_projects_pronac   ON org_projects(pronac);
CREATE INDEX IF NOT EXISTS idx_org_projects_active   ON org_projects(organization_id, is_active);

-- ─────────────────────────────────────────────────────────────
-- 3. Atualizar tenant middleware — índice para custom_domain
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain
  ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_plan
  ON organizations(plan_type);
