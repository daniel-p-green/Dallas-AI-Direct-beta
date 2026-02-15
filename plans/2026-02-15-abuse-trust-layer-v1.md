# Plan — Abuse/Trust Layer v1

## Scope
Add signup route protections (rate limit + risk heuristics), suspicious-event moderation logging, duplicate handling hardening, redacted structured logs, docs/runbook updates, and verification coverage.

## Ordered user-story outline
1. [x] Schema for abuse telemetry and moderation queue/audit events (US-001 in progress this session).
2. [x] Config model for route-level limits and risk thresholds.
3. [ ] Signup middleware/utilities for velocity tracking and rate limiting.
4. [ ] Risk scoring heuristics and suspicious-event recording path.
5. [ ] Duplicate-email hardening and safe response contract.
6. [ ] Redacted structured logging and incident-response hooks.
7. [ ] Tests for 429 and abuse scenarios without normal-flow regressions.
8. [ ] Docs/runbook/runtime validation updates plus final build/test evidence.

## Notes
- Keep normal attendee success path unaffected for compliant traffic.
- Never log raw email; hash or redact sensitive identifiers.
- Ensure limits are deterministic and testable.
