// Neon Skyline editor: state, controls, export, and the debug/test API
// the CDP driver uses (window.__cover, window.__shotReady,
// window.__coverErrors). Photos are read on the machine only, never sent
// anywhere; export draws the same renderCover the preview uses.

import { renderCover, SIZES } from './cover.js';
import { stageShot } from './shots.js';

export const SAMPLES = ['boulevard', 'pier'];

export const state = {
  title: 'NEON SKYLINE',
  subtitle: 'VICE CITY NIGHTS',
  size: 'square',
  panels: [
    { photo: null, photoName: '', zoom: 1, panX: 0, panY: 0 },
    { photo: null, photoName: '', zoom: 1, panX: 0, panY: 0 },
    { photo: null, photoName: '', zoom: 1, panX: 0, panY: 0 },
  ],
};

window.__coverErrors = [];
window.addEventListener('error', (event) => {
  window.__coverErrors.push(String(event.message || event.error || 'error'));
});

const canvas = document.getElementById('cover');

export function render() {
  renderCover(canvas, state, state.size);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

export async function loadSampleInto(panelIndex, sampleName) {
  const img = await loadImage(`samples/${sampleName}.jpg`);
  const panel = state.panels[panelIndex];
  panel.photo = img;
  panel.photoName = sampleName;
  render();
  return panel;
}

// Fill every empty panel with the first panel's photo (one photo, many
// panels) — the quick path from a single shot to a full cover.
export function fillAllFromFirst() {
  const first = state.panels[0];
  if (!first.photo) return;
  for (let i = 1; i < state.panels.length; i += 1) {
    state.panels[i].photo = first.photo;
    state.panels[i].photoName = first.photoName;
  }
  render();
}

export async function exportDataURL(sizeName) {
  await document.fonts.ready;
  const off = document.createElement('canvas');
  renderCover(off, state, sizeName);
  return off.toDataURL('image/png');
}

export function fontsLoaded() {
  return document.fonts.check('16px Anton') && document.fonts.check('600 16px Oswald');
}

window.__cover = {
  state,
  exportDataURL,
  fontsLoaded,
  render,
  loadSampleInto,
  fillAllFromFirst,
};

// The panel that a stageShot or a sample button loads next, so repeated
// sample clicks alternate between the two kit photos.
export function setPanelPan(panelIndex, panX, panY) {
  const panel = state.panels[panelIndex];
  panel.panX = panX;
  panel.panY = panY;
  render();
}

function wirePanelBox(box, index) {
  const fileInput = box.querySelector('input[type=file]');
  const [uploadBtn, sampleBtn] = box.querySelectorAll('button');
  const [zoomRange, panXRange, panYRange] = box.querySelectorAll('input[type=range]');
  const panel = state.panels[index];

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        panel.photo = await loadImage(reader.result);
        panel.photoName = file.name;
        render();
      } catch (err) {
        window.__coverErrors.push(String(err));
      }
    };
    reader.readAsDataURL(file);
  });

  let sampleStep = index;
  sampleBtn.addEventListener('click', async () => {
    try {
      const name = SAMPLES[sampleStep % SAMPLES.length];
      sampleStep += 1;
      await loadSampleInto(index, name);
    } catch (err) {
      window.__coverErrors.push(String(err));
    }
  });

  zoomRange.addEventListener('input', () => {
    panel.zoom = parseFloat(zoomRange.value);
    render();
  });
  panXRange.addEventListener('input', () => {
    panel.panX = parseFloat(panXRange.value);
    render();
  });
  panYRange.addEventListener('input', () => {
    panel.panY = parseFloat(panYRange.value);
    render();
  });
}

function wireControls() {
  const titleInput = document.getElementById('title');
  titleInput.addEventListener('input', () => {
    state.title = titleInput.value;
    render();
  });
  const subtitleInput = document.getElementById('subtitle');
  subtitleInput.addEventListener('input', () => {
    state.subtitle = subtitleInput.value;
    render();
  });
  document.querySelectorAll('input[name=size]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        state.size = radio.value;
        render();
      }
    });
  });
  document.querySelectorAll('.panel-box').forEach((box, index) => wirePanelBox(box, index));
  document.getElementById('fill-all').addEventListener('click', fillAllFromFirst);
  document.getElementById('export').addEventListener('click', async () => {
    const url = await exportDataURL(state.size);
    const a = document.getElementById('download');
    a.href = url;
    a.download = `neon-skyline-${state.size}.png`;
    a.click();
  });
}

async function boot() {
  wireControls();
  try {
    await Promise.all([
      document.fonts.load('16px Anton'),
      document.fonts.load('600 16px Oswald'),
      document.fonts.load('400 16px Oswald'),
    ]);
  } catch (err) {
    window.__coverErrors.push(String(err));
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('shot')) {
    await stageShot(state, render, loadSampleInto);
  } else {
    try {
      await loadSampleInto(0, 'boulevard');
    } catch (err) {
      window.__coverErrors.push(String(err));
    }
    render();
  }
  window.__shotReady = true;
}

boot().catch((err) => {
  window.__coverErrors.push(String(err));
  window.__shotReady = true;
});
