# Limpeza do histórico do repositório

## Por que

Dois comprovantes bancários reais de servidores (janeiro/2026), o relatório do
Playwright e o CPF do proprietário (em cinco arquivos do GDF) foram versionados
e ficaram em commits públicos. Já saíram da árvore atual (commit "Remove comprovantes bancários,
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
   git clone --mirror https://github.com/incentivaBR/incentivabr.git backup-incentivabr-$(date +%F).git
   ```

   Guarde também o ZIP baixado pelo GitHub (Code → Download ZIP).

2. **Rodar o script**, que clona para uma pasta nova e reescreve só a cópia:

   ```bash
   pip install git-filter-repo
   CPF_A_REMOVER=000.000.000-00 scripts/limpar-historico.sh https://github.com/incentivaBR/incentivabr.git ../incentivabr-limpo
   ```

   Troque `000.000.000-00` pelo CPF que estava em `docs/LEGAL.md`,
   `LICENSE`, `index.html`, `dashboard.html` e `login-govbr.html` do GDF.
   O número não fica escrito no script nem neste documento de propósito.

   O script termina imprimindo três contadores, todos com valor zero. Se
   algum não for zero, ele avisa e não se deve prosseguir.

3. **Conferir à mão** na cópia limpa, antes de qualquer push:

   ```bash
   cd ../incentivabr-limpo
   git log --oneline | head          # os commits recentes continuam lá, com novos ids
   git ls-files | grep -c uploads    # 0
   git tag                           # mvp-2025 deve continuar existindo
   ```

4. **Publicar** (o passo irreversível). No GitHub, em Settings → Branches,
   desative temporariamente a proteção de `main` se houver. Depois:

   ```bash
   cd ../incentivabr-limpo
   git remote add origin https://github.com/incentivaBR/incentivabr.git
   git push --force --all origin
   git push --force --tags origin
   ```

5. **Depois do push.**
   - Railway faz deploy do novo `main`; confirmar em `/health`.
   - Apagar clones antigos em todos os computadores e clonar de novo. Um `git pull` num clone antigo reintroduz o histórico sujo.
   - PRs abertos precisam ser recriados a partir do novo `main`.
   - Pedir ao suporte do GitHub que descarte os objetos antigos ainda alcançáveis por URL direta ("remove cached views and references to the sensitive data"). Sem isso, quem guardou o link de um commit antigo ainda o abre por um tempo.
   - Avisar os dois titulares dos comprovantes, se forem identificáveis, que o documento ficou público entre janeiro e setembro de 2026.

## Execução em 06/09/2026

- Script rodado numa cópia clonada direto do GitHub; três contadores em zero; árvore do `main` limpo idêntica à do `main` original; 595 commits nos dois.
- Force-push feito nos branches `main` e `dev`. Conferido depois por um clone novo: nenhum PDF e nenhum CPF em qualquer commit alcançável pelos branches.
- **Tags:** as três tags de agosto (`v2026.08.04-*`) continuaram apontando para commits antigos, porque o ambiente usado recusou push de tags. Enquanto existirem, o histórico sujo continua alcançável por elas. Apagar em GitHub → Tags, ou recriá-las a partir de um clone novo. A tag `mvp-2025` deve ser criada no commit `9477e28` ("completo", 29/07/2025) do histórico novo.
- **Referências de PR:** o GitHub mantém `refs/pull/1/head`, `refs/pull/2/head` e `refs/pull/3/head` apontando para commits antigos. Só o suporte do GitHub remove. Pedido em https://support.github.com/request, categoria "Remove sensitive data", com o texto:

  > The repository incentivaBR/incentivabr had two personal bank receipts (PDF) and the owner's CPF (Brazilian tax id) committed by mistake. The history has been rewritten with git filter-repo and force-pushed on 2026-09-06. Please remove the unreachable objects and the cached views of the old commits, including the pull request refs (refs/pull/1, 2 and 3), so the old files can no longer be accessed by URL.

## O que o script remove

| Item | Padrão |
|---|---|
| Comprovantes | `*/uploads/receipts/*.pdf` e `backend/uploads/receipts/*.pdf`, em qualquer commit |
| Relatórios de teste | `tests/playwright-report/index.html`, `tests/test-results/.last-run.json` |
| CPF | as duas grafias (com e sem máscara), substituídas por `[CPF removido]` em todos os blobs; o número vem de `CPF_A_REMOVER` |

O script foi validado em 06/09/2026 numa cópia local do branch
`centralizacao`: os três contadores deram zero.

## O que o script não faz

- Não remove as credenciais de teste do seed (`seeds.sql`, migration 024). Isso é correção de código, não de histórico, e está na Onda 0 do Raio-X.
- Não remove telefone e endereço residencial de `docs/juridico/LEGAL.md` e de `archive/incentivabr-gdf/README.md`. Decisão do proprietário: são dados de contato publicados de propósito, mas o endereço é residencial.
