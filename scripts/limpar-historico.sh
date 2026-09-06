#!/usr/bin/env bash
#
# Reescreve o histórico do repositório para apagar, de todos os commits,
# o que nunca deveria ter sido versionado:
#
#   - comprovantes bancários em qualquer pasta uploads/receipts/
#   - o relatório do Playwright e o .last-run.json
#   - o CPF do proprietário (substituído por "[CPF removido]")
#
# O CPF não fica escrito aqui: vem da variável de ambiente CPF_A_REMOVER,
# no formato 000.000.000-00. Assim o script pode ser versionado.
#
# O script NÃO toca no repositório em que é executado nem no GitHub.
# Ele clona a origem para uma pasta nova, reescreve essa cópia e para.
# O force-push é um passo manual, descrito em docs/operacao/limpeza-historico.md.
#
# Uso:
#   CPF_A_REMOVER=000.000.000-00 scripts/limpar-historico.sh [ORIGEM] [DESTINO]
#
#   ORIGEM   URL ou caminho do repositório (padrão: o remoto origin daqui)
#   DESTINO  pasta a criar com a cópia limpa (padrão: ../rouanet-limpo)
#
# Requer git-filter-repo: pip install git-filter-repo

set -euo pipefail

ORIGEM="${1:-$(git config --get remote.origin.url)}"
DESTINO="${2:-$(cd "$(dirname "$0")/.." && pwd)/../rouanet-limpo}"

if [ -z "${CPF_A_REMOVER:-}" ]; then
  echo "Defina CPF_A_REMOVER=000.000.000-00 (o CPF que deve sair do histórico)." >&2
  exit 1
fi
CPF_DIGITOS="${CPF_A_REMOVER//[^0-9]/}"

if ! git filter-repo --version >/dev/null 2>&1; then
  echo "git-filter-repo não encontrado. Instale com: pip install git-filter-repo" >&2
  exit 1
fi

if [ -e "$DESTINO" ]; then
  echo "A pasta $DESTINO já existe. Apague ou escolha outro destino." >&2
  exit 1
fi

echo "== Clonando $ORIGEM em $DESTINO (todos os branches e tags)"
git clone --no-local --mirror "$ORIGEM" "$DESTINO/.git"
git -C "$DESTINO" config --bool core.bare false
git -C "$DESTINO" checkout -q main

SUBST="$(mktemp)"
trap 'rm -f "$SUBST"' EXIT
printf '%s==>[CPF removido]\n%s==>[CPF removido]\n' "$CPF_A_REMOVER" "$CPF_DIGITOS" > "$SUBST"

echo "== Reescrevendo o histórico"
git -C "$DESTINO" filter-repo --force \
  --invert-paths \
  --path-glob '*/uploads/receipts/*.pdf' \
  --path-glob 'backend/uploads/receipts/*.pdf' \
  --path tests/playwright-report/index.html \
  --path tests/test-results/.last-run.json \
  --replace-text "$SUBST"

echo "== Conferindo"
cd "$DESTINO"
# grep sem resultado devolve 1; com set -e e pipefail isso abortaria o script,
# e "nenhum resultado" é justamente o que queremos. Por isso o "|| true".
RESTO_PDF=$( { git log --all --format= --name-only --diff-filter=A | grep -E 'uploads/receipts/.*\.pdf$' || true; } | sort -u | wc -l)
RESTO_PW=$( { git log --all --format= --name-only --diff-filter=A | grep -E '^tests/(playwright-report|test-results)/' || true; } | sort -u | wc -l)
RESTO_CPF=$( { git rev-list --all | xargs git grep -l -F -e "$CPF_A_REMOVER" -e "$CPF_DIGITOS" 2>/dev/null || true; } | wc -l)

echo "PDFs de comprovante ainda no histórico: $RESTO_PDF (esperado 0)"
echo "Relatórios de teste ainda no histórico:  $RESTO_PW (esperado 0)"
echo "Blobs com o CPF ainda no histórico:      $RESTO_CPF (esperado 0)"

if [ "$RESTO_PDF" != 0 ] || [ "$RESTO_PW" != 0 ] || [ "$RESTO_CPF" != 0 ]; then
  echo "A limpeza não ficou completa. Não faça push desta cópia." >&2
  exit 2
fi

git gc --prune=now --aggressive -q

cat <<EOF

Cópia limpa pronta em: $DESTINO
Commits: $(git rev-list --all --count)   Tamanho: $(du -sh .git | cut -f1)

Nada foi enviado ao GitHub. Para publicar, siga docs/operacao/limpeza-historico.md.
EOF
