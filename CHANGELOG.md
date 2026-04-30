# CHANGELOG — IncentivaBR Rouanet

## [1.3.0] — 2026-04-30 — Piloto FGV: Campanha Cadeira 47
### Contexto
Substituição do projeto Circuito do Forró (PRONAC 252026) pelo projeto piloto
**Orquestra das Periferias do DF** (PRONAC 261847 — fictício, SIMULATION_MODE=true).
Objetivo: validar H1/H2 da pesquisa FGV (usabilidade e intenção de destinação).
Decisão estratégica: somente projetos Art. 18 (FNC, 100% dedutível) — nunca Art. 26 (80%).

### Adicionado
- `backend/src/migrations/022_orquestra_periferias.sql` — troca PRONAC + dados do projeto em `organizations` e `org_projects` (slug='www')
- `frontend/index.html` — reescrita completa com tema "Cadeira 47":
  - Hero: "A Cadeira 47 está esperando." (placeholder `assets/orquestra-hero.webp`)
  - Grid de 40 cadeiras CSS (7 pré-apoiadas: 3,7,12,18,23,31,36)
  - Seção 3 Atos: O Início / O Processo / A Visão
  - Credibilidade: Baccarelli (R$3,49 SROI/IDIS 2023) e Orquestra Jovem de Goiás
  - Contador live: 7/40 cadeiras apoiadas
  - CTA: "Você não sabe ainda quem vai sentar na Cadeira 47."
- `frontend/projeto-detalhes.html` — seções especiais para PRONAC 261847:
  - `DEMO_PROJETOS` dict: dados estáticos (não consulta SALIC para PRONAC fictício)
  - Seção "A Cadeira 47" com grid escuro de 40 cadeiras
  - Narrativa 3 Atos inline
  - Comparativo Art. 18 vs Art. 26 (verde/vermelho)
  - Sidebar: "Reserve uma cadeira" em vez de "Destine seu IR"
  - CTA final contextual para a Orquestra

### Projeto piloto — Orquestra das Periferias do DF
- **PRONAC:** 261847 (fictício para simulação FGV)
- **Proponente:** Associação Cultural Orquestra das Periferias do DF
- **CNPJ:** 47.832.156/0001-93
- **Banco:** Banco do Brasil — Ag. 3217-4 / Conta 48.291-5
- **Artigo:** Art. 18 — FNC — Música Erudita — 100% dedutível
- **Meta:** R$ 520.000 / Captado demo: R$ 91.000 (17,5%)
- **Público:** 80 jovens de 14–24 anos — Ceilândia, Samambaia, Santa Maria
- **Atividades:** ensaios semanais, 6 concertos públicos, gravação audiovisual

### Decisões estratégicas registradas
- Cadeira 47 = vaga anônima (nenhum menor nomeado — evita LGPD + risco de não entrega)
- Após piloto: `DELETE FROM donations WHERE status = 'test_simulated'`
- Trocar PRONAC = 5 min (arquitetura parametrizada por URL `?pronac=X`)
- IncentivaBR = marca mãe; DestineAI = showroom is_demo=true da Lei Rouanet

### Pendente
- Atualizar `destinar-rouanet.html` (wizard ainda referencia PRONAC 252026)
- Imagens da Orquestra para Nano criar: `assets/orquestra-hero.webp` e `assets/orquestra-card.webp`
- Corrigir 9% → 8% em `para-contadores.html` e demais arquivos

---

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
