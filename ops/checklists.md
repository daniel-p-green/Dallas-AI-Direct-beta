# Operational checklists

## Policy test checklist (release gate)

- [ ] Confirm RLS is enabled on `attendees`.
- [ ] Confirm `anon` cannot `select` from `attendees`.
- [ ] Confirm `authenticated` cannot `select` from `attendees` (unless staff policy is active).
- [ ] Confirm `anon` and `authenticated` can `select` from `attendees_public`.
- [ ] Confirm public payload never includes `email`.
- [ ] Confirm inserts to `attendees` fail when `honeypot` is non-empty.
- [ ] Confirm unique email constraint blocks duplicates.

## Pre-demo checklist

- [ ] Confirm board fields match plan: name, optional title/company, AI comfort, help offered, LinkedIn.
- [ ] Confirm UI reads from `attendees_public` only.
- [ ] Confirm insert path writes to `attendees`.
- [ ] Confirm abuse controls are active.
- [ ] Confirm fallback networking is available.
- [ ] Confirm on-screen boundary banner is visible.

## Live demo checklist

- [ ] Start timing script.
- [ ] Trigger QR flow.
- [ ] Verify attendee count and AI comfort distribution updates.
- [ ] Verify no private field appears in public UI.

## Post-demo checklist

- [ ] Export non-sensitive metrics summary.
- [ ] Review logs for policy violations.
- [ ] File follow-up issues with owners.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No test/policy-specific skill exists there today, so this file applies
  repository checklist standards directly.