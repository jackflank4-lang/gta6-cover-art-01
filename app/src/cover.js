// Vice Lights Studio — cover renderer: multi-panel GTA-style poster on a 2D canvas.
export const SIZES = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1920, h: 1080 },
};

export const GRADES = {
  sunset: { top: "#ff9a3c", mid: "#ff2e88", bot: "#2b1055", tint: "rgba(255,110,60,0.20)" },
  neon: { top: "#19e3c2", mid: "#ff2e88", bot: "#12002e", tint: "rgba(25,227,194,0.16)" },
  vice: { top: "#ff7ad9", mid: "#ff2e88", bot: "#3b0a4d", tint: "rgba(255,46,136,0.22)" },
  dusk: { top: "#19e3c2", mid: "#2b6cff", bot: "#0a1030", tint: "rgba(43,108,255,0.18)" },
};

function drawPhotoCover(ctx, img, x, y, w, h, zoom) {
  if (!img) return;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih) * (zoom || 1);
  const dw = iw * s;
  const dh = ih * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function gradeOverlay(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, grade.top);
  g.addColorStop(0.55, grade.mid);
  g.addColorStop(1, grade.bot);
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawTitle(ctx, w, h, title, subtitle, grade) {
  const pad = Math.round(w * 0.045);
  const size = Math.round(w * 0.115);
  const subSize = Math.round(size * 0.34);
  const bandPad = Math.round(size * 0.18);
  const gap = Math.round(size * 0.12);
  // Band sized to hold the title AND the subtitle fully inside the canvas.
  const bandH = size + subSize + gap + bandPad * 2;
  const bandTop = h - bandH;
  const titleBaseline = bandTop + bandPad + size;
  const subtitleBaseline = titleBaseline + subSize + gap;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // Title block: dark band + neon underline.
  ctx.fillStyle = "rgba(10,4,28,0.82)";
  ctx.fillRect(0, bandTop, w, bandH);
  ctx.fillStyle = grade.mid;
  ctx.fillRect(0, bandTop, w, 6);
  ctx.font = `${size}px Anton, Impact, sans-serif`;
  ctx.lineWidth = Math.max(3, Math.round(size * 0.06));
  ctx.strokeStyle = "#0a041c";
  ctx.strokeText(title.toUpperCase(), pad, titleBaseline);
  const grad = ctx.createLinearGradient(pad, titleBaseline - size, pad + ctx.measureText(title.toUpperCase()).width, titleBaseline);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.5, grade.top);
  grad.addColorStop(1, grade.mid);
  ctx.fillStyle = grad;
  ctx.fillText(title.toUpperCase(), pad, titleBaseline);
  if (subtitle) {
    ctx.font = `italic ${subSize}px Georgia, serif`;
    ctx.fillStyle = grade.top;
    ctx.fillText(subtitle, pad, subtitleBaseline);
  }
  ctx.restore();
}

// Draw the cover onto ctx at the given size. panels: [{photo: Image|null, zoom}]
// Returns nothing; throws on a bad size name.
export function renderCover(ctx, sizeName, state) {
  const size = SIZES[sizeName];
  if (!size) throw new Error("unknown size: " + sizeName);
  const { w, h } = size;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0d0a1a";
  ctx.fillRect(0, 0, w, h);
  const gap = Math.round(w * 0.012);
  const heroH = Math.round(h * 0.62);
  const sideW = Math.round(w * 0.34);
  // Hero panel (left, tall), side panel (right, tall), bottom strip (full width).
  drawPhotoCover(ctx, state.panels[0] && state.panels[0].photo, 0, 0, w - sideW - gap, heroH, state.panels[0] && state.panels[0].zoom);
  drawPhotoCover(ctx, state.panels[1] && state.panels[1].photo, w - sideW, 0, sideW, heroH, state.panels[1] && state.panels[1].zoom);
  drawPhotoCover(ctx, state.panels[2] && state.panels[2].photo, 0, heroH + gap, w, h - heroH - gap, state.panels[2] && state.panels[2].zoom);
  // Panel separators.
  ctx.fillStyle = "#0d0a1a";
  ctx.fillRect(w - sideW - gap, 0, gap, heroH);
  ctx.fillRect(0, heroH, w, gap);
  gradeOverlay(ctx, w, h, grade);
  drawTitle(ctx, w, h, state.title || "VICE LIGHTS", state.subtitle || "", grade);
}
