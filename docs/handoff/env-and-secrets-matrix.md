# Environment and Secrets Matrix

## Required variables

| Variable | Required when | Purpose | Supplier owner | Rotation owner | Notes |
|---|---|---|---|---|---|
| `DATABASE_URL` | Always | Neon connection string for app and APIs | Sponsor/Infra | Sponsor/Infra | Must point to provisioned beta database |
| `SESSION_SECRET` | Always | Admin session signing | Maintainer | Maintainer | Minimum 32 chars random secret |
| `ADMIN_EMAIL` | Always | Admin login identity seed | Sponsor | Sponsor | Used by `npm run seed:admin` |
| `ADMIN_PASSWORD` | Always | Admin login credential seed | Sponsor | Sponsor | Rotate after handoff acceptance |
| `NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED` | Always | Controls attendee gating posture | Maintainer | Maintainer | `true` recommended for public beta |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | If attendee gating enabled | Clerk public key | Sponsor | Sponsor | Required with secret key for attendee auth |
| `CLERK_SECRET_KEY` | If attendee gating enabled | Clerk server key | Sponsor | Sponsor | Missing key in gated mode is No-Go |
| `NEXT_PUBLIC_SHOW_ENV_BANNER` | Optional | Show environment ribbon in shell | Maintainer | Maintainer | Keep `false` for screenshot parity |
| `SIGNUP_RATE_LIMIT_WINDOW_MS` | Optional | Abuse-control window size | Maintainer | Maintainer | Defaults from config if unset |
| `SIGNUP_RATE_LIMIT_MAX_REQUESTS` | Optional | Abuse-control max attempts/window | Maintainer | Maintainer | Tune by event size |

## Recommended secret handling

1. Store secrets in deployment platform secret manager, not in repository.
2. Keep local `.env.local` out of version control.
3. Rotate admin and Clerk secrets at each major event cycle.
4. Re-run `npm run bootstrap:beta` after any secret rotation.

## Pre-flight owner check

- Maintainer confirms variable presence and app startup.
- Sponsor confirms production secret values and access continuity.
- Operator confirms runbook path (`docs/handoff/operator-checklist.md`).
