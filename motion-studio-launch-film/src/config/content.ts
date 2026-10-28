// Replaceable content (ASSETS.md "replaceable content contract").
// Screens are 2880x1800 captures of varg.ai/how-to (1440x900 CSS at 2x), taken 2026-10-28.
export const content = {
  opening: { before: "Every AI ", accent: "video", after: ", one search away." },
  results: [
    "The exact recipe: formats, hooks, sources.",
    "39 how-to guides. 646 skills. Real examples.",
  ],
  closingLine: "Make any video with AI agents.",
  closingUrl: "varg.ai/how-to",
  query: "ugc ad",
  screens: {
    home: "screens/home.png",
    palette: "screens/palette-empty.png",
    typed: ["screens/type-1.png", "screens/type-2.png", "screens/type-3.png", "screens/type-4.png", "screens/type-5.png", "screens/type-6.png"],
    guide: "screens/guide.png",
  },
  logo: "logo.png", // 300x80 crop of the real sidebar logo
  source: { w: 2880, h: 1800 },
  // Anchors in source-image pixels (measured on the captures).
  anchors: {
    searchBox: { x: 330, y: 170 },     // sidebar "Search skills" field
    paletteFocus: { x: 1440, y: 560 },  // centre of the open command palette
    guideRow: { x: 1150, y: 514 },      // "How to make a UGC ad video with AI" row
    guideFocus: { x: 1300, y: 900 },    // "What works now" block on the guide page
  },
} as const;

// Fitted card box in composition pixels (uniform contain fit: 2880 -> 1216).
export const cardBox = { x: 352, y: 220, w: 1216, h: 760 } as const;
export const fitScale = cardBox.w / content.source.w;
