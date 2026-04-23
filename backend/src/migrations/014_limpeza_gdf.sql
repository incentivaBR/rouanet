-- Migration 014: Limpeza final Fase 1
-- Data: 2026-04-21
-- Remove resquícios do sistema GDF e mapeia incentivabr.com.br

-- ─────────────────────────────────────────────────────────────
-- 1. Usuário fictício do sistema antigo
-- ─────────────────────────────────────────────────────────────
DELETE FROM organization_users WHERE user_id IN (
  SELECT id FROM users WHERE email = 'admin@incentivabr.com.br'
);
DELETE FROM users WHERE email = 'admin@incentivabr.com.br';

-- ─────────────────────────────────────────────────────────────
-- 2. Tabelas GDF — remover com segurança
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS accountability_reports CASCADE;
DROP TABLE IF EXISTS intermediary_organizations CASCADE;

-- A tabela projects é diferente de org_projects — remover a antiga
-- (org_projects é a nova estrutura correta)
DROP TABLE IF EXISTS projects CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 3. Admin domain — incentivabr.com.br é o domínio mãe
--    Permite que o tenant middleware reconheça ambos os domínios
--    da IncentivaBR: destineai.com.br (usuário) e
--    incentivabr.com.br (institucional + admin)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS admin_domain TEXT UNIQUE;

UPDATE organizations
  SET admin_domain = 'incentivabr.com.br'
WHERE slug = 'www';

CREATE INDEX IF NOT EXISTS idx_organizations_admin_domain
  ON organizations(admin_domain) WHERE admin_domain IS NOT NULL;
