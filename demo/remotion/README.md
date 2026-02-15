# Remotion Demo Workspace

This folder owns the README demo video source for Dallas AI Direct.

## Purpose

- Keep demo rendering code isolated from the Next.js app root.
- Produce lightweight, reproducible assets for README usage.
- Encode the core story flow: QR signup -> room board update -> privacy-safe public view.

## Structure

- `src/index.js`: Remotion entrypoint (`registerRoot`)
- `src/Root.jsx`: composition registration + lightweight defaults
- `src/compositions/`: product demo compositions
- `assets/`: local static assets (images/icons/fonts) for demos
- `remotion.config.js`: render defaults

## Composition defaults

`DallasAIDirectFlow` is tuned for README-friendly size and pacing:
- Duration: `216` frames (~9s)
- FPS: `24`
- Dimensions: `960x540`

## Usage (from repo root)

```bash
npm run demo:remotion:install
npm run demo:remotion:preview
npm run demo:remotion:generate
```

Or run commands individually:

```bash
npm run demo:remotion:render
npm run demo:remotion:still
npm run demo:remotion:check
```

Rendered outputs are written to:
- `public/demo/dallas-ai-direct-remotion-demo.mp4`
- `public/demo/dallas-ai-direct-remotion-demo-poster.png`

`npm run demo:remotion:check` enforces deterministic file presence and size budgets to keep repo footprint reasonable.

## Ownership

- Workflow: `feature-dev`
- Story: `US-001`
- Plan: `plans/2026-02-15-remotion-readme-demo.md`
