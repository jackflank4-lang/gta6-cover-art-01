[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Skyline — GTA 6 Cover Maker

A make.fun entry for [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01): an offline web app that turns your photo and a caption into GTA-style cover art, exported as a PNG to share.

## What it makes

Three neon panels in a skyline stagger — the middle column drops like a step in a city skyline — over a night-purple grade with magenta and cyan glows, a crescent moon, and a bold Anton title with a cyan outline and magenta glow. Portrait mode swaps to a wide hero on top with two panels below.

## How to use it

1. Open `app/index.html` in desktop Chrome (or run `node serve.ts` and open http://localhost:8080). No network, no build step, nothing is uploaded.
2. Type a title and a subtitle.
3. For each of the three panels, upload your own photo or use a sample, then crop it with the zoom and pan sliders. One photo can fill all three panels with the "Use photo 1 for all panels" button.
4. Pick an export size — Square 1080×1080, Portrait 1080×1350, or Landscape 1920×1080 — and hit **Export PNG**.

## Files

- `app/` — the static app: `index.html`, `style.css`, `src/cover.js` (the renderer), `src/main.js` (the editor), `src/shots.js` (screenshot staging), `fonts/` (Anton + Oswald, SIL Open Font License), `samples/` (two kit photos, free to use).
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library. Run it with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
- `screenshots/` — the cover (first by name) plus the editor at work and covers in the other sizes.

Everything in the cover is original: no Rockstar logo, artwork, or font. The Anton and Oswald fonts ship under the SIL Open Font License (their `OFL-*.txt` files sit beside them in `app/fonts/`).
