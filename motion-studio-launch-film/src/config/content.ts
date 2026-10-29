// Replaceable content (ASSETS.md "replaceable content contract").
// Screens are 2880x1800 captures of varg.ai/how-to (1440x900 CSS at 2x), taken 2026-10-29 in one session.
// Every source rect below is in source pixels (CSS px x 2), measured from the DOM at capture time.
export type Rect = { x: number; y: number; w: number; h: number };
export type Clip = { src: string; rect: Rect; fit: "cover" | "contain"; seconds: number; radius: number; keep?: (Rect & { r: number })[] };

const css = (x: number, y: number, w: number, h: number): Rect => ({ x: x * 2, y: y * 2, w: w * 2, h: h * 2 });
const pad2 = (n: number) => String(n).padStart(2, "0");

export const content = {
  opening: { before: "Every AI ", accent: "video", after: ", one search away." },
  results: ["Every skill shows what it makes.", "Real ads, made with the skills."],
  closingLine: "Make any video with AI agents.",
  closingUrl: "varg.ai/how-to",
  query: "dropshipping",
  screens: {
    home: "screens/home.png",
    palette: "screens/palette-empty.png",
    typed: Array.from({ length: 12 }, (_, i) => `screens/type-${pad2(i + 1)}.png`), // "d" .. "dropshipping"
    skill: "screens/skill.png", // /how-to/skills/varg-dropship-reel
    scroll: Array.from({ length: 24 }, (_, i) => `screens/scroll/s-${pad2(i)}.png`), // /how-to/browse/skills/ads, eased scroll 0 -> 1190 px
    grid: "screens/grid.png", // the same page at 1190 px: the product-ad reels
  },
  // The previews the pages autoplay, laid back over their own boxes (the captures hold one still frame).
  clips: {
    skill: [
      { src: "clips/varg-dropship-reel.mp4", rect: css(774.33, 143.42, 632.66, 394.66), fit: "contain", seconds: 9.0, radius: 36, keep: [{ ...css(786.33, 494.08, 32, 32), r: 16 }] },
    ] as Clip[],
    grid: [
      { src: "clips/varg-studio-cinematic.mp4", rect: css(281, 101.59, 360.66, 224.66), fit: "contain", seconds: 6.583, radius: 28, keep: [{ ...css(291, 111.59, 52.55, 22), r: 44 }, { ...css(349.55, 111.59, 64, 22), r: 44 }] },
      { src: "clips/varg-studio-ad-hooks.mp4", rect: css(663.66, 101.59, 360.67, 224.66), fit: "cover", seconds: 3.417, radius: 28, keep: [{ ...css(673.66, 111.59, 52.55, 22), r: 44 }, { ...css(732.2, 111.59, 74.7, 22), r: 44 }] },
      { src: "clips/varg-dropship-reel.mp4", rect: css(1046.33, 101.59, 360.66, 224.66), fit: "contain", seconds: 9.0, radius: 28, keep: [{ ...css(1056.33, 111.59, 64, 22), r: 44 }] },
      { src: "clips/varg-product-hook.mp4", rect: css(281, 412.25, 360.66, 224.66), fit: "contain", seconds: 6.0, radius: 28, keep: [{ ...css(291, 422.25, 64, 22), r: 44 }] },
      { src: "clips/file_565f31d99f3a.mp4", rect: css(663.66, 412.25, 360.67, 224.66), fit: "cover", seconds: 5, /* loop the hook only: the 56 s reel turns to the laptop at 5 s */ radius: 28, keep: [{ ...css(673.66, 422.25, 45.8, 22), r: 44 }] },
      { src: "clips/file_a2aa0853b683.mp4", rect: css(1046.33, 412.25, 360.66, 224.66), fit: "cover", seconds: 20.9, radius: 28, keep: [{ ...css(1056.33, 422.25, 45.8, 22), r: 44 }] },
      { src: "clips/file_b1f093b28659.mp4", rect: css(281, 722.91, 360.66, 224.66), fit: "cover", seconds: 15.042, radius: 28, keep: [{ ...css(291, 732.91, 45.8, 22), r: 44 }] },
      { src: "clips/file_d45406f8d0db.mp4", rect: css(663.66, 722.91, 360.67, 224.66), fit: "cover", seconds: 7, /* loop the hook only: the 58 s reel turns to the laptop at 7 s */ radius: 28, keep: [{ ...css(673.66, 732.91, 45.8, 22), r: 44 }] },
    ] as Clip[],
  },
  logo: "logo.png", // 300x80 crop of the real sidebar logo
  source: { w: 2880, h: 1800 },
  anchors: {
    searchBox: { x: 300, y: 172 }, // sidebar "Search skills" field
    paletteFocus: { x: 1440, y: 560 }, // upper half of the open command palette
    skillRow: { x: 1150, y: 404 }, // "Turn a product into a dropshipping guide reel · Skill · best match"
    skillRowRect: { x: 838, y: 348, w: 1204, h: 110 },
    videoFocus: { x: 2181, y: 681 }, // centre of the skill page's example reel
    crumb: { x: 912, y: 84 }, // breadcrumb "Ads & UGC"
    crumbRect: { x: 832, y: 54, w: 160, h: 60 },
    gridFocus: { x: 1688, y: 940 }, // centre of the product-ad reels
  },
} as const;

// Fitted card box in composition pixels (uniform contain fit: 2880 -> 1216).
export const cardBox = { x: 352, y: 220, w: 1216, h: 760 } as const;
export const fitScale = cardBox.w / content.source.w;
