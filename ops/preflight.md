# Pre-demo runtime validation (15 minutes)

Run these checks in order before going live.

## 1) Base table read blocked for anon

- Action: execute select as anon against `public.attendees`.
- Expected: permission denied or zero policy access.
- Result field: PASS/FAIL

## 2) View read allowed for anon

- Action: execute select as anon against `public.attendees_public`.
- Expected: rows return with public fields only.
- Result field: PASS/FAIL

## 3) Email inaccessible from public view

- Action: run `select email from public.attendees_public`.
- Expected: column does not exist error.
- Result field: PASS/FAIL

## 4) Duplicate email blocked

- Action: insert two rows with same normalized email.
- Expected: unique constraint violation on second insert.
- Result field: PASS/FAIL

## 5) Malicious HTML escaped in UI

- Action: submit `name` with HTML payload and render board.
- Expected: UI shows escaped text and executes no script.
- Result field: PASS/FAIL

## 6) Payload leak scan

- Action: inspect public API/view JSON payloads.
- Expected: payload contains no `email` key and no raw `@` values.
- Result field: PASS/FAIL

## Go/No-go rule

- Go only when all checks pass.
- No-go when any privacy or RLS check fails.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No dedicated runtime-validation skill exists there today.
- Applied repository pre-demo validation standards directly.