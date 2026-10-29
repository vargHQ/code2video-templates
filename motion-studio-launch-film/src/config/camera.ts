import { cardBox, content, fitScale } from "./content";
import { ev } from "./timeline";
import { inOut, track } from "./ease";

// A source-pixel point on the fitted card, in composition pixels before the camera.
export const base = (p: { x: number; y: number }) => ({
  x: cardBox.x + p.x * fitScale,
  y: cardBox.y + p.y * fitScale,
});

export type Cam = { s: number; fx: number; fy: number; tx: number; ty: number };
// comp = T + (p - F) * s. Any camera with s = 1 and T = F is the identity, whatever F is.
const at = (p: { x: number; y: number }, s: number, tx: number, ty: number): Cam => {
  const b = base(p);
  return { s, fx: b.x, fy: b.y, tx, ty };
};
const isIdentity = (c: Cam) => c.s === 1 && c.tx === c.fx && c.ty === c.fy;
const identityAt = (c: Cam): Cam => ({ s: 1, fx: c.fx, fy: c.fy, tx: c.fx, ty: c.fy });
const mix = (a: Cam, b: Cam, t: number): Cam => ({
  s: a.s + (b.s - a.s) * t,
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
  tx: a.tx + (b.tx - a.tx) * t,
  ty: a.ty + (b.ty - a.ty) * t,
});

const A = content.anchors;
const PALETTE = at(A.paletteFocus, 1.85, 960, 545);
const VIDEO = at(A.videoFocus, 1.7, 1010, 590);
const GRID = at(A.gridFocus, 1.28, 960, 620);
const HOME = identityAt(PALETTE);

// Camera moves in order; between moves the camera holds.
const moves: { span: readonly [number, number]; to: Cam | "identity" }[] = [
  { span: ev.zoomPalette, to: PALETTE },
  { span: ev.zoomOut, to: "identity" },
  { span: ev.pushVideo, to: VIDEO },
  { span: ev.pullBack, to: "identity" },
  { span: ev.pushGrid, to: GRID },
];

export const camera = (f: number): Cam => {
  let cur = HOME;
  for (const m of moves) {
    const to = m.to === "identity" ? identityAt(cur) : m.to;
    // From the identity, zoom about the target's own focus point (no stray pan).
    const from = isIdentity(cur) && m.to !== "identity" ? identityAt(to) : cur;
    if (f < m.span[0]) return cur;
    if (f < m.span[1] - 1) return mix(from, to, track(f, m.span, 0, 1, inOut));
    cur = to;
  }
  return cur;
};

export const toComp = (p: { x: number; y: number }, c: Cam) => ({
  x: c.tx + (p.x - c.fx) * c.s,
  y: c.ty + (p.y - c.fy) * c.s,
});
