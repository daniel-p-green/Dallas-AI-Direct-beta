# agents.md (tests)

## Folder Purpose

Define markdown-based test plans for security, privacy, abuse resistance, auth, QR flow, performance, and observability.

## Output Standards

- Use scenario-driven test cases.
- Include preconditions, steps, expected results, and evidence fields.
- Prioritize security-critical negative tests.

## Update Rules

- Add tests when new fields, flows, or controls appear.
- Keep test IDs stable for traceability.
- Update test matrix when RLS policies change.

## Security Rules

- Never include real or personal emails in test data.
- Directory reads only from `attendees_public`.
- Validate that public paths never return `email`.

## Skills Usage Instructions

- Skills directory: `~/.codex/skills`.
- Scan for `neon`, `rls`, `threat`, and `tests` before edits.
- Apply the smallest relevant set and add `Skills used` when helpful.

## Definition of Done

- Test plans cover required controls and failure modes.
- Critical paths include pass/fail criteria.
- Privacy leak tests block release when failing.
