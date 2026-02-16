# Execution Plan: Dallas AI Handoff Readiness (Ops-Ready Beta)

## Goal
- Problem: Dallas AI needs a deterministic, operations-ready handoff package with clear ownership, verified runtime behavior, and no unresolved P0/P1 blockers in docs/product alignment.
- Target outcome: Merge a scoped handoff PR that closes P0/P1 blockers, delivers `docs/handoff/*`, and records verification evidence (`typecheck`, `test`, `build`, UI audit, bootstrap).

## Scope
- In scope:
  - Merge readiness baseline from `test` including PR #11 fixes.
  - Clarify `/admin` as authenticated operational tooling (not non-privileged demo-only).
  - Add signup UI support for `other_help_needed` and `other_help_offered`.
  - Add traceability matrix from PRD requirements -> stories/use-cases -> validation checks.
  - Add dedicated signup error-path contract tests.
  - Create handoff packet under `docs/handoff/`.
  - Synchronize README/START-HERE/runtime/TODO docs.
- Out of scope:
  - Changing public API paths.
  - Introducing new auth providers/endpoints.
  - Clean-room DB bootstrap from empty Neon instance (pre-provisioned snapshot assumed).

## Approach
- Proposed change:
  - Implement the smallest additive code/doc updates needed to close P0/P1 blockers.
  - Preserve current runtime behavior and route contracts.
  - Validate with existing node:test and build gates, plus mobile audit script and bootstrap checks.
- Alternatives considered:
  - De-scoping `other_help_*` fields: rejected (user selected implementation).
  - Deferring traceability and test gaps: rejected (P0+P1 treated as blockers).

## Tasks
- [x] Confirm PR #11 state and branch baseline.
- [x] Create handoff execution plan artifact.
- [x] Update admin posture docs across README/START-HERE/runtime/TODO.
- [x] Add `other_help_*` optional free-text fields in signup UX and payload.
- [x] Add traceability matrix doc and cross-links.
- [x] Add dedicated signup error-path test coverage.
- [x] Create `docs/handoff/*` packet.
- [x] Run verification commands and collect evidence.
- [x] Prepare PR body using harness contract.

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx playwright test tests/ui-mobile-audit.spec.ts`
- `npm run bootstrap:beta`

## Risks + rollback
- Risks:
  - Docs drift if references are not cross-linked consistently.
  - Signup UI additions could regress payload shape if not wired to existing keys.
  - Bootstrap check may fail without local env secrets (expected in clean env).
- Rollback:
  - Revert scoped handoff commit(s) from `codex/handoff-readiness-2026-02-16`.
  - Disable attendee auth gate (`NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED=false`) as immediate runtime fallback.

## Verification evidence

Executed in `/private/tmp/dallas-ai-handoff-1771222502`:

1. `npm run typecheck`
   - Outcome: PASS
   - Evidence: `tsc --noEmit` completed successfully.
2. `npm test`
   - Outcome: PASS
   - Evidence: `134 passed, 0 failed`.
3. `npm run build`
   - Outcome: PASS
   - Evidence: Next.js production build completed with app and API routes compiled.
4. `BASE_URL=http://localhost:3011 npx playwright test tests/ui-mobile-audit.spec.ts`
   - Outcome: PASS
   - Evidence: `2 passed, 0 failed`.
5. Breakpoint sanity capture (`320/390/768/1024/1440` on `/`, `/signup`, `/room`, `/login`, `/admin`)
   - Outcome: PASS
   - Evidence: `docs/reviews/2026-02-16-handoff-mobile-sanity/README.md` + screenshots.
6. `npm run bootstrap:beta`
   - Outcome: FAIL (expected in clean environment without secrets)
   - Evidence: `ERROR: Missing required env var DATABASE_URL`.
   - Follow-up: requires operator-provided runtime secrets before final launch signoff.
