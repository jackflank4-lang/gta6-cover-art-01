// Sunset Strip — editor for gta6-cover-art-01 (round 3).
// A photo + caption cover maker: four panels (hero band + three below),
// crop (zoom) + position (pan) per panel, three export sizes, PNG export.
// Debug/test hook: window.__cover { state, exportDataURL, fontsLoaded, render }.

import { SIZES, drawCover } from './cover.js';
import { stageShot } from './shots.js';

window.__coverErrors = [];
window.addEventListener('error', (e) => window.__coverErrors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => window.__coverErrors.push(String(e.reason)));

const SAMPLES = ['boulevard', 'pier'];
const PANEL_NAMES = ['Hero', 'Panel 1', 'Panel 2', 'Panel 3'];

const state = {
  size: 'square',
  title: 'SUNSET HEIST',
  subtitle: 'VICE CITY',
  panels: [0, 1, 2, 3].map(() => ({ photo: null, photoName: '', zoom: 1, panX: 0, panY: 0 })),
};

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');

function render() {
  const { w, h } = SIZES[state.size];
  canvas.width = w;
  canvas.height = h;
  drawCover(ctx, state, state.size);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function loadSampleIntoPanels(name, indices) {
  const img = await loadImage(`samples/${name}.jpg`);
  for (const i of indices) {
    state.panels[i].photo = img;
    state.panels[i].photoName = name;
  }
  render();
}

function setSize(sizeName) {
  if (!SIZES[sizeName]) return;
  state.size = sizeName;
  document.querySelectorAll('input[name="size"]').forEach((r) => { r.checked = r.value === sizeName; });
  render();
}

function setTitle(t) {
  state.title = t;
  const el = document.getElementById('title');
  if (el && el.value !== t) el.value = t;
  render();
}

function setSubtitle(t) {
  state.subtitle = t;
  const el = document.getElementById('subtitle');
  if (el && el.value !== t) el.value = t;
  render();
}

async function exportDataURL(sizeName) {
  await document.fonts.ready;
  const { w, h } = SIZES[sizeName];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off.getContext('2d'), state, sizeName);
  return off.toDataURL('image/png');
}

function setPanelPan(i, panX, panY) {
  const panel = state.panels[i];
  if (!panel) return;
  panel.panX = panX;
  panel.panY = panY;
  render();
}

function fontsLoaded() {
  return document.fonts.check('16px Anton') && document.fonts.check('600 16px Oswald');
}

window.__cover = { state, exportDataURL, fontsLoaded, render, setSize, setTitle, setSubtitle };

// ---- editor UI ----
function buildPanelBoxes() {
  const host = document.getElementById('panels');
  state.panels.forEach((panel, i) => {
    const box = document.createElement('div');
    box.className = 'panel-box';
    box.innerHTML = `
      <h3>${PANEL_NAMES[i]}</h3>
      <div class="photo-name">No photo yet</div>
      <div class="row">
        <button type="button" class="upload-btn">Upload photo</button>
        <button type="button" class="sample-btn">Use sample</button>
        <button type="button" class="clear-btn">Clear</button>
      </div>
      <label>Zoom <input type="range" class="zoom" min="1" max="2.5" step="0.05" value="1"></label>
      <label>Pan X <input type="range" class="panx" min="-1" max="1" step="0.05" value="0"></label>
      <label>Pan Y <input type="range" class="pany" min="-1" max="1" step="0.05" value="0"></label>
      <input type="file" class="file" accept="image/*" hidden>`;
    const fileInput = box.querySelector('.file');
    const nameEl = box.querySelector('.photo-name');
    const setName = () => { nameEl.textContent = panel.photo ? `Photo: ${panel.photoName || 'upload'}` : 'No photo yet'; };
    box.querySelector('.upload-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      const url = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
      panel.photo = await loadImage(url);
      panel.photoName = f.name;
      setName();
      render();
    });
    box.querySelector('.sample-btn').addEventListener('click', async () => {
      const name = SAMPLES[i % SAMPLES.length];
      await loadSampleIntoPanels(name, [i]);
      setName();
    });
    box.querySelector('.clear-btn').addEventListener('click', () => {
      panel.photo = null;
      panel.photoName = '';
      panel.zoom = 1; panel.panX = 0; panel.panY = 0;
      box.querySelector('.zoom').value = '1';
      box.querySelector('.panx').value = '0';
      box.querySelector('.pany').value = '0';
      setName();
      render();
    });
    box.querySelector('.zoom').addEventListener('input', (e) => { panel.zoom = parseFloat(e.target.value); render(); });
    box.querySelector('.panx').addEventListener('input', (e) => { panel.panX = parseFloat(e.target.value); render(); });
    box.querySelector('.pany').addEventListener('input', (e) => { panel.panY = parseFloat(e.target.value); render(); });
    host.appendChild(box);
  });
}

function wireControls() {
  document.getElementById('title').addEventListener('input', (e) => setTitle(e.target.value));
  document.getElementById('subtitle').addEventListener('input', (e) => setSubtitle(e.target.value));
  document.querySelectorAll('input[name="size"]').forEach((r) => {
    r.addEventListener('change', () => { if (r.checked) setSize(r.value); });
  });
  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      const url = await exportDataURL(b.dataset.export);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sunset-strip-${b.dataset.export}.png`;
      a.click();
    });
  });
}

async function boot() {
  buildPanelBoxes();
  wireControls();
  // Load the fonts explicitly so the first render already uses them.
  try {
    await Promise.all([
      document.fonts.load('16px Anton'),
      document.fonts.load('600 16px Oswald'),
      document.fonts.load('400 16px Oswald'),
    ]);
  } catch (e) { window.__coverErrors.push('font load: ' + String(e)); }
  await stageShot({ setSize, setTitle, setSubtitle, loadSampleIntoPanels, setPanelPan, render });
  render();
  window.__shotReady = true;
}

boot().catch((e) => {
  window.__coverErrors.push(String(e && e.message ? e.message : e));
  window.__shotReady = true;
});
