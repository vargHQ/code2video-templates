// Global event frames (STORYBOARD.md). Intervals are [start, endExclusive).
export const scenes = {
  opening: [0, 180],
  action: [180, 480],
  result: [480, 900],
  closing: [900, 1200],
} as const;

export const ev = {
  headlineIn: [0, 24],
  cardIn: [20, 57],
  cursorIn: 220,
  cursorToSearch: [240, 289],
  pressSearch: 300,
  headlineOut: [288, 306],
  zoomPalette: [304, 346],
  typing: [330, 345, 360, 375, 390, 405], // one real captured state per character
  cursorToRow: [416, 445],
  pressRow: 450,
  guideCut: 462, // the click navigates: instant cut to the guide screen
  zoomOut: [452, 484],
  result1In: [492, 522],
  pushGuide: [560, 840],
  result1Out: [672, 690],
  result2In: [690, 720],
  closingStart: 900,
  cardOut: [900, 942],
  logoIn: [918, 960],
  lineIn: [948, 978],
  urlIn: [972, 1002],
} as const;
