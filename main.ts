// Vice Nights, a gta6-cover-art-01 entry (Node 22, standard library only):
// the app is this directory's app/ folder, plain static files a desktop
// browser loads offline (app/index.html and its ES modules, no library and
// no network request). The program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, with a readable error, instead of handing in an entry the
// scorer would refuse: the app must be there, and screenshots/ must hold
// 1 to 4 images (a missing or empty screenshots/ folder means the shots
// step never ran, and the gate would reject the entry for it).
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing: the app was not built');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('screenshots/ is missing: take the screenshots first');
}
const shots = readdirSync(join(here, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length < 1 || shots.length > 4) {
  throw new Error(`screenshots/ holds ${shots.length} images, expected 1 to 4`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of
// app files, in all, or a path under app/ over 1000 bytes: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
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
