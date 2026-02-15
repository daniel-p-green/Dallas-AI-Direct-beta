# Plan — Abuse/Trust Layer v1

## Scope
Add signup route protections (rate limit + risk heuristics), suspicious-event moderation logging, duplicate handling hardening, redacted structured logs, docs/runbook updates, and verification coverage.

## Ordered user-story outline
1. [x] Schema for abuse telemetry and moderation queue/audit events (US-001 complete).
2. [x] Config model for route-level limits and risk thresholds (US-002 complete).
3. [x] Signup middleware/utilities for velocity tracking and rate limiting.
4. [x] Risk scoring heuristics and suspicious-event recording path.
5. [x] Duplicate-email hardening and safe response contract.
6. [x] Redacted structured logging and incident-response hooks.
7. [x] Tests for 429 and abuse scenarios without normal-flow regressions.
8. [x] Docs/runbook/runtime validation updates plus final build/test evidence.

## Notes
- Keep normal attendee success path unaffected for compliant traffic.
- Never log raw email; hash or redact sensitive identifiers.
- Ensure limits are deterministic and testable.

## Story execution updates
- US-003: Added deterministic rate-limit snapshot/headers (`X-RateLimit-*`, `Retry-After`) on signup 429 responses and updated abuse-protection tests to lock the 429 contract.

- US-004: Extracted deterministic risk scoring into `lib/signup-risk-scoring.ts`/`.mjs`, wired signup route to shared scorer, and added tests covering heuristic score math plus suspicious-event/moderation persistence + redaction safeguards.

- US-005: Hardened duplicate-email conflict flow to preserve stable 409 UX contract, use captured signup email/fingerprint in telemetry, and gate duplicate event recording behind configurable policy (`SIGNUP_RECORD_DUPLICATE_ATTEMPTS`) with regression tests for first-time success behavior.
