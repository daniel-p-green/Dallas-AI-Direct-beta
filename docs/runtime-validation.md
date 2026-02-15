# Runtime validation

## Goal

Prove the live demo does not expose sensitive data, matching stays reproducible,
and facilitator decisions are fully auditable.

## 15-minute checklist

1. Confirm environment banner shows intended environment.
2. Run `ops/preflight.md` checks.
3. Confirm UI queries `attendees_public` only for public surfaces.
4. Submit one signup via QR flow.
5. Confirm organizer can create/activate an event via `POST /api/events` (`action: create|activate`) and validate one active session.
6. Submit one signup and confirm row links to the active event (`attendees.event_id = active event id`).
7. Set active-event `check_in_window_start` in the future (or `check_in_window_end` in the past), then submit signup and confirm API returns `403` with `code: "CHECK_IN_WINDOW_CLOSED"`.
8. Confirm room board updates within 5 seconds and displays active session context.
8. Confirm UI and payloads never expose email.
9. Trigger deterministic match generation for a fixed attendee subset (same `topN`, same time anchor).
10. Re-run generation and verify ordered scores/results are identical (reproducibility check).
11. Open facilitator queue and approve one suggestion + reject one suggestion.
12. Verify each decision creates exactly one immutable audit event with actor, action, and timestamp.
13. Execute deterministic burst test: submit `SIGNUP_RATE_LIMIT_MAX_REQUESTS + 1` signups in a single `SIGNUP_RATE_LIMIT_WINDOW_MS` window from the same fingerprint; confirm final response is `429` with stable `X-RateLimit-*` and `Retry-After` headers.
14. Trigger one normal signup, one suspicious signup (honeypot or duplicate), and one blocked/rate-limited attempt; confirm `signup_trust_decision` logs include `decision` allow/flag/block with `schemaVersion: 2026-02-15.v1`.
15. Verify suspicious-event persistence: confirm corresponding rows are written to both `signup_risk_events` and `signup_moderation_queue` with matching `risk_event_id` linkage.
16. Confirm signup trust logs contain hashed/redacted identifiers only (`emailHash`, `emailRedacted`, `ipHash`) and no raw email/IP values.
17. Run mobile QR sanity validation and record evidence from `tests/ui-mobile-audit.md` and `tests/ui-mobile-audit.spec.ts`.

## Expected outputs

- Base table reads block for anon and non-admin contexts.
- `attendees_public` returns only safe fields.
- `email` column does not exist in public view.
- Duplicate email insert fails.
- Out-of-range comfort level fails.
- Injected HTML renders escaped text only.
- Active event lookup returns one active session at a time.
- Signup writes include `event_id` when an active event exists; legacy fallback remains `null` when no active event is configured.
- Signup attempts outside the active event check-in window return `403` with `code: "CHECK_IN_WINDOW_CLOSED"`.
- Room board API returns event-scoped attendees plus scoped aggregate metrics.
- Deterministic match replay returns identical ordered suggestion IDs and score values.
- Facilitator decision API returns updated suggestion status without private attendee fields.
- Audit table contains one appended event per approve/reject action and preserves prior events.
- Burst replay over configured limit deterministically returns `429` with stable rate-limit headers.
- Suspicious signup attempts persist linked records across `signup_risk_events` and `signup_moderation_queue` for moderator triage.
- Mobile QR sanity evidence confirms:
  - iPhone Safari and Android Chrome were validated.
  - 375px signup behavior has no horizontal overflow.
  - Public room view shows privacy-safe output (no email).

## Mobile QR sanity

Run `tests/ui-mobile-audit.md` on iPhone Safari and Android Chrome.
Confirm QR entry, form usability at 375px width, consent default state,
room-board privacy badge visibility, newest-first behavior, and no public email.

Automated assertion companion: `tests/ui-mobile-audit.spec.ts`.

Use `docs/PRE-DEMO-COMMAND-CARD.md` as the execution order for pre-demo checks.

## Failure response

- Switch to seeded dataset mode.
- Keep public board on safe projection.
- Disable facilitator decision actions for the session if audit writes fail.
- Present `docs/rls-policies.md` and `docs/privacy-and-consent.md`.
- State mitigation and next remediation step.
