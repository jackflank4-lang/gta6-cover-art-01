// Screenshot staging: reads ?shot=cover|editor&size=..&photo=..&caption=..
// &subtitle=.. from the URL, stages the editor exactly so, and returns.
// Cover shots are the app's own exported PNGs (the driver calls
// window.__cover.exportDataURL); editor shots are a page capture, so the
// staged state has to show in the live controls too.

const OTHER_SAMPLE = { boulevard: 'pier', pier: 'boulevard' };

// Framing per kit photo: boulevard's face sits high in the frame, so a
// negative panY (image down, upper part visible) keeps it in the panel;
// pier is centred, so it barely needs any.
const FRAMING = {
  boulevard: { zoom: 1.15, panX: 0, panY: -0.35 },
  pier: { zoom: 1.1, panX: 0, panY: -0.05 },
};

function syncPanelDom(index, panel) {
  const box = document.querySelectorAll('.panel-box')[index];
  if (!box) return;
  const [zoomRange, panXRange, panYRange] = box.querySelectorAll('input[type=range]');
  zoomRange.value = String(panel.zoom);
  panXRange.value = String(panel.panX);
  panYRange.value = String(panel.panY);
}

export async function stageShot(state, render, loadSampleInto) {
  const params = new URLSearchParams(window.location.search);
  const size = params.get('size');
  if (size && ['square', 'portrait', 'landscape'].includes(size)) {
    state.size = size;
    const radio = document.querySelector(`input[name="size"][value="${size}"]`);
    if (radio) radio.checked = true;
  }
  const caption = params.get('caption');
  if (caption) {
    state.title = caption;
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.value = caption;
  }
  const subtitle = params.get('subtitle');
  if (subtitle) {
    state.subtitle = subtitle;
    const subtitleInput = document.getElementById('subtitle');
    if (subtitleInput) subtitleInput.value = subtitle;
  }
  const photo = params.get('photo');
  if (photo && OTHER_SAMPLE[photo]) {
    const frame = FRAMING[photo];
    await loadSampleInto(0, photo);
    Object.assign(state.panels[0], frame);
    // The second panel holds the other photo; its framing depends on which
    // photo it is — boulevard's face sits high, so it needs a negative
    // panY to stay in the frame, pier is centred and does not.
    const other = OTHER_SAMPLE[photo];
    await loadSampleInto(1, other);
    Object.assign(state.panels[1], other === 'boulevard'
      ? { zoom: 1.3, panX: 0.2, panY: -0.4 }
      : { zoom: 1.3, panX: 0.2, panY: 0.1 });
    await loadSampleInto(2, photo);
    Object.assign(state.panels[2], photo === 'boulevard'
      ? { zoom: 1.25, panX: -0.15, panY: -0.2 }
      : { zoom: 1.25, panX: -0.15, panY: 0.15 });
    state.panels.forEach((panel, i) => syncPanelDom(i, panel));
  }
  render();
}
