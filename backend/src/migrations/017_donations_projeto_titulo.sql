-- Migration 017: Adicionar projeto_titulo e organization_id na tabela donations
-- Data: 2026-04-21

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS projeto_titulo    TEXT,
  ADD COLUMN IF NOT EXISTS organization_id  UUID REFERENCES organizations(id);

-- Índice para buscar destinações por organização
CREATE INDEX IF NOT EXISTS idx_donations_org ON donations(organization_id);
