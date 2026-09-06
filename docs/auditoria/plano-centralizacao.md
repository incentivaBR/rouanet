# Um Só IncentivaBR — plano de centralização

Autor: Adacto Artur Dornas de Oliveira. Setembro de 2026.
Complementa o Raio-X (`raio-x-2026-09.md`).

Quatro repositórios contavam a história do IncentivaBR em capítulos
separados. Este plano diz qual vira a casa única, o que cada um contribui,
o que se arquiva e como fazer isso sem perder histórico nem derrubar a produção.

## Estado da execução

| Passo | Situação em 06/09/2026 |
|---|---|
| 1. Backup dos quatro repositórios | Pendente, manual (Download ZIP ou `git clone --mirror`) |
| 2. Renomear `rouanet` para `incentivabr` | Feito em 06/09/2026 |
| 3. Trazer o GDF com histórico para `archive/` | Feito no branch `centralizacao` (105 commits preservados, tag local `mvp-2025`) |
| 4. Trazer os dois privados | Feito no branch `centralizacao`: ambos em `archive/`, com histórico (20 e 26 commits). Nada deles vai para o produto; ver "Os dois privados, lidos" abaixo |
| 5. Remover PDFs, relatório do Playwright e CPF | Feito. Histórico reescrito e publicado com force-push em 06/09/2026 (branches `main` e `dev`). Pendências: apagar as três tags antigas no GitHub e pedir ao suporte a limpeza dos commits soltos; ver `docs/operacao/limpeza-historico.md` |
| 6. Organizar docs/, archive/, README e CLAUDE.md únicos | Feito no branch `centralizacao` |
| 7. Arquivar os três repositórios antigos no GitHub | Feito em 06/09/2026, com README de arquivamento em cada um |
| 8. Segundo mecanismo (FDI/FDCA como dado) | Depende das Ondas 0 e 1 do Raio-X |

## A decisão

**Não criar um quinto repositório.** O `rouanet` já é o IncentivaBR: é o
único com código vivo (432 commits até agosto), com 33 migrations, testes,
LGPD, conferência de comprovantes e a TINA real. O `incentivabr-gdf` é o
ancestral dele: as migrations 003 a 009 são idênticas nos dois, e o
`rouanet` continua de 010 em diante. Os outros dois são satélites.

Portanto: renomear o `rouanet` para `incentivabr`, trazer para dentro dele o
que os outros três têm de útil, e arquivar os três. Renomear no GitHub
preserva histórico, o deploy da Railway e cria redirecionamento da URL antiga.

Um repositório novo perderia o histórico que prova a evolução do software
(relevante para o registro no INPI), quebraria o deploy e obrigaria a
migrar 33 migrations à mão.

## Os quatro repositórios

| Repositório | Papel | O que é |
|---|---|---|
| `rouanet` | base | Plataforma completa: backend Node/Express + Postgres, 39 páginas, TINA com Claude, multi-tenant, conferência, Recibo de Mecenato. Fluxo completo só para Lei Rouanet. Produção na Railway em modo simulação. 432 commits, mar–ago/2026, 196 MB. |
| `incentivabr-gdf` | ancestral | Mesmo backend, versão de janeiro a abril de 2026, com o fluxo FDI/FDCA do DF (contas no BRB), painel do fundo, painel de impacto por associação, Clube de Vantagens. Na raiz, o MVP original de julho de 2025, só frontend. Parou em 30/04/2026. 105 commits, 4,4 MB. |
| `incentivabr-gdf-apresentacao` | sem acesso | Privado. Pelo nome, o site ou deck de apresentação. Destino provável: `site/` ou `docs/apresentacao/`. |
| `tina-incentivabr` | sem acesso | Privado. Pelo nome, a assistente TINA em separado. O `rouanet` já tem a TINA real. Destino provável: fundir a base de conhecimento e descartar o que duplicar. |

## O que serve à finalidade

A finalidade é uma só: fazer um servidor público destinar parte do IR devido
a uma causa, com segurança, em minutos, e sair com o recibo certo na mão.

| Camada | Onde está | Estado |
|---|---|---|
| Motor de destinação (calcular, registrar, transferir, conferir, recibo) | `rouanet` backend + wizard | Pronto para Rouanet; falta o segundo mecanismo |
| Mecanismos (Rouanet, FDI, FDCA, Esporte…) | Rouanet no `rouanet`; FDI/FDCA no GDF (`official_funds` com contas do BRB) | Cada um num repositório; o catálogo de 7 leis do `rouanet` (migration 018) existe e ninguém lê |
| Orientação (TINA, guias, contador, biblioteca jurídica) | `rouanet` (real) + `tina-incentivabr` (?) + GDF (simulada por palavra-chave) | Duplicada, com contradições fiscais apontadas no Raio-X |
| Venda e apresentação | Espalhada nos quatro | Quatro paletas, três marcas, promessas divergentes ("até 9%") |

Centralizar não é só juntar pastas. É fazer o mecanismo virar dado (uma linha
no catálogo de leis, com conta, percentual e regras) em vez de um repositório
por lei.

## O que aproveitar de cada um

Legenda: **base** fica como está · **portar** trazer para o produto ·
**arquivar** guardar em `archive/` com histórico · **remover** não pode
ficar em repositório nenhum · **verificar** depende de acesso.

### Do incentivabr-gdf

| Item | Decisão | Por quê |
|---|---|---|
| Seeds de `official_funds` (FDI/DF e FDCA/DF: contas BRB, CNPJ, modo) | portar como dados | É o segundo mecanismo. Entra no catálogo de leis depois de reconferir cada conta com o conselho do fundo. |
| `orgDashboard.js` + `painel-organizacao.html` | portar depois | O `rouanet` só tem uma página de impacto estática. Este é o painel de impacto real, útil para vender a associações. |
| `funds.js` | portar adaptado | Vira `/api/laws` lendo o catálogo da migration 018. |
| `admin.html` | arquivar | `conferencia.html` e o fluxo de mecenato são mais completos. |
| `clube-vantagens`, `para-organizacoes`, `para-contadores`, `plataforma` | portar só o texto | Fica uma página por público; o que for melhor no GDF vira texto na página do `rouanet`. |
| MVP de julho/2025 na raiz | arquivar com tag | Primeira versão, só frontend. Valor histórico; retrato mais próximo do registrado no INPI. Tag `mvp-2025`. |
| `docs/roteiro-video-destinacao-ir.md` | portar corrigido | Bom roteiro, mas dizia "até 9% do IR". Corrigido para 6%. |
| `docs/DEMO.md`, `README.md` comercial | portar reescrito | Vira o README único, sem afirmações sem lastro. |
| `docs/LEGAL.md` | remover o CPF, portar o resto | Continha o CPF do proprietário em repositório público. |
| `backend/uploads/receipts/*.pdf` | remover dos dois repositórios | Comprovantes reais de janeiro/2026. Sair do histórico, não só da árvore. |
| `STATUS.md`, `nixpacks.toml`, `Dockerfile`, seeds com senha de teste | arquivar / remover | Obsoletos ou perigosos. |
| Branch `melhorias-login` | verificado | Já estava mesclado em `main`. |

### Do rouanet

| Item | Decisão |
|---|---|
| Backend, migrations 001–033, testes, LGPD, conferência, mecenato, convites, tenant | base |
| `demo-*.html`, `projeto-detalhes.html`, CSS órfão, imagens do Forró e da Orquestra sem uso | arquivar (feito) |
| Documentos de estratégia na raiz | portar para `docs/` (feito) |
| `CNAME` de `destineai.com.br`, CORS e remetente DestineAI | remover (pendente; mexe em configuração de deploy) |

### Os dois privados, lidos

A hipótese original (deck para `site/`; base de conhecimento da TINA para fundir) não se confirmou. Os dois são protótipos React de julho de 2025, anteriores ao MVP, sem chave de API e sem dados pessoais.

| Repositório | O que é | Decisão |
|---|---|---|
| `incentivabr-gdf-apresentacao` | Deck de 5 slides para gestores do GDF ("R$ 139 milhões", "0,8% destinam"), em HTML estático publicado por GitHub Pages e num componente React inacabado. 20 commits, 11 arquivos. Números sem fonte citada. | **arquivar**. Não vai para `site/`: a tese (fundos do DF) e os números (sem fonte) não são os do produto atual. A estrutura da narrativa pode inspirar material novo. |
| `tina-incentivabr` | Chat React com respostas escritas à mão, sem chamada a modelo de IA. Afirma teto de "7% do IR devido" e percentuais por fundo que contradizem o produto. README com métricas inventadas. 26 commits, 8 arquivos. | **arquivar**, portar nada. Fundir esse conteúdo na TINA real pioraria o risco 04 do Raio-X. |

## Estrutura final

```
incentivabr/                 ← antigo rouanet, renomeado
├── README.md                ← um só, honesto, para investidor e cliente
├── CLAUDE.md                ← memória do projeto, sem contas de teste
├── backend/
├── frontend/                ← só as páginas vivas
├── site/                    ← institucional (do repositório de apresentação, quando houver acesso)
├── brand/
├── docs/{estrategia,operacao,juridico,auditoria,apresentacao,piloto-fgv}/
├── archive/{incentivabr-gdf,demos-2026}/
└── .github/workflows/ci.yml ← testes do backend a cada push (pendente)
```

## Passo a passo

1. **Backup.** Download ZIP dos quatro repositórios ou `git clone --mirror`. Guardar fora do computador de trabalho.
2. **Renomear o `rouanet`.** Feito em 06/09/2026: o repositório agora é `incentivaBR/incentivabr`; a URL antiga redireciona. Conferir na Railway que o serviço continua apontando para o repositório. Trocar a URL em `backend/Dockerfile`, que clona `rouanet.git` para buscar os assets; melhor ainda, parar de clonar no build.
3. **Trazer o GDF com histórico.** Feito: merge com `-s ours` + `read-tree --prefix=archive/incentivabr-gdf/`, equivalente ao `git subtree add` sem squash. Tag `mvp-2025` no último commit do MVP original.
4. **Trazer os dois privados.** Feito, mesmo procedimento, para `archive/incentivabr-gdf-apresentacao/` e `archive/tina-incentivabr/`.
5. **Limpar o que não pode ficar.** Feito na árvore. A reescrita do histórico está em `scripts/limpar-historico.sh` e `docs/operacao/limpeza-historico.md`; exige force-push e backup prévio.
6. **Organizar a casa.** Feito: `docs/`, `archive/`, README e CLAUDE.md únicos.
7. **Arquivar os três antigos.** Em cada um: README de três linhas ("incorporado a `incentivaBR/incentivabr` em <data>") e Settings → Archive this repository. Nunca apagar.
8. **O segundo mecanismo.** FDI/FDCA no catálogo de leis e wizard generalizado por `?lei=`. Só depois das Ondas 0 e 1 do Raio-X.

## Cuidados

- **Dados pessoais em repositório público.** Os PDFs e o CPF estão fora da árvore, mas seguem no histórico até o passo 5 terminar. É o item mais urgente e não depende de centralizar nada.
- **Não fazer merge de código antigo por cima do novo.** Os 39 arquivos com o mesmo caminho nos dois repositórios são todos diferentes, e a versão boa é sempre a do `rouanet`.
- **Contas bancárias do FDI/FDCA** datam de janeiro/2026. Reconferir com cada conselho antes de virar seed.
- **A Railway lê `main`.** Toda a reorganização fica no branch `centralizacao` até o deploy de preview estar de pé.

## Os repositórios antigos, depois disto

Com os três incorporados em `archive/`, o passo 7 (arquivar no GitHub) pode
ser feito a qualquer momento. Nenhum dos três tem branch não mesclado nem
conteúdo que só exista lá.
