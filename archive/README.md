# archive/

Tudo aqui é histórico. Nada nesta pasta é servido pela aplicação, copiado
para o deploy (`.railwayignore`) ou lido pelo backend. Serve para provar de
onde cada coisa veio e para consultar código antigo sem ressuscitá-lo.

## incentivabr-gdf/

O repositório ancestral, `incentivaBR/incentivabr-gdf`, trazido inteiro com
seus 105 commits (julho/2025 a abril/2026). É a versão do produto para os
fundos do DF (FDI e FDCA, contas no BRB), mais o MVP original de julho/2025
só em frontend, na raiz (`index.html`, `dashboard.html`, `login-govbr.html`).

Do que está aqui, o que ainda vale a pena portar para o produto, um item por
vez e reconferido antes:

- seeds de `official_funds` (FDI/DF e FDCA/DF) como dados do catálogo de leis;
- `backend/src/routes/orgDashboard.js` e `frontend/painel-organizacao.html`, o painel de impacto por associação;
- `backend/src/routes/funds.js`, adaptado para ler o catálogo de leis;
- textos de `clube-vantagens.html`, `para-organizacoes.html`, `para-contadores.html`.

O que não deve voltar: `admin.html` (superado por `conferencia.html`),
seeds com usuários de teste, `nixpacks.toml`, `Dockerfile`, `STATUS.md`.

Os comprovantes bancários que estavam em `backend/uploads/receipts/` e o CPF
que estava em `docs/LEGAL.md` foram removidos da árvore. Continuam em commits
antigos até a reescrita do histórico (`docs/operacao/limpeza-historico.md`).

A tag `mvp-2025` marca o último commit do MVP original, antes do backend.

## demos-2026/

Páginas e imagens que o produto não usa mais:

- `demo-calculadora.html`, `demo-dashboard.html`, `demo-projeto.html`: demonstrações do piloto ASJDF (março/2026), com paleta própria e depoimentos fictícios;
- `projeto-detalhes.html`: página órfã e quebrada, do projeto Circuito do Forró;
- `css/destineai.css`: só era usada por `projeto-detalhes.html`;
- `assets/`: imagens do Circuito do Forró, da Orquestra das Periferias, do piloto FGV e logos antigos que nenhuma página viva referencia.

Nenhum arquivo vivo em `frontend/` ou `backend/` aponta para cá. A conferência
foi feita por busca de referência em todo o código no dia da mudança.
