-- Migration 010: Organização Destinai — cliente Rouanet
-- Data: 2026-03-14

INSERT INTO organizations (
  name, slug,
  fund_type, fund_name, legal_basis, max_percentage,
  bank_name, bank_code, bank_agency, bank_account,
  pix_key, pix_key_type,
  beneficiary_name, beneficiary_cnpj,
  contact_email,
  pronac, pronac_titulo, pronac_area, pronac_proponente,
  primary_color, secondary_color,
  is_active
) VALUES (
  'Destinai', 'www',
  'rouanet', 'Fundo Nacional de Cultura', 'Lei 8.313/1991', 6.00,
  'Banco do Brasil', '001', '3902-5', '170500-8',
  NULL, NULL,
  'FNC — Fundo Nacional de Cultura', NULL,
  'contato@destinai.com.br',
  '2514726', NULL, NULL, NULL,
  '#1E3A5F', '#2B5A9E',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  fund_type        = EXCLUDED.fund_type,
  fund_name        = EXCLUDED.fund_name,
  bank_name        = EXCLUDED.bank_name,
  bank_code        = EXCLUDED.bank_code,
  bank_agency      = EXCLUDED.bank_agency,
  bank_account     = EXCLUDED.bank_account,
  pronac           = EXCLUDED.pronac,
  pronac_titulo    = EXCLUDED.pronac_titulo,
  pronac_area      = EXCLUDED.pronac_area,
  pronac_proponente= EXCLUDED.pronac_proponente,
  primary_color    = EXCLUDED.primary_color,
  secondary_color  = EXCLUDED.secondary_color;
