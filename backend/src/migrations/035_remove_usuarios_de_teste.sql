-- 035 — Remove as duas contas com senha pública
--
-- Duas contas nasciam em todo boot com senha conhecida e documentada:
--
--   * o "admin de teste" do seeds.sql (CPF 11122233344, is_admin = true),
--     recriado a cada subida do servidor porque o seed roda sempre;
--   * a conta demo do piloto FGV, criada pela migração 024 (CPF 99988877700,
--     e-mail demo@destineai.com.br) e preenchida automaticamente pelo
--     login.html em modo ?demo=true.
--
-- Nesta onda o seed deixa de criar a primeira e o login deixa de preencher a
-- segunda. Esta migração cuida do que já está no banco. Raio-X, risco 03.
--
-- Dois passos, nesta ordem:
--
--   1. Desativar sempre. Um senha_hash que não é bcrypt faz bcrypt.compare
--      responder false sem lançar erro (bcryptjs devolve false para qualquer
--      hash fora do formato). Nenhum papel administrativo sobrevive.
--   2. Apagar só quem não deixa rastro. donations.user_id, confirmed_by,
--      rejected_by e mecenato_issued_by referenciam users sem ON DELETE: se a
--      conta demo do piloto tiver destinações simuladas, o DELETE falharia e,
--      como a migração roda numa única query, desfaria o passo 1 junto. Por
--      isso o DELETE só alcança contas sem nenhuma dessas referências.
--      organization_users, audit_log e org_invites têm CASCADE ou SET NULL.

-- 1. Desativar
UPDATE users
   SET senha_hash     = 'conta-de-teste-desativada-onda-0',
       is_admin       = false,
       is_superadmin  = false,
       is_org_admin   = false,
       email_verified = false
 WHERE cpf IN ('11122233344', '99988877700')
    OR LOWER(email) IN ('demo@destineai.com.br', 'admin@destinai.com.br');

UPDATE organization_users
   SET is_active = false
 WHERE user_id IN (
   SELECT id FROM users
    WHERE cpf IN ('11122233344', '99988877700')
       OR LOWER(email) IN ('demo@destineai.com.br', 'admin@destinai.com.br')
 );

-- 2. Apagar as que não têm destinação nem ato de conferência vinculado
DELETE FROM users u
 WHERE (u.cpf IN ('11122233344', '99988877700')
        OR LOWER(u.email) IN ('demo@destineai.com.br', 'admin@destinai.com.br'))
   AND NOT EXISTS (
     SELECT 1 FROM donations d
      WHERE d.user_id = u.id
         OR d.confirmed_by = u.id
         OR d.rejected_by = u.id
         OR d.mecenato_issued_by = u.id
   );
