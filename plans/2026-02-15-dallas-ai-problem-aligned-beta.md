# Execution Plan: Dallas AI Problem-Aligned Beta

## Goal
- Problem: current product direction risks drifting from actual Dallas AI event/community needs.
- Target outcome: beta roadmap and requirements that map directly to verified Dallas AI constraints (scale, networking quality, privacy trust, volunteer operability).

## Inputs
- `docs/research/dallas-ai-problem-research-2026-02-15.md`
- `docs/JTBD.md`
- `docs/PRD.md`

## Scope
### In scope
- Problem-aligned JTBD and PRD updates
- Implementation sequencing for event operations, networking outcomes, and trust layer
- Measurable release gates and success metrics

### Out of scope
- New payment flows or subscription logic
- Full CRM/marketing automation
- Broad enterprise IAM/SSO features

## Approach

### Phase 1: Event operations reliability (first)
1. Event-session scoping (active event + attendee linkage)
2. Stable signup + room board filtering by event
3. Runtime gates and runbook hardening for volunteers

### Phase 2: Networking outcome quality (second)
1. Deterministic matching from help-needed/help-offered + comfort
2. Facilitator queue for intro approvals
3. Decision audit trail + lightweight effectiveness metrics

### Phase 3: Trust and abuse controls (third)
1. Route-level rate limiting and risk scoring
2. Redacted trust event logs + moderation queue
3. Incident checklist and verification tests

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`
- Runtime/privacy checklist (`docs/runtime-validation.md`, `ops/preflight.md`)

## Risks and mitigations
- Risk: overfitting to one event format
  - Mitigation: event-session model + configurable defaults
- Risk: networking features leak sensitive data
  - Mitigation: strict projection boundary + API contract tests
- Risk: volunteer overhead grows too fast
  - Mitigation: keep controls minimal and runbook-driven

## Success targets
- <=30s median signup completion
- <=5s room board freshness
- zero public email exposure
- facilitator can act on relevant intro suggestions during session

## Clarification questions to resolve next
1. Should paid workshops be represented as event metadata only, or intentionally ignored in this product scope?
2. Do you want Dallas AI Direct to eventually unify RSVP states across Meetup + LinkedIn signals, or stay event-local only?
3. For networking outcomes, should we optimize for introductions made, or introductions accepted/scheduled?
