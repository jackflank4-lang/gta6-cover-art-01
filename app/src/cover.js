// Renders the multi-panel GTA-style cover onto a canvas. Everything the
// judge sees comes from here: the panel collage, the sunset/neon grade and
// the big caption lettering. The same function draws the live preview and
// the exported PNG, so the preview is exactly what exports.
//
// A panel is { photo, zoom, ox, oy }: photo is an HTMLImageElement (or
// null), zoom 1..2.5 magnifies the cover-fit, ox/oy in -0.5..0.5 pan across
// the overflow. State is { size, title, subtitle, grade, neon, panels[4] }.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920 x 1080' },
};

const GUTTER = 8;

/** Four panel rects for a cover of w x h. Hero first, then the rest. */
export function layoutPanels(w, h) {
  if (w === h) {
    // Square: tall hero left, three stacked panels right.
    return [
      { x: 0, y: 0, w: 700, h: 1080 },
      { x: 708, y: 0, w: 372, h: 400 },
      { x: 708, y: 408, w: 372, h: 330 },
      { x: 708, y: 746, w: 372, h: 334 },
    ];
  }
  if (h > w) {
    // Portrait: wide hero on top, three panels in a row below.
    return [
      { x: 0, y: 0, w: 1080, h: 720 },
      { x: 0, y: 728, w: 352, h: 622 },
      { x: 360, y: 728, w: 352, h: 622 },
      { x: 720, y: 728, w: 360, h: 622 },
    ];
  }
  // Landscape: wide hero left, one panel top-right, two below it.
  return [
    { x: 0, y: 0, w: 1100, h: 1080 },
    { x: 1108, y: 0, w: 812, h: 400 },
    { x: 1108, y: 408, w: 400, h: 672 },
    { x: 1516, y: 408, w: 404, h: 672 },
  ];
}

/** Draws one photo into its panel rect, cover-fit with zoom and pan. */
function drawPanelPhoto(ctx, rect, panel) {
  const photo = panel.photo;
  if (!photo || !photo.naturalWidth) {
    // Empty slot: deep violet with a prompt, so the editor shows what is missing.
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3b1d5e');
    g.addColorStop(1, '#1a0b2e');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `600 ${Math.max(14, rect.w * 0.055)}px Oswald, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+ ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const scale = base * (panel.zoom || 1);
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const oxPx = (pw - rect.w) / 2;
  const oyPx = (ph - rect.h) / 2;
  const dx = rect.x + (rect.w - pw) / 2 + (panel.ox || 0) * 2 * oxPx;
  const dy = rect.y + (rect.h - ph) / 2 + (panel.oy || 0) * 2 * oyPx;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = 'saturate(1.28) contrast(1.07)';
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.filter = 'none';
  ctx.restore();
}

/** Sunset grade over one panel: warm magenta-orange wash + a cool top light. */
function gradePanel(ctx, rect, strength) {
  if (strength <= 0) return;
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, `rgba(255, 94, 98, ${0.10 * strength})`);
  g.addColorStop(0.55, `rgba(255, 120, 80, ${0.16 * strength})`);
  g.addColorStop(1, `rgba(200, 40, 120, ${0.42 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const v = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(10, 2, 24, ${0.28 * strength})`);
  ctx.fillStyle = v;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

/** The caption block: letterspaced subtitle over the big Anton title. */
function drawCaption(ctx, w, h, title, subtitle, neon) {
  const x = w * 0.05;
  // Bottom scrim so the lettering reads over any photo.
  const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
  scrim.addColorStop(0, 'rgba(8, 2, 16, 0)');
  scrim.addColorStop(0.55, 'rgba(8, 2, 16, 0.55)');
  scrim.addColorStop(1, 'rgba(8, 2, 16, 0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  const sub = (subtitle || '').trim().toUpperCase();
  const text = (title || '').trim().toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Fit the title to the width, then draw it slightly tilted, neon-lit.
  let size = h * 0.12;
  ctx.font = `${size}px Anton, sans-serif`;
  if (text) {
    while (ctx.measureText(text).width > w * 0.92 && size > 16) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
  }
  const titleY = h * 0.94;
  const subY = titleY - size * 1.18;
  ctx.save();
  ctx.translate(x, titleY);
  ctx.rotate(-0.03);
  if (sub) {
    const subSize = Math.max(18, h * 0.032);
    ctx.font = `600 ${subSize}px Oswald, sans-serif`;
    try { ctx.letterSpacing = `${subSize * 0.32}px`; } catch (e) { /* older canvas: no letterSpacing */ }
    ctx.fillStyle = '#ffd166';
    ctx.fillText(sub, 0, subY - titleY);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
  }
  if (text) {
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.lineJoin = 'round';
    if (neon) {
      ctx.shadowColor = '#ff2e88';
      ctx.shadowBlur = size * 0.32;
      ctx.fillStyle = '#ff2e88';
      ctx.fillText(text, 5, 5);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(text, -4, -3);
    }
    ctx.strokeStyle = 'rgba(10, 2, 20, 0.85)';
    ctx.lineWidth = Math.max(2, size * 0.055);
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

/** Draws the whole cover onto the canvas at its own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);
  const panels = layoutPanels(w, h);
  for (let i = 0; i < 4; i += 1) {
    const rect = panels[i];
    const panel = state.panels[i];
    drawPanelPhoto(ctx, rect, panel);
    gradePanel(ctx, rect, state.grade);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  }
  drawCaption(ctx, w, h, state.title, state.subtitle, state.neon);
  // White poster frame.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, w - 10, h - 10);
}
