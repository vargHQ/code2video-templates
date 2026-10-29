// Global event frames (STORYBOARD.md). Intervals are [start, endExclusive).
export const scenes = {
  opening: [0, 76],
  search: [76, 194],
  skill: [194, 558],
  grid: [558, 900],
  closing: [900, 1200],
} as const;

export const ev = {
  headlineIn: [0, 14],
  cardIn: [4, 30],
  heroGlare: [10, 58], // the opening: a glare over the captured hero "How to" pill
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
  label1Out: [320, 334],
  pullBack: [326, 356],
  // "Copy prompt": the button reads "Prompt copied" (real capture) and the prompt lands in Claude Code
  cursorToCopy: [356, 380],
  pressCopy: 386,
  copied: [388, 440],
  label1bIn: [372, 398],
  panelIn: [394, 420],
  paste: [404, 416], // Cmd+V: the copied prompt appears line by line
  enter: 462,
  panelOut: [500, 520],
  label1bOut: [500, 514],
  cursorToCrumb: [516, 544],
  pressCrumb: 550,
  gridCut: 558, // "Ads & UGC" breadcrumb -> the category page
  scroll: [558, 590], // 24 real captures of an eased scroll down to the product-ad reels
  // grid
  label2In: [594, 620],
  label2Out: [714, 732], // gone before the push brings the card up under the text slot
  pushGrid: [700, 880],
  closingStart: 900,
  cardOut: [900, 942],
  markIn: [910, 940], // the mark lands, the star turns
  vargIn: [920, 948],
  pillIn: [934, 970], // "how to" springs out from behind "varg", the orange bloom peaks on it
  pillGlare: [968, 1010], // a glare runs across the pill and its letters
  lineIn: [972, 1000],
  urlIn: [994, 1030], // solid orange button
  urlGlare: [1040, 1080],
} as const;
