# CI e deploy

Autor: Adacto Artur Dornas de Oliveira. Setembro de 2026.

## O que existe

`.github/workflows/ci.yml` roda a suíte do backend (`cd backend && npm ci && npm test`)
a cada push, em qualquer branch, e a cada pull request. A suíte usa pg-mem e não
depende de Postgres, chave de API ou segredo. O resultado aparece como o check
**Testes do backend** no commit e no PR.

A Railway continua fazendo deploy do branch `main` a cada push. O CI não
substitui isso; ele diz se o commit está são antes de a Railway publicá-lo.

## O que fazer no painel (uma vez)

Duas configurações fecham o ciclo "deploy só com verde". As duas ficam fora do
repositório.

1. **Railway → serviço → Settings → Deploy → Wait for CI.** Com isso ligado, a
   Railway espera os checks do GitHub passarem no commit antes de publicar.
   Check vermelho, deploy não sai.
2. **GitHub → Settings → Branches → Add rule para `main`:** marcar *Require
   status checks to pass before merging* e escolher **Testes do backend**.
   Marcar também *Require a pull request before merging*. Com isso ninguém
   mescla em `main` com teste quebrado, nem faz push direto.

## Quando o check ficar vermelho

Abra a execução em GitHub → Actions. A saída do `npm test` mostra qual arquivo
falhou e qual caso. Todos os testes rodam em qualquer máquina com
`cd backend && npm ci && npm test`; reproduza antes de corrigir.

"Flake" não é diagnóstico: a suíte não usa rede nem relógio. Se falhou, é código.
