# Product requirements document

## Problem

Dallas AI operates a large, volunteer-led community with 10k+ members spread across Meetup, LinkedIn, and email touchpoints. The practical event problems are:

1. Organizers need real-time in-room attendee visibility during events that can range from small workshops to 300+ person sessions.
2. Attendees need meaningful networking outcomes, not just attendance (for example reducing “didn’t meet anyone” outcomes).
3. Trust must be preserved by design: private attendee data cannot leak on public surfaces.
4. Volunteer operators need a repeatable, low-friction workflow they can run reliably each event.

## Research evidence snapshot (Dallas AI, Feb 2026)

- Dallas AI public positioning emphasizes nonprofit, professional learning + networking, and multi-channel engagement.
- Meetup page observations: ~10,209 members, 4.6 rating across 1,063 ratings, recent events with 301 and 126 attendees.
- Meetup feedback taxonomy explicitly tracks networking/safety/expectation outcomes (for example “Met new people”, “I felt safe”, “Not as described”, “Didn’t meet anyone”, “Wasn’t punctual”).

Reference: `docs/research/dallas-ai-problem-research-2026-02-15.md`

## Primary personas

- New member / first-time event attendee
- Regular returning member
- Event organizer / facilitator
- Ops and security reviewer
- Volunteer maintainer / contributor

## Product scope (beta baseline)

- QR signup flow during talk Q and A.
- Attendee insert path to secure base table.
- Public directory reads from `attendees_public` only.
- Aggregates for room count and AI comfort distribution.
- Invite + Match Engine with deterministic scoring and facilitator review queue.
- Runtime validation gate before any live demo.

## Beta implementation plan (problem-aligned)

### Theme A: Event operations at scale
- Event-session scoping so room board and check-in are tied to the correct live event.
- Fast fallback behavior for degraded live data situations.

### Theme B: Networking outcome quality
- Deterministic matching logic from `help_needed` ↔ `help_offered` and `ai_comfort_level` proximity.
- Facilitator queue workflow for approve/reject decisions before intros are operationalized.
- Match generation and decision actions are persisted with immutable audit events.

### Theme C: Trust and safety for live events
- Abuse/throttle protection on signup path.
- Redacted operational logs and moderation trail for suspicious behavior.
- Privacy-safe match payloads that never expose private email on APIs or UI surfaces.

## Explicitly out of scope (current beta)

- OAuth/SSO and identity federation.
- Full attendee profile management/history.
- CRM/payment integrations.
- Advanced admin moderation console beyond essential review actions.

## Hero moment requirements

- Attendee completes signup in about 30 seconds.
- Room board updates within 5 seconds.
- Board shows only safe public fields.
- Email never appears in public output.
- Facilitator can generate deterministic top-N match suggestions and resolve queue items confidently.

## Functional requirements

1. System stores required fields: `name`, `email`.
2. System stores optional fields: `linkedin_url`, `title`, `company`.
3. System requires explicit attendee consent before displaying optional `title` or `company` on public surfaces.
4. System stores required structured fields:
   - `ai_comfort_level` as integer `1..5`
   - `help_needed` as `text[]`
   - `help_offered` as `text[]`
5. System stores optional free-text fields:
   - `other_help_needed`
   - `other_help_offered`
6. System treats `email` as sensitive.
7. Public UI reads from `attendees_public` only.
8. Insert path writes to `attendees`.
9. System displays aggregate metrics without private fields.
10. System displays approved Dallas AI logo assets on shared demo shell and hero surfaces.
11. System supports active event-session context for attendee association and room-board filtering.
12. System supports deterministic networking suggestions from attendee intent fields.
13. Deterministic scoring uses stable weights and tie-breaks; repeated runs over the same snapshot produce reproducible results.
14. System records facilitator intro decisions in an immutable, auditable trail.
15. Facilitator workflow supports queue review, approve/reject actions, and actor attribution for each decision event.
16. System applies configurable signup abuse controls for burst traffic.
17. System produces redacted trust-event logs suitable for volunteer operations.
18. Match APIs and admin UI surfaces must never expose private fields, including attendee email.

## Non-functional requirements

- Security-first backend controls with RLS.
- Demo-ready reliability under moderate live traffic.
- Auditability of policy behavior and test evidence.
- Maintainability for Dallas community handoff (clear docs + deterministic local setup).
- Operational simplicity for volunteer-led execution.

## Success metrics and release gates

### Product success metrics
- Signup completion time: median <= 30 seconds in demo conditions.
- Board freshness: attendee appears on room board within <= 5 seconds.
- Privacy incidents: zero public email exposure in demo/public surfaces.
- Demo reliability: no critical-path failure during standard event walkthrough.
- Networking signal quality: facilitator can act on relevant intro candidates during session.
- Match reproducibility: deterministic generator returns the same ordered top-N results when replayed with fixed inputs/time.

### Release gates (must pass)
- `npm run typecheck`
- `npm test`
- `npm run build`
- Runtime/privacy checklist from `docs/runtime-validation.md` and `ops/preflight.md`

## Assumptions and constraints

### Assumptions
- Event has working internet and QR scanning capability.
- Neon Postgres is reachable and configured with required schema/RLS.
- Organizers use room board for facilitation, not as a source of legal/compliance truth.
- Dallas AI Direct remains free/open-source community infrastructure.

### Constraints
- Email remains sensitive and non-public under all public-read flows.
- Public reads must continue to use `attendees_public` projection boundary only.
- Changes that affect privacy controls require docs + validation updates in same PR.
- Facilitator decisions are auditable and cannot silently overwrite prior decision events.

## Risks

- Live-event traffic spikes may degrade responsiveness.
- Misconfigured RLS/policies could break reads or violate privacy guarantees.
- Documentation drift can cause maintainers to ship unsafe changes.
- Channel fragmentation (Meetup/LinkedIn/email) may reduce data continuity if event context is weak.

## Traceability

- Community problem research: `docs/research/dallas-ai-problem-research-2026-02-15.md`
- Personas and journeys: `docs/user-stories.md`
- Operational scenarios: `docs/use-cases.md`
- Data/privacy boundary design: `docs/data-model.md`, `docs/rls-policies.md`
- Runtime verification: `docs/runtime-validation.md`, `ops/preflight.md`
- Invite + Match Engine plan: `plans/2026-02-15-invite-match-engine.md`

## Skills used

- Scanned `~/.codex/skills` and used `antfarm-workflows/SKILL.md` for workflow execution conventions.
- Applied repository documentation standards directly.
