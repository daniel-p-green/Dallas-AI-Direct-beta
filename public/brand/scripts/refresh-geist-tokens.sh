#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COLORS_URL="https://vercel.com/geist/colors"
INTRO_URL="https://vercel.com/geist/introduction"

mkdir -p "$ROOT_DIR/sources" "$ROOT_DIR/tokens" "$ROOT_DIR/assets"

curl -sL "$COLORS_URL" > "$ROOT_DIR/sources/geist-colors-source.html"
curl -sL "$INTRO_URL" > "$ROOT_DIR/sources/geist-introduction-source.html"

mapfile -t CSS_URLS < <(
  rg -o '/vc-ap-[^" ]+\.css\?dpl=[^" ]+' "$ROOT_DIR/sources/geist-colors-source.html" \
    | sed 's#^#https://vercel.com#' \
    | sed 's/\\$//' \
    | sort -u
)

CSS_URL=""
for url in "${CSS_URLS[@]}"; do
  css_content="$(curl -sL "$url")"
  if printf '%s' "$css_content" | rg -q -- '--ds-gray-100-value:[0-9]'; then
    CSS_URL="$url"
    printf '%s' "$css_content" > "$ROOT_DIR/sources/geist-colors-source.css"
    break
  fi
done

if [[ -z "$CSS_URL" ]]; then
  echo "Failed to locate Geist token CSS URL." >&2
  exit 1
fi

printf '%s\n' "$CSS_URL" > "$ROOT_DIR/sources/geist-colors-css-url.txt"

curl -sL "$INTRO_URL" \
  | rg -o '/geist/[a-z0-9-]+' \
  | sort -u \
  > "$ROOT_DIR/sources/geist-introduction-links.txt"

ROOT_DIR="$ROOT_DIR" node <<'NODE'
const fs = require('fs');
const path = require('path');

const root = process.env.ROOT_DIR;
const cssPath = path.join(root, 'sources', 'geist-colors-source.css');
const css = fs.readFileSync(cssPath, 'utf8');

function splitModes(regex) {
  const matches = [...css.matchAll(regex)].map((m) => [m[1], m[2].trim()]);
  const light = {};
  const dark = {};
  const seen = new Set();
  let mode = 'light';
  for (const [name, value] of matches) {
    if (mode === 'light' && seen.has(name)) {
      mode = 'dark';
    }
    if (mode === 'light') {
      light[name] = value;
      seen.add(name);
    } else if (!(name in dark)) {
      dark[name] = value;
    }
  }
  return { light, dark, count: matches.length };
}

const valueTokens = splitModes(/--(ds-[a-z0-9-]+-value):([^;]+);/g);
const alphaTokens = splitModes(/--(ds-gray-alpha-[0-9]{3,4}):([^;]+);/g);

const orderedFamilies = ['gray', 'blue', 'red', 'amber', 'green', 'teal', 'purple', 'pink', 'background'];
const orderedSteps = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];

function orderValueKeys(map) {
  return Object.keys(map).sort((a, b) => {
    const ma = a.match(/^ds-([a-z]+)-([0-9]{3,4})-value$/);
    const mb = b.match(/^ds-([a-z]+)-([0-9]{3,4})-value$/);
    if (!ma || !mb) return a.localeCompare(b);
    const af = ma[1];
    const as = ma[2];
    const bf = mb[1];
    const bs = mb[2];
    const afi = orderedFamilies.indexOf(af);
    const bfi = orderedFamilies.indexOf(bf);
    if (afi !== bfi) return (afi === -1 ? 99 : afi) - (bfi === -1 ? 99 : bfi);
    const asi = orderedSteps.indexOf(as);
    const bsi = orderedSteps.indexOf(bs);
    if (asi !== bsi) return (asi === -1 ? 99 : asi) - (bsi === -1 ? 99 : bsi);
    return a.localeCompare(b);
  });
}

const orderedValueKeys = orderValueKeys(valueTokens.light);
const orderedAlphaKeys = Object.keys(alphaTokens.light).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const cssLines = [];
cssLines.push('/*');
cssLines.push('  Local Geist color tokens snapshot');
cssLines.push('  Source: https://vercel.com/geist/colors');
cssLines.push('*/');
cssLines.push('');
cssLines.push(':root {');
for (const key of orderedValueKeys) {
  cssLines.push(`  --${key}: ${valueTokens.light[key]};`);
}
for (const key of orderedAlphaKeys) {
  cssLines.push(`  --${key}: ${alphaTokens.light[key]};`);
}
cssLines.push('}');
cssLines.push('');
cssLines.push('.dark, .dark-theme, .invert-theme {');
for (const key of orderedValueKeys) {
  if (valueTokens.dark[key] !== undefined) {
    cssLines.push(`  --${key}: ${valueTokens.dark[key]};`);
  }
}
for (const key of orderedAlphaKeys) {
  if (alphaTokens.dark[key] !== undefined) {
    cssLines.push(`  --${key}: ${alphaTokens.dark[key]};`);
  }
}
cssLines.push('}');
cssLines.push('');
cssLines.push(':root, .dark, .dark-theme, .invert-theme {');
for (const key of orderedValueKeys) {
  if (!key.startsWith('ds-background-')) {
    const semantic = key.replace(/-value$/, '');
    cssLines.push(`  --${semantic}: hsla(var(--${key}), 1);`);
  }
}
cssLines.push('  --ds-background-100: hsla(var(--ds-background-100-value), 1);');
cssLines.push('  --ds-background-200: hsla(var(--ds-background-200-value), 1);');
cssLines.push('}');
cssLines.push('');

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: {
    colorsPage: 'https://vercel.com/geist/colors',
    introductionPage: 'https://vercel.com/geist/introduction',
  },
  cssUrl: fs.readFileSync(path.join(root, 'sources', 'geist-colors-css-url.txt'), 'utf8').trim(),
  counts: {
    rawValueMatches: valueTokens.count,
    rawAlphaMatches: alphaTokens.count,
    lightValueTokens: Object.keys(valueTokens.light).length,
    darkValueTokens: Object.keys(valueTokens.dark).length,
    lightAlphaTokens: Object.keys(alphaTokens.light).length,
    darkAlphaTokens: Object.keys(alphaTokens.dark).length,
  },
  valueTokens,
  alphaTokens,
};

fs.writeFileSync(path.join(root, 'tokens', 'geist-colors.tokens.css'), cssLines.join('\n'));
fs.writeFileSync(path.join(root, 'tokens', 'geist-colors.tokens.json'), JSON.stringify(snapshot, null, 2));
NODE

if [[ -f "$ROOT_DIR/vercel-assets.zip" ]]; then
  rm -rf "$ROOT_DIR/assets/vercel"
  mkdir -p "$ROOT_DIR/assets/vercel"
  unzip -oq "$ROOT_DIR/vercel-assets.zip" -d "$ROOT_DIR/assets/vercel"

  find "$ROOT_DIR/assets/vercel" -name '__MACOSX' -type d -prune -exec rm -rf {} +
  find "$ROOT_DIR/assets/vercel" -name '.DS_Store' -type f -delete
  find "$ROOT_DIR/assets/vercel" -name '._*' -type f -delete

  if [[ -d "$ROOT_DIR/assets/vercel/Vercel" ]]; then
    tmp_dir="$(mktemp -d)"
    cp -R "$ROOT_DIR/assets/vercel/Vercel/." "$tmp_dir/"
    rm -rf "$ROOT_DIR/assets/vercel"
    mkdir -p "$ROOT_DIR/assets/vercel"
    cp -R "$tmp_dir/." "$ROOT_DIR/assets/vercel/"
    rm -rf "$tmp_dir"
  fi
fi

echo "Refreshed Geist snapshot in $ROOT_DIR"
