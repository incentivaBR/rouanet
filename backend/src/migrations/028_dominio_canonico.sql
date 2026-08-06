-- 028 — O domínio que a organização padrão anuncia precisa servir a aplicação
--
-- A migração 012 gravou, na organização `www`:
--
--   custom_domain = 'destineai.com.br'
--   website_url   = 'https://destineai.com.br'
--
-- Esse domínio NÃO serve a aplicação — responde 404, verificado em produção.
-- E o custom_domain não é enfeite: `routes/auth.js` monta o link de
-- REDEFINIÇÃO DE SENHA a partir dele. Ou seja, todo pedido de nova senha da
-- organização padrão vinha entregando um link morto. O mesmo vale para
-- qualquer outro e-mail que passe a usar o domínio da organização.
--
-- A marca do core é IncentivaBR; destineai.com.br é apêndice. O domínio
-- canônico é o www — o apex incentivabr.com.br responde com falha de TLS
-- (SEC_E_WRONG_PRINCIPAL), então não serve como destino de link.
--
-- Só toca em quem aponta para o domínio morto: uma organização que tenha
-- configurado domínio próprio de verdade não é afetada.

UPDATE organizations
   SET custom_domain = NULL,
       website_url   = 'https://www.incentivabr.com.br'
 WHERE slug = 'www'
   AND custom_domain = 'destineai.com.br';

COMMENT ON COLUMN organizations.custom_domain IS
  'Domínio próprio da organização. Precisa SERVIR a aplicação: routes/auth.js monta o link de redefinição de senha a partir dele. Domínio que só existe como marca não entra aqui.';
