# Contributing

Thanks for helping improve Dallas AI Direct.

## Priorities
1. Keep attendee privacy guarantees intact.
2. Keep demo flow reliable (`/signup` -> `/room`).
3. Keep docs aligned with behavior in the same PR.

## Local workflow

```bash
npm ci
npm run typecheck
npm test
npm run build
```

## Branch and PR expectations
- Use short-lived branches.
- Keep PRs scoped and reviewable.
- Include:
  - what changed
  - risk/impact
  - verification output
  - rollback note

## Security and privacy
- Do not expose private attendee fields on public surfaces.
- Treat DB boundary controls (RLS + projection view) as non-negotiable.
- If changing data model or policies, update:
  - `docs/data-model.md`
  - `docs/rls-policies.md`
  - `docs/runtime-validation.md` (if validation behavior changed)

## Maintainer handoff intent
This repo is intended to be community-maintained by Dallas AI developers over time. If you want to help as a maintainer, open an issue labeled `maintainers`.
