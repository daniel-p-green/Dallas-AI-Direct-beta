# Step 8 – Neon Connection Wiring (Minimal and Safe)

## Objective
Wire the app to Neon Postgres for public-safe reads and controlled inserts without changing schema or RLS policy design.

## Guardrails (Non-Negotiable)
- Do not modify schema or migrations.
- Do not modify RLS SQL.
- Do not expose `DATABASE_URL` to client code.
- Keep public reads constrained to `attendees_public` shape.
- Keep insert path server-side via API route.
- Do not add OAuth/SSO in this step.

## Paste into v0

```text
Wire Neon Postgres access for Dallas AI Direct Alpha with strict security boundaries.

Requirements:
- Add server-only DB helper (for route handlers / server actions), e.g. `lib/db/neon.ts`.
- Use `DATABASE_URL` in server runtime only.
- Do not create browser DB clients.
- Create/confirm API routes:
  - GET room board data from `attendees_public`
  - POST signup insert into `attendees` with validation + honeypot checks
- Room board UI must call API endpoint only.
- Signup UI must call API endpoint only.
- Keep UI behavior unchanged except data wiring.
- Add concise error states with no raw stack traces.

Output:
- minimal Neon server wiring
- API route shapes for room read + signup insert
- frontend integration shape (fetch to API only)
- no schema/auth redesign
```

## Regression checks
- Environment variables resolve cleanly in server runtime.
- No DB credentials in client bundle.
- Room path references `attendees_public` only.
- No email rendered publicly.
- Existing UI tests still pass.
