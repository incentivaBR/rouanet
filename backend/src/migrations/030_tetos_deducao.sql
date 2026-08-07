-- 030 — O teto de dedução vira dado, não constante de código
--
-- POR QUE
--
-- O limite de 6% estava escrito em três lugares do código:
--   calculator.js:20   const LIMITE_ROUANET = 0.06
--   donations.js:78    const LIMITE_ROUANET = 0.06
--   calculator.js      a validação de /distribuir
--
-- Três cópias de um número que é uma TESE JURÍDICA, não um fato do sistema. E
-- teses mudam: o incentivo ao esporte era 6% e virou 7% com a Lei 14.439/2022.
-- A interação entre o art. 18 da Lei 8.313/91 e o teto global do art. 22 da Lei
-- 9.532/97 ainda está para ser confirmada por parecer tributário.
--
-- Enquanto o número vive no código, cada resposta do tributarista é um deploy.
-- Depois desta migração, é um UPDATE.
--
-- O QUE É UM TETO, E POR QUE MERECE TABELA PRÓPRIA
--
-- Não é uma propriedade de um mecanismo: é algo que VÁRIOS mecanismos dividem.
-- Rouanet, FIA e Fundo do Idoso somam dentro dos mesmos 6% do imposto devido —
-- destinar aos três não dá 18%, dá 6% no total. Já o incentivo ao esporte tem
-- teto próprio, que não se mistura.
--
-- Modelar o teto como coluna de cada mecanismo faria parecer que cada um tem o
-- seu, e o cálculo liberaria mais do que a lei permite. Errar para mais joga o
-- servidor na malha fina — o erro que não se desfaz.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Os tetos
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tetos_deducao (
  codigo          TEXT PRIMARY KEY,
  descricao       TEXT        NOT NULL,

  -- Percentual sobre o IMPOSTO DEVIDO, não sobre a renda.
  percentual      NUMERIC(5,2) NOT NULL CHECK (percentual > 0 AND percentual <= 100),

  -- O artigo que fixa o teto. Serve para o servidor conferir e para nós
  -- defendermos o número se ele for questionado.
  base_legal      TEXT        NOT NULL,

  -- Tetos mudam por lei. Guardar a vigência permite recalcular um ano anterior
  -- com a regra que valia à época — o que uma retificadora exige.
  vigencia_inicio DATE        NOT NULL,
  vigencia_fim    DATE,

  -- Marca o que ainda depende de confirmação. Melhor um campo explícito do que
  -- um comentário que ninguém lê.
  confirmado_por_parecer BOOLEAN NOT NULL DEFAULT FALSE,
  observacao      TEXT,

  created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tetos_deducao IS
  'Tetos de dedução do IRPF. Um teto é compartilhado por vários mecanismos — por isso é tabela, não coluna. Alterar aqui muda o cálculo sem deploy.';

INSERT INTO tetos_deducao
  (codigo, descricao, percentual, base_legal, vigencia_inicio, confirmado_por_parecer, observacao)
VALUES
  ('irpf_global_6',
   'Teto global do IRPF — soma das deduções de incentivo',
   6.00,
   'Lei 9.532/1997, art. 22 c/c Lei 9.250/1995, art. 12',
   '1998-01-01',
   FALSE,
   'Reúne Lei Rouanet, FIA/FDCA e Fundo do Idoso: a soma dos três não ultrapassa 6% do imposto devido. Pendente de parecer tributário quanto à interação com o art. 18 da Lei 8.313/91.'),

  ('desporto_7',
   'Incentivo ao desporto — teto próprio',
   7.00,
   'Lei 11.438/2006, art. 1º, com redação da Lei 14.439/2022',
   '2022-09-01',
   FALSE,
   'Teto separado: NÃO compõe os 6% globais. Cadastrado para quando o mecanismo entrar; nenhum fundo aponta para ele ainda.')
ON CONFLICT (codigo) DO NOTHING;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Cada mecanismo aponta para o teto que divide
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE incentive_groups
  ADD COLUMN IF NOT EXISTS teto_codigo TEXT REFERENCES tetos_deducao(codigo);

COMMENT ON COLUMN incentive_groups.teto_codigo IS
  'Qual teto este mecanismo divide. Dois grupos com o mesmo código somam contra o mesmo limite. NULL cai no teto global, que é o comportamento conservador.';

UPDATE incentive_groups
   SET teto_codigo = 'irpf_global_6'
 WHERE teto_codigo IS NULL;

CREATE INDEX IF NOT EXISTS idx_incentive_groups_teto
  ON incentive_groups(teto_codigo);
