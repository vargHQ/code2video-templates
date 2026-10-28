// Visual tokens (STYLE.md). Colors sampled from varg.ai/how-to (app.css + screenshot pixel).
export const tokens = {
  bg: "#070708",
  depth2: "#151516",
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.13)",
  fg: "#ffffff",
  fg2: "#a1a1aa",
  fg3: "#737373",
  accent: "#fc5215",
  radius: 22,
  safe: 96,
  displaySize: 68,
  labelSize: 52,
  weightDisplay: 500,
} as const;

export const canvas = { width: 1920, height: 1080, fps: 60, frames: 1200 } as const;
