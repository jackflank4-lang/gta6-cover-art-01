// Sunset Strip — cover renderer for gta6-cover-art-01 (round 3).
// Draws a multi-panel GTA-style poster: a wide hero band on top and three
// equal panels in a row below it, a golden-hour sunset grade, a retro sun
// glyph, and bold Anton / Oswald lettering. Pure canvas, no network.

export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1920, h: 1080 },
};

// Hero height as a fraction of the cover height, per size.
const HERO_FRAC = { square: 0.55, portrait: 0.52, landscape: 0.58 };
const DIVIDER = 6; // neon divider thickness, px at 1080 width

export function layoutFor(sizeName) {
  const { w, h } = SIZES[sizeName];
  const heroH = Math.round(h * HERO_FRAC[sizeName]);
  const bottomY = heroH + DIVIDER;
  const bottomH = h - bottomY;
  const pw = Math.floor((w - DIVIDER * 2) / 3);
  const panels = [0, 1, 2].map((i) => ({
    x: i * (pw + DIVIDER),
    y: bottomY,
    w: i === 2 ? w - 2 * (pw + DIVIDER) : pw,
    h: bottomH,
  }));
  return {
    w,
    h,
    hero: { x: 0, y: 0, w, h: heroH },
    panels,
    // Title band sits fully inside the hero, above the divider, so the
    // subtitle never straddles the hero/bottom boundary.
    titleBand: { x: 0, y: heroH - Math.round(h * 0.17), w, h: Math.round(h * 0.17) },
  };
}

// Draw one photo into a rect, cover-fit, with zoom and pan offsets.
// panX / panY are in [-1, 1]: -1 shows the left/top edge, 1 the right/bottom.
export function drawPhotoInto(ctx, photo, rect, zoom, panX, panY) {
  if (!photo || !photo.naturalWidth) return;
  const z = Math.max(0.5, zoom || 1);
  const scale = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * z;
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  const maxX = Math.max(0, (dw - rect.w) / 2);
  const maxY = Math.max(0, (dh - rect.h) / 2);
  const dx = rect.x + (rect.w - dw) / 2 - (panX || 0) * maxX;
  const dy = rect.y + (rect.h - dh) / 2 - (panY || 0) * maxY;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.restore();
}

// Golden-hour grade: warm orange wash from the top, magenta/violet from the
// bottom, plus a vignette that darkens the corners.
function applyGrade(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255, 140, 40, 0.20)');
  g.addColorStop(0.45, 'rgba(255, 90, 120, 0.10)');
  g.addColorStop(1, 'rgba(90, 20, 140, 0.28)');
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  const v = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,0,30,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

// Retro sun: a striped circle, drawn into the hero's top-right corner.
function drawSun(ctx, cx, cy, r) {
  ctx.save();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, '#ffd23f');
  g.addColorStop(0.55, '#ff7a3d');
  g.addColorStop(1, '#ff2e88');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Cut horizontal stripes across the lower half.
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.05;
  let th = r * 0.07;
  while (y < cy + r) {
    ctx.fillRect(cx - r - 2, y, r * 2 + 4, th);
    y += th * 2.4;
    th *= 1.35;
  }
  ctx.restore();
}

// Shrink the title until it fits the band width.
function fitTitleFont(ctx, title, bandW, startPx) {
  let px = startPx;
  ctx.font = `${px}px Anton, sans-serif`;
  while (px > 24 && ctx.measureText(title).width > bandW) {
    px -= 4;
    ctx.font = `${px}px Anton, sans-serif`;
  }
  return px;
}

// Draw the title + subtitle centred in the title band.
function drawLettering(ctx, layout, title, subtitle) {
  const { w, h } = layout;
  const band = layout.titleBand;
  const cy = band.y + band.h / 2;
  // Dark scrim behind the lettering so it reads over any photo.
  const scrim = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  scrim.addColorStop(0, 'rgba(8,0,24,0)');
  scrim.addColorStop(0.5, 'rgba(8,0,24,0.62)');
  scrim.addColorStop(1, 'rgba(8,0,24,0)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, band.y, w, band.h);

  const titleText = (title || 'SUNSET HEIST').toUpperCase();
  const titlePx = fitTitleFont(ctx, titleText, w * 0.92, Math.round(w * 0.105));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = Math.round(w * 0.02);
  ctx.lineWidth = Math.max(2, Math.round(w * 0.006));
  ctx.strokeStyle = '#ff2e88';
  ctx.strokeText(titleText, w / 2, cy - Math.round(h * 0.018));
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(titleText, w / 2, cy - Math.round(h * 0.018));
  ctx.restore();

  const sub = (subtitle || 'VICE CITY').toUpperCase();
  const subPx = Math.round(w * 0.032);
  ctx.font = `600 ${subPx}px Oswald, sans-serif`;
  try { ctx.letterSpacing = `${Math.round(w * 0.012)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(sub, w / 2, cy + Math.round(h * 0.052));
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
}

// Main entry: draw the whole cover for `state` at `sizeName` onto ctx.
// state: { title, subtitle, panels: [{photo, zoom, panX, panY}] } — panels[0]
// is the hero, panels[1..3] are the bottom row.
export function drawCover(ctx, state, sizeName) {
  const layout = layoutFor(sizeName);
  const { w, h } = layout;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#12061f';
  ctx.fillRect(0, 0, w, h);

  const panels = state.panels || [];
  // Hero photo (or a sunset gradient when empty).
  const hero = panels[0];
  if (hero && hero.photo) {
    drawPhotoInto(ctx, hero.photo, layout.hero, hero.zoom, hero.panX, hero.panY);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, layout.hero.h);
    sky.addColorStop(0, '#2b0a4d');
    sky.addColorStop(0.55, '#c22e6e');
    sky.addColorStop(1, '#ff8a3d');
    ctx.fillStyle = sky;
    ctx.fillRect(layout.hero.x, layout.hero.y, layout.hero.w, layout.hero.h);
  }
  // Bottom panels.
  for (let i = 0; i < 3; i += 1) {
    const p = panels[i + 1];
    const rect = layout.panels[i];
    if (p && p.photo) {
      drawPhotoInto(ctx, p.photo, rect, p.zoom, p.panX, p.panY);
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, '#3a1150');
      g.addColorStop(1, '#12061f');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  }

  applyGrade(ctx, w, h);

  // Neon dividers: amber rule under the hero, cyan rules between bottom panels.
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(0, layout.hero.h, w, DIVIDER);
  ctx.fillStyle = '#22e6ff';
  for (let i = 1; i < 3; i += 1) {
    const x = layout.panels[i].x - DIVIDER;
    ctx.fillRect(x, layout.panels[0].y, DIVIDER, layout.panels[0].h);
  }

  // Retro sun in the hero's top-right corner.
  const sunR = Math.round(w * 0.085);
  drawSun(ctx, w - sunR * 1.35, sunR * 1.5, sunR);

  drawLettering(ctx, layout, state.title, state.subtitle);
}
