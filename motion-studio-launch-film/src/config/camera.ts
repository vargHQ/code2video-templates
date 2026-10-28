import { interpolate } from "remotion";
import { cardBox, content, fitScale } from "./content";
import { ev } from "./timeline";
import { inOut, track } from "./ease";

// A source-pixel point on the fitted card, in composition pixels before the camera.
export const base = (p: { x: number; y: number }) => ({
  x: cardBox.x + p.x * fitScale,
  y: cardBox.y + p.y * fitScale,
});

export type Cam = { s: number; fx: number; fy: number; tx: number; ty: number };
// comp = T + (p - F) * s
const identity = (fx = 960, fy = 540): Cam => ({ s: 1, fx, fy, tx: fx, ty: fy });
const mix = (a: Cam, b: Cam, t: number): Cam => ({
  s: a.s + (b.s - a.s) * t,
  fx: a.fx + (b.fx - a.fx) * t,
  fy: a.fy + (b.fy - a.fy) * t,
  tx: a.tx + (b.tx - a.tx) * t,
  ty: a.ty + (b.ty - a.ty) * t,
});

const pal = base(content.anchors.paletteFocus);
const PALETTE: Cam = { s: 1.85, fx: pal.x, fy: pal.y, tx: 960, ty: 545 };
const gd = base(content.anchors.guideFocus);
const GUIDE_PUSH: Cam = { s: 1.22, fx: gd.x, fy: gd.y, tx: 960, ty: 640 };

export const camera = (f: number): Cam => {
  if (f < ev.zoomOut[0]) {
    const t = track(f, ev.zoomPalette, 0, 1, inOut);
    return mix(identity(pal.x, pal.y), PALETTE, t);
  }
  if (f < ev.pushGuide[0]) {
    const t = track(f, ev.zoomOut, 0, 1, inOut);
    return mix(PALETTE, identity(pal.x, pal.y), t);
  }
  const t = interpolate(f, [ev.pushGuide[0], ev.pushGuide[1] - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: inOut,
  });
  return mix(identity(gd.x, gd.y), GUIDE_PUSH, t);
};

export const toComp = (p: { x: number; y: number }, c: Cam) => ({
  x: c.tx + (p.x - c.fx) * c.s,
  y: c.ty + (p.y - c.fy) * c.s,
});
