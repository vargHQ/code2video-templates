// Global event frames (STORYBOARD.md). Intervals are [start, endExclusive).
export const scenes = {
  opening: [0, 76],
  search: [76, 172],
  skill: [172, 446],
  grid: [446, 900],
  closing: [900, 1200],
} as const;

export const ev = {
  headlineIn: [0, 14],
  cardIn: [4, 30],
  // search
  cursorIn: 30,
  cursorToSearch: [36, 66],
  pressSearch: 72,
  headlineOut: [64, 78],
  zoomPalette: [76, 108],
  typing: [92, 100, 108, 116, 124, 132], // one real captured state per character
  cursorToRow: [138, 160],
  pressRow: 164,
  skillCut: 172, // the click navigates: cut to the skill page, its video starts
  zoomOut: [166, 196],
  // skill page: the example video plays
  label1In: [184, 210],
  pushVideo: [200, 256],
  pullBack: [372, 406],
  label1Out: [392, 406],
  cursorToCrumb: [404, 432],
  pressCrumb: 438,
  gridCut: 446, // "Ads & UGC" breadcrumb -> the category grid, every card playing
  // grid
  label2In: [456, 482],
  label2Out: [612, 630], // gone before the push brings the card up under the text slot
  pushGrid: [590, 880],
  closingStart: 900,
  cardOut: [900, 942],
  logoIn: [918, 960],
  lineIn: [948, 978],
  urlIn: [972, 1002],
} as const;
