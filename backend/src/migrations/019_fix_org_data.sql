-- Migration 019: Corrigir dados da org DestineAI (banco, PIX, PRONAC Themis)
-- Data: 2026-04-25

-- 1. Atualizar organização com dados bancários e PRONAC correto
UPDATE organizations SET
  name              = 'DestineAI',
  pronac            = '250347',
  pronac_titulo     = 'Projeto Themis — Música e Transformação Social',
  pronac_area       = 'Música',
  pronac_proponente = 'Instituto Themis de Arte e Cultura',
  bank_name         = 'Banco do Brasil',
  bank_code         = '001',
  bank_agency       = '3902-5',
  bank_account      = '170500-8',
  pix_key           = 'contato@destineai.com.br',
  pix_key_type      = 'email',
  beneficiary_name  = 'Instituto Themis de Arte e Cultura',
  beneficiary_cnpj  = NULL,
  contact_email     = 'contato@destineai.com.br',
  primary_color     = '#273F77',
  secondary_color   = '#EE985C'
WHERE slug = 'www';

-- 2. Atualizar org_projects com dados bancários (para quando SALIC está online)
UPDATE org_projects SET
  pronac            = '250347',
  titulo            = 'Projeto Themis — Música e Transformação Social',
  area              = 'Música',
  proponente_nome   = 'Instituto Themis de Arte e Cultura',
  bank_name         = 'Banco do Brasil',
  bank_code         = '001',
  bank_agency       = '3902-5',
  bank_account      = '170500-8',
  pix_key           = 'contato@destineai.com.br',
  pix_key_type      = 'email',
  beneficiary_name  = 'Instituto Themis de Arte e Cultura'
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'www');
