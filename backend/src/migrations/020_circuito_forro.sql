-- Migration 020: Atualizar PRONAC para Circuito do Forró (PRONAC 252026)
-- Data: 2026-04-28
-- Proponente: BR Projects LTDA (CNPJ 00.383.111/0001-24)
-- Banco: BB Ag. 1419-2, Conta Captação 36.068-6

-- 1. Atualizar organização
UPDATE organizations SET
  pronac            = '252026',
  pronac_titulo     = 'Circuito do Forró',
  pronac_area       = 'Música',
  pronac_proponente = 'BR Projects LTDA',
  bank_name         = 'Banco do Brasil',
  bank_code         = '001',
  bank_agency       = '1419-2',
  bank_account      = '36.068-6',
  pix_key           = NULL,
  pix_key_type      = NULL
WHERE slug = 'www';

-- 2. Atualizar org_projects
UPDATE org_projects SET
  pronac          = '252026',
  titulo          = 'Circuito do Forró',
  area            = 'Música',
  proponente_nome = 'BR Projects LTDA',
  bank_name       = 'Banco do Brasil',
  bank_code       = '001',
  bank_agency     = '1419-2',
  bank_account    = '36.068-6',
  pix_key         = NULL,
  pix_key_type    = NULL
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'www');
