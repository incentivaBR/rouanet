-- Migration 023: garantir que o constraint de donations.status inclui todos os valores
-- Necessário para compatibilidade com todos os fluxos (não altera comportamento de simulate)
-- O simulate agora usa 'confirmed' diretamente, sem precisar de 'test_simulated'

ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'awaiting_confirmation', 'confirmed', 'processed', 'cancelled'));
