# Incident Response

## Severity Levels
- Sev-1: Confirmed sensitive data exposure.
- Sev-2: Security control failure without confirmed leak.
- Sev-3: Reliability degradation with preserved privacy.

## Immediate Actions
1. Freeze public directory output if leak suspected.
2. Disable affected endpoint or view route.
3. Preserve logs and query history for forensic review.
4. Notify internal owner and security lead.

## Abuse/Trust Layer v1 triage workflow

### 1) Inspect redacted signup trust logs
- Filter for `event: signup_trust_decision` and `schemaVersion: 2026-02-15.v1`.
- Build timeline by `decision` (`allow`, `flag`, `block`) and `routeOutcome` (`signup_created`, `duplicate_email_conflict`, `rate_limit_exceeded`, etc.).
- Confirm logs include only redacted/hash identifiers (`emailHash`, `emailRedacted`, `ipHash`, `requestFingerprintHash`) and no raw email/IP.

### 2) Confirm suspicious-event persistence
- Query `signup_risk_events` for the suspect time window and fingerprint hash.
- Query `signup_moderation_queue` for linked entries and verify `risk_event_id` correlation.
- Validate queue status progression (`suggested` -> resolved state) and moderation notes/actor metadata.

### 3) Validate rate-limit behavior
- Re-run burst simulation (`max requests + 1` inside one window for the same fingerprint).
- Confirm deterministic `429` behavior and stable `X-RateLimit-*`/`Retry-After` headers.
- If limits are too strict/lenient, adjust env config and redeploy with change log entry.

### 4) Preserve evidence
- Save a redacted incident packet containing:
  - trust-decision log samples
  - linked `signup_risk_events` + `signup_moderation_queue` records
  - runtime validation command outputs and timestamps

## Containment Playbook
- Rotate exposed credentials if needed.
- Patch policy or query path.
- Re-run privacy and RLS test plans.
- Re-enable service only after validation passes.

## Communication Rules
- Use factual updates.
- Avoid speculative root-cause statements.
- Exclude sensitive data from all status messages.
