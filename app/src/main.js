// Wires the page: pick photos per panel, crop and position each, type the
// caption, pick a post size, export the cover as a PNG. A `?shot=` query
// sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelsEl = document.getElementById('panels');

window.__coverErrors = [];
window.addEventListener('error', (e) => window.__coverErrors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => window.__coverErrors.push(String(e.reason)));

const PANEL_NAMES = ['Panel 1 — Hero', 'Panel 2', 'Panel 3', 'Panel 4'];

const state = {
  size: 'square',
  title: 'SOLMAR BAY',
  subtitle: 'NEON HEAT',
  grade: 0.7,
  neon: true,
  panels: [
    { photo: null, zoom: 1.15, ox: 0, oy: 0 },
    { photo: null, zoom: 1.2, ox: 0, oy: 0 },
    { photo: null, zoom: 1.2, ox: 0, oy: 0 },
    { photo: null, zoom: 1.2, ox: 0, oy: 0 },
  ],
};

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cannot load ' + url));
    img.src = url;
  });
}

async function loadFonts() {
  try {
    const anton = new FontFace('Anton', 'url(./fonts/Anton-Regular.ttf)');
    const oswald = new FontFace('Oswald', 'url(./fonts/Oswald.ttf)', { weight: '200 700' });
    document.fonts.add(anton);
    document.fonts.add(oswald);
    await Promise.all([anton.load(), oswald.load()]);
    await document.fonts.ready;
  } catch (e) {
    window.__coverErrors.push('font load: ' + String(e && e.message ? e.message : e));
  }
}

function sliderRow(label, min, max, step, value, oninput) {
  const row = document.createElement('label');
  row.className = 'slider-row';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener('input', () => oninput(Number(input.value)));
  const out = document.createElement('b');
  out.textContent = String(value);
  input.addEventListener('input', () => { out.textContent = input.value; });
  row.append(span, input, out);
  return row;
}

function buildPanelControls() {
  state.panels.forEach((panel, i) => {
    const box = document.createElement('fieldset');
    box.className = 'panel-box';
    const legend = document.createElement('legend');
    legend.textContent = PANEL_NAMES[i];
    box.append(legend);

    const photoRow = document.createElement('div');
    photoRow.className = 'photo-row';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.setAttribute('aria-label', PANEL_NAMES[i] + ' photo');
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      try {
        panel.photo = await loadImage(URL.createObjectURL(f));
        status.textContent = `${PANEL_NAMES[i]}: photo loaded.`;
      } catch (e) {
        status.textContent = `${PANEL_NAMES[i]}: could not read that photo.`;
      }
      redraw();
    });
    const sample = async (name) => {
      try {
        panel.photo = await loadImage(`samples/${name}.jpg`);
        status.textContent = `${PANEL_NAMES[i]}: sample ${name} loaded.`;
      } catch (e) {
        status.textContent = `${PANEL_NAMES[i]}: sample ${name} failed to load.`;
      }
      redraw();
    };
    const b1 = document.createElement('button');
    b1.type = 'button';
    b1.textContent = 'Boulevard';
    b1.addEventListener('click', () => sample('boulevard'));
    const b2 = document.createElement('button');
    b2.type = 'button';
    b2.textContent = 'Pier';
    b2.addEventListener('click', () => sample('pier'));
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    clear.addEventListener('click', () => { panel.photo = null; redraw(); });
    photoRow.append(file, b1, b2, clear);
    box.append(photoRow);
    box.append(sliderRow('Zoom', 1, 2.5, 0.05, panel.zoom, (v) => { panel.zoom = v; redraw(); }));
    box.append(sliderRow('Pan X', -0.5, 0.5, 0.01, panel.ox, (v) => { panel.ox = v; redraw(); }));
    box.append(sliderRow('Pan Y', -0.5, 0.5, 0.01, panel.oy, (v) => { panel.oy = v; redraw(); }));
    panelsEl.append(box);
  });
}

/** Renders the cover at a post size and resolves to a PNG data URL. */
export function exportDataURL(sizeName) {
  const size = SIZES[sizeName] || SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return new Promise((resolve) => off.toBlob((b) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(b);
  }, 'image/png'));
}

window.__cover = {
  state,
  redraw,
  exportDataURL,
  loadImage,
  fontsLoaded: () => document.fonts.check('16px Anton') && document.fonts.check('600 16px Oswald'),
};

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('grade').addEventListener('input', (e) => { state.grade = Number(e.target.value) / 100; redraw(); });
document.getElementById('neon').addEventListener('change', (e) => { state.neon = e.target.checked; redraw(); });
document.querySelectorAll('input[name="size"]').forEach((radio) => {
  radio.addEventListener('change', () => { state.size = radio.value; redraw(); });
});
document.getElementById('export').addEventListener('click', async () => {
  const size = SIZES[state.size];
  status.textContent = 'Exporting…';
  const url = await exportDataURL(state.size);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cover-${size.w}x${size.h}.png`;
  a.click();
  status.textContent = `Saved cover-${size.w}x${size.h}.png`;
});

buildPanelControls();

const shot = new URLSearchParams(location.search).get('shot');
const query = new URLSearchParams(location.search);
(async () => {
  await loadFonts();
  // Default samples so the app opens looking like a cover, not empty slots.
  try {
    const [boulevard, pier] = await Promise.all([
      loadImage('samples/boulevard.jpg'),
      loadImage('samples/pier.jpg'),
    ]);
    state.panels[0].photo = boulevard;
    state.panels[1].photo = pier;
    state.panels[2].photo = boulevard;
    state.panels[3].photo = pier;
  } catch (e) {
    window.__coverErrors.push('sample load: ' + String(e && e.message ? e.message : e));
  }
  redraw();
  if (shot) {
    await runShot(shot, query, state, loadImage, redraw);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
})();
