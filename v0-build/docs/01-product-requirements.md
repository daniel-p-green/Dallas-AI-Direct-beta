# Product Requirements for v0 Build

## Goal

Deliver a secure, fast attendee room board flow that answers "who is in the room" without exposing private attendee data.

## Functional requirements

| ID | Requirement |
| --- | --- |
| FR-1 | System stores required attendee fields: `name`, `email`, `ai_comfort_level`, `help_needed`, `help_offered`. |
| FR-2 | System stores optional attendee fields: `linkedin_url`, `title`, `company`, `other_help_needed`, `other_help_offered`. |
| FR-3 | System inserts signup data into `attendees`. |
| FR-4 | Public room board reads attendee rows from `attendees_public` only. |
| FR-5 | Public room board never renders `email`. |
| FR-6 | System shows `title` and `company` only when `display_title_company = true`. |
| FR-7 | Room board refreshes on a 5-second polling interval. |
| FR-8 | Signup flow includes a honeypot field and keeps the field hidden from normal users. |
| FR-9 | Shared shell and hero surfaces display approved Dallas AI logo assets. |

## Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-1 | System enforces privacy at the database boundary with RLS. |
| NFR-2 | System keeps public UI mobile-usable at 375px width. |
| NFR-3 | System surfaces concise user-facing error states and hides internal stack traces. |
| NFR-4 | System keeps implementation scope limited to Next.js + Neon Postgres for alpha. |

## Acceptance criteria

- Signup completes in approximately 30 seconds under normal network conditions.
- New attendee appears on room board within 5 seconds of successful insert.
- Public board payload and UI never expose attendee `email`.
- Dallas AI logo appears in shared shell and hero entry surfaces.

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository root standards from `agents.md`
