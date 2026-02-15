# Runtime validation

## Goal

Prove the live demo does not expose sensitive data, matching stays reproducible,
and facilitator decisions are fully auditable.

## 15-minute checklist

1. Confirm environment banner shows intended environment.
2. Run `ops/preflight.md` checks.
3. Confirm UI queries `attendees_public` only for public surfaces.
4. Submit one signup via QR flow.
5. Confirm room board updates within 5 seconds.
6. Confirm UI and payloads never expose email.
7. Trigger deterministic match generation for a fixed attendee subset (same `topN`, same time anchor).
8. Re-run generation and verify ordered scores/results are identical (reproducibility check).
9. Open facilitator queue and approve one suggestion + reject one suggestion.
10. Verify each decision creates exactly one immutable audit event with actor, action, and timestamp.
11. Run mobile QR sanity validation and record evidence from `tests/ui-mobile-audit.md` and `tests/ui-mobile-audit.spec.ts`.

## Expected outputs

- Base table reads block for anon and non-admin contexts.
- `attendees_public` returns only safe fields.
- `email` column does not exist in public view.
- Duplicate email insert fails.
- Out-of-range comfort level fails.
- Injected HTML renders escaped text only.
- Deterministic match replay returns identical ordered suggestion IDs and score values.
- Facilitator decision API returns updated suggestion status without private attendee fields.
- Audit table contains one appended event per approve/reject action and preserves prior events.
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
