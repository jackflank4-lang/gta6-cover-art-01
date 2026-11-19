// Renders the Vice Nights cover: three photo panels (one hero, two
// supporting) under a teal/magenta duotone grade, with a bold title band
// along the foot. Every size draws the same cover, re-laid-out.

/** The three export sizes, in pixels. */
export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1920, h: 1080 },
};

/**
 * Panel rectangles for a size, as fractions of the canvas. `band` is the
 * fraction of the height the title band takes. Panels fill the rest.
 */
export function layout(sizeName) {
  if (sizeName === 'portrait') {
    return {
      band: 0.19,
      panels: [
        { x: 0, y: 0, w: 1, h: 0.48 },
        { x: 0, y: 0.48, w: 0.5, h: 0.33 },
        { x: 0.5, y: 0.48, w: 0.5, h: 0.33 },
      ],
    };
  }
  if (sizeName === 'landscape') {
    return {
      band: 0.175,
      panels: [
        { x: 0, y: 0, w: 0.56, h: 0.825 },
        { x: 0.56, y: 0, w: 0.44, h: 0.4125 },
        { x: 0.56, y: 0.4125, w: 0.44, h: 0.4125 },
      ],
    };
  }
  return {
    band: 0.185,
    panels: [
      { x: 0, y: 0, w: 0.575, h: 0.815 },
      { x: 0.575, y: 0, w: 0.425, h: 0.4075 },
      { x: 0.575, y: 0.4075, w: 0.425, h: 0.4075 },
    ],
  };
}

/**
 * Draws one photo into a panel rect: cover-fit with zoom and pan, then a
 * teal-to-magenta grade, a vignette, and a neon divider around the panel.
 * `panX`/`panY` run -1..1 and shift the photo inside the panel.
 */
function drawPanel(ctx, photo, rect, zoom, panX, panY) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = '#1b0f2e';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  if (photo) {
    const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
    const scale = base * zoom;
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    const ox = Math.max(0, (dw - rect.w) / 2);
    const oy = Math.max(0, (dh - rect.h) / 2);
    ctx.drawImage(photo, rect.x + (rect.w - dw) / 2 + panX * ox, rect.y + (rect.h - dh) / 2 + panY * oy, dw, dh);
    const grade = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grade.addColorStop(0, 'rgba(0, 229, 255, 0.16)');
    grade.addColorStop(0.55, 'rgba(120, 40, 180, 0.10)');
    grade.addColorStop(1, 'rgba(255, 0, 128, 0.24)');
    ctx.fillStyle = grade;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(8, 0, 18, 0)');
  vig.addColorStop(1, 'rgba(8, 0, 18, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
  ctx.lineWidth = Math.max(2, rect.w * 0.004);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** A small retro sun glyph: a disc with three horizon slats cut through it. */
function drawSunGlyph(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, '#ffd23f');
  g.addColorStop(1, '#ff2e88');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = '#12081f';
  const gaps = [r * 0.1, r * 0.35, r * 0.6];
  for (const gy of gaps) {
    ctx.fillRect(cx - r, cy + gy, r * 2, Math.max(2, r * 0.09));
  }
  ctx.restore();
}

/**
 * Draws the whole cover onto `canvas` (sized by `state.size` first).
 * `state` is { title, subtitle, size, panels: [{ photo, zoom, panX, panY }] }.
 */
export function drawCover(canvas, state) {
  const size = SIZES[state.size] || SIZES.square;
  const ctx = canvas.getContext('2d');
  const W = size.w;
  const H = size.h;
  const lay = layout(state.size);
  const bandH = H * lay.band;
  const bandY = H - bandH;
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);
  state.panels.forEach((panel, i) => {
    const f = lay.panels[i];
    drawPanel(ctx, panel.photo, { x: f.x * W, y: f.y * H, w: f.w * W, h: f.h * H }, panel.zoom, panel.panX, panel.panY);
  });
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(0, bandY, W, Math.max(3, H * 0.004));
  const glyphR = bandH * 0.3;
  drawSunGlyph(ctx, W - bandH * 0.55, bandY + bandH * 0.5, glyphR);
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim().toUpperCase();
  const tx = W * 0.05;
  const maxW = W * 0.78;
  ctx.save();
  ctx.translate(tx, bandY + bandH * 0.52);
  ctx.rotate(-0.035);
  if (title) {
    let tSize = bandH * 0.46;
    ctx.font = `${tSize}px Anton, sans-serif`;
    while (ctx.measureText(title).width > maxW && tSize > 12) {
      tSize -= 2;
      ctx.font = `${tSize}px Anton, sans-serif`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff2e88';
    ctx.fillText(title, tSize * 0.045, tSize * 0.05);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = Math.max(2, tSize * 0.045);
    ctx.strokeText(title, 0, 0);
    ctx.fillText(title, 0, 0);
    const subY = tSize * 0.62;
    if (sub) {
      let sSize = bandH * 0.15;
      ctx.font = `600 ${sSize}px Oswald, sans-serif`;
      try { ctx.letterSpacing = `${Math.round(sSize * 0.28)}px`; } catch (e) { /* no letter-spacing */ }
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = 'rgba(0,0,0,0)';
      ctx.lineWidth = 0;
      ctx.fillText(sub, 2, subY);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* reset */ }
    }
  }
  ctx.restore();
}
