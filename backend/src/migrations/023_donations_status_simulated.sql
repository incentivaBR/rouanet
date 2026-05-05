-- Migration 023: adicionar 'test_simulated' ao CHECK constraint de donations.status
-- Necessário para o modo SIMULATION_MODE do piloto FGV

ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_status_check;

ALTER TABLE donations
  ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'confirmed', 'processed', 'cancelled', 'test_simulated'));
