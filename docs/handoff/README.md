# Dallas AI Handoff Packet (Ops-Ready Beta)

This packet is the maintainer/operator contract for running Dallas AI Direct in public-beta mode.

## Recommended operating mode

- Auth posture: gated attendee mode (`NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED=true`)
- Backend: Neon (pre-provisioned snapshot accepted this cycle)
- Branch posture: operate from `test`; promote to `main` only via reviewed PR

## Packet contents

1. `docs/handoff/operator-checklist.md`
   - event-day run order
   - smoke flow
   - rollback path
2. `docs/handoff/env-and-secrets-matrix.md`
   - required environment variables
   - ownership for supplying/rotating each secret
3. `docs/handoff/go-no-go-signoff.md`
   - launch decision rubric
   - signoff table and evidence expectations

## Must-read supporting docs

- `docs/START-HERE.md`
- `docs/runtime-validation.md`
- `docs/traceability-matrix.md`
- `docs/OPEN-TODO.md`

## Accepted gaps this cycle

- Clean-room bootstrap from an empty Neon project is not a blocker for this handoff.
- Pre-provisioned Neon snapshot is accepted for this beta cycle.

## Ownership split

- Maintainer: code changes, migrations, verification gates, docs updates.
- Operator: event-day execution, runbook adherence, incident response.
- Sponsor (Dallas AI lead): policy approval, launch go/no-go, and secret stewardship.
