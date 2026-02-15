#!/usr/bin/env bash
set -euo pipefail

FILE="docs/brand-guidelines.md"

[[ -f "$FILE" ]] || { echo "Missing $FILE"; exit 1; }

grep -q "## Typography" "$FILE"
grep -q "## Spacing" "$FILE"
grep -q "## Color Usage" "$FILE"
grep -q "## Icon Rules" "$FILE"
grep -q "## Logo System" "$FILE"
grep -q "## Accessibility Guardrails" "$FILE"
grep -q "## Card and Shadow System" "$FILE"
grep -qi "email never appears" "$FILE"
grep -qi "do not claim official Vercel endorsement" "$FILE"
grep -q "public/brand/dallas-ai-logo-color.png" "$FILE"

echo "brand-guidelines validation passed"
