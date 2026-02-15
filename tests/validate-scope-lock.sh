#!/usr/bin/env bash
set -euo pipefail

# Resolve repository from current working directory to support both local runs and isolated test repos.
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "FAIL: not inside a git repository"
  exit 1
fi
cd "$REPO_ROOT"

# Optional override for test harnesses; defaults to comparing against working tree vs HEAD.
BASE_REF="${1:-HEAD}"

changed_files="$(
  {
    git diff --name-only --diff-filter=ACMR "$BASE_REF" 2>/dev/null || true
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sed '/^$/d' | sort -u
)"

if [[ -z "$changed_files" ]]; then
  echo "PASS: no changed files detected"
  exit 0
fi

violations=()
while IFS= read -r file; do
  case "$file" in
    README.md|docs/*.md|tests/*.md|tests/*.sh|prompts/*.md)
      ;;
    *)
      violations+=("$file")
      ;;
  esac
done <<< "$changed_files"

if (( ${#violations[@]} > 0 )); then
  echo "FAIL: scope-lock violation (forbidden changed paths detected):"
  printf ' - %s\n' "${violations[@]}"
  echo
  echo "Allowed changed paths:" 
  echo " - README.md"
  echo " - docs/*.md"
  echo " - tests/*.md"
  echo " - tests/*.sh"
  echo " - prompts/*.md"
  exit 1
fi

echo "PASS: only allowed paths are changed"
