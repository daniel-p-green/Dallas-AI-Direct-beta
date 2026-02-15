# Test Plan Index

This folder contains markdown test plans for alpha security, privacy, abuse resistance, auth behavior, QR flow reliability, performance, and observability.

## Scope Lock Gate (docs/tests-only rerun)
Run this before and after docs updates to enforce the rerun scope lock:

```bash
bash tests/validate-scope-lock.sh
```

The gate passes only when changed files are limited to:
- `README.md`
- `docs/*.md`
- `tests/*.md`
- `tests/*.sh`
- `prompts/*.md`

## Baseline Verification Harness
Use this command set to reproduce current docs/runtime consistency checks:

```bash
bash tests/validate-scope-lock.sh
npm run typecheck
npm run build
npm test
bash tests/validate-brand-guidelines.sh
bash tests/validate-mobile-audit-runtime-links.sh
```

## Execution Order
1. `tests/rls-policy-tests.md`
2. `tests/privacy-leak-tests.md`
3. `tests/abuse-and-spam-tests.md`
4. `tests/auth-and-session-tests.md`
5. `tests/qr-flow-tests.md`
6. `tests/load-and-performance-tests.md`
7. `tests/observability-tests.md`
