-- Migration 016: Projeto demo para testes (substitua o PRONAC pelo real quando disponível)
-- Data: 2026-04-21
-- ATENÇÃO: PRONAC 220001 é placeholder. Atualize com o PRONAC real via painel admin.

-- 1. Atualizar organização principal com dados de fallback (funciona mesmo sem SALIC online)
UPDATE organizations
SET
  pronac            = '220001',
  pronac_titulo     = 'IncentivaBR — Cultura e Cidadania 2025',
  pronac_area       = 'Artes Cênicas',
  pronac_proponente = 'IncentivaBR Projetos Culturais Ltda'
WHERE slug = 'www';

-- 2. Inserir projeto na tabela org_projects
INSERT INTO org_projects (
  organization_id,
  pronac,
  titulo,
  area,
  segmento,
  uf,
  proponente_nome,
  proponente_cnpj,
  is_active,
  is_featured,
  descricao
)
SELECT
  id,
  '220001',
  'IncentivaBR — Cultura e Cidadania 2025',
  'Artes Cênicas',
  'Teatro',
  'DF',
  'IncentivaBR Projetos Culturais Ltda',
  '00.000.000/0001-00',
  true,
  true,
  'Projeto cultural de democratização do acesso à cultura e cidadania no Distrito Federal, com apresentações teatrais gratuitas para servidores públicos e suas famílias.'
FROM organizations
WHERE slug = 'www'
ON CONFLICT (organization_id, pronac) DO NOTHING;
