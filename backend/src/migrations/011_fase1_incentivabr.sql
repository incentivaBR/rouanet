-- Migration 011: Fase 1 — Identidade e Acesso IncentivaBR
-- Data: 2026-04-21
-- Inclui: Gov.br fields, super-admin, limpeza de orgs de teste, atualização org www

-- ─────────────────────────────────────────────────────────────
-- 1. Gov.br — campos por organização (multi-tenant)
--    Cada cliente pode ter suas próprias credenciais Gov.br.
--    Se null, usa as credenciais padrão da IncentivaBR.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS govbr_client_id      TEXT,
  ADD COLUMN IF NOT EXISTS govbr_client_secret  TEXT,
  ADD COLUMN IF NOT EXISTS govbr_redirect_uri   TEXT;

-- ─────────────────────────────────────────────────────────────
-- 2. Níveis de acesso — usuários
--    is_superadmin → IncentivaBR (Artur) — vê tudo
--    is_org_admin  → gestor do cliente — vê só sua org
--    is_admin      → mantido por compatibilidade (equivale a is_org_admin)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_org_admin  BOOLEAN NOT NULL DEFAULT false;

-- Migrar is_admin existente para is_org_admin
UPDATE users SET is_org_admin = true WHERE is_admin = true;

-- ─────────────────────────────────────────────────────────────
-- 3. Remover orgs de teste (GDF / exemplos anteriores)
-- ─────────────────────────────────────────────────────────────
DELETE FROM organizations WHERE slug IN ('ajufer', 'crm', 'fia');

-- ─────────────────────────────────────────────────────────────
-- 4. Atualizar org principal — IncentivaBR (slug: www)
--    Esta é a org padrão da plataforma DestineAI.
--    Não tem conta bancária própria — o pagamento vai ao proponente do projeto SALIC.
--    Cores: Manual da Marca IncentivaBR
-- ─────────────────────────────────────────────────────────────
UPDATE organizations SET
  name               = 'IncentivaBR',
  fund_type          = 'rouanet',
  fund_name          = 'Lei Rouanet — Lei 8.313/1991',
  legal_basis        = 'Lei 8.313/1991',
  max_percentage     = 6.00,
  primary_color      = '#273F77',
  secondary_color    = '#EE985C',
  bank_name          = NULL,
  bank_code          = NULL,
  bank_agency        = NULL,
  bank_account       = NULL,
  pix_key            = NULL,
  pix_key_type       = NULL,
  beneficiary_name   = NULL,
  beneficiary_cnpj   = NULL,
  pronac             = NULL,
  pronac_titulo      = NULL,
  pronac_area        = NULL,
  pronac_proponente  = NULL,
  contact_email      = 'contato@incentivabr.com.br',
  contact_phone      = NULL,
  is_active          = true
WHERE slug = 'www';
