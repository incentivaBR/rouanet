-- Migration: Multi-tenant básico
-- Data: 2026-01-24

-- 1. CRIAR TABELA DE ORGANIZAÇÕES
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#00A859',
  secondary_color VARCHAR(7) DEFAULT '#1E3A5F',

  -- Dados do Fundo
  fund_type VARCHAR(50),
  fund_name VARCHAR(200),
  legal_basis VARCHAR(200),
  max_percentage DECIMAL(5,2) DEFAULT 6.00,

  -- Dados bancários
  bank_name VARCHAR(100),
  bank_code VARCHAR(10),
  bank_agency VARCHAR(20),
  bank_account VARCHAR(30),
  pix_key VARCHAR(200),
  pix_key_type VARCHAR(20),
  beneficiary_name VARCHAR(200),
  beneficiary_cnpj VARCHAR(20),

  -- Contato
  contact_email VARCHAR(200),
  contact_phone VARCHAR(20),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Organização inserida via migration 010 (Destinai)

-- 3. ADICIONAR ORGANIZATION_ID NOS PROJETOS
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 4. ASSOCIAR PROJETOS EXISTENTES À ORGANIZAÇÃO PADRÃO
UPDATE projects SET organization_id = (SELECT id FROM organizations WHERE slug = 'www') WHERE organization_id IS NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
