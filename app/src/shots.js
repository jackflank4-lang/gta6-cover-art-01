// Vice Lights Studio — screenshot scenes: the 4 shots the maker takes with the
// CDP driver (~/workspace/makefun/cdp-cover.mjs shots). The first by name is the
// cover; at least one shows the editor with a photo loaded, the rest are covers
// the app exported. Each shot is a query the app boots with (?shot=...).
export const SHOTS = [
  {
    name: "1-cover.jpg",
    query: "?shot=cover&size=landscape&photo=boulevard&caption=Midnight%20Drive&subtitle=OCEAN%20BLVD",
    kind: "export",
    size: "landscape",
  },
  {
    name: "2-editor.jpg",
    query: "?shot=editor&size=square&photo=boulevard&caption=Palm%20Court&subtitle=VICE%20NIGHTS",
    kind: "page",
    size: "square",
  },
  {
    name: "3-cover.jpg",
    query: "?shot=cover&size=portrait&photo=pier&caption=Palm%20Court&subtitle=NEON%20COAST",
    kind: "export",
    size: "portrait",
  },
  {
    name: "4-cover.jpg",
    query: "?shot=cover&size=square&photo=pier&caption=Ocean%20Blvd&subtitle=MIDNIGHT%20DRIVE",
    kind: "export",
    size: "square",
  },
];

// Gate limits (reference/gate.json): each screenshot at most 256 KiB, long side
// at most 1280 px, short side at least 480 px. Exported covers are scaled down
// to fit before they are saved.
export const SHOT_LIMITS = { maxBytes: 262144, maxLongSide: 1280, minShortSide: 480 };
