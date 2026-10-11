#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "HATA: backend/.env dosyası bulunamadı."
  exit 1
fi

set -a
source .env
set +a

: "${DB_PASSWORD:?DB_PASSWORD .env dosyasında tanımlı olmalı}"

export TEST_DB_URL="${TEST_DB_URL:-jdbc:postgresql://localhost:5432/orvexa_test}"
export TEST_DB_USERNAME="${TEST_DB_USERNAME:-${DB_USERNAME:-orvexa}}"
export TEST_DB_PASSWORD="${TEST_DB_PASSWORD:-$DB_PASSWORD}"

exec ./mvnw test "$@"
