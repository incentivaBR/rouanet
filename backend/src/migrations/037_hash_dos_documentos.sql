-- 037 — SHA-256 do comprovante bancário e do Recibo de Mecenato
--
-- Os documentos saem do disco do container e vão para object storage
-- (services/armazenamento.js; Raio-X, risco 02). O banco passa a guardar,
-- além da chave e do nome original, o hash do conteúdo gravado. Serve para
-- duas coisas: provar que o arquivo baixado é o que foi enviado, e conferir
-- a migração dos arquivos antigos (scripts/migrar-uploads-para-storage.mjs).
--
-- receipt_url e mecenato_url continuam existindo e passam a guardar a CHAVE
-- no armazenamento (`receipts/2026/09/receipt-<uuid>.pdf`). Os valores
-- antigos (`/uploads/receipts/...`) continuam sendo lidos.

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS receipt_sha256  TEXT,
  ADD COLUMN IF NOT EXISTS mecenato_sha256 TEXT;

COMMENT ON COLUMN donations.receipt_url IS
  'Chave do comprovante bancário no armazenamento (services/armazenamento.js). Valores antigos /uploads/receipts/... são traduzidos na leitura. Nunca é URL pública.';
COMMENT ON COLUMN donations.receipt_sha256 IS
  'SHA-256 (hex) do comprovante bancário como foi gravado.';
COMMENT ON COLUMN donations.mecenato_sha256 IS
  'SHA-256 (hex) do Recibo de Mecenato como foi gravado.';
