import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { base, camera, toComp } from "../config/camera";
import { content, fitScale } from "../config/content";
import { ev } from "../config/timeline";
import { inOut, track } from "../config/ease";
import { tokens } from "../config/tokens";

type P = { x: number; y: number };
const lerpP = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Waypoints in source pixels, so cursor and highlights follow the fitted, zoomed screen.
const START: P = { x: 2435, y: 1280 };
const PALETTE_REST: P = { x: 1760, y: 900 };
const ROW = content.anchors.guideRow;
const ROW_RECT = { x: 840, y: 461, w: 1200, h: 108 }; // "How to make a UGC ad video with AI"

const sourcePoint = (f: number): P => {
  if (f < ev.pressSearch + 8) {
    // a slight arc: ease on x, a touch later on y
    const tx = track(f, ev.cursorToSearch, 0, 1, inOut);
    const ty = track(f, [ev.cursorToSearch[0] + 4, ev.cursorToSearch[1]], 0, 1, inOut);
    return { x: START.x + (content.anchors.searchBox.x - START.x) * tx, y: START.y + (content.anchors.searchBox.y - START.y) * ty };
  }
  return lerpP(PALETTE_REST, ROW, track(f, ev.cursorToRow, 0, 1, inOut));
};

const visibility = (f: number) => {
  const a = track(f, [ev.cursorIn, ev.cursorIn + 16], 0, 1) * (1 - track(f, [ev.pressSearch + 6, ev.pressSearch + 18], 0, 1));
  const b = track(f, [410, 420], 0, 1) * (1 - track(f, [ev.pressRow + 2, ev.guideCut], 0, 1));
  return f < 380 ? a : b;
};

const pressDip = (f: number, at: number) =>
  1 - 0.14 * interpolate(f, [at - 4, at, at + 8], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Ripple: React.FC<{ at: number; p: P; life?: number }> = ({ at, p, life = 24 }) => {
  const f = useCurrentFrame();
  if (f < at || f >= at + life) return null;
  const t = track(f, [at, at + life], 0, 1);
  const r = 10 + 46 * t;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x - r,
        top: p.y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `3px solid ${tokens.accent}`,
        opacity: 1 - t,
      }}
    />
  );
};

export const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.cursorIn || f >= ev.guideCut) return null;
  const c = camera(f);
  const p = toComp(base(sourcePoint(f)), c);
  const o = visibility(f);
  const scale = pressDip(f, ev.pressSearch) * pressDip(f, ev.pressRow);

  // Selection ring around the chosen result row (presentation overlay, screenshot untouched).
  const ring = track(f, [ev.pressRow - 14, ev.pressRow], 0, 1) * (1 - track(f, [ev.pressRow + 2, ev.guideCut], 0, 1));
  const tl = toComp(base({ x: ROW_RECT.x, y: ROW_RECT.y }), c);
  const k = fitScale * c.s;

  return (
    <AbsoluteFill>
      {ring > 0 && (
        <div
          style={{
            position: "absolute",
            left: tl.x,
            top: tl.y,
            width: ROW_RECT.w * k,
            height: ROW_RECT.h * k,
            borderRadius: 14,
            boxShadow: `0 0 0 3px ${tokens.accent}, 0 0 40px rgba(252,82,21,0.35)`,
            opacity: ring,
          }}
        />
      )}
      <Ripple at={ev.pressSearch} p={toComp(base(content.anchors.searchBox), camera(ev.pressSearch))} />
      <Ripple at={ev.pressRow} p={toComp(base(ROW), c)} life={ev.guideCut - ev.pressRow} />
      <svg
        width={34}
        height={46}
        viewBox="0 0 17 23"
        style={{
          position: "absolute",
          left: p.x - 2,
          top: p.y - 2,
          opacity: o,
          transformOrigin: "2px 2px",
          transform: `scale(${scale})`,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))",
        }}
      >
        <path d="M1 1 L1 18.5 L5.6 14.2 L8.6 21 L11.6 19.7 L8.7 13 L15 13 Z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
