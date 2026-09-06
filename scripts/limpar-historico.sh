#!/usr/bin/env bash
#
# Reescreve o histórico do repositório para apagar, de todos os commits,
# o que nunca deveria ter sido versionado:
#
#   - comprovantes bancários em qualquer pasta uploads/receipts/
#   - o relatório do Playwright e o .last-run.json
#   - o CPF do proprietário (substituído por "[CPF removido]")
#
# O script NÃO toca no repositório em que é executado nem no GitHub.
# Ele clona a origem para uma pasta nova, reescreve essa cópia e para.
# O force-push é um passo manual, descrito em docs/operacao/limpeza-historico.md.
#
# Uso:
#   scripts/limpar-historico.sh [ORIGEM] [DESTINO]
#
#   ORIGEM   URL ou caminho do repositório (padrão: o remoto origin daqui)
#   DESTINO  pasta a criar com a cópia limpa (padrão: ../rouanet-limpo)
#
# Requer git-filter-repo: pip install git-filter-repo

set -euo pipefail

ORIGEM="${1:-$(git config --get remote.origin.url)}"
DESTINO="${2:-$(cd "$(dirname "$0")/.." && pwd)/../rouanet-limpo}"

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
cat > "$SUBST" <<'EOF'
[CPF removido]==>[CPF removido]
[CPF removido]==>[CPF removido]
EOF

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
RESTO_PDF=$(git log --all --format= --name-only --diff-filter=A | grep -E 'uploads/receipts/.*\.pdf$' | sort -u | wc -l)
RESTO_PW=$(git log --all --format= --name-only --diff-filter=A | grep -E '^tests/(playwright-report|test-results)/' | sort -u | wc -l)
RESTO_CPF=$(git grep -l -e '[CPF removido]' -e '[CPF removido]' $(git rev-list --all) 2>/dev/null | wc -l)

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
