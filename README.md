[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Sunset Strip — GTA 6-style Cover Maker

Turn a photo and a caption into GTA 6-style cover art, in your browser, offline. No upload, no account, no watermark: your photos never leave your machine.

## What it makes

A multi-panel poster in the style of GTA 6's covers: a wide hero band on top and three panels in a row below it, a golden-hour sunset grade, a retro striped sun, and bold Anton / Oswald lettering. The title sits on a dark scrim over the hero so it reads over any photo.

## How to use it

1. Open `app/index.html` in desktop Chrome (or run `node serve.ts` and open http://localhost:8080).
2. Pick a post size: **Square 1080 × 1080**, **Portrait 1080 × 1350**, or **Landscape 1920 × 1080**.
3. Load a photo into each panel — upload your own, or use a sample. Drag the **Zoom** and **Pan X / Pan Y** sliders to frame each photo.
4. Type your **Title** and **Subtitle**; the preview updates live.
5. Hit **Export** for the size you want. The PNG downloads, ready to post.

## Features

- Four panels (hero + three), each with its own photo, zoom, and pan.
- One photo can fill several panels, or each panel can hold a different photo.
- Live preview that is exactly what gets exported — no surprises.
- Three export sizes in one click: 1080 × 1080, 1080 × 1350, 1920 × 1080.
- Fully offline: every script, font, and image is a file under `app/`. No network request is made.
- Original art only: no Rockstar Games logo, artwork, or font. The Anton and Oswald fonts are licensed under the SIL Open Font License (see `app/fonts/OFL-Anton.txt` and `app/fonts/OFL-Oswald.txt`).

## Layout

- `app/` — the cover maker (static files): `index.html`, `style.css`, `src/cover.js` (renderer), `src/main.js` (editor), `src/shots.js` (screenshot staging), `fonts/` (Anton + Oswald, SIL OFL), `samples/` (two sample photos, free to use).
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `screenshots/` — four screenshots: the exported cover in landscape, portrait, and square, plus the editor with a photo loaded.
- `serve.ts` — serves `app/` locally for trying it out.

## License

MIT. See `LICENSE`.
