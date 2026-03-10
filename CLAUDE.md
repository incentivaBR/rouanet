# CLAUDE.md — IncentivaBR Rouanet

## O que é este projeto
Plataforma white-label para destinação de IR via Lei Rouanet (Lei 8.313/1991).
Permite que servidores públicos e contribuintes destinem até 6% do IR devido a projetos culturais aprovados pelo MinC/SALIC.

## Stack
- **Frontend:** HTML5, CSS3, JavaScript vanilla (sem build system), CDNs (FontAwesome, Google Fonts, jsPDF)
- **Backend:** Node.js + Express (ES modules)
- **Banco:** PostgreSQL
- **Infra:** Docker, docker-compose, nixpacks (Railway)

## Domínios
- Plataforma mãe: `www.incentivabr.com.br`
- Esta instância: `destinai.com.br`

## Estrutura
```
rouanet/
├── frontend/
│   ├── index.html               ← landing page
│   ├── login.html               ← autenticação
│   ├── dashboard.html           ← painel do usuário
│   ├── projetos-rouanet.html    ← busca SALIC com filtros ao vivo
│   ├── projeto-detalhes.html    ← detalhes do projeto SALIC
│   ├── destinar-rouanet.html    ← wizard 6 steps de destinação
│   ├── calculadora.html         ← calculadora IR (6% Rouanet)
│   └── comprovante.html
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          ← autenticação JWT
│   │   │   ├── salic.js         ← proxy SALIC + cache TTL
│   │   │   ├── donations.js     ← POST /api/donations/rouanet
│   │   │   ├── calculator.js    ← 6% IR devido
│   │   │   ├── organizations.js
│   │   │   ├── projects.js
│   │   │   └── uploads.js
│   │   └── migrations/
│   │       ├── 008_rouanet.sql
│   │       └── 009_rouanet_tenant.sql
├── docker-compose.yml
├── Dockerfile
├── nixpacks.toml
└── .env.example
```

## White-label — configuração por .env
Toda personalização de marca é feita via variáveis de ambiente:
- `BRAND_NAME`, `BRAND_DOMAIN`, `BRAND_COLOR_PRIMARY`
- `SALIC_API_BASE_URL`, `SALIC_API_KEY`
- Credenciais de banco, email, JWT

## Regras que NUNCA devem ser quebradas
- Nunca hardcodar dados bancários no código — sempre via `.env` ou banco
- Nunca expor `SALIC_API_KEY` no frontend
- Sempre validar limite de 6% do IR devido no backend antes de registrar doação
- Migrations rodam em sequência — nunca pular numeração

## Endpoints principais
- `GET  /api/salic/projetos` — busca projetos SALIC com cache 5min
- `GET  /api/salic/projetos/:pronac` — detalhes do projeto, cache 30min
- `GET  /api/salic/org-project` — projeto vinculado à org, com fallback offline
- `POST /api/donations/rouanet` — registra destinação com validação de limite
- `POST /api/calculator/ir` — calcula IR devido e limite de 6%

## Erros já corrigidos
- `init-db.js` corrigido para rodar migrations 003–009 em sequência (não pular)

## Contas de teste
- CPF: 11122233344 | Senha: teste123
