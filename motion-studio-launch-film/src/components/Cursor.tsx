import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { base, camera, toComp } from "../config/camera";
import { content, fitScale } from "../config/content";
import { ev } from "../config/timeline";
import { inOut, track } from "../config/ease";
import { tokens } from "../config/tokens";

type P = { x: number; y: number };
type R = { x: number; y: number; w: number; h: number };
const A = content.anchors;

// Three clicks. Waypoints are source pixels, so the cursor and rings follow the fitted, zoomed screen.
const passes: { show: [number, number]; from: P; to: P; move: readonly [number, number]; press: number; ring?: R; ringRadius?: number; end: number }[] = [
  { show: [ev.cursorIn, ev.pressSearch + 14], from: { x: 1500, y: 1250 }, to: A.searchBox, move: ev.cursorToSearch, press: ev.pressSearch, end: ev.pressSearch + 14 },
  { show: [ev.cursorToRow[0] - 6, ev.skillCut], from: { x: 1820, y: 900 }, to: A.skillRow, move: ev.cursorToRow, press: ev.pressRow, ring: A.skillRowRect, end: ev.skillCut },
  { show: [ev.cursorToCopy[0] - 6, ev.pressCopy + 14], from: { x: 1300, y: 1250 }, to: A.copyPrompt, move: ev.cursorToCopy, press: ev.pressCopy, ring: A.copyPromptRect, ringRadius: 999, end: ev.pressCopy + 14 },
  { show: [ev.cursorToCrumb[0] - 6, ev.gridCut], from: { x: 1100, y: 700 }, to: A.crumb, move: ev.cursorToCrumb, press: ev.pressCrumb, ring: A.crumbRect, end: ev.gridCut },
];

const dip = (f: number, at: number) =>
  1 - 0.14 * interpolate(f, [at - 4, at, at + 8], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  const pass = passes.find((p) => f >= p.show[0] && f < p.show[1]);
  if (!pass) return null;
  const c = camera(f);
  const tx = track(f, pass.move, 0, 1, inOut);
  const ty = track(f, [pass.move[0] + 3, pass.move[1]], 0, 1, inOut); // slight arc
  const src = { x: pass.from.x + (pass.to.x - pass.from.x) * tx, y: pass.from.y + (pass.to.y - pass.from.y) * ty };
  const p = toComp(base(src), c);
  const o = track(f, [pass.show[0], pass.show[0] + 8], 0, 1) * (1 - track(f, [pass.press + 2, pass.end], 0, 1));

  const ringO = track(f, [pass.press - 12, pass.press], 0, 1) * (1 - track(f, [pass.press + 2, pass.end], 0, 1));
  const rippleT = track(f, [pass.press, pass.end], 0, 1);
  const pressAt = toComp(base(pass.to), c);
  const kk = fitScale * c.s;

  return (
    <AbsoluteFill>
      {pass.ring && ringO > 0 && (() => {
        const tl = toComp(base(pass.ring), c);
        return (
          <div
            style={{
              position: "absolute",
              left: tl.x,
              top: tl.y,
              width: pass.ring.w * kk,
              height: pass.ring.h * kk,
              borderRadius: pass.ringRadius ?? 14,
              boxShadow: `0 0 0 3px ${tokens.accent}, 0 0 40px rgba(252,82,21,0.35)`,
              opacity: ringO,
            }}
          />
        );
      })()}
      {f >= pass.press && f < pass.end && (
        <div
          style={{
            position: "absolute",
            left: pressAt.x - (10 + 40 * rippleT),
            top: pressAt.y - (10 + 40 * rippleT),
            width: 2 * (10 + 40 * rippleT),
            height: 2 * (10 + 40 * rippleT),
            borderRadius: "50%",
            border: `3px solid ${tokens.accent}`,
            opacity: 1 - rippleT,
          }}
        />
      )}
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
          transform: `scale(${dip(f, pass.press)})`,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))",
        }}
      >
        <path d="M1 1 L1 18.5 L5.6 14.2 L8.6 21 L11.6 19.7 L8.7 13 L15 13 Z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
