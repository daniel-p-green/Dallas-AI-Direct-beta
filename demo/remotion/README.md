# Remotion Demo Workspace

This folder owns the README demo video source for Dallas AI Direct and an expanded overview cut for external sharing.

## Purpose

- Keep demo rendering code isolated from the Next.js app root.
- Produce lightweight, reproducible assets for README usage.
- Encode the core story flow: QR signup -> room board update -> privacy-safe public view.

## Legacy README composition defaults

`DallasAIDirectFlow` remains tuned for README-friendly size and pacing:
- Duration: `216`
- FPS: `24`
- Dimensions: `960x540`

It renders:
- `public/demo/dallas-ai-direct-remotion-demo.mp4`
- `public/demo/dallas-ai-direct-remotion-demo-poster.png`

`npm run demo:remotion:check` enforces deterministic file presence and size budgets.

## New overview composition

`DallasAIBetaOverview` is the share-ready walkthrough built from live captures of:
- `/` landing page
- `/signup`
- `/room` directory + "You Should Meet..."
- `/login` and `/admin` auth posture

Screenshots are generated from the running app and stored in:
- `demo/remotion/assets/live/` (capture archive)
- `demo/remotion/public/live/` (render source)

It renders:
- `public/demo/dallas-ai-direct-beta-overview.mp4`
- `public/demo/dallas-ai-direct-beta-overview-poster.png`

## Usage (from repo root)

```bash
npm run demo:remotion:install
npm run demo:remotion:generate
npm run demo:remotion:check
```

Overview-only commands:

```bash
npm --prefix demo/remotion run generate:overview
npm --prefix demo/remotion run check:overview
```

## Plan links

- `plans/2026-02-15-remotion-readme-demo.md`
- `plans/2026-02-16-remotion-overview-live-fix.md`
