-- Migration 022: Orquestra das Periferias do DF (substitui Circuito do Forró)
-- Data: 2026-04-30
-- PRONAC: 261847 (fictício — piloto FGV, SIMULATION_MODE=true)
-- Proponente: Associação Cultural Orquestra das Periferias do DF
-- CNPJ: 47.832.156/0001-93
-- Banco do Brasil (001), Ag. 3217-4, Conta Captação 48.291-5
-- Art. 18 — FNC — Música Erudita — 100% dedutível

-- 1. Atualizar organização principal
UPDATE organizations SET
  pronac            = '261847',
  pronac_titulo     = 'Orquestra das Periferias do DF — Temporada 2026',
  pronac_area       = 'Música',
  pronac_proponente = 'Associação Cultural Orquestra das Periferias do DF',
  bank_name         = 'Banco do Brasil',
  bank_code         = '001',
  bank_agency       = '3217-4',
  bank_account      = '48.291-5',
  pix_key           = NULL,
  pix_key_type      = NULL
WHERE slug = 'www';

-- 2. Atualizar org_projects (projeto principal ativo)
UPDATE org_projects SET
  pronac           = '261847',
  titulo           = 'Orquestra das Periferias do DF — Temporada 2026',
  area             = 'Música',
  segmento         = 'Apresentação/Gravação de Música Erudita',
  uf               = 'DF',
  proponente_nome  = 'Associação Cultural Orquestra das Periferias do DF',
  proponente_cnpj  = '47832156000193',
  bank_name        = 'Banco do Brasil',
  bank_code        = '001',
  bank_agency      = '3217-4',
  bank_account     = '48.291-5',
  pix_key          = NULL,
  pix_key_type     = NULL,
  descricao        = 'Formação orquestral contínua para 80 jovens de 14 a 24 anos de Ceilândia, Samambaia e Santa Maria. Ensaios semanais, 6 concertos públicos e gravação audiovisual. Art. 18 — 100% dedutível. PRONAC 261847.',
  is_active        = true,
  is_featured      = true
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'www');

-- 3. Garantir que existe ao menos um registro em org_projects (caso UPDATE não encontre linhas)
INSERT INTO org_projects (
  organization_id,
  pronac,
  titulo,
  area,
  segmento,
  uf,
  proponente_nome,
  proponente_cnpj,
  bank_name,
  bank_code,
  bank_agency,
  bank_account,
  is_active,
  is_featured,
  descricao
)
SELECT
  id,
  '261847',
  'Orquestra das Periferias do DF — Temporada 2026',
  'Música',
  'Apresentação/Gravação de Música Erudita',
  'DF',
  'Associação Cultural Orquestra das Periferias do DF',
  '47832156000193',
  'Banco do Brasil',
  '001',
  '3217-4',
  '48.291-5',
  true,
  true,
  'Formação orquestral contínua para 80 jovens de 14 a 24 anos de Ceilândia, Samambaia e Santa Maria. Ensaios semanais, 6 concertos públicos e gravação audiovisual. Art. 18 — 100% dedutível. PRONAC 261847.'
FROM organizations
WHERE slug = 'www'
ON CONFLICT (organization_id, pronac) DO NOTHING;
