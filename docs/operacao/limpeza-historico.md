# Limpeza do histórico do repositório

## Por que

Dois comprovantes bancários reais de servidores (janeiro/2026), o relatório do
Playwright e o CPF do proprietário foram versionados e ficaram em commits
públicos. Já saíram da árvore atual (commit "Remove comprovantes bancários,
relatório do Playwright e CPF do repositório"), mas continuam acessíveis em
qualquer commit anterior. Só a reescrita do histórico resolve isso.

Reescrever o histórico muda o identificador de todos os commits. Quem tiver
um clone precisa clonar de novo. Por isso este passo é manual, exige backup
antes e a decisão é do proprietário.

## Quando

Depois de mesclar o PR de centralização em `main`. Assim a reescrita cobre de
uma vez o histórico do `rouanet` e o do `incentivabr-gdf` (que entrou em
`archive/` com seus 105 commits e trazia os mesmos dois PDFs).

## Passo a passo

1. **Backup.** Em uma pasta fora do computador de trabalho:

   ```bash
   git clone --mirror https://github.com/incentivaBR/rouanet.git backup-rouanet-$(date +%F).git
   ```

   Guarde também o ZIP baixado pelo GitHub (Code → Download ZIP).

2. **Rodar o script**, que clona para uma pasta nova e reescreve só a cópia:

   ```bash
   pip install git-filter-repo
   scripts/limpar-historico.sh https://github.com/incentivaBR/rouanet.git ../rouanet-limpo
   ```

   O script termina imprimindo três contadores, todos com valor zero. Se
   algum não for zero, ele avisa e não se deve prosseguir.

3. **Conferir à mão** na cópia limpa, antes de qualquer push:

   ```bash
   cd ../rouanet-limpo
   git log --oneline | head          # os commits recentes continuam lá, com novos ids
   git ls-files | grep -c uploads    # 0
   git tag                           # mvp-2025 deve continuar existindo
   ```

4. **Publicar** (o passo irreversível). No GitHub, em Settings → Branches,
   desative temporariamente a proteção de `main` se houver. Depois:

   ```bash
   cd ../rouanet-limpo
   git remote add origin https://github.com/incentivaBR/rouanet.git
   git push --force --all origin
   git push --force --tags origin
   ```

5. **Depois do push.**
   - Railway faz deploy do novo `main`; confirmar em `/health`.
   - Apagar clones antigos em todos os computadores e clonar de novo. Um `git pull` num clone antigo reintroduz o histórico sujo.
   - PRs abertos precisam ser recriados a partir do novo `main`.
   - Pedir ao suporte do GitHub que descarte os objetos antigos ainda alcançáveis por URL direta ("remove cached views and references to the sensitive data"). Sem isso, quem guardou o link de um commit antigo ainda o abre por um tempo.
   - Avisar os dois titulares dos comprovantes, se forem identificáveis, que o documento ficou público entre janeiro e setembro de 2026.

## O que o script remove

| Item | Padrão |
|---|---|
| Comprovantes | `*/uploads/receipts/*.pdf` e `backend/uploads/receipts/*.pdf`, em qualquer commit |
| Relatórios de teste | `tests/playwright-report/index.html`, `tests/test-results/.last-run.json` |
| CPF | as duas grafias, substituídas por `[CPF removido]` em todos os blobs |

O script foi validado em 06/09/2026 numa cópia local do branch
`centralizacao`: os três contadores deram zero.

## O que o script não faz

- Não remove as credenciais de teste do seed (`seeds.sql`, migration 024). Isso é correção de código, não de histórico, e está na Onda 0 do Raio-X.
- Não remove telefone e endereço residencial de `docs/juridico/LEGAL.md` e de `archive/incentivabr-gdf/README.md`. Decisão do proprietário: são dados de contato publicados de propósito, mas o endereço é residencial.
