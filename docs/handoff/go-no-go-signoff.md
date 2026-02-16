# Go / No-Go Signoff (Dallas AI Beta)

Use this form before each public-beta event launch.

## Release decision criteria

## Go only if all are true

- `npm run bootstrap:beta` passes.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
- `npx playwright test tests/ui-mobile-audit.spec.ts` passes.
- Runtime validation checks pass (`docs/runtime-validation.md`).
- `/admin` auth works and facilitator decisions write auditable events.
- No public email exposure in `/room`, `/api/attendees/public`, or admin queue payloads.

## Automatic No-Go conditions

- Attendee auth is required and Clerk keys are missing.
- Any gate command fails.
- Any privacy-boundary check fails.
- Facilitator decision writes or audit trail checks fail.

## Accepted known gaps this cycle

- Pre-provisioned Neon snapshot is acceptable.
- Clean-room bootstrap from empty DB is deferred.

## Signoff record

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Maintainer |  | Go / No-Go |  |  |
| Operator |  | Go / No-Go |  |  |
| Sponsor |  | Go / No-Go |  |  |

## Evidence links

- Plan: `plans/2026-02-16-dallas-ai-handoff-readiness.md`
- Traceability: `docs/traceability-matrix.md`
- Runtime checklist: `docs/runtime-validation.md`
- Open TODO: `docs/OPEN-TODO.md`
