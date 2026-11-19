// Wires the Vice Nights editor: three photo panels, a title and a subtitle,
// three export sizes, and the ?shot= scenes the screenshots are taken from.
import { drawCover, SIZES } from './cover.js';
import { runShot } from './shots.js';

window.__coverErrors = [];
window.addEventListener('error', (e) => window.__coverErrors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => window.__coverErrors.push('rejection: ' + String(e.reason)));

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const statusEl = document.getElementById('status');

const state = {
  title: 'Midnight Drive',
  subtitle: 'OCEAN BLVD',
  size: 'square',
  panels: [
    { photo: null, zoom: 1, panX: 0, panY: 0 },
    { photo: null, zoom: 1, panX: 0, panY: 0 },
    { photo: null, zoom: 1, panX: 0, panY: 0 },
  ],
};

const SAMPLES = ['./samples/boulevard.jpg', './samples/pier.jpg'];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + url));
    img.src = url;
  });
}

function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state);
}

function setSize(name) {
  if (!SIZES[name]) return;
  state.size = name;
  redraw();
}

/** Renders the cover at `sizeName` off-screen and returns a PNG data URL. */
async function exportDataURL(sizeName) {
  await document.fonts.ready;
  const size = SIZES[sizeName] || SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, { ...state, size: sizeName });
  return off.toDataURL('image/png');
}

window.__cover = {
  state,
  setSize,
  exportDataURL,
  fontsLoaded() {
    return document.fonts.check('16px Anton') && document.fonts.check('16px Oswald');
  },
};

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

document.querySelectorAll('input[name="size"]').forEach((radio) => {
  radio.addEventListener('change', () => { if (radio.checked) setSize(radio.value); });
});

document.getElementById('export').addEventListener('click', async () => {
  const url = await exportDataURL(state.size);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vice-nights-${state.size}.png`;
  a.click();
  statusEl.textContent = `Saved vice-nights-${state.size}.png`;
});

document.querySelectorAll('.panel-box').forEach((box) => {
  const idx = Number(box.dataset.panel);
  const panel = state.panels[idx];
  const fileInput = box.querySelector('input[type="file"]');
  const buttons = box.querySelectorAll('button');
  const ranges = box.querySelectorAll('input[type="range"]');
  buttons[0].addEventListener('click', () => fileInput.click());
  buttons[1].addEventListener('click', async () => {
    panel.photo = await loadImage(SAMPLES[idx % SAMPLES.length]);
    redraw();
  });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    panel.photo = await loadImage(URL.createObjectURL(file));
    redraw();
  });
  ranges[0].addEventListener('input', () => { panel.zoom = parseFloat(ranges[0].value); redraw(); });
  ranges[1].addEventListener('input', () => { panel.panX = parseFloat(ranges[1].value); redraw(); });
  ranges[2].addEventListener('input', () => { panel.panY = parseFloat(ranges[2].value); redraw(); });
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, {
    loadImage,
    samples: SAMPLES,
    state,
    setSize,
    redraw,
    setTitle(text) { state.title = text; titleInput.value = text; },
    setSubtitle(text) { state.subtitle = text; subtitleInput.value = text; },
    ready() { window.__shotReady = true; },
  });
} else {
  redraw();
  document.fonts.ready.then(() => { window.__shotReady = true; });
}
