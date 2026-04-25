-- Migration 018: Catálogo das 7 leis de incentivo (multifundo)
-- Data: 2026-04-25
-- ─────────────────────────────────────────────────────────────
-- Cria as tabelas estáticas que descrevem cada lei de incentivo:
--   - laws            : catálogo das 7 leis (Rouanet, LIE, PRONON, PRONAS/PCD, LIR, FIA, Idoso)
--   - law_categories  : categorias de despesa elegíveis por lei
--   - law_vedacoes    : vedações expressas (o que NÃO pode ser pago)
--   - law_tetos       : tetos percentuais por grupo de despesa
--   - law_phases      : fases do ciclo de vida do projeto (concepção, submissão, captação, execução)
--   - law_checklists  : itens de checklist por fase
--
-- Migration ADITIVA: não altera nenhuma tabela existente.
-- Pasta canônica: backend/src/migrations/
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- 1. Tabela: laws (catálogo principal)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS laws (
  id                   SERIAL PRIMARY KEY,
  slug                 VARCHAR(20) UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  name_full            TEXT,
  nickname             VARCHAR(50),
  base_legal           TEXT NOT NULL,
  orgao                TEXT NOT NULL,
  sistema_oficial      VARCHAR(50),
  sistema_url          TEXT,
  max_pf_percent       NUMERIC(5,2),
  max_pj_percent       NUMERIC(5,2),
  prazo_execucao_meses INTEGER,
  color                VARCHAR(7),
  observacao           TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE laws IS 'Catálogo estático das leis de incentivo fiscal suportadas pela plataforma';
COMMENT ON COLUMN laws.slug IS 'Identificador estável: rouanet, lie, pronon, pronas, lir, fia, idoso';
COMMENT ON COLUMN laws.nickname IS 'Apelido informal usado em copy de marketing (ex: Recicla+, Funcriança)';
COMMENT ON COLUMN laws.max_pf_percent IS 'Limite individual de dedução para pessoa física (sem considerar somas de grupo)';
COMMENT ON COLUMN laws.max_pj_percent IS 'Limite individual de dedução para pessoa jurídica tributada pelo lucro real';


-- ─────────────────────────────────────────────────────────────
-- 2. Tabela: law_categories (despesas elegíveis por lei)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS law_categories (
  id          SERIAL PRIMARY KEY,
  law_id      INTEGER NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_law_categories_law_id ON law_categories(law_id);


-- ─────────────────────────────────────────────────────────────
-- 3. Tabela: law_vedacoes (vedações expressas por lei)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS law_vedacoes (
  id         SERIAL PRIMARY KEY,
  law_id     INTEGER NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  texto      TEXT NOT NULL,
  ordem      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_law_vedacoes_law_id ON law_vedacoes(law_id);


-- ─────────────────────────────────────────────────────────────
-- 4. Tabela: law_tetos (tetos por grupo de despesa)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS law_tetos (
  id         SERIAL PRIMARY KEY,
  law_id     INTEGER NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  grupo      TEXT NOT NULL,
  max_pct    NUMERIC(5,2) NOT NULL,
  max_valor  NUMERIC(12,2),
  descricao  TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_law_tetos_law_id ON law_tetos(law_id);

COMMENT ON COLUMN law_tetos.max_pct IS 'Teto percentual sobre o valor total do projeto';
COMMENT ON COLUMN law_tetos.max_valor IS 'Teto absoluto em R$ (quando aplicável, ex: PRONON captação até R$ 50.000)';


-- ─────────────────────────────────────────────────────────────
-- 5. Tabela: law_phases (fases do ciclo do projeto)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS law_phases (
  id         SERIAL PRIMARY KEY,
  law_id     INTEGER NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  slug       VARCHAR(30) NOT NULL,
  name       TEXT NOT NULL,
  ordem      INTEGER NOT NULL,
  descricao  TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(law_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_law_phases_law_id ON law_phases(law_id);


-- ─────────────────────────────────────────────────────────────
-- 6. Tabela: law_checklists (checklist por fase)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS law_checklists (
  id         SERIAL PRIMARY KEY,
  phase_id   INTEGER NOT NULL REFERENCES law_phases(id) ON DELETE CASCADE,
  texto      TEXT NOT NULL,
  ordem      INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_law_checklists_phase_id ON law_checklists(phase_id);


-- ═════════════════════════════════════════════════════════════
-- SEEDS — As 7 leis com regras completas
-- ═════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- SEED — Tabela laws
-- ─────────────────────────────────────────────────────────────
INSERT INTO laws (slug, name, name_full, nickname, base_legal, orgao, sistema_oficial, sistema_url, max_pf_percent, max_pj_percent, prazo_execucao_meses, color, observacao) VALUES
('rouanet', 'Lei Rouanet', 'Lei Federal de Incentivo à Cultura', NULL,
 'Lei nº 8.313/1991, IN MinC nº 29 de 30/01/2026',
 'Ministério da Cultura (MinC)', 'SALIC', 'https://salic.cultura.gov.br',
 6.00, 4.00, 36, '#7a1f2b',
 'Plurianual e Territórios Criativos podem chegar a 48 meses. PJ lucro real até 4% do IR devido.'),

('lie', 'Lei de Incentivo ao Esporte', 'Lei Federal de Incentivo ao Esporte', 'LIE',
 'Lei nº 11.438/2006, Lei nº 14.147/2021, Lei Complementar nº 222/2025, Decreto nº 12.861/2026, Portaria MESP nº 10/2026',
 'Ministério do Esporte', 'SLI', 'https://sli.mds.gov.br',
 7.00, 2.00, NULL, '#1f5d3a',
 'Manifestações: Formação Esportiva, Esporte para Toda a Vida, Excelência Esportiva. Até 6 projetos por CNPJ raiz/ano. Vedado pagamento de atleta profissional.'),

('pronon', 'Programa Nacional de Apoio à Atenção Oncológica', 'Programa Nacional de Apoio à Atenção Oncológica', 'PRONON',
 'Lei nº 12.715/2012',
 'Ministério da Saúde', 'Transferegov', 'https://www.gov.br/transferegov',
 1.00, 1.00, NULL, '#3d4fa8',
 'Credenciamento concomitante à submissão. Até 3 projetos/ano por entidade credenciada. Captação no orçamento até 5% ou R$ 50.000 (o menor).'),

('pronas', 'Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência', 'Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência', 'PRONAS/PCD',
 'Lei nº 12.715/2012',
 'Ministério da Saúde', 'Transferegov', 'https://www.gov.br/transferegov',
 1.00, 1.00, NULL, '#8a3a9e',
 'Mesma sistemática do PRONON. Até 3 projetos/ano por entidade credenciada. Reformas permitidas, ampliação vedada.'),

('lir', 'Lei de Incentivo à Reciclagem (LIR)', 'Lei de Incentivo à Reciclagem', 'Recicla+',
 'Lei nº 14.260/2021 (regulamentada em 2024)',
 'Ministério do Meio Ambiente e Mudança do Clima (MMA)', 'SINIR+', 'https://sinir.gov.br',
 6.00, 1.00, NULL, '#2b7a78',
 'PJ lucro real até 1% por trimestre ou ano. Foco em cooperativas de catadores, infraestrutura e logística reversa.'),

('fia', 'Fundos da Criança e do Adolescente (FIA/FMDCA)', 'Fundos dos Direitos da Criança e do Adolescente', 'Funcriança',
 'Estatuto da Criança e do Adolescente (Lei 8.069/1990), art. 260',
 'Conselhos dos Direitos da Criança e do Adolescente (CMDCA, CEDCA, CONANDA)', 'Conselhos descentralizados', NULL,
 6.00, 1.00, NULL, '#d36b2a',
 'Aprovação prévia pelo Conselho competente. Destinação durante o ano até 3%; doação na declaração até 6% (somando com Idoso).'),

('idoso', 'Fundo dos Direitos da Pessoa Idosa', 'Fundo Nacional, Estaduais e Municipais dos Direitos da Pessoa Idosa', 'Fundo do Idoso',
 'Lei nº 12.213/2010',
 'Conselhos dos Direitos da Pessoa Idosa (CMDPI, CEDPI, CNDPI)', 'Conselhos descentralizados', NULL,
 6.00, 1.00, NULL, '#6a4c93',
 'Mesma sistemática do FIA. Destinação 3% no ano-calendário; doação na declaração até 6% combinado com FIA.');


-- ─────────────────────────────────────────────────────────────
-- SEED — law_categories (categorias elegíveis)
-- ─────────────────────────────────────────────────────────────

-- Rouanet
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Pré-produção', 1),
  ('Produção (cachês artísticos e técnicos)', 2),
  ('Cenografia, figurino, iluminação, som', 3),
  ('Locação de espaço e equipamentos', 4),
  ('Divulgação e comunicação', 5),
  ('Acessibilidade', 6),
  ('Administração', 7),
  ('Elaboração de proposta', 8),
  ('Serviço de captação', 9),
  ('Prestação de contas', 10),
  ('Contrapartida social', 11)
) AS c(cat, ord) WHERE slug = 'rouanet';

-- LIE
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Recursos humanos — técnicos, treinadores, equipe pedagógica', 1),
  ('Material esportivo e equipamentos', 2),
  ('Aluguel de espaço e infraestrutura', 3),
  ('Transporte, hospedagem, alimentação em eventos', 4),
  ('Formação e capacitação', 5),
  ('Divulgação (limitada)', 6),
  ('Administração', 7),
  ('Contrapartida social', 8)
) AS c(cat, ord) WHERE slug = 'lie';

-- PRONON
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Equipamentos médicos (referência SIGEM)', 1),
  ('Medicamentos e insumos', 2),
  ('Recursos humanos — equipe clínica e pesquisa', 3),
  ('Pesquisa (quando aplicável)', 4),
  ('Capacitação profissional', 5),
  ('Reformas (conservação, manutenção, reparo)', 6),
  ('Administração', 7),
  ('Serviço de captação', 8),
  ('Contrapartida', 9)
) AS c(cat, ord) WHERE slug = 'pronon';

-- PRONAS/PCD
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Equipamentos e tecnologia assistiva', 1),
  ('Medicamentos e insumos', 2),
  ('Recursos humanos — equipe multiprofissional', 3),
  ('Pesquisa (quando aplicável)', 4),
  ('Capacitação profissional', 5),
  ('Reformas (conservação, manutenção, reparo)', 6),
  ('Administração', 7),
  ('Serviço de captação', 8),
  ('Contrapartida', 9)
) AS c(cat, ord) WHERE slug = 'pronas';

-- LIR
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Infraestrutura para cooperativas', 1),
  ('Equipamentos e veículos para coleta seletiva', 2),
  ('Capacitação de catadores', 3),
  ('Incubação de cooperativas e empreendimentos solidários', 4),
  ('Organização de redes de comercialização', 5),
  ('Administração', 6),
  ('Contrapartida', 7)
) AS c(cat, ord) WHERE slug = 'lir';

-- FIA
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Recursos humanos (educadores, psicólogos, assistentes)', 1),
  ('Material didático e pedagógico', 2),
  ('Alimentação das atividades', 3),
  ('Transporte para beneficiários', 4),
  ('Equipamentos e mobiliário', 5),
  ('Capacitação da equipe', 6),
  ('Divulgação', 7),
  ('Administração', 8),
  ('Avaliação e impacto', 9)
) AS c(cat, ord) WHERE slug = 'fia';

-- Idoso
INSERT INTO law_categories (law_id, name, ordem)
SELECT id, cat, ord FROM laws, (VALUES
  ('Recursos humanos multiprofissionais', 1),
  ('Material e insumos para atividades', 2),
  ('Alimentação durante atividades', 3),
  ('Transporte dos beneficiários', 4),
  ('Equipamentos e tecnologia assistiva', 5),
  ('Capacitação de cuidadores', 6),
  ('Divulgação', 7),
  ('Administração', 8)
) AS c(cat, ord) WHERE slug = 'idoso';


-- ─────────────────────────────────────────────────────────────
-- SEED — law_vedacoes (o que NÃO pode ser pago)
-- ─────────────────────────────────────────────────────────────

-- Rouanet
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Intermediação: contratar pessoa ou entidade para apresentar a proposta em nome do proponente.', 1),
  ('Pagamento em espécie — toda movimentação deve ser pela conta do projeto.', 2),
  ('Uso do item de captação para financiar captação destinada ao incentivador.', 3),
  ('Concentrar mais de 50% das despesas administrativas em um único item.', 4),
  ('Recursos próprios do proponente sendo pagos dentro do projeto.', 5),
  ('Gastos pessoais do proponente não vinculados ao projeto.', 6)
) AS v(txt, ord) WHERE slug = 'rouanet';

-- LIE
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Pagamento de remuneração de atleta profissional, em qualquer modalidade esportiva.', 1),
  ('Manutenção ou organização de equipes profissionais de excelência esportiva.', 2),
  ('Aquisição de espaços publicitários em qualquer meio de comunicação.', 3),
  ('Projetos que beneficiem direta ou indiretamente pessoa física ou jurídica vinculada ao patrocinador.', 4),
  ('Cobrança de qualquer valor pecuniário dos beneficiários em atividade regular esportiva ou paraesportiva.', 5),
  ('Pagamento em espécie.', 6)
) AS v(txt, ord) WHERE slug = 'lie';

-- PRONON
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Ampliação de imóvel — apenas reformas de conservação, manutenção e reparo.', 1),
  ('Construção nova.', 2),
  ('Despesas fora da conta específica do projeto.', 3),
  ('Pagamento em espécie.', 4),
  ('Uso de valores fora da Tabela SIGEM quando aplicável.', 5)
) AS v(txt, ord) WHERE slug = 'pronon';

-- PRONAS
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Ampliação de imóvel — apenas reformas.', 1),
  ('Construção nova.', 2),
  ('Despesas fora da conta específica do projeto.', 3),
  ('Pagamento em espécie.', 4)
) AS v(txt, ord) WHERE slug = 'pronas';

-- LIR
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Beneficiamento direto de pessoa vinculada ao incentivador.', 1),
  ('Despesas sem rastreabilidade financeira.', 2),
  ('Pagamento em espécie.', 3)
) AS v(txt, ord) WHERE slug = 'lir';

-- FIA
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Destinação a pessoa vinculada ao conselheiro aprovador.', 1),
  ('Atividades fora do escopo aprovado pelo Conselho.', 2),
  ('Pagamento em espécie.', 3),
  ('Despesas posteriores ao prazo de execução aprovado.', 4)
) AS v(txt, ord) WHERE slug = 'fia';

-- Idoso
INSERT INTO law_vedacoes (law_id, texto, ordem)
SELECT id, txt, ord FROM laws, (VALUES
  ('Destinação a vinculados do conselheiro aprovador.', 1),
  ('Atividades fora do escopo aprovado.', 2),
  ('Pagamento em espécie.', 3)
) AS v(txt, ord) WHERE slug = 'idoso';


-- ─────────────────────────────────────────────────────────────
-- SEED — law_tetos (tetos por grupo de despesa)
-- ─────────────────────────────────────────────────────────────

-- Rouanet
INSERT INTO law_tetos (law_id, grupo, max_pct, descricao)
SELECT id, 'Administração', 15.00,
  'Administrativo até 15% do orçamento. Não se pode concentrar mais de 50% da administração em um único item.'
FROM laws WHERE slug = 'rouanet';

INSERT INTO law_tetos (law_id, grupo, max_pct, descricao)
SELECT id, 'Divulgação e comunicação + Acessibilidade (soma)', 20.00,
  'Divulgação + acessibilidade juntas podem chegar a até 20% do orçamento.'
FROM laws WHERE slug = 'rouanet';

-- LIE
INSERT INTO law_tetos (law_id, grupo, max_pct, descricao)
SELECT id, 'Administração', 15.00,
  'Despesas administrativas (atividade-meio) até 15% do orçamento total, excetuados gastos com pessoal indispensável à atividade-fim.'
FROM laws WHERE slug = 'lie';

-- PRONON
INSERT INTO law_tetos (law_id, grupo, max_pct, max_valor, descricao)
SELECT id, 'Serviço de captação', 5.00, 50000.00,
  'Captação até 5% do valor do projeto, limitada a R$ 50.000 no total (o que for menor).'
FROM laws WHERE slug = 'pronon';

-- PRONAS
INSERT INTO law_tetos (law_id, grupo, max_pct, max_valor, descricao)
SELECT id, 'Serviço de captação', 5.00, 50000.00,
  'Captação até 5% do valor do projeto, limitada a R$ 50.000 no total (o que for menor).'
FROM laws WHERE slug = 'pronas';


-- ─────────────────────────────────────────────────────────────
-- SEED — law_phases (4 fases padrão para todas as leis)
-- ─────────────────────────────────────────────────────────────
INSERT INTO law_phases (law_id, slug, name, ordem, descricao)
SELECT id, 'concepcao', 'Concepção e elaboração', 1,
  'Estruture a ideia antes de abrir o sistema oficial. É onde a maioria dos projetos indeferidos falha.'
FROM laws;

INSERT INTO law_phases (law_id, slug, name, ordem, descricao)
SELECT id,
  CASE slug
    WHEN 'rouanet' THEN 'salic'
    WHEN 'lie' THEN 'sli'
    WHEN 'pronon' THEN 'transferegov'
    WHEN 'pronas' THEN 'transferegov'
    WHEN 'lir' THEN 'sinir'
    WHEN 'fia' THEN 'conselho'
    WHEN 'idoso' THEN 'conselho'
  END,
  'Submissão',
  2,
  'Envio da proposta no sistema oficial.'
FROM laws;

INSERT INTO law_phases (law_id, slug, name, ordem, descricao)
SELECT id, 'captacao', 'Captação', 3,
  'Mobilização de recursos junto a doadores e patrocinadores.'
FROM laws;

INSERT INTO law_phases (law_id, slug, name, ordem, descricao)
SELECT id, 'execucao', 'Execução e prestação de contas', 4,
  'Implementação do projeto e prestação de contas final.'
FROM laws;


-- ─────────────────────────────────────────────────────────────
-- SEED — law_checklists (Rouanet completo, demais resumido)
--
-- Para Rouanet (lei mais usada hoje), checklists completos das 4 fases.
-- Para as demais 6 leis, checklists essenciais — podem ser ampliados em
-- migrations futuras conforme cada lei ganhar telas dedicadas.
-- ─────────────────────────────────────────────────────────────

-- Rouanet — Concepção
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Definir segmento cultural (artes cênicas, música, artes visuais, patrimônio, livro/leitura, audiovisual)', 1),
  ('Redigir objetivo geral em uma frase clara', 2),
  ('Listar objetivos específicos (3 a 5 mensuráveis)', 3),
  ('Escrever justificativa cultural (relevância, diagnóstico, público)', 4),
  ('Descrever plano de execução etapa por etapa', 5),
  ('Definir metas quantitativas (apresentações, público, oficinas)', 6),
  ('Elaborar plano de divulgação', 7),
  ('Montar planilha orçamentária com 3 cotações para itens relevantes', 8),
  ('Cronograma físico-financeiro mês a mês', 9),
  ('Definir contrapartidas sociais (gratuidade, acessibilidade, democratização)', 10),
  ('Definir cotas de patrocínio e contrapartidas para o incentivador', 11),
  ('Reunir currículos e portfólios da equipe principal', 12)
) AS t(txt, ord)
WHERE l.slug = 'rouanet' AND p.slug = 'concepcao';

-- Rouanet — Submissão SALIC
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Conta gov.br do proponente com nível prata ou ouro', 1),
  ('Cadastro completo no Novo SALIC', 2),
  ('CPF/CNPJ regular na Receita', 3),
  ('Certidões negativas atualizadas', 4),
  ('Formulário preenchido sem lacunas', 5),
  ('Planilha orçamentária no formato SALIC', 6),
  ('Cronograma físico-financeiro anexado', 7),
  ('Portfólio e currículo da equipe anexados', 8),
  ('Plano de democratização e acessibilidade descritos', 9),
  ('Revisão final antes do envio (IN 29/2026 restringe complementação posterior)', 10),
  ('Número PRONAC anotado', 11)
) AS t(txt, ord)
WHERE l.slug = 'rouanet' AND p.slug = 'salic';

-- Rouanet — Captação
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Publicação no DOU (condição para captar)', 1),
  ('Conta bancária bloqueada específica aberta', 2),
  ('Lista de potenciais patrocinadores', 3),
  ('Apresentação comercial pronta (cotas e contrapartidas)', 4),
  ('Carta-proposta personalizável', 5),
  ('Reuniões com marketing/comunicação das empresas', 6),
  ('Recibos de mecenato prontos', 7),
  ('Captação mínima de 10% (permite readequação)', 8),
  ('Captação de 20% atingida (desbloqueio)', 9),
  ('Contratos de patrocínio assinados', 10)
) AS t(txt, ord)
WHERE l.slug = 'rouanet' AND p.slug = 'captacao';

-- Rouanet — Execução e prestação de contas
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Movimentação exclusiva pela conta do projeto', 1),
  ('Nenhum pagamento em espécie', 2),
  ('Pasta digital por item (NF + comprovante + contrato)', 3),
  ('Registro mensal no SALIC em dia', 4),
  ('Contrapartidas sociais documentadas (foto, lista, data)', 5),
  ('Clipping de mídia arquivado', 6),
  ('Relatório técnico de cumprimento do objeto', 7),
  ('Relatório financeiro conciliando extratos', 8),
  ('Devolução de saldo remanescente (se houver)', 9),
  ('Prestação enviada no SALIC em até 60 dias', 10),
  ('Cópia de segurança guardada por 10 anos', 11)
) AS t(txt, ord)
WHERE l.slug = 'rouanet' AND p.slug = 'execucao';

-- LIE — checklists essenciais por fase
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Definir manifestação esportiva (Formação, Esporte para Toda a Vida, Excelência)', 1),
  ('Público-alvo (faixa etária, território, PCD)', 2),
  ('Objetivo geral e específicos mensuráveis', 3),
  ('Justificativa social e esportiva', 4),
  ('Metas: número de atendidos, horas-aula, eventos', 5),
  ('Planilha orçamentária com cotações', 6),
  ('Cronograma físico-financeiro', 7),
  ('Plano técnico-esportivo ou pedagógico', 8),
  ('Currículo da equipe técnica', 9),
  ('Contrapartidas sociais', 10)
) AS t(txt, ord)
WHERE l.slug = 'lie' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro do proponente no SLI com gov.br', 1),
  ('Verificar limite de 6 projetos por CNPJ raiz no ano', 2),
  ('CNPJ regular e certidões atualizadas', 3),
  ('Proposta dentro do prazo da portaria anual (2026: 04/03 a 18/09)', 4),
  ('Formulário completo no SLI', 5),
  ('Anexos técnicos e documentais', 6),
  ('Revisão antes do envio', 7),
  ('Número do projeto anotado', 8)
) AS t(txt, ord)
WHERE l.slug = 'lie' AND p.slug = 'sli';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Projeto aprovado e publicado', 1),
  ('Conta bancária específica do projeto aberta', 2),
  ('Apresentação comercial e carta-proposta', 3),
  ('Lista de empresas do setor esportivo, escolas, patrocinadores locais', 4),
  ('Abordagem a empresas tributadas pelo lucro real', 5),
  ('Contratos/termos de patrocínio formalizados', 6),
  ('Recibos para dedução do IR do incentivador', 7)
) AS t(txt, ord)
WHERE l.slug = 'lie' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme plano aprovado', 1),
  ('Movimentação exclusiva pela conta do projeto', 2),
  ('Listas de presença e frequência dos atendidos', 3),
  ('Registro fotográfico e audiovisual das atividades', 4),
  ('NFs e recibos arquivados por item de despesa', 5),
  ('Nenhum salário de atleta profissional (vedação legal)', 6),
  ('Relatório técnico de execução', 7),
  ('Relatório financeiro', 8),
  ('Prestação de contas no SLI dentro do prazo', 9)
) AS t(txt, ord)
WHERE l.slug = 'lie' AND p.slug = 'execucao';

-- PRONON — checklists essenciais
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Definir linha: assistência, pesquisa ou capacitação em oncologia', 1),
  ('Alinhar com missão da entidade e atuação em oncologia', 2),
  ('Objetivo geral e específicos', 3),
  ('Justificativa epidemiológica', 4),
  ('Metas quantitativas (pacientes, profissionais, publicações)', 5),
  ('Equipe técnica', 6),
  ('Planilha orçamentária com referência SIGEM', 7),
  ('Cronograma físico-financeiro', 8),
  ('Parecer de comitê de ética (quando pesquisa com seres humanos)', 9)
) AS t(txt, ord)
WHERE l.slug = 'pronon' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro da entidade na Plataforma Transferegov', 1),
  ('Documentação institucional (estatuto, ata, CNPJ, certificados)', 2),
  ('CNES atualizado (para projetos assistenciais)', 3),
  ('Declaração do gestor SUS (atendimento direto, gratuito e regular)', 4),
  ('Submissão da proposta junto com o pedido de credenciamento', 5),
  ('Envio em até 45 dias da publicação da portaria anual', 6),
  ('Protocolo arquivado', 7)
) AS t(txt, ord)
WHERE l.slug = 'pronon' AND p.slug = 'transferegov';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Aprovação publicada', 1),
  ('Conta específica do projeto aberta', 2),
  ('Abordagem a empresas de saúde, farmacêuticas, hospitais parceiros', 3),
  ('Material de apresentação com foco em impacto em oncologia', 4),
  ('Recibos para dedução do IR emitidos', 5)
) AS t(txt, ord)
WHERE l.slug = 'pronon' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme cronograma', 1),
  ('Movimentação exclusiva pela conta do projeto', 2),
  ('Prontuários, listas e relatórios clínicos', 3),
  ('Controle de gastos por item com NFs', 4),
  ('Relatórios parciais na Transferegov', 5),
  ('Relatório técnico final com indicadores', 6),
  ('Relatório financeiro conciliado', 7),
  ('Prestação de contas final pela Transferegov', 8)
) AS t(txt, ord)
WHERE l.slug = 'pronon' AND p.slug = 'execucao';

-- PRONAS/PCD — checklists essenciais (similar a PRONON, ajustes específicos PCD)
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Definir linha (reabilitação, assistência, pesquisa ou capacitação em PCD)', 1),
  ('Público-alvo (tipo de deficiência, faixa etária, território)', 2),
  ('Objetivo geral e específicos', 3),
  ('Justificativa epidemiológica e social', 4),
  ('Metodologia clínica/reabilitação', 5),
  ('Metas (pacientes, sessões, profissionais, publicações)', 6),
  ('Equipe multiprofissional', 7),
  ('Planilha orçamentária', 8),
  ('Cronograma físico-financeiro', 9),
  ('Parecer de comitê de ética (quando pesquisa)', 10)
) AS t(txt, ord)
WHERE l.slug = 'pronas' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro da entidade na Transferegov', 1),
  ('Documentação institucional completa', 2),
  ('CNES e/ou habilitações em reabilitação/PCD', 3),
  ('Declaração do gestor SUS quando aplicável', 4),
  ('Submissão dentro dos 45 dias da portaria anual', 5),
  ('Protocolo arquivado', 6)
) AS t(txt, ord)
WHERE l.slug = 'pronas' AND p.slug = 'transferegov';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Aprovação publicada', 1),
  ('Conta específica aberta', 2),
  ('Abordagem a empresas de saúde, tecnologia assistiva, farmacêuticas', 3),
  ('Material de apresentação com foco em impacto em PCD', 4),
  ('Recibos para dedução do IR emitidos', 5)
) AS t(txt, ord)
WHERE l.slug = 'pronas' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme cronograma', 1),
  ('Movimentação financeira rastreável', 2),
  ('Prontuários e registros de atendimento', 3),
  ('Relatórios parciais na Transferegov', 4),
  ('Indicadores de impacto em PCD', 5),
  ('Relatório técnico final', 6),
  ('Relatório financeiro conciliado', 7),
  ('Prestação de contas final na Transferegov', 8)
) AS t(txt, ord)
WHERE l.slug = 'pronas' AND p.slug = 'execucao';

-- LIR — checklists essenciais
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Definir eixo do projeto (infraestrutura, equipamentos, incubação, rede comercial, capacitação)', 1),
  ('Identificar cooperativa(s) ou associação(ões) de catadores envolvidas', 2),
  ('Diagnóstico socioambiental da região', 3),
  ('Objetivo geral e específicos mensuráveis', 4),
  ('Metas (toneladas recicladas, catadores beneficiados, renda gerada)', 5),
  ('Plano de trabalho e metodologia', 6),
  ('Planilha orçamentária com cotações', 7),
  ('Cronograma físico-financeiro', 8),
  ('Termos de anuência das cooperativas', 9),
  ('Indicadores socioambientais de impacto', 10)
) AS t(txt, ord)
WHERE l.slug = 'lir' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro da entidade no SINIR+', 1),
  ('Documentação institucional', 2),
  ('Atestado de atuação em reciclagem', 3),
  ('Formulário preenchido sem lacunas', 4),
  ('Anexos: orçamento, cronograma, declarações', 5),
  ('Submissão dentro do edital vigente', 6),
  ('Protocolo arquivado', 7)
) AS t(txt, ord)
WHERE l.slug = 'lir' AND p.slug = 'sinir';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Aprovação publicada', 1),
  ('Conta específica do projeto aberta', 2),
  ('Abordagem a empresas com metas de logística reversa (ESG)', 3),
  ('Abordagem a indústrias embaladoras, varejo, bebidas, higiene', 4),
  ('Material de apresentação com indicadores socioambientais', 5),
  ('Recibos para dedução do IR emitidos', 6)
) AS t(txt, ord)
WHERE l.slug = 'lir' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme plano', 1),
  ('Movimentação financeira rastreável', 2),
  ('Medição de toneladas recicladas por período', 3),
  ('Lista de catadores beneficiados e renda gerada', 4),
  ('NFs de equipamentos, obras, capacitação', 5),
  ('Relatórios parciais no SINIR+', 6),
  ('Relatório técnico final com indicadores socioambientais', 7),
  ('Relatório financeiro conciliado', 8),
  ('Prestação de contas final no SINIR+', 9)
) AS t(txt, ord)
WHERE l.slug = 'lir' AND p.slug = 'execucao';

-- FIA — checklists essenciais
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Alinhar o projeto aos eixos prioritários do Conselho escolhido', 1),
  ('Público-alvo: faixa etária, território, situação de vulnerabilidade', 2),
  ('Objetivo geral e específicos', 3),
  ('Justificativa social com dados locais e indicadores', 4),
  ('Metas mensuráveis (crianças atendidas, atividades, horas-aula)', 5),
  ('Equipe técnica', 6),
  ('Planilha orçamentária detalhada', 7),
  ('Cronograma físico-financeiro', 8),
  ('Indicadores de impacto alinhados ao ECA', 9)
) AS t(txt, ord)
WHERE l.slug = 'fia' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro/inscrição da entidade no Conselho (CMDCA/CEDCA/CONANDA)', 1),
  ('Certificação/registro da entidade na área da criança (quando exigido)', 2),
  ('Documentação institucional (estatuto, ata, CNPJ, certificados)', 3),
  ('Projeto conforme modelo do edital vigente', 4),
  ('Apresentação em reunião ou chamamento público quando exigido', 5),
  ('Protocolo formal da submissão', 6)
) AS t(txt, ord)
WHERE l.slug = 'fia' AND p.slug = 'conselho';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Projeto aprovado por resolução do Conselho e publicado', 1),
  ('Entidade habilitada no Fundo para receber repasses', 2),
  ('Campanha de destinação junto a pessoas físicas e jurídicas', 3),
  ('Material explicando destinação pela declaração de IR', 4),
  ('Recibos emitidos pelo Fundo para o contribuinte', 5),
  ('Acompanhamento dos repasses recebidos do Fundo', 6)
) AS t(txt, ord)
WHERE l.slug = 'fia' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme plano aprovado', 1),
  ('Conta específica do projeto (quando exigida)', 2),
  ('Listas de atendimento assinadas pelos responsáveis', 3),
  ('Registro fotográfico autorizado (termos de uso de imagem)', 4),
  ('NFs e recibos por item de despesa', 5),
  ('Relatório técnico com indicadores de impacto', 6),
  ('Relatório financeiro detalhado', 7),
  ('Prestação de contas ao Conselho e TCE/TCU conforme edital', 8)
) AS t(txt, ord)
WHERE l.slug = 'fia' AND p.slug = 'execucao';

-- Idoso — checklists essenciais
INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Alinhamento aos eixos prioritários do Conselho', 1),
  ('Público-alvo (faixa etária, território, vulnerabilidades)', 2),
  ('Objetivo geral e específicos', 3),
  ('Justificativa social com indicadores', 4),
  ('Metas quantitativas', 5),
  ('Equipe multiprofissional (gerontólogo, assistente social, educador)', 6),
  ('Planilha orçamentária', 7),
  ('Cronograma físico-financeiro', 8)
) AS t(txt, ord)
WHERE l.slug = 'idoso' AND p.slug = 'concepcao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Cadastro/inscrição no Conselho do Idoso', 1),
  ('Certificação/registro da entidade na área (quando exigido)', 2),
  ('Documentação institucional completa', 3),
  ('Projeto no modelo do edital vigente', 4),
  ('Protocolo formal', 5)
) AS t(txt, ord)
WHERE l.slug = 'idoso' AND p.slug = 'conselho';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Projeto aprovado e publicado', 1),
  ('Habilitação no Fundo', 2),
  ('Campanha de destinação junto a PF (na declaração) e PJ', 3),
  ('Recibos emitidos pelo Fundo', 4)
) AS t(txt, ord)
WHERE l.slug = 'idoso' AND p.slug = 'captacao';

INSERT INTO law_checklists (phase_id, texto, ordem)
SELECT p.id, t.txt, t.ord FROM law_phases p
JOIN laws l ON l.id = p.law_id
CROSS JOIN (VALUES
  ('Execução conforme plano', 1),
  ('Listas de atendimento e termos de consentimento', 2),
  ('NFs e recibos por item de despesa', 3),
  ('Relatório técnico', 4),
  ('Relatório financeiro', 5),
  ('Prestação ao Conselho e TCE/TCU', 6)
) AS t(txt, ord)
WHERE l.slug = 'idoso' AND p.slug = 'execucao';
