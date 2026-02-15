# Privacy and Security Boundary for v0 Build

## Primary boundary model

Enforce privacy and access control in Neon Postgres, then reflect that boundary in UI behavior.

## Data access contract

| Surface | Allowed source | Allowed fields | Forbidden fields |
| --- | --- | --- | --- |
| Signup insert | `attendees` | documented attendee insert payload | N/A |
| Public room board read | `attendees_public` | public-safe projection fields only | `email`, `honeypot`, internal/private notes |
| Staff/admin read path | governed server-side route | role-scoped | uncontrolled public access |

## Hard rules

- Never query base table `attendees` for public room display.
- Never render `email` in public UI, logs, toasts, or debug payloads.
- Never place `DATABASE_URL` in client code.
- Keep RLS deny-by-default posture on sensitive base tables.
- Keep password gate messaging explicit: convenience only.

## Abuse controls

- Keep honeypot field in signup payload and require empty value.
- Keep duplicate email block through unique normalized email constraint.
- Keep server-side validation for field bounds and required arrays.

## Validation checks

| Check | Expected result |
| --- | --- |
| Public read source check | Query path references `attendees_public` only |
| Email leak check | No public response contains `email` key or value |
| Duplicate signup check | Second insert with same normalized email fails |
| Comfort range check | Out-of-range value fails validation |

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository root standards from `agents.md`
