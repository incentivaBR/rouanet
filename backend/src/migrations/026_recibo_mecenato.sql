-- 026 — Recibo de Mecenato: a perna de volta do ciclo
--
-- Contexto normativo. Na Lei Rouanet o documento que o contribuinte usa para
-- deduzir é o RECIBO DE MECENATO, emitido pelo PROPONENTE no modelo oficial do
-- MinC, em três vias (Ministério, proponente e incentivador). A plataforma não
-- emite e não deve tentar emitir.
--
-- O que ela pode fazer é transportar: o proponente anexa o recibo que emitiu e
-- o destinador baixa de dentro da própria conta. Isso resolve o momento de
-- maior insegurança do fluxo — logo após transferir, quando o destinador passa
-- a depender de um terceiro para receber o documento da declaração dele.
--
-- Fluxo bancário, conforme o Manual do Proponente do MinC (seção 7.2): o
-- incentivador deposita na CONTA DE CAPTAÇÃO (bloqueada) do projeto no Banco
-- do Brasil. O proponente só movimenta pela conta livre, após liberação.

-- 1. O recibo emitido pelo proponente.
--    Distinto de receipt_url, que é o comprovante BANCÁRIO enviado pelo
--    destinador. São documentos e direções opostas: um entra, o outro sai.
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS mecenato_url        TEXT,
  ADD COLUMN IF NOT EXISTS mecenato_filename   TEXT,
  ADD COLUMN IF NOT EXISTS mecenato_issued_at  TIMESTAMP,
  ADD COLUMN IF NOT EXISTS mecenato_issued_by  UUID REFERENCES users(id);

COMMENT ON COLUMN donations.mecenato_url IS
  'Recibo de Mecenato emitido pelo proponente e anexado por ele. A plataforma apenas transporta — quem emite é o proponente, no modelo do MinC.';

-- 2. Dois estados novos, depois de confirmed:
--      confirmed          -> transferência conferida
--      awaiting_mecenato  -> proponente notificado, recibo pendente
--      mecenato_issued    -> recibo disponível para o destinador baixar
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN (
    'pending',
    'awaiting_confirmation',
    'confirmed',
    'awaiting_mecenato',
    'mecenato_issued',
    'processed',
    'cancelled'
  ));

-- 3. Quando o proponente foi avisado. Sem isso não há como dizer ao destinador
--    "a instituição já foi notificada", que é a informação que tira a ansiedade.
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS proponente_notified_at TIMESTAMP;

-- 4. Contato do proponente para a ponte direta.
--    O destinador precisa saber a quem recorrer se o recibo demorar; sem isso
--    ele fica sem saída e a culpa recai sobre a plataforma.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS contact_person       TEXT,
  ADD COLUMN IF NOT EXISTS contact_whatsapp     TEXT,
  ADD COLUMN IF NOT EXISTS mecenato_prazo_dias  INTEGER DEFAULT 10;

COMMENT ON COLUMN organizations.mecenato_prazo_dias IS
  'Prazo declarado ao destinador para emissão do Recibo de Mecenato. Expectativa explícita evita a sensação de abandono após a transferência.';

-- 5. Índice para a fila de recibos pendentes do proponente.
CREATE INDEX IF NOT EXISTS idx_donations_mecenato_pendente
  ON donations(organization_id, status)
  WHERE status IN ('confirmed', 'awaiting_mecenato');
