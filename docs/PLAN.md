# Plan of Record: Dallas AI Direct Alpha

## Goal

Deliver a secure, low-friction attendee directory that answers
"Who is in the room?" in near real time without exposing email.

## Hero moment

Attendees scan a QR code during Q and A, submit in under 30 seconds,
and appear on the live room board within seconds. The board shows only
public-safe fields: `name`, `title` (if attendee explicitly opts in),
`company` (if attendee explicitly opts in), `ai_comfort_level`,
`help_offered`, and `linkedin_url`.
The board never shows `email`.

## Audience and stakes

- Primary audience: CISOs, security leaders, and technical decision makers.
- Stakes: privacy trust, live demo reliability, and enterprise confidence.

## Non-goals

- Full CRM replacement.
- Deep social graph features.
- Multi-event warehouse analytics.

## Minimal steps

1. Define schema with sensitive/private separation.
2. Add optional `title` and `company` fields to `attendees`.
3. Enable RLS and enforce deny-by-default policies.
4. Create `attendees_public` view that excludes `email`.
5. Insert attendee records into `attendees`.
6. Read directory data from `attendees_public` only.
7. Add abuse controls and rehearse fallback paths.

## Key decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Data store | Neon Postgres | Strong RLS and fast setup |
| Security boundary | Database controls first | Enforces policy even if UI fails |
| Public reads | `attendees_public` view | Prevents accidental email exposure |
| Optional fields | `title`, `company` (displayed only with explicit consent) | Aligns schema with on-stage narrative while keeping optional profile data opt-in |
| Alpha gate | Optional password gate | Convenience only, not primary security |

## Failure modes and pivots

- Realtime lag -> switch to 5-second polling.
- QR traffic spike -> apply throttling and staff-assisted check-in.
- RLS test failure -> stop live writes and use sanitized dataset.

## Tomorrow morning timebox (CST)

- 07:30-08:00: RLS and policy preflight.
- 08:00-08:20: schema + view validation (`title`, `company` optional).
- 08:20-08:45: QR flow and abuse-control rehearsal.
- 08:45-09:10: live board + metrics verification.
- 09:10-09:25: fallback drill and operator handoff.
- 09:25-09:40: go/no-go review.

## Demo line to memorize

We enforce access control in the database, not in the UI. RLS and a
public-safe view prevent email exposure even if the front end breaks.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No plan-specific skill exists there today.
- Applied repository security standards directly.