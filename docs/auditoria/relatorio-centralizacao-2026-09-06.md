# Relatório da centralização — 6 de setembro de 2026

Autor: Adacto Artur Dornas de Oliveira.
Executa o plano "Um Só IncentivaBR" (`plano-centralizacao.md`), a partir do Raio-X (`raio-x-2026-09.md`).

## Resultado em uma frase

O IncentivaBR passou de quatro repositórios para um, `incentivaBR/incentivabr`, com o histórico dos outros três preservado dentro dele, os dados pessoais fora do histórico publicado e a produção no ar sem interrupção.

## O que mudou

| Antes | Depois |
|---|---|
| 4 repositórios (`rouanet`, `incentivabr-gdf`, `incentivabr-gdf-apresentacao`, `tina-incentivabr`) | 1 repositório vivo, `incentivabr`; os três antigos arquivados no GitHub com README apontando para a casa única |
| Histórico do GDF e dos protótipos de 2025 espalhado | Tudo em `archive/`, com os commits originais (105 + 20 + 26) |
| Comprovantes bancários reais, relatório de teste e CPF do proprietário versionados e em commits públicos | Fora da árvore e fora de qualquer commit alcançável por branch ou tag; pedido ao suporte do GitHub para limpar o cache das referências de PR |
| Documentos de estratégia, operação, jurídico e piloto misturados na raiz | `docs/` por tema, README único, CLAUDE.md só com a memória operacional, PRD e identidade visual em arquivos próprios |
| Build na Railway clonava o GitHub para buscar 173 MB de imagens | `frontend/assets` com 856 kB, copiada direto no build; sem dependência do nome do repositório |
| Repositório chamado `rouanet` | Renomeado para `incentivabr`; Railway reconectada ao nome novo |

## Sequência executada

1. Leitura do plano e do Raio-X; anexação dos repositórios (os dois privados só depois de o app do Claude receber acesso à organização).
2. Branch `centralizacao`: GDF trazido para `archive/incentivabr-gdf/` com histórico (merge `-s ours` + `read-tree`, equivalente ao `git subtree add` sem squash).
3. Remoção, na árvore, dos dois PDFs de comprovante, do relatório do Playwright e do CPF (que estava em cinco arquivos do GDF, não só em `LEGAL.md`). `.gitignore` passa a bloquear qualquer pasta `uploads/`.
4. Reorganização: `docs/{estrategia,operacao,juridico,auditoria,apresentacao,piloto-fgv}`, `archive/demos-2026/` com as páginas e imagens que nenhuma página viva referencia, README e CLAUDE.md novos.
5. Os dois privados lidos e incorporados em `archive/`. A hipótese do plano (deck para `site/`, base de conhecimento para fundir) não se confirmou: são protótipos React de julho/2025, sem código aproveitável, um deles com números sem fonte e o outro com teto fiscal errado ("7%").
6. PR #1 mesclado com merge commit; 13 suítes de teste do backend verdes antes e depois.
7. READMEs de arquivamento nos três repositórios antigos (PRs mesclados) e arquivamento no GitHub.
8. Dockerfile sem clone do GitHub (PR #2); rename para `incentivabr`; Railway reconectada; deploy conferido pelo `/health` e pelo logo na página inicial; referências ao nome antigo atualizadas (PR #3).
9. Histórico reescrito com `git filter-repo` numa cópia clonada do GitHub, três contadores em zero, árvore do `main` idêntica à original, e force-push de `main` e `dev` autorizado pelo proprietário. Tags antigas apagadas pelo proprietário. Conferência final por clone novo: zero PDFs, zero CPF (PR #4 registra tudo).
10. Pedido ao suporte do GitHub ("Limpar as visualizações em cache") para remover as referências `refs/pull/1`, `/2` e `/3`, que só eles conseguem apagar.

## Conferências feitas

- Nenhum arquivo vivo de `backend/` ou `frontend/` referencia algo movido para `archive/` (busca em todo o código).
- Testes do backend: 13 suítes, 125 casos, todos verdes após cada etapa.
- Cópia limpa: 595 commits, mesmo número do original; `git diff` entre o `main` original e o limpo vazio.
- Produção: `/health` respondendo após cada deploy (centralização, reconexão da Railway, novo Dockerfile).

## O que ficou aberto

| Item | Depende de |
|---|---|
| Limpeza das referências de PR no GitHub | resposta do suporte (ticket aberto em 06/09) |
| Tag `mvp-2025` no commit `9477e28` | qualquer computador com git; o ambiente da sessão não pôde enviar tags |
| Telefone e endereço residencial em `docs/juridico/LEGAL.md` e no README do GDF arquivado | decisão do proprietário |
| `CNAME` de destineai.com.br, `nixpacks.toml` da raiz, 8 redirects em `frontend/` | decisão do proprietário; mexem em deploy e URLs |

## Achados laterais

- A organização tem 7 repositórios, não 4: `incentivabr-mvp-premium`, `incentivabr-mvp-premium-1` e `comercial` não foram lidos. Decidir se entram numa segunda rodada.
- O GitHub aponta 35 alertas de dependências no `main` (1 crítico, 13 altos). Parte vem dos `package.json` dos protótipos arquivados.
- A branch `dev` no GitHub é uma cópia antiga do `main`, sem commits exclusivos.

## Próximas frentes, em ordem

1. Onda 0 do Raio-X: conta bancária errada nas páginas públicas, usuários de teste no seed e na migration 024, prompt da TINA com limites contraditórios, CTA da calculadora.
2. Onda 1: object storage para comprovantes, backup do Postgres com restore testado, CI mínimo, migrations estritas, `saldoDisponivel` na rota de registro.
3. Alertas de dependências e decisão sobre os três repositórios privados restantes.
