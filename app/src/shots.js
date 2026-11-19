// Stages the fixed scenes the screenshots are taken from. A `?shot=cover`
// scene loads a photo into every panel and sets the caption; a `?shot=editor`
// scene loads a photo and leaves the editor on screen to be captured.

/**
 * Runs one shot scene. `hooks` is the editor's wiring: loadImage, samples,
 * state, setSize, redraw, setTitle, setSubtitle, ready.
 */
export async function runShot(shot, params, hooks) {
  const size = params.get('size') || 'square';
  const photoName = params.get('photo') || 'boulevard';
  const caption = params.get('caption') || 'Midnight Drive';
  const subtitle = params.get('subtitle') || 'OCEAN BLVD';
  const pick = (name) => (name === 'pier' ? hooks.samples[1] : hooks.samples[0]);
  hooks.setSize(size);
  hooks.setTitle(caption);
  hooks.setSubtitle(subtitle);
  if (shot === 'cover') {
    hooks.state.panels[0].photo = await hooks.loadImage(pick(photoName));
    hooks.state.panels[1].photo = await hooks.loadImage(pick(photoName === 'pier' ? 'boulevard' : 'pier'));
    hooks.state.panels[2].photo = await hooks.loadImage(pick(photoName));
    hooks.state.panels[2].zoom = 1.5;
    hooks.state.panels[2].panX = -0.3;
    hooks.state.panels[2].panY = 0.5;
    if (size === 'portrait') hooks.state.panels[0].panY = 0.65;
    hooks.redraw();
  } else {
    hooks.state.panels[0].photo = await hooks.loadImage(pick(photoName));
    hooks.state.panels[1].photo = await hooks.loadImage(pick(photoName === 'pier' ? 'boulevard' : 'pier'));
    hooks.state.panels[2].photo = await hooks.loadImage(pick(photoName));
    hooks.state.panels[2].zoom = 1.3;
    hooks.redraw();
  }
  await document.fonts.ready;
  hooks.ready();
}
