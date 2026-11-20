[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Lights Studio — GTA 6-style cover art maker

An offline web app that turns any photo and a caption into GTA 6-style
multi-panel cover art, exported as a PNG to share. Built for the
[make.fun bounty gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Multi-panel cover**: a hero panel, a side panel and a bottom strip, each
  filled with your own photo (or a sample), cropped and zoomed per panel.
- **Bold lettering**: the caption is set in Anton (SIL OFL, embedded as a
  subset WOFF2) over a dark title band with a neon underline, plus an
  italic subtitle.
- **Sunset / neon grades**: four colour grades (Sunset, Neon Nights, Vice
  Pink, Dusk Teal) that wash the whole cover in a Vice City glow.
- **Three post sizes**: Square 1080×1080, Portrait 1080×1350 and Landscape
  1920×1080, exported as PNG in one click.
- **Offline**: every file the app loads lives under `app/`; photos never
  leave the machine. No Rockstar logo, artwork or font anywhere.

## Use it

Serve `app/` with any static server and open `index.html` in desktop Chrome:

```
node serve.ts        # or: npx serve app
```

1. Load a photo into each panel (or use a sample).
2. Drag the zoom slider per panel, type a caption and subtitle.
3. Pick a grade and a post size, then Export PNG.

## Build the entry

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory
and writes `dossier.json` with the vendored `vendor/makefun-app.ts`.

## Files

- `app/index.html`, `app/style.css` — the editor UI.
- `app/src/cover.js` — the cover renderer (panels, grades, lettering).
- `app/src/main.js` — app logic, photo loading, export, CDP test interface.
- `app/src/shots.js` — the four screenshot scenes.
- `app/fonts/anton.js` — Anton subset WOFF2 (base64), loaded via FontFace.
- `app/fonts/OFL-Anton.txt` — the SIL Open Font License for Anton.
- `app/samples/` — two sample photos from the kit starter.
- `main.ts` — the entry program. `vendor/makefun-app.ts` — the kit library.

## License

MIT. The Anton font is under the SIL Open Font License 1.1 (see
`app/fonts/OFL-Anton.txt`).
