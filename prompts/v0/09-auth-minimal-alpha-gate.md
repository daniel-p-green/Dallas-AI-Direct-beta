# Step 9 – Auth Minimal Alpha Gate (Optional)

## Objective
Add an optional lightweight traffic-quality gate for alpha demo access without changing the primary security model.

## Guardrails (Non-Negotiable)
- Treat gate as convenience only.
- Do not present gate as primary security control.
- Keep RLS + projection boundary as primary control plane.
- Do not introduce OAuth, SSO, magic links, or role redesign.
- Do not add new backend services.

## Paste into v0

```text
Implement an optional alpha password gate for Dallas AI Direct Alpha as a traffic-quality control.

Requirements:
- Add a lightweight gate on entry routes (e.g., /signup and /room) with simple passphrase check.
- Keep implementation minimal and reversible.
- Show clear copy:
  - "This gate reduces random traffic during the live demo."
  - "Database access controls remain enforced by RLS and public-safe projection."
- Do not redesign auth architecture.
- Do not alter schema or policy SQL.
- Preserve existing UI/UX and privacy language.

Output:
- optional gate UI
- clear messaging of control hierarchy
- no claims of compliance or official endorsement
```

## Regression checks
- Gate works as expected and can be bypass-disabled for rehearsal.
- Privacy and boundary language remains intact.
- No impact on RLS assumptions.
- No dependency additions.
