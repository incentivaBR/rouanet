-- 031 — A Lei de Incentivo ao Esporte concorre com a Rouanet, para pessoa física
--
-- A migração 030 cadastrou o desporto como teto SEPARADO, com a observação de
-- que "NÃO compõe os 6% globais". Isso está errado para pessoa física: a Lei de
-- Incentivo ao Esporte disputa o mesmo teto da Rouanet.
--
-- O comportamento do sistema já estava correto por outro caminho — a 030 apontou
-- TODOS os incentive_groups para `irpf_global_6`, e nenhum fundo apontava para o
-- teto do desporto. Ou seja, o cálculo nunca liberou a mais. O que estava errado
-- era o CADASTRO, e cadastro errado vira comportamento errado no dia em que
-- alguém confiar nele para configurar um mecanismo novo.
--
-- Por que a correção pende para menos: se os tetos concorrem e tratamos como
-- concorrentes, está certo. Se não concorrerem e tratarmos como concorrentes, o
-- servidor destina menos do que podia — perde oportunidade, recuperável no ano
-- seguinte. O inverso o joga na malha fina, e isso não se desfaz.
--
-- Também mudou o terreno: a Lei Complementar nº 222/2025, de novembro de 2025,
-- revogou a lei do desporto anterior. Qualquer percentual anotado aqui precisa
-- ser reconferido contra o marco novo antes de o mecanismo entrar em operação.

UPDATE tetos_deducao
   SET descricao  = 'Incentivo ao desporto — pessoa física (concorre com o teto global)',
       base_legal = 'Lei 11.438/2006, alterada pela Lei 14.439/2022; marco revisto pela LC 222/2025',
       observacao = 'NÃO USAR sem parecer. Para pessoa física, a Lei de Incentivo ao Esporte '
                 || 'concorre com a Lei Rouanet dentro do mesmo teto — não é limite separado, '
                 || 'como esta linha afirmava. Mantida apenas como registro; nenhum mecanismo '
                 || 'aponta para ela. A LC 222/2025 revogou a lei anterior, então o percentual '
                 || 'precisa ser reconferido antes de qualquer uso.',
       confirmado_por_parecer = FALSE
 WHERE codigo = 'desporto_7';

-- Reforça o que a 030 já fez: sem teto declarado, o mecanismo cai no global.
-- Repetido de propósito — é a garantia de que um incentive_group cadastrado
-- entre as duas migrações não fique órfão e acabe sem teto nenhum.
UPDATE incentive_groups
   SET teto_codigo = 'irpf_global_6'
 WHERE teto_codigo IS NULL;
