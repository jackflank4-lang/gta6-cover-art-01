// Neon Skyline (gta6-cover-art-01): hands the app in. Copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json with the vendored make.fun library. Node 22,
// standard library only. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, with a plain error, when the entry is not complete: the
// scorer would refuse it anyway, and a silent copy would hide the cause.
const indexHtml = join(here, 'app', 'index.html');
if (!existsSync(indexHtml)) throw new Error('missing app/index.html');
for (const font of ['Anton-Regular.ttf', 'Oswald.ttf']) {
  if (!existsSync(join(here, 'app', 'fonts', font))) throw new Error(`missing app/fonts/${font}`);
}
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir)) throw new Error('missing screenshots/');
const shots = readdirSync(shotDir).filter((name) => !name.startsWith('.'));
if (shots.length < 1 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 1 to 4 images, found ${shots.length}`);
}
for (const name of shots) {
  const bytes = statSync(join(shotDir, name)).size;
  if (bytes > 262144) throw new Error(`screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// The dossier is what the judge reads: confirm it was written, parses,
// and stays under the gate's 1.5 MiB cap instead of shipping a broken one.
const dossierPath = join(out, 'dossier.json');
const dossierBytes = statSync(dossierPath).size;
if (dossierBytes > 1572864) throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
JSON.parse(readFileSync(dossierPath, 'utf8'));
