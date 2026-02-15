# Risk Register

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | RLS misconfiguration leaks private data | Critical | Medium | Policy tests per role and deny-by-default rules |
| R2 | Public directory includes email field by mistake | Critical | Low-Medium | Read-only from `attendees_public` and contract tests |
| R3 | QR abuse/spam inflates room metrics | High | Medium | Unique email, honeypot, server validation, throttling |
| R4 | Live demo network instability | High | Medium | Polling fallback and backup connectivity |
| R5 | Operator error in live environment | High | Medium | Checklist, dry run, and clear rollback steps |
| R6 | Password gate misinterpreted as security boundary | Medium | Medium | Explicit docs that RLS is primary control |

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No dedicated risk-register skill exists there today.
- Applied repository risk documentation standards directly.
