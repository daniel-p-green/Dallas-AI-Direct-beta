# Operator Checklist (Event Day)

## Before event (T-60 to T-30)

1. Confirm branch/commit to run (release candidate on `test`).
2. Confirm env file is present and secrets are loaded.
3. Run bootstrap checks:

```bash
npm run bootstrap:beta
```

4. Run release gates:

```bash
npm run typecheck
npm test
npm run build
```

5. Run mobile audit companion:

```bash
npx playwright test tests/ui-mobile-audit.spec.ts
```

## Pre-doors smoke flow (T-20 to T-5)

1. Start app (`npm run dev` or deploy target).
2. Validate routes:
   - `/`
   - `/signup`
   - `/room`
   - `/login`
   - `/admin`
3. Verify auth posture:
   - attendee gating enabled if public beta mode
   - `/admin` requires authenticated admin session
4. Submit one test signup and confirm room update within 5 seconds.
5. Confirm no public email exposure in UI/API payloads.

## During event

1. Keep `/room` visible for live board monitoring.
2. Use `/admin` for facilitator queue review and intro decisions.
3. Track suspicious signup events and moderation queue status.
4. Record any incident timestamps and mitigation actions.

## Fallback behavior

- If attendee auth is required but unavailable: fail closed, do not run public-beta mode.
- If live data is degraded: switch to seeded sample mode for presentation continuity.
- If audit writes fail: pause facilitator decision actions until restored.

## Rollback path

1. Immediate posture rollback:
   - set `NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED=false`
   - restart service
2. Code rollback:
   - revert to last known good release commit
3. Data safety rollback:
   - keep `attendees_public` projection boundary intact
   - avoid emergency schema edits during live event window

## Ownership

- Maintainer on call: executes technical rollback and logs incident details.
- Event operator: communicates status to attendees/facilitators.
- Sponsor: decides whether to continue, pause, or cancel live workflow.
