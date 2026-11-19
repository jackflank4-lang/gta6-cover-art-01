# Vice Nights — GTA-style cover maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jackflank4-lang/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Nights turns your photos and a caption into GTA-style cover art: three
photo panels (one hero, two supporting) under a teal-to-magenta neon grade,
with a bold title band, exported as a PNG to share. It runs entirely offline
in desktop Chrome — your photos never leave your machine.

## How to use

1. Serve the app: `node serve.ts`, then open http://localhost:8080.
2. Pick a cover size: Square 1080 x 1080, Portrait 1080 x 1350, or
   Landscape 1920 x 1080.
3. For each of the three panels, choose a photo from your machine (or press
   Sample), then crop it with the Zoom and Pan sliders.
4. Type a title and a subtitle — the preview updates live.
5. Press Export PNG. The cover downloads at the size you picked.

## The cover

- **Three panels, one hero.** The hero panel takes the big slot; two smaller
  panels stack beside (square, landscape) or below (portrait) it. Each panel
  takes its own photo, or all three can share one.
- **Neon grade.** Every panel gets a teal-shadow / magenta-highlight duotone
  and a vignette, with a thin cyan divider between panels.
- **Title band.** The title is set in Anton, white with a cyan outline and a
  magenta offset shadow, tilted two degrees; the subtitle is letterspaced
  Oswald in amber, beside a retro sun glyph.
- **Three post sizes.** Square 1080 x 1080, Portrait 1080 x 1350, Landscape
  1920 x 1080 — the panel layout re-flows for each.

## Files

- `app/` — the static app (no build step, no network request). Fonts Anton
  and Oswald are vendored under `app/fonts/` under the SIL Open Font License.
- `app/samples/` — two sample photos made with an image model, free to use.
- `screenshots/` — the cover and the editor at work.
- `main.ts` — hands the app in: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.

Everything in this entry is original: no Rockstar Games logo, wordmark,
artwork, or font. Built for the [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01)
bounty on make.fun.
