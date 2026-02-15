# Remotion Demo Workspace

This folder owns the README demo video source for Dallas AI Direct.

## Purpose

- Keep demo rendering code isolated from the Next.js app root.
- Produce lightweight, reproducible assets for README usage.
- Encode the core story flow: QR signup -> room board update -> privacy-safe public view.

## Structure

- `src/index.js`: Remotion entrypoint (`registerRoot`)
- `src/Root.jsx`: composition registration
- `src/compositions/`: product demo compositions
- `assets/`: local static assets (images/icons/fonts) for demos
- `remotion.config.js`: render defaults

## Usage (from repo root)

```bash
npm run demo:remotion:preview
npm run demo:remotion:render
npm run demo:remotion:still
```

## Ownership

- Workflow: `feature-dev`
- Story: `US-001`
- Plan: `plans/2026-02-15-remotion-readme-demo.md`
