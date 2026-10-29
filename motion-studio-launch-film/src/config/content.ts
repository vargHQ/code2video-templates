// Replaceable content (ASSETS.md "replaceable content contract").
// Screens are 2880x1800 captures of varg.ai/how-to (1440x900 CSS at 2x), taken 2026-10-29 in one session.
// Every source rect below is in source pixels (CSS px x 2), measured from the DOM at capture time.
export type Rect = { x: number; y: number; w: number; h: number };
export type Clip = { src: string; rect: Rect; fit: "cover" | "contain"; seconds: number; radius: number; keep?: (Rect & { r: number })[] };

const css = (x: number, y: number, w: number, h: number): Rect => ({ x: x * 2, y: y * 2, w: w * 2, h: h * 2 });
const badge = (x: number, y: number) => ({ ...css(x + 10, y + 10, 64, 22), r: 22 }); // "Workflow" pill over a card

export const content = {
  opening: { before: "Every AI ", accent: "video", after: ", one search away." },
  results: ["Every skill shows what it makes.", "667 skills. Each with a real example."],
  closingLine: "Make any video with AI agents.",
  closingUrl: "varg.ai/how-to",
  query: "ugc ad",
  screens: {
    home: "screens/home.png",
    palette: "screens/palette-empty.png",
    typed: ["screens/type-1.png", "screens/type-2.png", "screens/type-3.png", "screens/type-4.png", "screens/type-5.png", "screens/type-6.png"],
    skill: "screens/skill.png", // /how-to/skills/varg-studio-ugc-ads
    grid: "screens/ads.png", // /how-to/browse/skills/ads
  },
  // The previews the pages autoplay, laid back over their own boxes (the captures hold one still frame).
  clips: {
    skill: [
      { src: "clips/varg-studio-ugc-ads.mp4", rect: css(774.33, 84.5, 632.66, 394.66), fit: "contain", seconds: 9, radius: 36, keep: [{ ...css(786.33, 435.16, 32, 32), r: 16 }] },
    ] as Clip[],
    grid: [
      { src: "clips/marketingskills-video.mp4", rect: css(281, 359.63, 360.66, 224.66), fit: "contain", seconds: 12, radius: 28, keep: [badge(281, 359.63)] },
      { src: "clips/fal-ugc.mp4", rect: css(663.66, 359.63, 360.67, 224.66), fit: "cover", seconds: 3.958, radius: 28, keep: [badge(663.66, 359.63)] },
      { src: "clips/krea-marketing.mp4", rect: css(281, 670.28, 360.66, 224.66), fit: "cover", seconds: 9.041, radius: 28, keep: [badge(281, 670.28)] },
      { src: "clips/business-motion-film.mp4", rect: css(663.66, 670.28, 360.67, 224.66), fit: "cover", seconds: 8, radius: 28, keep: [badge(663.66, 670.28)] },
      { src: "clips/flux-3-product-ads.mp4", rect: css(1046.33, 670.28, 360.66, 224.66), fit: "cover", seconds: 10, radius: 28, keep: [badge(1046.33, 670.28)] },
    ] as Clip[],
  },
  logo: "logo.png", // 300x80 crop of the real sidebar logo
  source: { w: 2880, h: 1800 },
  anchors: {
    searchBox: { x: 300, y: 172 }, // sidebar "Search skills" field
    paletteFocus: { x: 1440, y: 560 }, // upper half of the open command palette
    skillRow: { x: 1150, y: 404 }, // "UGC Ad · Skill" row
    skillRowRect: { x: 840, y: 352, w: 1200, h: 104 },
    videoFocus: { x: 2181, y: 563 }, // centre of the skill page's example video
    crumb: { x: 912, y: 84 }, // breadcrumb "Ads & UGC"
    crumbRect: { x: 832, y: 54, w: 160, h: 60 },
    gridFocus: { x: 1688, y: 1180 }, // centre of the card grid
  },
} as const;

// Fitted card box in composition pixels (uniform contain fit: 2880 -> 1216).
export const cardBox = { x: 352, y: 220, w: 1216, h: 760 } as const;
export const fitScale = cardBox.w / content.source.w;
