# Auth + Matchmaking + Product-Doc Audit (Current Branch)

## Scope and context
- Branch: `codex/v0-ui-neon-merge-refactor`
- Primary objective: stabilize UI button consistency, fix login/auth reliability, add lightweight networking value (`You Should Meet...`), and audit product docs for high-value, low-creep roadmap opportunities.
- Evidence sources:
  - Code + tests in this branch
  - Visual captures under `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/`
  - Product docs: `docs/PRD.md`, `docs/JTBD.md`, `docs/user-stories.md`, `docs/use-cases.md`

## Verification status (release gates)
- `npm run typecheck`: pass
- `npm test`: pass (`122` passing)
- `npm run build`: pass

## What changed in this pass
1. Admin auth/login hardening
- Added Neon-backed admin auth/session flow:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/session/route.ts`
  - `lib/auth.ts`
  - `lib/auth-guard.ts`
- Added admin DB schema support:
  - `db/migrations/202602151430_admin_auth_schema.sql`
- Protected admin/runtime-sensitive operations with admin-session checks.
- Fixed `/login` build/runtime behavior by removing `useSearchParams` dependency from prerender path and using a client-safe URL parser.

2. UI button and shell consistency
- Standardized button class usage across key user surfaces and navigation CTAs:
  - `components/shared-header.tsx`
  - `components/hero-section.tsx`
  - `components/signup-form.tsx`
- Preserved v0-style dark shell while improving consistency of primary/secondary action sizing.

3. New networking feature: `You Should Meet...`
- Added API endpoint:
  - `GET /api/matches/you-should-meet`
  - File: `app/api/matches/you-should-meet/route.ts`
- Added room-board UI section and fetch integration:
  - `components/room-board.tsx`
- Behavior:
  - Reuses latest deterministic match run
  - Event-scoped when active event/session exists
  - Privacy-safe response projection (no email exposure)
  - Deduplicates reciprocal pairs and adds concise "why" reasons

4. Test coverage additions
- Added endpoint/UI contract checks:
  - `tests/you-should-meet-endpoint.test.mjs`

## Auth architecture decision: Neon-only vs Clerk

## Recommendation
- Keep current Neon-backed custom admin auth for now.
- Do **not** introduce Clerk in this sprint.

## Why
- Current requirement is admin/operator auth, not full attendee identity.
- Neon + existing server-side session cookie model is now in place and passing gates.
- Clerk introduces integration and migration overhead (provider setup, middleware, callback/redirect alignment, role mapping) that is not required for current beta goals.

## Trigger to adopt Clerk later
Adopt Clerk when at least one becomes true:
1. Attendee self-serve accounts/profile history are in-scope.
2. Social login / enterprise SSO is required.
3. Multi-tenant auth, delegated org admin, or complex identity lifecycle is needed.

## Current residual auth risks to track
1. In-memory login throttling map resets on server restart and does not coordinate across instances.
2. No MFA or step-up auth for admin actions.
3. No centralized auth telemetry dashboard yet.

## UI/UX audit (post-fix snapshot)

## Strengths
1. Landing hierarchy and CTA flow now match v0 intent with cleaner button consistency.
2. Signup form interaction density remains high-quality and readable in dark mode.
3. Room board now has a clear networking affordance via "You Should Meet..." without overwhelming the existing flow.

## Remaining polish opportunities (non-blocking)
1. Add subtle overflow affordance for horizontal pill rows on mobile.
2. Add route-variant shell for `/login` and `/admin` that removes growth CTAs to sharpen admin intent.
3. Add loading skeleton for "You Should Meet..." section to improve perceived responsiveness.

## Product-doc audit (PRD/JTBD/User Stories/Use Cases)

## Alignment strengths
1. Docs consistently center on event-session reliability, privacy boundaries, and deterministic networking.
2. JTBD and stories align with operational realities of a volunteer-run event team.
3. Use-cases clearly capture check-in, facilitation, moderation, and demo readiness gates.

## Gaps worth tightening
1. No explicit story/use-case for attendee post-event follow-up loop (soft outcomes, not CRM-heavy).
2. No explicit success metric for intro conversion quality (for example accepted/acted intro rate).
3. Limited definition of organizer workflows after event close (handoff notes, quick retro signals).

## Low-creep, high-value feature additions (recommended)

| Priority | Idea | Value | Effort | Why low-creep |
|---|---|---|---|---|
| 1 | "Intro delivered" one-click outcome flag in admin queue | High | Low | Extends existing match decision model without new auth/domain surfaces |
| 2 | 24-hour follow-up card in room/admin summary (`Top intros to follow up`) | High | Low | Uses existing approved suggestions + event scope |
| 3 | Post-event micro-pulse (1 question): "Did you meet someone relevant?" | High | Low-Med | Adds one bounded feedback signal; no account system needed |
| 4 | "Needs attention" organizer banner (check-in closed, no active event, queue stale) | Med-High | Low | Operational UX layer over existing state |
| 5 | Lightweight attendee "availability now" toggle during event | Med | Med | Reuses room board state; optional and temporary |

## Explicit anti-creep guardrails
1. No attendee account system in this phase.
2. No CRM or outbound campaign tooling.
3. No free-form messaging/chat system.
4. Keep each incremental feature behind existing data boundaries and event scoping.

## Suggested next sprint slice (1 week)
1. Add intro outcome flag + summary counts.
2. Add post-event micro-pulse endpoint and aggregate metric.
3. Add admin shell variant and small mobile overflow cues.
4. Add tests for intro outcome flow and micro-pulse privacy constraints.

## Visual evidence index
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/home-mobile-390.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/home-desktop-1440.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/signup-mobile-390.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/signup-desktop-1440.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/room-mobile-390.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/room-desktop-1440.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/login-mobile-390.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/login-desktop-1440.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/admin-mobile-390.png`
- `docs/reviews/2026-02-15-auth-matchmaking-doc-audit-assets/admin-desktop-1440.png`

## Skills used
- `find-skills`: confirmed and aligned review workflow with requested skill lenses.
- `writing-plans`: execution plan tracked in `plans/2026-02-15-auth-matchmaking-doc-audit.md`.
- `frontend-design`: used as rubric for visual consistency and interaction quality review.
- `browser-use`/browser automation: route-level visual evidence capture.
- `humanizer`: used to keep recommendations concise and natural for decision-making.
