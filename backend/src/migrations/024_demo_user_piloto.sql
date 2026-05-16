-- Migration 024: Usuário demo para Piloto FGV (maio–junho 2026)
-- Email: demo@destineai.com.br | Senha: Piloto2026
-- Conta de acesso único para participantes do piloto sem cadastro

INSERT INTO users (cpf, nome, email, senha_hash, is_admin, email_verified,
  jurisdiction_id, accepted_terms_at, accepted_terms_version)
VALUES (
  '99988877700',
  'Demo — Piloto FGV',
  'demo@destineai.com.br',
  '$2a$10$vC/9JjGb3OXfY1qjavIQuOHVvGbw8lwwSD8jpaKIny/xNd.tlTrUy',
  false,
  true,
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  '1.0'
)
ON CONFLICT DO NOTHING;

-- Vincular à org padrão (slug = www) como member
INSERT INTO organization_users (organization_id, user_id, role, accepted_at)
SELECT o.id, u.id, 'member', NOW()
FROM users u, organizations o
WHERE u.email = 'demo@destineai.com.br' AND o.slug = 'www'
ON CONFLICT (organization_id, user_id) DO NOTHING;
