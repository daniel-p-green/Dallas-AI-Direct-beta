#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "FAIL: not inside a git repository"
  exit 1
fi
cd "$REPO_ROOT"

require_match() {
  local file="$1"
  local pattern="$2"
  local message="$3"

  if ! rg -q --multiline "$pattern" "$file"; then
    echo "FAIL: $message"
    echo "  file: $file"
    exit 1
  fi
}

# README required exact closing line.
require_match "README.md" "^We build this pattern inside organizations around revenue constraints\\.$" "README missing required closing line"

# Core docs alignment on public data boundary.
require_match "docs/PLAN.md" 'never shows `email`' "PLAN must assert email is never public"
require_match "docs/PRD.md" "Email never appears in public output\." "PRD must assert email is never public"
require_match "docs/security.md" 'excludes `email`' "security doc must assert email is excluded from public projection"

# RLS boundary posture.
require_match "docs/PLAN.md" "RLS and a[[:space:]]+public-safe view" "PLAN must preserve RLS/public-view boundary"
require_match "docs/PRD.md" "Security-first backend controls with RLS\." "PRD must preserve RLS-first posture"
require_match "docs/security.md" "Postgres RLS enforces data access in the database\." "security doc must preserve DB boundary claim"

# Beta auth posture is convenience-only.
require_match "docs/PLAN.md" "Beta gate \| Optional password gate \| Convenience only, not primary security" "PLAN must keep beta gate convenience-only posture"
require_match "docs/security.md" "alpha access controls as convenience, not trust boundary\." "security doc must keep convenience-only alpha access posture"

# Skills footer must exist and reference antfarm-workflows skill.
for file in docs/PLAN.md docs/PRD.md docs/security.md; do
  require_match "$file" "^## Skills used$" "$file missing Skills used footer"
  require_match "$file" "antfarm-workflows/SKILL\\.md" "$file Skills used footer missing antfarm-workflows reference"
done

echo "PASS: README and core docs consistency checks passed"
