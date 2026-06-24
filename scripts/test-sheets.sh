#!/usr/bin/env bash
# Test connectivity to all Google Sheets URLs defined in .env
# Usage: ./scripts/test-sheets.sh
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Copy .env.example to .env and fill in your URLs."
  exit 1
fi

# Parse .env safely — handles unquoted values containing & ? = without shell interpretation
while IFS='=' read -r key value; do
  # Skip blank lines and comments
  [[ -z "$key" || "$key" == \#* ]] && continue
  # Strip inline comments and leading/trailing whitespace from value
  value="${value%%#*}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  # Strip surrounding quotes if present
  value="${value#\"}" ; value="${value%\"}"
  value="${value#\'}" ; value="${value%\'}"
  export "$key=$value"
done < "$ENV_FILE"

SECRETS=(SHEET_AGENDA_URL SHEET_PROJECTS_URL SHEET_META_URL)
PASS=0
FAIL=0

echo "Testing Google Sheets connectivity..."
echo ""

for secret in "${SECRETS[@]}"; do
  url="${!secret:-}"
  if [ -z "$url" ]; then
    echo "  [SKIP] $secret — not set"
    continue
  fi

  if echo "$url" | grep -q "SPREADSHEET_ID"; then
    echo "  [SKIP] $secret — still has placeholder URL"
    continue
  fi

  # Follow redirects, check HTTP status, download up to 1KB
  http_code=$(curl -sL -o /tmp/_test_sheet.csv -w "%{http_code}" \
    --max-time 10 \
    --max-filesize 1024 \
    "$url" 2>/dev/null || echo "000")

  if [ "$http_code" = "200" ]; then
    # Verify it looks like a CSV (has a comma on the first line)
    first_line=$(head -1 /tmp/_test_sheet.csv 2>/dev/null || echo "")
    if echo "$first_line" | grep -q ","; then
      echo "  [OK]   $secret (HTTP 200, CSV headers: $first_line)"
      PASS=$((PASS + 1))
    else
      echo "  [WARN] $secret (HTTP 200 but response does not look like CSV)"
      echo "         First line: $first_line"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "  [FAIL] $secret (HTTP $http_code)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
