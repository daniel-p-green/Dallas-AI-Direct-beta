# Traceability Matrix (PRD -> Stories -> Use Cases -> Validation)

This matrix maps each numbered functional requirement in `docs/PRD.md` to:
- user-story intent in `docs/user-stories.md`
- operational behavior in `docs/use-cases.md`
- validation artifacts (tests/checklists) used before release

## Functional requirement traceability

| PRD FR | Requirement summary | User story mapping | Use case mapping | Validation evidence |
|---|---|---|---|---|
| FR-01 | Store required `name`, `email` | 1, 2, 3 | First-time event signup via QR | `tests/room-board-event-scope.test.mjs`, `docs/runtime-validation.md` |
| FR-02 | Store optional `linkedin_url`, `title`, `company` | 2, 4 | Returning member quick re-entry | `app/api/attendees/signup/route.ts` validation, `tests/signup-route-contracts.test.mjs` |
| FR-03 | Explicit consent before showing `title`/`company` publicly | 4, 16 | Consent-based profile display | `tests/facilitator-queue-endpoint.test.mjs`, `docs/privacy-and-consent.md` |
| FR-04 | Store required structured fields (`ai_comfort_level`, `help_needed`, `help_offered`) | 5, 8, 9 | AI comfort pulse check | `tests/signup-route-contracts.test.mjs`, `tests/match-scoring.test.mjs` |
| FR-05 | Store optional free text (`other_help_needed`, `other_help_offered`) | 2, 5 | Returning member quick re-entry | `components/signup-form.tsx`, `tests/signup-route-contracts.test.mjs` |
| FR-06 | Treat `email` as sensitive | 3, 15, 16 | Privacy boundary verification | `tests/privacy-leak-tests.md`, `docs/runtime-validation.md` |
| FR-07 | Public UI reads `attendees_public` only | 3, 8, 15 | Public-safe room board display | `tests/room-board-event-scope.test.mjs`, `ops/preflight.md` |
| FR-08 | Insert path writes to `attendees` | 1, 2 | First-time event signup via QR | `app/api/attendees/signup/route.ts`, `docs/runtime-validation.md` |
| FR-09 | Display aggregates without private fields | 8, 9 | Public-safe room board display | `tests/room-board-event-scope.test.mjs`, `docs/runtime-validation.md` |
| FR-10 | Show approved Dallas AI logo assets | 1, 8 | Demo readiness gate | `tests/app-shell.test.mjs`, `tests/validate-brand-guidelines.sh` |
| FR-11 | Active event-session context for attendee association/filtering | 6, 8 | Active event-session management; Event-scoped check-in | `tests/event-session-runtime.test.mjs`, `tests/room-board-event-scope.test.mjs` |
| FR-12 | Organizer can switch active event (single-active invariant) | 6, 14 | Active event-session management | `tests/event-session-runtime.test.mjs`, `docs/runtime-validation.md` |
| FR-13 | Enforce check-in windows + machine-readable closure code | 7, 14 | Event-scoped check-in | `tests/signup-abuse-protections.test.mjs`, `docs/runtime-validation.md` |
| FR-14 | Deterministic networking suggestions from attendee intent | 10, 11 | Match generation run | `tests/match-scoring.test.mjs`, `tests/match-generation-endpoint.test.mjs` |
| FR-15 | Stable weights/tie-breaks and reproducible reruns | 10, 17 | Match generation run | `tests/match-scoring.test.mjs`, `docs/runtime-validation.md` |
| FR-16 | Immutable, auditable facilitator intro decisions | 12, 17 | Facilitator decision action | `tests/match-decision-endpoint.test.mjs`, `tests/intro-outcomes-workflow.test.mjs` |
| FR-17 | Queue review + approve/reject + actor attribution | 11, 12 | Facilitator queue review; Facilitator decision action | `tests/facilitator-queue-endpoint.test.mjs`, `tests/admin-review-ui.test.mjs` |
| FR-18 | Configurable signup abuse controls for burst traffic | 13, 14 | Abuse resistance during live event | `tests/signup-abuse-protections.test.mjs`, `tests/signup-protection-config.test.mjs` |
| FR-19 | Redacted trust-event logs for operations | 13, 15 | Abuse resistance during live event | `tests/abuse-trust-schema.test.mjs`, `tests/abuse-trust-docs-consistency.test.mjs` |
| FR-20 | Match APIs/admin UI never expose private fields (email) | 11, 16 | Facilitator queue review; Privacy boundary verification | `tests/facilitator-queue-endpoint.test.mjs`, `tests/match-decision-endpoint.test.mjs` |

## Notes

- Release gate commands are defined in `docs/START-HERE.md` and must pass before handoff signoff.
- Runtime validation details for event-day operation live in `docs/runtime-validation.md`.
