-- Migration 015: Tokens de autenticação — reset de senha e verificação de email
-- Data: 2026-04-21

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verification_token   TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reset_token                TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires        TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_reset_token
  ON users(reset_token) WHERE reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_email_token
  ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
