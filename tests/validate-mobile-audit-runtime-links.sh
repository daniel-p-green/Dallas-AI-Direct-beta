#!/usr/bin/env bash
set -euo pipefail

runtime_doc="docs/runtime-validation.md"
audit_doc="tests/ui-mobile-audit.md"
audit_spec="tests/ui-mobile-audit.spec.ts"

require_match() {
  local file="$1"
  local pattern="$2"
  local label="$3"

  if ! rg -q "$pattern" "$file"; then
    echo "❌ Missing ${label} in ${file}"
    exit 1
  fi
}

require_match "$runtime_doc" "Mobile QR sanity" "mobile QR sanity section"
require_match "$runtime_doc" "tests/ui-mobile-audit.md" "manual audit reference"
require_match "$runtime_doc" "tests/ui-mobile-audit.spec.ts" "automated audit reference"
require_match "$runtime_doc" "iPhone Safari" "iPhone Safari reference"
require_match "$runtime_doc" "Android Chrome" "Android Chrome reference"
require_match "$runtime_doc" "375px" "375px viewport reference"
require_match "$runtime_doc" "no public email|no email" "privacy/no-email reference"

require_match "$audit_doc" "iPhone Safari" "iPhone Safari checklist"
require_match "$audit_doc" "Android Chrome" "Android Chrome checklist"
require_match "$audit_doc" "375px" "375px behavior check"
require_match "$audit_doc" "no email appears" "privacy/no-email check"
require_match "$audit_doc" "/signup" "signup flow reference"
require_match "$audit_doc" "/room" "room flow reference"

require_match "$audit_spec" "setViewportSize\(\{ width: 375" "mobile viewport assertion"
require_match "$audit_spec" "Public view – emails excluded" "privacy badge assertion"
require_match "$audit_spec" "not.toContain\('@'\)" "no-email assertion"

echo "✅ Mobile audit and runtime validation references are consistent"
