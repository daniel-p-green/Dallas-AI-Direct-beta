# Pre-Demo Command Card

Run from repo root: `/Users/danielgreen/corex/dallas-ai-direct-alpha`

## 1) Build

```bash
npm run build
```

## 2) Core shell tests

```bash
npm test
```

## 3) Mobile audit smoke

```bash
npx playwright test tests/ui-mobile-audit.spec.ts
```

## 4) Brand guideline doc check

```bash
bash tests/validate-brand-guidelines.sh
```

## 5) Runtime checklist references

- `docs/runtime-validation.md`
- `tests/ui-mobile-audit.md`
- `ops/preflight.md`

## Go / No-Go minimum

- Build passes.
- Tests pass.
- Mobile audit passes.
- No public email exposure in UI/path checks.
