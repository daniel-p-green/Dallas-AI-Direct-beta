import fs from 'node:fs';
import path from 'node:path';

const demoDir = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(demoDir, '..', '..');

const requiredArtifacts = [
  {
    relativePath: 'public/demo/dallas-ai-direct-remotion-demo.mp4',
    maxBytes: 3 * 1024 * 1024,
  },
  {
    relativePath: 'public/demo/dallas-ai-direct-remotion-demo-poster.png',
    maxBytes: 500 * 1024,
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

console.log('Remotion README demo artifacts are present and within size budgets.');
