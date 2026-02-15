# Security overview

## Security principles

- Enforce backend controls first.
- Minimize exposed fields by default.
- Validate every public read path.
- Treat alpha access controls as convenience, not trust boundary.

## Primary control plane

- Postgres RLS enforces data access in the database.
- `attendees_public` excludes `email` and other private fields.
- UI reads directory data from `attendees_public` only.
- Optional profile fields (`title`, `company`) are shown publicly only with explicit attendee consent.
- Inserts go to `attendees` with validation.

## Abuse controls

- Unique index on normalized email.
- Honeypot field must remain empty.
- Server-side validation for schema and range checks.
- Configurable route-level throttling and risk scoring for signup traffic (IP/user-agent fingerprint + heuristic weights/thresholds).
- Suspicious attempts are mirrored to moderation/audit tables with redacted structured logs.
- Duplicate-email conflict telemetry is policy-controlled via `SIGNUP_RECORD_DUPLICATE_ATTEMPTS` to keep UX stable while allowing abuse signal tuning.

## Alpha password gate

Use an optional password gate to reduce random traffic during demos.
Treat this gate as convenience only. Keep RLS and view-based data
minimization as primary controls.

## Database credential usage

- Use `DATABASE_URL` only in trusted server runtime.
- Never expose database credentials to browser clients.
- Restrict database operations to server-side code paths.

## Beta migration

- Move to authenticated sessions with role-based access.
- Add verified organizer and staff roles.
- Add policy regression tests in CI.
- Add optional SSO for enterprise admins.

## STRIDE threat model (alpha)

| Threat | Example | Primary control | Evidence |
| --- | --- | --- | --- |
| Spoofing | Bot submits fake attendee | Honeypot + validation + optional auth in beta | Abuse tests |
| Tampering | Client alters payload shape | Server-side validation + DB constraints | API tests |
| Repudiation | User denies action | Server logs and event timestamps | Observability tests |
| Information Disclosure | Email leaks in public view | `attendees_public` + RLS deny-by-default | Privacy leak tests |
| Denial of Service | Signup flood during talk | Rate limits + fallback flow | Load tests |
| Elevation of Privilege | Non-admin reads base table | No public select policy on `attendees` | RLS policy tests |

## Control-to-evidence matrix

| Control | Verification artifact | Expected result |
| --- | --- | --- |
| Base table read blocked for public roles | `ops/preflight.md` step 1, `docs/runtime-validation.md` | Access blocked |
| Public projection excludes email | `ops/preflight.md` step 3, `tests/privacy-leak-tests.md` | No `email` field |
| Duplicate email blocked | `ops/preflight.md` step 4, DB unique index | Second insert fails |
| Comfort level range enforced | `ops/preflight.md` step 5, DB check constraint | Out-of-range insert fails |
| Mobile-safe privacy rendering | `tests/ui-mobile-audit.md`, `tests/ui-mobile-audit.spec.ts` | No email exposure on mobile |

## Residual risk accepted for alpha

- Anonymous insert path can still attract burst abuse despite layered controls.
- Polling refresh can lag under venue network instability.
- Demo posture favors reliability and safety over full enterprise auth maturity.

## No-go threshold

Fail any privacy boundary check and treat the run as automatic no-go.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No dedicated security/threat-model skill exists there today.
- Applied repository security standards directly.