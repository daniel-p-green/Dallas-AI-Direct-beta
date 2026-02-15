# Product requirements document

## Problem

Organizers need real-time attendee visibility without paid directory lock-in
or email exposure risk.

## Primary personas

- New member / first-time event attendee
- Regular returning member
- Event organizer / facilitator
- Ops and security reviewer
- Dallas maintainer / contributor

## Product scope (alpha)

- QR signup flow during talk Q and A.
- Attendee insert path to secure base table.
- Public directory reads from `attendees_public` only.
- Aggregates for room count and AI comfort distribution.

## Hero moment requirements

- Attendee completes signup in about 30 seconds.
- Room board updates within 5 seconds.
- Board shows only safe public fields.
- Email never appears in public output.

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

## Non-functional requirements

- Security-first backend controls with RLS.
- Demo-ready reliability under moderate live traffic.
- Auditability of policy behavior and test evidence.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No PRD-specific skill exists there today.
- Applied repository requirements standards directly.
