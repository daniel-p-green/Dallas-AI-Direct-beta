# v0 Review Evidence Log

## Source Artifacts
- v0 zip: `/Users/danielgreen/Downloads/build-plan.zip`
- v0 extract path: `/tmp/dallas-ai-direct-v0-review/source`
- delta target repo: `/Users/danielgreen/Documents/GitHub/Dallas-AI-Direct-beta`

## Verification Gates (v0 Source)
| Command | Start Time | End Time | Outcome | Notes |
|---|---|---|---|---|
| `npm ci` | 2026-02-15T20:25:01Z | 2026-02-15T20:25:09Z | FAIL | Lockfile out of sync with `package.json` (`EUSAGE`). First actionable error: `npm ci can only install packages when your package.json and package-lock.json are in sync`. |
| `npm run typecheck` | 2026-02-15T20:25:40Z | 2026-02-15T20:25:41Z | PASS | Ran after `npm install` to unblock analysis. |
| `npm test` | 2026-02-15T20:25:45Z | 2026-02-15T20:25:45Z | FAIL | `13` passed, `4` failed. First actionable failure: stale shell assertions in `tests/app-shell.test.mjs` expecting `ALPHA DEMO` and old layout copy not present in `app/layout.tsx`. |
| `npm run build` | 2026-02-15T20:25:49Z | 2026-02-15T20:25:57Z | PASS | Next.js production build succeeded. |

## UI Evidence
- Browser tool: `browser-use` (primary), Playwright (supplemental screenshots at fixed widths)
- Routes tested: `/`, `/signup`, `/room`, `/admin`, `/login`
- Widths tested: `320`, `390`, `768`, `1024`, `1440`
- Browser-use logs: `/Users/danielgreen/Documents/GitHub/Dallas-AI-Direct-beta/docs/reviews/2026-02-15-v0-faang-apple-openai-review-assets/browser-use-logs/`
- Screenshot index: `/Users/danielgreen/Documents/GitHub/Dallas-AI-Direct-beta/docs/reviews/2026-02-15-v0-faang-apple-openai-review-assets/README.md`

## Notes
- Baseline release-readiness blocker: `npm ci` failure due lockfile/package drift in v0 source.
- Supplemental install command executed for analysis continuity: `npm install` at `2026-02-15T20:25:09Z`.
- Asset integrity spot check:
  - `file /tmp/dallas-ai-direct-v0-review/source/public/brand/dallas-ai-logo-white.png` => `ASCII text`
  - `file /tmp/dallas-ai-direct-v0-review/source/public/brand/dallas-ai-logo-color.png` => `ASCII text`
  - This aligns with broken logo rendering in screenshot evidence.
