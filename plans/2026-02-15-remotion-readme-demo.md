# Execution Plan: Remotion README Demo for Dallas AI Direct

## Goal
- Problem: The repository lacks a polished, reproducible visual demo artifact in README that communicates the core Dallas AI Direct flow and privacy guarantees.
- Target outcome: Add a lightweight Remotion-based demo source + render pipeline that outputs README-friendly assets (video/GIF + poster), then document and embed/link those assets in README with clear privacy-safe messaging.

## Scope
- In scope:
  - Create a product-focused Remotion workspace under `demo/remotion/`
  - Build one composition showing QR signup -> room board update -> privacy-safe public view (no email)
  - Add reproducible render script/command and output artifacts suitable for GitHub README
  - Add README section with caption and asset embedding/linking
  - Add tests/docs checks for demo structure and README references
- Out of scope:
  - Re-architecting core app flows
  - High-fidelity motion design system expansion
  - Large binary assets that significantly inflate repository size

## Approach
- Proposed change:
  - Scaffold minimal Remotion project in `demo/remotion/` with isolated config, assets, and scripts.
  - Implement scene-based composition emphasizing clarity, typography, pacing, and privacy messaging.
  - Render a compressed mp4 and poster image (optionally GIF derivative if size allows) into a dedicated docs/public demo-assets path.
  - Wire root/package scripts for deterministic render invocation and add README demo section.
  - Add tests validating artifact existence, command wiring, and README/demo consistency.
- Alternatives considered:
  - Animated GIF only (rejected as sole output due to quality/size tradeoffs)
  - Hand-edited screen recording (rejected: less reproducible and harder to maintain)

## Tasks
- [x] Define story plan and acceptance criteria for Remotion demo delivery
- [x] Scaffold Remotion source structure and composition baseline
- [x] Stabilize root command wiring with deterministic demo workspace install step
- [ ] Implement final visual narrative and render pipeline
- [ ] Integrate README section + demo artifact links/captions
- [x] Add/update tests and run verification gates

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`
- Demo checks (new): render command execution + artifact/readme validation

## Risks + rollback
- Risks:
  - Asset size bloat in git history
  - Missing media codec/fonts in CI/dev machines
  - README embeds breaking on relative path changes
- Rollback:
  - Revert demo/remotion and README/demo section commits
  - Remove added demo artifacts/scripts and restore previous README
