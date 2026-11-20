// Vice Lights Studio — app logic: state, photo loading, export, CDP test interface.
import { ANTON_WOFF2_B64 } from "../fonts/anton.js";
import { renderCover, SIZES } from "./cover.js";

window.__coverErrors = [];
window.addEventListener("error", (e) => window.__coverErrors.push(String(e.message || e.error)));

const state = {
  title: "VICE LIGHTS",
  subtitle: "Neon Coast",
  grade: "sunset",
  size: "square",
  panels: [
    { photo: null, zoom: 1 },
    { photo: null, zoom: 1 },
    { photo: null, zoom: 1 },
  ],
};

const canvas = document.getElementById("cover");
const ctx = canvas.getContext("2d");
let fontsReady = false;

async function loadAnton() {
  try {
    const bytes = Uint8Array.from(atob(ANTON_WOFF2_B64), (c) => c.charCodeAt(0));
    const face = new FontFace("Anton", bytes, { weight: "400" });
    await face.load();
    document.fonts.add(face);
    fontsReady = true;
  } catch (err) {
    window.__coverErrors.push("font load failed: " + err.message);
  }
}

function draw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  try {
    renderCover(ctx, state.size, state);
  } catch (err) {
    window.__coverErrors.push("render failed: " + err.message);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed: " + src));
    img.src = src;
  });
}

async function loadSample(name, panelIdx) {
  try {
    const img = await loadImage("samples/" + name + ".jpg");
    state.panels[panelIdx].photo = img;
    draw();
  } catch (err) {
    window.__coverErrors.push(err.message);
  }
}

function loadFile(file, panelIdx) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadImage(url)
    .then((img) => {
      state.panels[panelIdx].photo = img;
      draw();
    })
    .catch((err) => window.__coverErrors.push(err.message));
}

function wirePanel(box, idx) {
  const loadBtn = box.querySelector('[data-load]');
  const sampleBtn = box.querySelector('[data-sample]');
  const fileInput = box.querySelector('input[type="file"]');
  const zoom = box.querySelector('input[type="range"]');
  loadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => loadFile(fileInput.files[0], idx));
  sampleBtn.addEventListener("click", () => loadSample(sampleBtn.dataset.sample, idx));
  zoom.addEventListener("input", () => {
    state.panels[idx].zoom = parseFloat(zoom.value) || 1;
    draw();
  });
}

document.querySelectorAll(".panel-box").forEach(wirePanel);

document.getElementById("title").addEventListener("input", (e) => {
  state.title = e.target.value;
  draw();
});
document.getElementById("subtitle").addEventListener("input", (e) => {
  state.subtitle = e.target.value;
  draw();
});
document.getElementById("grade").addEventListener("change", (e) => {
  state.grade = e.target.value;
  draw();
});
document.querySelectorAll('input[name="size"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      state.size = radio.value;
      draw();
    }
  });
});

async function exportDataURL(sizeName) {
  const size = SIZES[sizeName] || SIZES[state.size];
  const off = document.createElement("canvas");
  off.width = size.w;
  off.height = size.h;
  renderCover(off.getContext("2d"), sizeName in SIZES ? sizeName : state.size, state);
  return off.toDataURL("image/png");
}

document.getElementById("exportBtn").addEventListener("click", async () => {
  try {
    const url = await exportDataURL(state.size);
    const link = document.getElementById("downloadLink");
    link.href = url;
    link.download = "vice-lights-" + state.size + ".png";
    link.hidden = false;
    link.click();
  } catch (err) {
    window.__coverErrors.push("export failed: " + err.message);
  }
});

// CDP / test interface.
window.__cover = {
  state,
  exportDataURL,
  fontsLoaded() {
    return fontsReady && document.fonts.check('16px Anton');
  },
};

async function applyShotParams() {
  const q = new URLSearchParams(location.search);
  const shot = q.get("shot");
  if (!shot) return;
  if (q.get("caption")) {
    state.title = q.get("caption");
    document.getElementById("title").value = state.title;
  }
  if (q.get("subtitle")) {
    state.subtitle = q.get("subtitle");
    document.getElementById("subtitle").value = state.subtitle;
  }
  if (q.get("grade") && document.getElementById("grade")) {
    state.grade = q.get("grade");
    document.getElementById("grade").value = state.grade;
  }
  const photo = q.get("photo");
  if (photo) {
    await loadSample(photo, 0);
    await loadSample(photo === "boulevard" ? "pier" : "boulevard", 1);
    await loadSample(photo, 2);
  }
  if (q.get("size")) {
    state.size = q.get("size");
    const radio = document.querySelector(`input[name="size"][value="${state.size}"]`);
    if (radio) radio.checked = true;
  }
}

(async function boot() {
  await loadAnton();
  await applyShotParams();
  draw();
  window.__shotReady = true;
})();
