# START HERE (Demo Build Version)

Use this file to run the fastest safe path before live demo.

## Read in this order

1. `docs/PRD.md`
2. `docs/rls-policies.md`
3. `docs/security.md`
4. `docs/runtime-validation.md`
5. `docs/PRE-DEMO-COMMAND-CARD.md`

## Run now

```bash
npm run build
npm test
npx playwright test tests/ui-mobile-audit.spec.ts
bash tests/validate-brand-guidelines.sh
```

## Go / No-Go

Go only if all commands pass and privacy checks pass.

No-Go if:
- any test fails
- any public path exposes email
- any boundary check fails in `ops/preflight.md`

## Source-of-truth rule

If docs conflict, follow:
1. `docs/rls-policies.md`
2. `docs/runtime-validation.md`
3. `docs/PRD.md`

## Skills used

- Source: `~/.codex/skills`
- Applied: `verification-before-completion`, `webapp-testing`, `neon-postgres-best-practices`
- Notes: Used to keep launch checks deterministic and security-first.