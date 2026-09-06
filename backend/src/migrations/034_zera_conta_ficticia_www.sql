-- 034 — Tira do banco a conta bancária fictícia do piloto FGV
--
-- A migration 022 gravou, na organização institucional (slug 'www') e no seu
-- org_projects, o PRONAC 261847 e a conta Ag. 3217-4 / Conta 48.291-5. Os dois
-- são inventados: o projeto nunca existiu no SALIC e a conta nunca recebeu
-- nada. A 025 limpou o PRONAC da organização, mas deixou a conta, e deixou o
-- projeto ativo em org_projects. Com isso, POST /api/donations/rouanet no
-- tenant padrão continuava devolvendo esses dados como destino da
-- transferência. Depósito numa conta que não é a Conta de Captação do PRONAC
-- não gera Recibo de Mecenato: o servidor perde a dedução.
--
-- Raio-X de setembro/2026, risco 01.

-- 1. A organização institucional não tem conta de captação. Dado bancário só
--    existe em org_projects, por projeto ativo (regra do CLAUDE.md).
UPDATE organizations
   SET bank_name    = NULL,
       bank_code    = NULL,
       bank_agency  = NULL,
       bank_account = NULL,
       pix_key      = NULL,
       pix_key_type = NULL
 WHERE slug = 'www';

-- 2. O PRONAC fictício sai de circulação em qualquer organização em que tenha
--    sido semeado. Desativar, não apagar: pode haver destinações simuladas do
--    piloto apontando para ele, e o histórico do piloto tem valor.
UPDATE org_projects
   SET is_active   = false,
       is_featured = false,
       bank_name    = NULL,
       bank_code    = NULL,
       bank_agency  = NULL,
       bank_account = NULL,
       pix_key      = NULL,
       pix_key_type = NULL
 WHERE pronac = '261847';
