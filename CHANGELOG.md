# CHANGELOG — IncentivaBR Rouanet

## [1.0.0] — 2026-03-10
### Origem
Fork white-label do repositório `casdfteste/incentivaBR-GDF`.
Extraídos apenas os módulos referentes à Lei Rouanet (Lei 8.313/1991).

### Incluído
- Proxy SALIC com cache TTL (áreas, segmentos, projetos, org-project)
- Wizard `destinar-rouanet.html` — 6 steps: projeto → calculadora → valor → pagamento → comprovante → confirmação
- Página `projetos-rouanet.html` com filtros ao vivo
- Migrations `008_rouanet.sql` e `009_rouanet_tenant.sql`
- Calculator com `case 'rouanet'` (6% IR devido)
- `POST /api/donations/rouanet` com validação de limite
- `GET /api/salic/org-project` com fallback offline
- `docker-compose.yml` para ambiente de desenvolvimento
- White-label parametrizável via `.env`

### Removido (específico GDF)
- `admin.html`, `painel-organizacao.html`, `clube-vantagens.html`
- `para-organizacoes.html`, `para-contadores.html`
- Rotas: `funds.js`, `orgDashboard.js`, `admin.js`
- Referências a FDI/DF e FDCA/DF
