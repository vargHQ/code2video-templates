// Event frames for the Examples film. [start, endExclusive). The closing (900+) is shared with Launch.
export const xt = {
  headlineIn: [0, 14],
  cardIn: [4, 30],
  heroGlare: [8, 50],
  cursorIn: 24,
  cursorToRecent: [28, 52],
  pressRecent: 58,
  headlineOut: [50, 64],
  recentCut: 64, // sidebar "Recent" -> the live feed, every card starts
  label1In: [72, 98],
  zoomIn: [120, 200], // a gentle push so the tiles read bigger
  scrollRecent: [150, 590], // 0 -> 5200 CSS px down the feed
  label1Out: [560, 574],
  zoomOut: [570, 604],
  cursorToMake: [598, 626],
  pressMake: 632,
  makeCut: 640, // sidebar "Make a video" -> 278 results
  label2In: [648, 674],
  zoomIn2: [660, 720],
  scrollMake: [680, 886], // 0 -> 2700 CSS px
  label2Out: [862, 878],
} as const;

export const scroll = { recent: 5200, make: 2700 }; // CSS px
