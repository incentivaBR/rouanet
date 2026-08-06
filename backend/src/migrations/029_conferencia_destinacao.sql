-- 029 — Conferência da destinação: o passo que faltava para sair da simulação
--
-- Até aqui, o ÚNICO ponto do sistema que marcava uma destinação como
-- confirmada era POST /api/donations/:id/simulate, e ele começa recusando
-- quando SIMULATION_MODE não é 'true'. Com a simulação desligada, o fluxo
-- morria no meio: o destinador registrava, transferia, enviava o comprovante
-- bancário — e a destinação ficava em `awaiting_confirmation` para sempre.
-- Como a notificação ao proponente e todo o ciclo do Recibo de Mecenato
-- dependem da confirmação, nada mais acontecia.
--
-- O percurso completo passa a ser:
--
--   pending                → registrada, sem comprovante
--   awaiting_confirmation  → destinador anexou o comprovante bancário
--   confirmed              → ALGUÉM CONFERIU o extrato   ← esta migração
--   awaiting_mecenato      → proponente notificado
--   mecenato_issued        → recibo disponível para baixar
--
-- A conferência é humana de propósito. O dinheiro cai na Conta de Captação do
-- projeto, no Banco do Brasil, fora do alcance da plataforma — não há como
-- conciliar automaticamente sem integração bancária. Alguém abre o extrato,
-- confere valor e data, e confirma. Fica registrado quem confirmou.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Quem conferiu, e com que observação
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS confirmed_by      UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS confirmation_note TEXT;

COMMENT ON COLUMN donations.confirmed_by IS
  'Quem conferiu o comprovante bancário e confirmou. A confirmação libera a notificação ao proponente e o ciclo do Recibo de Mecenato — precisa ter nome.';

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Recusa — o comprovante não bate
--
-- Não é um estado novo: a destinação VOLTA para `pending`, porque ela não
-- morreu, só o comprovante estava errado (valor divergente, print de agendamento
-- em vez de comprovante, transferência para a conta institucional em vez da
-- Conta de Captação). O destinador corrige e reenvia.
--
-- O motivo é obrigatório na rota. Devolver sem dizer por quê deixa a pessoa
-- sem saber o que fazer — e ela transferiu dinheiro.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejected_by      UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON COLUMN donations.rejection_reason IS
  'Por que o comprovante foi recusado. Mostrado ao destinador — devolver sem motivo deixa quem já transferiu dinheiro sem saber o que corrigir.';

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Índice da fila de conferência
-- ───────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_donations_conferencia
  ON donations (organization_id, created_at)
  WHERE status = 'awaiting_confirmation';

-- ───────────────────────────────────────────────────────────────────────────
-- 4. Endereço de contato da organização padrão
--
-- Estava como contato@destineai.com.br. destineai.com.br é apêndice da marca;
-- o core é IncentivaBR — e este endereço não é decorativo: é para ele que vai
-- o aviso de que há Recibo de Mecenato a emitir.
-- ───────────────────────────────────────────────────────────────────────────
UPDATE organizations
   SET contact_email = 'contato@incentivabr.com.br'
 WHERE slug = 'www'
   AND contact_email = 'contato@destineai.com.br';
