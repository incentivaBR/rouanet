# TODO — IncentivaBR Rouanet

## Em andamento
- [ ] Adaptar `server.js` para remover rotas GDF (funds, admin, orgDashboard)
- [ ] Adaptar `backend/package.json` (nome: `incentivabr-rouanet`)
- [ ] Revisar `frontend/index.html` — remover referências FDI/FDCA/GDF
- [ ] Revisar `frontend/dashboard.html` — limpar módulos não-Rouanet
- [ ] Parametrizar brand no frontend via variável injetada pelo backend (`/api/config/brand`)

## Próximas tarefas
- [ ] Criar `.env.example` completo com todas as variáveis necessárias
- [ ] Testar fluxo completo: busca SALIC → wizard → comprovante
- [ ] Criar README.md comercial (para clientes white-label)
- [ ] Configurar deploy na Railway com nixpacks
- [ ] Subdomínio `destinai.com.br` apontando para o deploy

## Backlog
- [ ] Página de onboarding para novos clientes white-label
- [ ] Painel admin simplificado (só doações Rouanet)
- [ ] Webhook para notificar organização a cada nova destinação
- [ ] Relatório PDF mensal de destinações por PRONAC
