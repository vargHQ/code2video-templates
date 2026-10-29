// Global event frames (STORYBOARD.md). Intervals are [start, endExclusive).
export const scenes = {
  opening: [0, 76],
  search: [76, 194],
  skill: [194, 460],
  grid: [460, 900],
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
  typing: Array.from({ length: 12 }, (_, i) => 92 + i * 6), // "dropshipping", one real capture per character
  cursorToRow: [162, 182],
  pressRow: 186,
  skillCut: 194, // the click navigates: cut to the skill page, its reel starts
  zoomOut: [188, 218],
  // skill page: the example reel plays
  label1In: [206, 232],
  pushVideo: [222, 276],
  pullBack: [386, 420],
  label1Out: [404, 418],
  cursorToCrumb: [418, 446],
  pressCrumb: 452,
  gridCut: 460, // "Ads & UGC" breadcrumb -> the category page
  scroll: [460, 492], // 24 real captures of an eased scroll down to the product-ad reels
  // grid
  label2In: [496, 522],
  label2Out: [640, 658], // gone before the push brings the card up under the text slot
  pushGrid: [620, 880],
  closingStart: 900,
  cardOut: [900, 942],
  logoIn: [918, 960],
  lineIn: [948, 978],
  urlIn: [972, 1002],
} as const;
