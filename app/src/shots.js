// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos; ?shot=cover shows the cover alone. `photo` picks the hero sample,
// `caption` the title, `subtitle` the subtitle, `size` the post size.
// window.__shotReady is set by main.js once painted.
export async function runShot(shot, query, state, loadImage, redraw) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const size = query.get('size');
  if (size && (size === 'square' || size === 'portrait' || size === 'landscape')) {
    state.size = size;
    const radio = document.querySelector(`input[name="size"][value="${size}"]`);
    if (radio) radio.checked = true;
  }
  const caption = query.get('caption');
  if (caption !== null) {
    state.title = caption;
    document.getElementById('title').value = caption;
  }
  const subtitle = query.get('subtitle');
  if (subtitle !== null) {
    state.subtitle = subtitle;
    document.getElementById('subtitle').value = subtitle;
  }
  const photo = query.get('photo');
  if (photo) {
    try {
      const img = await loadImage(`samples/${photo}.jpg`);
      state.panels[0].photo = img;
    } catch (e) { /* keep the default samples */ }
  }
  redraw();
}
