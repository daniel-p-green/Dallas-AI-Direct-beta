#!/usr/bin/env bash
set -euo pipefail

REPORT="docs/us-004-validation-report.md"

if [[ ! -f "$REPORT" ]]; then
  echo "FAIL: validation report missing at $REPORT"
  exit 1
fi

required_commands=(
  "bash tests/validate-scope-lock.sh"
  "bash tests/validate-readme-core-docs.sh"
  "bash tests/validate-mobile-audit-runtime-links.sh"
  "bash tests/validate-brand-guidelines.sh"
  "npm test"
  "npm run typecheck"
  "npm run build"
  "bash tests/validate-validation-report.sh"
)

for cmd in "${required_commands[@]}"; do
  if ! grep -Fq "$cmd" "$REPORT"; then
    echo "FAIL: missing command entry in report: $cmd"
    exit 1
  fi
done

pass_count=$(grep -Fc -- "- Status: PASS" "$REPORT")
if [[ "$pass_count" -ne 8 ]]; then
  echo "FAIL: expected 8 PASS statuses, found $pass_count"
  exit 1
fi

if ! grep -Fq 'All required validation commands passed. Merge to `main` is permitted.' "$REPORT"; then
  echo "FAIL: missing successful final outcome line"
  exit 1
fi

echo "PASS: validation report integrity checks passed"
