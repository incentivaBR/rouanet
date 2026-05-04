# TODO — IncentivaBR Rouanet

## Em andamento
- [x] Adaptar `server.js` para remover rotas GDF — removidos `projectsRoutes` e `organizationsRoutes` (tabelas GDF inexistentes neste DB)
- [x] Adaptar `backend/package.json` (nome: `incentivabr-rouanet`) — já estava correto
- [x] Revisar `frontend/index.html` — sem referências GDF/FDI/FDCA
- [x] Revisar `frontend/dashboard.html` — removido link morto para `admin.html` (Painel do Fundo)
- [x] Parametrizar brand no frontend via `/api/config/brand` — adicionado `loadBrand()` em `tenant.js`

## Próximas tarefas
- [x] Criar `.env.example` completo — adicionado `SIMULATION_MODE` e `ANTHROPIC_API_KEY`
- [ ] Testar fluxo completo: busca SALIC → wizard → comprovante
- [ ] Criar README.md comercial (para clientes white-label)
- [ ] Configurar deploy na Railway com nixpacks
- [ ] Subdomínio `destinai.com.br` apontando para o deploy

## Backlog
- [ ] Página de onboarding para novos clientes white-label
- [ ] Painel admin simplificado (só doações Rouanet)
- [ ] Webhook para notificar organização a cada nova destinação
- [ ] Relatório PDF mensal de destinações por PRONAC
