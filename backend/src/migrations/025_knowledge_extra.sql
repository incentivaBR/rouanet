-- 025 — conhecimento por organização + correção do nome da organização padrão
--
-- Contexto: até aqui existe UMA organização no banco (slug 'www', criada na
-- migration 010). Circuito Forró e Orquestra das Periferias não foram tenants
-- separados — foram UPDATEs sucessivos nessa mesma linha. O mecanismo
-- multi-tenant do middleware nunca foi exercitado com duas organizações.

-- 1. Conhecimento livre específico da organização.
--
--    É o destino do conteúdo do piloto FGV que hoje vive cravado no
--    frontend/js/tina.js. Enquanto ele estiver lá, é global: aparece para
--    qualquer organização que use a TINA, inclusive as que não têm nada a ver
--    com a pesquisa da FGV.
--
--    O blocoDoTenant() já lê esta coluna e a ignora quando vazia, então esta
--    migration é segura de aplicar antes de haver qualquer conteúdo.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS knowledge_extra TEXT;

COMMENT ON COLUMN organizations.knowledge_extra IS
  'Conhecimento em texto livre injetado no prompt da TINA apenas para esta organização. Vai depois do núcleo comum e não invalida o prompt cache.';

-- 2. A organização padrão ainda se chama "DestineAI" — a marca aposentada.
--
--    Isso não é cosmético: o blocoDoTenant() injeta organizations.name no
--    prompt, então a TINA em produção se apresentava como DestineAI mesmo
--    depois de a marca ter saído de todos os arquivos do frontend.
UPDATE organizations
   SET name = 'IncentivaBR'
 WHERE slug = 'www'
   AND name IN ('DestineAI', 'Destinai', 'DestinaAI');

-- 3. A organização 'www' é o domínio institucional, não um projeto.
--
--    Ela carregava o PRONAC 261847 (Orquestra das Periferias) como resíduo do
--    último teste — os campos foram sendo sobrescritos a cada projeto desde a
--    migration 019. Como o blocoDoTenant() injeta esses dados no prompt, a TINA
--    do site institucional respondia como se fosse aquele projeto.
--
--    Só o bloco da TINA lê estes campos; a demo-projeto.html tem o projeto
--    fixo no HTML e não depende deles.
UPDATE organizations
   SET pronac            = NULL,
       pronac_titulo     = NULL,
       pronac_area       = NULL,
       pronac_proponente = NULL
 WHERE slug = 'www';

-- 4. Fundo e limite também saem do institucional.
--
--    Estavam fixos em "Lei Rouanet" e 6%. Num domínio que cobre os 7
--    mecanismos isso é pior que resíduo: faria a TINA responder "seu limite é
--    6%" a quem pergunta sobre Incentivo ao Esporte, cujo limite é 7%.
--    Sem esses campos, ela responde pelo núcleo, que cobre os sete.
--
--    Continuam disponíveis para organizações de projeto, onde fazem sentido.
UPDATE organizations
   SET fund_type      = NULL,
       fund_name      = NULL,
       legal_basis    = NULL,
       max_percentage = NULL
 WHERE slug = 'www';
