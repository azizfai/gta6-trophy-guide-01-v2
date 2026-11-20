// Leonida Trophy Guide — submission entrypoint (Node 22, standard library only).
// Copies the static guide (app/) and its screenshots into the output directory
// and writes dossier.json with the kit's vendored library, so the judge can
// read the entry. Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

function fail(message) {
  console.error('main.ts: ' + message);
  process.exit(1);
}

function checkGuideData() {
  const dataPath = join(appDir, 'data', 'trophies.json');
  if (!existsSync(dataPath)) fail('missing app/data/trophies.json');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(dataPath, 'utf8'));
  } catch (err) {
    fail('app/data/trophies.json is not valid JSON: ' + err.message);
  }
  const list = parsed.trophies ?? parsed;
  if (!Array.isArray(list) || list.length !== 55) {
    fail('expected 55 trophies in app/data/trophies.json, found ' + (Array.isArray(list) ? list.length : 'none'));
  }
  const unnamed = list.filter((t) => !t || typeof t.name !== 'string' || !t.name.trim() || typeof t.guide !== 'string' || !t.guide.trim());
  if (unnamed.length > 0) fail(unnamed.length + ' trophies are missing a name or a guide');
  console.log('main.ts: trophy data OK — 55 trophies with guides');
}

function checkScreenshots() {
  if (!existsSync(shotsDir)) fail('missing screenshots/ directory');
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    fail('expected 3 or 4 screenshots, found ' + shots.length);
  }
  console.log('main.ts: screenshots OK — ' + shots.length + ' files');
}

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

checkGuideData();
checkScreenshots();

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
copyTree(appDir, join(outputDir, 'app'));
copyTree(shotsDir, join(outputDir, 'screenshots'));

// buildDossier walks the copied app/ and screenshots/ and writes the dossier
// the gate compares byte for byte. The caps mirror the competition's limits:
// at most 4 screenshots of 256 KiB each, app/ under 993 files and 48 MiB,
// and the dossier text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('main.ts: wrote ' + join(outputDir, 'dossier.json') + ' (' + Buffer.byteLength(dossier, 'utf8') + ' bytes)');
