import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { fontFamily } from "../components/Copy";
import { LiquidPill } from "../components/LiquidPill";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { out, track } from "../config/ease";
import { canvas, tokens } from "../config/tokens";

// The varg mark from the site's logo SVG (viewBox 0 0 58 41).
const MARK =
  "M.115 38.92 16.505.018h5.986v.985L6.101 39.905H.116v-.985ZM55.893 18.7c-6.882-1.208-12.316-6.642-13.523-13.524l-.371-2.106h-2.58l-.372 2.106c-1.207 6.882-6.641 12.316-13.523 13.523l-2.106.371v2.58l2.106.372c6.882 1.207 12.316 6.641 13.523 13.523l.371 2.106h2.58l.372-2.106c1.207-6.882 6.641-12.316 13.523-13.524l2.106-.37V19.07l-2.106-.37Z";

const PILL = { w: 392, h: 134, ring: 7, font: 86 };

export const Closing: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.markIn[0]) return null;
  const sp = (start: number, damping = 12) =>
    spring({ frame: f - start, fps: canvas.fps, config: { damping, stiffness: 150, mass: 0.8 } });

  const mark = sp(ev.markIn[0], 14);
  const star = interpolate(mark, [0, 1], [-120, 0]);
  const varg = track(f, ev.vargIn, 0, 1, out);
  const pill = sp(ev.pillIn[0], 9); // overshoots, like the site's cubic-bezier(0.34, 1.56, 0.64, 1)
  const glare = interpolate(f, ev.pillGlare as unknown as number[], [0, 1], { extrapolateLeft: "extend", extrapolateRight: "extend" });
  const bloom =
    interpolate(f, [ev.pillIn[0], ev.pillIn[0] + 10, ev.pillIn[0] + 50], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) +
    0.12 * Math.sin((f - ev.pillIn[0]) / 22) * track(f, [ev.pillIn[0] + 50, ev.pillIn[0] + 80], 0, 1);
  const line = track(f, ev.lineIn, 0, 1);
  const url = sp(ev.urlIn[0], 11);
  const urlGlare = interpolate(f, ev.urlGlare as unknown as number[], [0, 1], { extrapolateLeft: "extend", extrapolateRight: "extend" });
  const halo = interpolate(f, [ev.pillIn[0], ev.pillIn[0] + 14, ev.pillIn[0] + 90], [0, 0.55, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 38% 30% at 50% 44%, rgba(252,82,21,${halo * 0.5}), transparent 70%)` }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: -70 }}>
        <svg
          width={170}
          height={120}
          viewBox="0 0 58 41"
          style={{ opacity: Math.min(1, mark * 1.4), transform: `scale(${0.6 + 0.4 * mark})`, overflow: "visible" }}
        >
          <path d={MARK.split("ZM")[0] + "Z"} fill="#fff" style={{ transform: `translateX(${(1 - mark) * -30}px)` }} />
          <g style={{ transformOrigin: "40.4px 20.4px", transform: `rotate(${star}deg)` }}>
            <path d={"M" + MARK.split("ZM")[1]} fill="#fff" />
          </g>
        </svg>
        <div
          style={{
            fontSize: 150,
            fontWeight: 500,
            letterSpacing: "-0.04em",
            color: tokens.fg,
            opacity: varg,
            transform: `translateX(${(1 - varg) * -40}px)`,
            marginTop: -18,
          }}
        >
          varg
        </div>
        <div style={{ width: PILL.w * Math.min(1, pill), height: PILL.h, overflow: "visible", position: "relative" }}>
          <LiquidPill
            f={f}
            width={PILL.w}
            height={PILL.h}
            ring={PILL.ring}
            text="how to"
            fontSize={PILL.font}
            fontFamily={fontFamily}
            glare={glare}
            glow={Math.max(0, bloom)}
            style={{
              opacity: Math.min(1, pill * 2),
              transformOrigin: "0% 50%",
              transform: `perspective(900px) rotateY(${(1 - pill) * -55}deg) scale(${0.5 + 0.5 * pill})`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: 44,
          fontSize: 62,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          color: tokens.fg,
          opacity: line,
          transform: `translateY(${(1 - line) * 24}px)`,
        }}
      >
        {content.closingLine}
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 40,
          padding: "18px 44px",
          borderRadius: 999,
          overflow: "hidden",
          background: `linear-gradient(180deg, #ff7a45, ${tokens.accent} 55%, #e2450c)`,
          color: "#fff",
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.18) inset, 0 14px 40px rgba(252,82,21,${0.45 * Math.min(1, url)}), 0 0 90px rgba(252,82,21,${0.25 * Math.min(1, url)})`,
          opacity: Math.min(1, url * 1.5),
          transform: `translateY(${(1 - Math.min(1, url)) * 26}px) scale(${0.85 + 0.15 * url})`,
        }}
      >
        {content.closingUrl} →
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${interpolate(urlGlare, [0, 1], [-60, 160]) - 20}%, rgba(255,255,255,0.6) ${interpolate(urlGlare, [0, 1], [-60, 160])}%, transparent ${interpolate(urlGlare, [0, 1], [-60, 160]) + 20}%)`,
            mixBlendMode: "screen",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
