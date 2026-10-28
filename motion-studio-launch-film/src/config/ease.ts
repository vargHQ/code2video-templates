import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const out = Easing.bezier(0.22, 1, 0.36, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

// Reaches `to` on the last displayed frame of [start, endExclusive).
export const track = (f: number, [start, endEx]: readonly [number, number], from: number, to: number, easing = out) =>
  interpolate(f, [start, endEx - 1], [from, to], { ...clamp, easing });
