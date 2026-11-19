// Shot staging for gta6-cover-art-01 (round 3): reads the page's query
// string (?shot=cover|editor&size=square|portrait|landscape&photo=<sample>
// &caption=<title>&subtitle=<subtitle>) and applies it to the editor, so a
// screenshot run can stage a cover or an editor view without clicking.
// The editor passes in its own API; this file only parses and stages.

export function getShotParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    shot: q.get('shot') || '',
    size: q.get('size') || '',
    photo: q.get('photo') || '',
    caption: q.get('caption') || '',
    subtitle: q.get('subtitle') || '',
  };
}

// Frame the hero per photo: the boulevard shot's subject sits high in the
// frame, so the wide hero band crops her face out unless the photo is
// shifted down; the pier shot is already framed well.
const HERO_PAN_Y = { boulevard: -0.45, pier: -0.05 };

// Stage one shot: set size + caption + subtitle, load the named sample photo
// into every panel that is still empty (cover shots fill the whole poster),
// then re-render. Returns after the photos are loaded.
export async function stageShot(api) {
  const p = getShotParams();
  if (p.size && api.setSize) api.setSize(p.size);
  if (p.caption && api.setTitle) api.setTitle(p.caption);
  if (p.subtitle && api.setSubtitle) api.setSubtitle(p.subtitle);
  if (p.photo && api.loadSampleIntoPanels) {
    await api.loadSampleIntoPanels(p.photo, p.shot === 'cover' ? [0, 1, 2, 3] : [0, 1]);
    if (api.setPanelPan && p.photo in HERO_PAN_Y) api.setPanelPan(0, 0, HERO_PAN_Y[p.photo]);
  }
  if (api.render) api.render();
}
