-- 036 — users.updated_at
--
-- PUT /api/auth/profile grava `updated_at = NOW()` numa coluna que nunca
-- existiu: a rota respondia 500 em toda edição de perfil (Raio-X, risco 08).
-- A coluna entra aqui em vez de a rota deixar de gravá-la, porque saber quando
-- um cadastro mudou pela última vez é informação útil na conferência.

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

COMMENT ON COLUMN users.updated_at IS
  'Última alteração de nome ou e-mail pelo próprio usuário (PUT /api/auth/profile). NULL = nunca editou.';
