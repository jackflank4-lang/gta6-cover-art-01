[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio — GTA-style cover art maker

Your photo + a caption, made into GTA-style cover art: a multi-panel poster
with bold caption lettering and a Vice City sunset/neon grade, exported as a
PNG to share. It runs offline in a desktop browser from its own files — your
photos never leave your machine.

## How to use

1. Open `app/index.html` (or serve the `app/` folder with any static server,
   e.g. `node serve.ts` then http://localhost:8080).
2. Pick a post size: **Square 1080 x 1080**, **Portrait 1080 x 1350**, or
   **Landscape 1920 x 1080**.
3. Type a **Title** and a **Subtitle** — the big lettering on the cover.
4. Fill the four panels: click **Boulevard** / **Pier** for a sample photo,
   or choose a photo of your own from your machine for any panel.
5. Per panel, tune **Zoom**, **Pan X** and **Pan Y** to crop and position the
   photo inside its panel. One photo can fill several panels, or each panel
   can hold a different one.
6. Slide **Sunset grade** for a stronger or softer warm tint, and toggle
   **Neon glow** on the title.
7. Click **Export PNG** — the cover downloads at the size you picked. The
   live preview is exactly what exports.

## What it makes

- A four-panel collage: a large hero panel plus three supporting panels, a
  different arrangement for each post size, with white gutters and a white
  poster frame.
- A sunset grade (magenta → orange wash, vignette) over every panel.
- Big condensed title lettering (Anton) with a neon pink/cyan glow and a
  letterspaced subtitle (Oswald), over a bottom scrim so it reads on any
  photo.

## Files

- `app/index.html`, `app/style.css`, `app/src/cover.js` (the renderer),
  `app/src/main.js` (the editor), `app/src/shots.js` (screenshot scenes).
- `app/fonts/` — Anton and Oswald, both under the SIL Open Font License
  (their `OFL-*.txt` files sit beside them). No Rockstar logo, artwork or
  font is used anywhere.
- `app/samples/` — two photos made with an image model for make.fun, free to
  use; they are what the screenshots show.
- `main.ts` hands the app in: it copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun
  library. Run it with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

## Notes

- Everything is static and offline: no network request, no upload, no build
  step. Every script, font and image the app loads is a file under `app/`.
- Screenshots: `1-cover.jpg` is the exported landscape cover; `2-editor.jpg`
  is the editor with a photo loaded; `3-cover.jpg` and `4-cover.jpg` are the
  exported portrait and square covers.
