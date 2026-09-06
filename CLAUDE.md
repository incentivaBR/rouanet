# CLAUDE.md — IncentivaBR

Memória operacional do projeto para quem trabalha no código (pessoa ou agente).
Regras de negócio, estrutura, decisões tomadas e o que nunca pode ser feito.
O PRD está em `docs/estrategia/PRD.md`; a identidade visual em `brand/IDENTIDADE-VISUAL.md`.

## O que é este projeto

Plataforma para servidores públicos destinarem parte do IR devido a projetos
culturais aprovados pela Lei Rouanet (Lei 8.313/1991, art. 18), operada em
nome de um proponente por tenant. A plataforma **não toca no dinheiro**: o
servidor transfere direto para a Conta de Captação do projeto, envia o
comprovante, um gestor confere e o proponente emite o Recibo de Mecenato.

Este repositório é a **casa única** do IncentivaBR desde setembro de 2026.
Os repositórios anteriores (`incentivabr-gdf`, `incentivabr-gdf-apresentacao`,
`tina-incentivabr`) estão incorporados em `archive/` com histórico e devem
ser arquivados no GitHub.
Ver `docs/auditoria/plano-centralizacao.md`.

## Stack real

- **Frontend:** HTML5, CSS3, JavaScript vanilla, sem build. Tailwind pelo Play CDN em parte das páginas.
- **Backend:** Node.js 20 + Express 4 (ES modules), um processo serve API e frontend estático.
- **Banco:** PostgreSQL. Migrations em `backend/src/migrations/` aplicadas no boot.
- **IA:** TINA, sobre a API da Anthropic (`backend/src/routes/chat.js`, base em `backend/src/knowledge/nucleo.md`).
- **E-mail:** Resend em produção; Ethereal quando falta chave.
- **Deploy:** Railway, `backend/Dockerfile`, healthcheck em `/health`. Lê o branch `main`.
- **Testes:** `backend/tests/*.test.mjs` (pg-mem, sem infraestrutura); `tests/api` e `tests/e2e` (Playwright, desatualizados).

O PRD descreve React, Supabase, Auth0 e Vercel. Essa stack nunca existiu; não a use como referência.

## Estrutura

```
rouanet/                       ← a ser renomeado para incentivabr
├── README.md                  ← apresentação única do produto
├── CLAUDE.md                  ← este arquivo
├── CHANGELOG.md
├── backend/                   ← API, migrations, testes, base da TINA
│   ├── server.js
│   ├── Dockerfile             ← o que a Railway usa
│   └── src/{routes,middleware,services,lib,knowledge,migrations,config}
├── frontend/                  ← só as páginas vivas do produto
│   ├── assets/                ← só o que alguma página usa
│   ├── css/incentivabr-theme.css
│   └── js/{tenant,api,auth,tina,layout,utils,toast,mobile-menu}.js
├── brand/                     ← manual da marca, logos, IDENTIDADE-VISUAL.md
├── scripts/                   ← sync da base da TINA, limpeza de histórico
├── tests/                     ← API + E2E (Playwright)
├── docs/
│   ├── estrategia/            ← PRD, plano-mestre, pitch, specs de jornada
│   ├── operacao/              ← virada para produção, TODO, limpeza de histórico
│   ├── juridico/              ← consulta ao tributarista, LEGAL (registros INPI)
│   ├── auditoria/             ← Raio-X e plano de centralização
│   ├── apresentacao/          ← roteiro Casa Azul, roteiro de vídeo
│   └── piloto-fgv/            ← formulários, guia e mensagens do piloto de maio/2026
└── archive/                   ← histórico, fora do produto; nada aqui é servido
    ├── incentivabr-gdf/       ← o repositório ancestral inteiro, com 105 commits
    ├── incentivabr-gdf-apresentacao/ ← deck de jul/2025 para o GDF, com histórico
    ├── tina-incentivabr/      ← protótipo React da TINA, jul/2025, com histórico
    └── demos-2026/            ← demo-*.html, projeto-detalhes.html, CSS e imagens órfãs
```

`archive/` e `docs/` estão no `.railwayignore`: não sobem para o deploy.

## Regras que nunca devem ser quebradas

- Nunca hardcodar dados bancários no código ou em página. Conta de captação vem do banco, por tenant, e só de projeto ativo.
- Nunca expor chave de API (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SALIC_API_KEY`) no frontend.
- Sempre validar o teto de dedução no backend antes de registrar destinação. O teto é dado (`tetos_deducao`), não constante.
- Migrations rodam em sequência; nunca pular nem renumerar.
- Nenhum documento fiscal de servidor (comprovante, recibo) entra no git. `.gitignore` bloqueia `**/uploads/`.
- Nenhuma credencial de teste em documento versionado. Contas de teste ficam fora do repositório.
- A TINA nunca inventa valor de incentivo, nunca dá orientação jurídica ou contábil definitiva, sempre inclui o aviso de que a plataforma não substitui contador ou advogado.
- Não fazer merge de código do `archive/` por cima do produto. O que for aproveitado é portado à mão, um item de cada vez.

## Decisões tomadas

| Decisão | Quando | Onde está registrada |
|---|---|---|
| Marca única IncentivaBR; DestineAI é vitrine, não marca | abr/2026 | `docs/estrategia/PLANO-INCENTIVABR.md` |
| Teto único de 6% do IR devido até o parecer do tributarista; Esporte compõe o mesmo teto | ago/2026 | migrations 030 e 031, `docs/juridico/CONSULTA-TRIBUTARISTA.md` |
| Somente projetos do art. 18 (100% dedutíveis), nunca art. 26 | abr/2026 | `CHANGELOG.md` 1.3.0 |
| Mecanismo de incentivo é dado (catálogo `laws`, migration 018), não um repositório por lei | set/2026 | `docs/auditoria/plano-centralizacao.md` |
| Um só repositório; GDF vai para `archive/` com histórico; três repositórios antigos serão arquivados | set/2026 | `docs/auditoria/plano-centralizacao.md` |
| Recibo de Mecenato é do proponente; o PDF da plataforma é registro de operação | ago/2026 | `backend/src/routes/mecenato.js` |

## Endpoints principais

| Rota | Função |
|---|---|
| `POST /api/calculator/ir` | IR devido estimado e teto de dedução |
| `GET /api/salic/projetos`, `GET /api/salic/projetos/:pronac` | busca e detalhe no SALIC, com cache |
| `GET /api/salic/org-project` | projeto vinculado ao tenant |
| `POST /api/donations/rouanet` | registra destinação com validação de teto |
| `POST /api/uploads/receipt/:donationId` | comprovante da transferência |
| `GET /api/donations/conferencia` | fila de conferência do gestor (confirmar ou recusar com motivo) |
| `/api/mecenato` | recibo de mecenato anexado pelo proponente |
| `/api/chat` | TINA |
| `/api/convites`, `/api/admin`, `/api/interessados`, `/api/config` | convites de gestor, superadmin, LGPD de interessados, marca por tenant |

## Modo simulação

`SIMULATION_MODE=true` em produção enquanto não houver parecer do tributarista
e uma destinação real de valor baixo percorrida de ponta a ponta. A virada está
descrita em `docs/operacao/VIRADA-PRODUCAO.md`; as pendências, no Raio-X.

## Pendências conhecidas

Ver `docs/auditoria/raio-x-2026-09.md`, seção "Os 12 riscos que importam".
Os itens da Onda 0 (conta bancária errada em páginas públicas, usuários de
teste no seed, prompt da TINA com limites contraditórios) são a próxima frente
de trabalho e não fazem parte da centralização.

## Contas de teste

Não ficam neste arquivo nem em nenhum outro do repositório.

---

*Atualizado em setembro de 2026 na centralização dos repositórios. Versão viva.*
