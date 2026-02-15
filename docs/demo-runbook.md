# Timed Demo Runbook

## Objective

Prove secure live onboarding and room visibility without exposing email.

## On-screen boundary banner

Display a persistent top banner:

- ALPHA DEMO
- ENV: STAGE or PROD
- PUBLIC VIEW SAFE

## Public board fields for demo

Show only these fields:

- `name`
- `title` (if provided and consented)
- `company` (if provided and consented)
- `ai_comfort_level`
- `help_offered`
- `linkedin_url`

Never show `email`.

Signup consent control:

- Checkbox label: `Display my title and company on the public room board.`
- Default state: unchecked
- Helper text: `Email stays private and never appears on the public board.`

## T-30 minutes checklist

- Verify RLS is enabled.
- Verify `attendees_public` excludes email and private notes.
- Verify UI reads only from `attendees_public`.
- Verify inserts write to `attendees`.
- Verify realtime path and polling fallback.

## 12-minute flow

1. Explain the business problem and privacy requirement.
2. Show architecture with RLS and view-only public reads.
3. Show the boundary banner and initial room board.
4. Trigger live QR signup during Q and A.
5. Show room count and AI comfort distribution updates.
6. Show payload sample from `attendees_public` without email.
7. State the database-first security guarantee.

## Fallback steps

- Switch realtime to 5-second polling.
- Move traffic to backup network.
- Continue with sanitized dataset if live writes fail.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No demo/runbook-specific skill exists there today, so this file applies
  repository runbook standards directly.