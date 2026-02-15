# Known Issues (Pre-Demo)

## 2026-02-12

1. `/room` hydration warning in console
- Symptom: server/client class mismatch can occur around just-joined highlighting.
- Impact: non-blocking for demo flow, but adds console noise.
- Mitigation: keep as known issue or patch by deriving join-highlight state after mount.

2. Parallel Antfarm run drift risk
- Symptom: overlapping workflow runs can create redundant doc churn.
- Impact: review overhead and potential confusion.
- Mitigation: enforce one active controlled run and manual stage-gated approvals.

## Demo posture

- No known blocker on privacy boundary validation from current checks.
- Continue to prioritize preflight and runtime sanity checks before presentation.
