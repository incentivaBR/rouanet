#!/usr/bin/env bash
#
# Restaura um backup feito por scripts/backup-postgres.sh num banco de destino.
#
# NUNCA aponte para o banco de produção sem ter lido docs/operacao/backup-restore.md.
# O restore apaga e recria os objetos do dump (--clean --if-exists).
#
# Uso:
#   BACKUP_PASSPHRASE=... DATABASE_URL=postgres://.../destino \
#     scripts/restaurar-postgres.sh caminho/incentivabr-2026-09-06-0300.dump.gpg
#
#   Para baixar do bucket antes: defina S3_* e passe só o NOME do arquivo:
#     scripts/restaurar-postgres.sh --do-bucket incentivabr-2026-09-06-0300.dump.gpg
#
# Ao final imprime a contagem das tabelas principais e a última migration
# aplicada, para comparar com a origem.

set -euo pipefail

: "${DATABASE_URL:?defina DATABASE_URL do banco de DESTINO}"
: "${BACKUP_PASSPHRASE:?defina BACKUP_PASSPHRASE}"

ARQ="${1:?informe o arquivo .dump.gpg (ou --do-bucket NOME)}"
if [ "$ARQ" = "--do-bucket" ]; then
  NOME="${2:?informe o nome do arquivo no bucket}"
  : "${S3_BUCKET:?}"; : "${S3_ACCESS_KEY_ID:?}"; : "${S3_SECRET_ACCESS_KEY:?}"
  export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY"
  export AWS_DEFAULT_REGION="${S3_REGION:-auto}" AWS_EC2_METADATA_DISABLED=true
  EP=(); [ -n "${S3_ENDPOINT:-}" ] && EP=(--endpoint-url "$S3_ENDPOINT")
  mkdir -p ./backups
  aws s3 cp "${EP[@]}" --only-show-errors "s3://$S3_BUCKET/backups/$NOME" "./backups/$NOME"
  aws s3 cp "${EP[@]}" --only-show-errors "s3://$S3_BUCKET/backups/$NOME.sha256" "./backups/$NOME.sha256" || true
  ARQ="./backups/$NOME"
fi

[ -f "$ARQ" ] || { echo "arquivo não encontrado: $ARQ" >&2; exit 1; }

if [ -f "$ARQ.sha256" ]; then
  echo "== conferindo sha256"
  (cd "$(dirname "$ARQ")" && sha256sum -c "$(basename "$ARQ").sha256")
fi

BRUTO="${ARQ%.gpg}"
echo "== decifrando"
gpg --batch --yes --decrypt --passphrase "$BACKUP_PASSPHRASE" --output "$BRUTO" "$ARQ"

echo "== pg_restore em $(echo "$DATABASE_URL" | sed -E 's#://([^:]+):[^@]+@#://\1:***@#')"
# --clean --if-exists: recria o que vem no dump. --no-owner/--no-acl: idem ao
# backup. O pg_restore segue em frente em erros de "já existe" (extensão
# uuid-ossp, por exemplo) e devolve código 1 no fim; a conferência abaixo é
# o que diz se o restore serviu.
if pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" "$BRUTO"; then
  echo "   pg_restore sem avisos"
else
  echo "   pg_restore terminou com avisos (normal para extensões já existentes); conferindo o conteúdo"
fi
rm -f "$BRUTO"

echo "== conferência"
psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'users: '          || COUNT(*) FROM users
UNION ALL SELECT 'donations: '      || COUNT(*) FROM donations
UNION ALL SELECT 'organizations: '  || COUNT(*) FROM organizations
UNION ALL SELECT 'org_projects: '   || COUNT(*) FROM org_projects
UNION ALL SELECT 'ultima migration: ' || MAX(filename) FROM migrations_log;
SQL
echo "== ok"
