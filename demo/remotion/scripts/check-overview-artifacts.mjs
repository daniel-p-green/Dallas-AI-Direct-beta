import fs from 'node:fs';
import path from 'node:path';

const demoDir = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(demoDir, '..', '..');

const requiredArtifacts = [
  {
    relativePath: 'public/demo/dallas-ai-direct-beta-overview.mp4',
    maxBytes: 8 * 1024 * 1024,
  },
  {
    relativePath: 'public/demo/dallas-ai-direct-beta-overview-poster.png',
    maxBytes: 2 * 1024 * 1024,
  },
];

for (const artifact of requiredArtifacts) {
  const absolutePath = path.join(repoRoot, artifact.relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing artifact: ${artifact.relativePath}`);
  }

  const stats = fs.statSync(absolutePath);
  if (stats.size <= 0) {
    throw new Error(`Artifact is empty: ${artifact.relativePath}`);
  }

  if (stats.size > artifact.maxBytes) {
    throw new Error(
      `Artifact exceeds size budget (${artifact.maxBytes} bytes): ${artifact.relativePath} (${stats.size} bytes)`,
    );
  }
}

console.log('Remotion overview artifacts are present and within size budgets.');
