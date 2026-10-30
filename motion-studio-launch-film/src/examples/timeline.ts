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
  zoomIn: [110, 190], // a gentle push so the tiles read bigger
  scrollRecent: [130, 420], // 0 -> 3600 CSS px down the feed
  label1Out: [396, 410],
  zoomOut: [404, 436],
  cursorToMake: [430, 458],
  pressMake: 464,
  makeCut: 472, // sidebar "Make a video" -> 278 results
  label2In: [480, 506],
  zoomIn2: [476, 520],
  scrollMake: [486, 530], // 0 -> 600 CSS px: the cards to open come into view
  label2Out: [540, 554],
  label3In: [556, 582],
  label3Out: [876, 890],
  // the click-through: card i is clicked at clickStart + i*clickStep + 22, its skill page shows from +26 to the next step
  clickStart: 536,
  clickStep: 90,
  clickMove: 18,
  clickPress: 22,
  clickCut: 26,
} as const;

export const scroll = { recent: 3600, make: 600 }; // CSS px
