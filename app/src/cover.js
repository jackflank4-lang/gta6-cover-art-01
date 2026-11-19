// Neon Skyline renderer: 3-panel GTA-style cover art, night neon grade.
// Panels: landscape/square = 3 vertical columns, the middle one dropped
// (a skyline stagger); portrait = one wide hero on top, two panels below.
// Every panel gets its own photo (cover-fit + zoom/pan), a purple-blue
// neon grade, glowing dividers, a crescent moon, and a bold title band.

export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1920, h: 1080 },
};

const NEON = {
  cyan: '#00e5ff',
  magenta: '#ff2d95',
  amber: '#ffc233',
  ink: '#0b0620',
};

// Panel rectangles for a size. Portrait: hero top, two below. The rest:
// three vertical columns, middle column dropped 10% like a skyline step.
export function layoutFor(sizeName, W, H) {
  if (sizeName === 'portrait') {
    const heroH = Math.round(H * 0.56);
    const half = Math.floor(W / 2);
    return [
      { x: 0, y: 0, w: W, h: heroH },
      { x: 0, y: heroH, w: half, h: H - heroH },
      { x: half, y: heroH, w: W - half, h: H - heroH },
    ];
  }
  const drop = Math.round(H * 0.1);
  const w1 = Math.floor(W * 0.34);
  const w2 = Math.floor(W * 0.32);
  return [
    { x: 0, y: 0, w: w1, h: H },
    { x: w1, y: drop, w: w2, h: H - drop },
    { x: w1 + w2, y: 0, w: W - w1 - w2, h: H },
  ];
}

// Cover-fit draw with zoom and pan. panX/panY are -1..1 fractions of the
// slack (the part of the scaled photo that sticks out past the box).
function drawPhotoInto(ctx, img, box, zoom, panX, panY) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(box.w / iw, box.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const slackX = Math.max(0, (dw - box.w) / 2);
  const slackY = Math.max(0, (dh - box.h) / 2);
  const dx = box.x + (box.w - dw) / 2 - panX * slackX;
  const dy = box.y + (box.h - dh) / 2 - panY * slackY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// A panel with no photo yet: deep night gradient + faint diagonal rays,
// so the cover still reads as a poster instead of a black hole.
function drawPlaceholder(ctx, box, i) {
  const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  g.addColorStop(0, i === 1 ? '#1c0f3d' : '#160a33');
  g.addColorStop(1, '#0b0620');
  ctx.fillStyle = g;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.10)';
  ctx.lineWidth = Math.max(2, box.w * 0.012);
  for (let k = -1; k <= 2; k += 1) {
    ctx.beginPath();
    ctx.moveTo(box.x + k * box.w * 0.5, box.y + box.h);
    ctx.lineTo(box.x + box.w + k * box.w * 0.5, box.y);
    ctx.stroke();
  }
  ctx.restore();
}

// Night neon grade: purple-blue wash, magenta glow low, cyan glow high,
// and a vignette so the panels sink into the night.
function gradePanel(ctx, box) {
  ctx.fillStyle = 'rgba(24, 8, 64, 0.26)';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  let glow = ctx.createRadialGradient(
    box.x + box.w * 0.15, box.y + box.h * 0.95, 0,
    box.x + box.w * 0.15, box.y + box.h * 0.95, box.w * 0.9,
  );
  glow.addColorStop(0, 'rgba(255, 45, 149, 0.22)');
  glow.addColorStop(1, 'rgba(255, 45, 149, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  glow = ctx.createRadialGradient(
    box.x + box.w * 0.85, box.y + box.h * 0.05, 0,
    box.x + box.w * 0.85, box.y + box.h * 0.05, box.w * 0.8,
  );
  glow.addColorStop(0, 'rgba(0, 229, 255, 0.16)');
  glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  const v = ctx.createRadialGradient(
    box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) * 0.35,
    box.x + box.w / 2, box.y + box.h / 2, Math.max(box.w, box.h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = v;
  ctx.fillRect(box.x, box.y, box.w, box.h);
}

// Glowing neon seams between the panels.
function drawDividers(ctx, boxes, sizeName, W, H) {
  ctx.save();
  ctx.shadowBlur = Math.max(8, W * 0.008);
  if (sizeName === 'portrait') {
    ctx.shadowColor = NEON.amber;
    ctx.strokeStyle = NEON.amber;
    ctx.lineWidth = Math.max(4, W * 0.005);
    ctx.beginPath();
    ctx.moveTo(0, boxes[0].h);
    ctx.lineTo(W, boxes[0].h);
    ctx.stroke();
    ctx.shadowColor = NEON.magenta;
    ctx.strokeStyle = NEON.magenta;
    ctx.beginPath();
    ctx.moveTo(boxes[1].w, boxes[0].h);
    ctx.lineTo(boxes[1].w, H);
    ctx.stroke();
  } else {
    const colors = [NEON.cyan, NEON.magenta];
    for (let i = 0; i < 2; i += 1) {
      const x = boxes[i].x + boxes[i].w;
      ctx.shadowColor = colors[i];
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = Math.max(4, W * 0.004);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Crescent moon + sparkle stars. Landscape/square: the moon hangs in the
// dark sky gap the dropped middle column leaves at the top, so it never
// covers a face. Portrait: top-right of the hero, in the open sky.
function drawMoon(ctx, W, H, sizeName, boxes) {
  let r;
  let cx;
  let cy;
  if (sizeName === 'portrait') {
    r = Math.max(18, H * 0.045);
    cx = W - r * 1.6;
    cy = r * 1.7;
  } else {
    const drop = boxes[1].y;
    r = Math.min(H * 0.045, drop * 0.36);
    cx = boxes[1].x + boxes[1].w / 2;
    cy = drop / 2;
  }
  ctx.save();
  ctx.shadowColor = '#ffe9a8';
  ctx.shadowBlur = r * 0.9;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.45, cy - r * 0.25, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = r * 0.35;
  const stars = [
    [cx - r * 2.6, cy + r * 0.4, r * 0.16],
    [cx - r * 1.2, cy + r * 1.6, r * 0.12],
    [cx + r * 1.4, cy + r * 1.1, r * 0.14],
  ];
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr * 2);
    ctx.lineTo(sx + sr * 0.5, sy - sr * 0.5);
    ctx.lineTo(sx + sr * 2, sy);
    ctx.lineTo(sx + sr * 0.5, sy + sr * 0.5);
    ctx.lineTo(sx, sy + sr * 2);
    ctx.lineTo(sx - sr * 0.5, sy + sr * 0.5);
    ctx.lineTo(sx - sr * 2, sy);
    ctx.lineTo(sx - sr * 0.5, sy - sr * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Shrink the title until it fits maxW, then draw it with a cyan outline
// and a magenta glow; the subtitle sits under it, letterspaced amber.
function drawTitleBand(ctx, state, W, H, sizeName, boxes) {
  const bandH = Math.round(H * 0.24);
  const bandY = sizeName === 'portrait' ? boxes[0].h - bandH : H - bandH;
  const grad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  grad.addColorStop(0, 'rgba(10, 4, 28, 0.55)');
  grad.addColorStop(1, 'rgba(10, 4, 28, 0.94)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, bandY, W, bandH);
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, NEON.cyan);
  edge.addColorStop(0.5, NEON.magenta);
  edge.addColorStop(1, NEON.amber);
  ctx.fillStyle = edge;
  ctx.fillRect(0, bandY, W, Math.max(3, H * 0.004));

  const padX = W * 0.045;
  const maxW = W - padX * 2;
  const title = (state.title || 'NEON SKYLINE').toUpperCase();
  let size = H * 0.105;
  ctx.textBaseline = 'alphabetic';
  while (size > H * 0.04) {
    ctx.font = `${size}px Anton, sans-serif`;
    if (ctx.measureText(title).width <= maxW) break;
    size *= 0.92;
  }
  const titleY = bandY + bandH * 0.58;
  ctx.save();
  ctx.shadowColor = NEON.magenta;
  ctx.shadowBlur = H * 0.028;
  ctx.lineWidth = Math.max(2, H * 0.008);
  ctx.strokeStyle = NEON.cyan;
  ctx.fillStyle = '#ffffff';
  ctx.strokeText(title, padX, titleY);
  ctx.fillText(title, padX, titleY);
  ctx.restore();

  const sub = (state.subtitle || '').toUpperCase();
  if (sub) {
    const subSize = Math.max(12, H * 0.03);
    ctx.font = `600 ${subSize}px Oswald, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${subSize * 0.22}px`;
    ctx.fillStyle = NEON.amber;
    ctx.fillText(sub, padX, bandY + bandH * 0.88);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
}

export function renderCover(canvas, state, sizeName) {
  const { w: W, h: H } = SIZES[sizeName] || SIZES.square;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = NEON.ink;
  ctx.fillRect(0, 0, W, H);
  const boxes = layoutFor(sizeName, W, H);
  state.panels.forEach((panel, i) => {
    const box = boxes[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    if (panel.photo) drawPhotoInto(ctx, panel.photo, box, panel.zoom, panel.panX, panel.panY);
    else drawPlaceholder(ctx, box, i);
    gradePanel(ctx, box);
    ctx.restore();
  });
  drawDividers(ctx, boxes, sizeName, W, H);
  drawMoon(ctx, W, H, sizeName, boxes);
  drawTitleBand(ctx, state, W, H, sizeName, boxes);
}
