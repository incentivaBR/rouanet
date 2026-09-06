-- DESTINAI — Seeds de produção (Rouanet only)
-- 1 jurisdição federal, 1 grupo, 1 fundo
--
-- Este arquivo roda em TODO boot (migrate.js). Nunca crie usuário aqui: o que
-- entrar neste arquivo com senha volta a existir a cada deploy, com a senha
-- escrita no repositório. O admin de teste que vivia aqui foi removido na
-- Onda 0 do Raio-X (migração 035). Contas de teste ficam fora do repositório.

-- 1. JURISDIÇÃO FEDERAL (Lei Rouanet é lei federal)
INSERT INTO jurisdictions (id, name, uf, type, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Brasil', 'BR', 'federal', true)
ON CONFLICT DO NOTHING;

-- 2. GRUPO DE INCENTIVO: Lei Rouanet (6% IR)
INSERT INTO incentive_groups (id, code, name, max_percentage, period_type, description) VALUES
  ('22222222-2222-2222-2222-222222222202', 'ROUANET', 'Lei Rouanet — Incentivo Cultural', 6.00, 'annual',
   'Destinação de até 6% do IR devido a projetos culturais aprovados pelo MinC/SALIC (Lei 8.313/1991)')
ON CONFLICT DO NOTHING;

-- 3. FUNDO OFICIAL: FNC — Fundo Nacional de Cultura
INSERT INTO official_funds (id, jurisdiction_id, incentive_group_id, code, name, legal_name,
  fund_type, federal_law, donation_mode, bank_code, agency, account,
  requires_project, requires_pre_approval, is_active) VALUES
  ('33333333-3333-3333-3333-333333333303',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222202',
   'FNC', 'Fundo Nacional de Cultura', 'Programa Nacional de Apoio à Cultura — PRONAC',
   'culture', 'Lei 8.313/1991', 'annual',
   '001', '3902-5', '170500-8',
   true, true, true)
ON CONFLICT DO NOTHING;
