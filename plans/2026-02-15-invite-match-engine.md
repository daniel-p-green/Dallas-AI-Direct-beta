# Plan — Invite + Match Engine (Feature Set A)

## Scope
Implement deterministic attendee matching, facilitator approval workflow, audit trail, privacy-safe APIs/UI, and docs/test updates.

## Ordered user-story outline
1. DB schema for match runs, match suggestions, and decision audit events.
2. Deterministic scoring service (overlap + comfort proximity + consent + recency) with unit tests.
3. Backend generation API for top-N per attendee and facilitator queue persistence.
4. Backend decision API for approve/reject actions with immutable audit events.
5. Privacy contract hardening for new APIs (no email/private fields leakage) with tests.
6. Admin UI for facilitator review and approve/reject flow.
7. Docs updates (PRD/use-cases/user-stories/runtime validation) for new workflow.
8. End-to-end integration validation and release-gate evidence update.

## Notes
- Preserve `attendees_public` read boundary for any public surface.
- Keep matching reproducible via deterministic tie-breakers.
- Store scoring inputs/weights used at generation time for auditability.

## Story focus (US-003)
- [x] Add `POST /api/matches/generate` endpoint with `topN` + optional attendee filtering
- [x] Persist `match_runs` + `attendee_matches` inside one DB transaction
- [x] Return privacy-safe response payload (no email/private-only fields)
- [x] Add endpoint contract tests for persistence, deterministic ranking call, and score/audit fields

## Story focus (US-004)
- [x] Add `GET /api/matches/facilitator-queue` endpoint with pagination and status/run filters
- [x] Join suggestions to source + matched attendee records and project consent-aware public-safe fields
- [x] Ensure queue response contract is stable for admin UI rendering metadata
- [x] Add endpoint tests covering pagination/filtering determinism and no-email privacy boundary

## Story focus (US-005)
- [x] Add `POST`/`PATCH` decision endpoint at `/api/matches/[suggestionId]/decision` with strict `approve|reject` validation
- [x] Enforce transition guardrails (`suggested` -> `approved|rejected`) and return non-2xx for finalized suggestions
- [x] Persist match status update + immutable `match_decision_events` row in a single transaction
- [x] Return facilitator-safe response payload with no private attendee fields and add contract tests

## Story focus (US-006)
- [x] Replace admin placeholder UI with facilitator queue list and score breakdown cards from queue API
- [x] Wire approve/reject controls to decision endpoint with optimistic local update and background refresh
- [x] Render success/error states and pending-action button state for operator feedback
- [x] Keep UI privacy-safe by showing consent-safe title/company fields only and no email rendering
- [x] Add UI flow tests covering queue fetch wiring, decision actions, and privacy guardrails

## Story focus (US-008)
- [x] Update `docs/PRD.md` with deterministic match requirements, facilitator workflow, auditability, and privacy constraints
- [x] Update `docs/use-cases.md` and `docs/user-stories.md` with facilitator queue review + decision journeys
- [x] Update `docs/runtime-validation.md` with reproducibility and decision-audit verification steps
- [x] Add docs consistency tests for invite + match engine documentation contracts
- [x] Verify `npm run typecheck`, `npm test`, and `npm run build` pass

## Story focus (US-009)
- [x] Run `npm run typecheck` and record pass/fail evidence for PR contract
- [x] Run `npm test` and record integration gate results for invite + match engine
- [x] Run `npm run build` and record release-gate output
- [x] Verify no unresolved `TODO`/`FIXME` markers remain in invite + match engine implementation surfaces
- [x] Publish final validation artifact at `docs/us-009-validation-report.md`
