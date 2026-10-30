import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { fontFamily as sans } from "../components/Copy";
import { LiquidPill } from "../components/LiquidPill";
import { tokens } from "../config/tokens";

// Showcase: five AI dropshipping ads, each made by varg-dropship-reel (varg how to) from one product photo,
// playing side by side. 1920x1080, 30 fps. Long reels loop their hook (seconds); the car-seat ad plays straight.
export const sc = { fps: 30, width: 1920, height: 1080, frames: 540 };
const reels = [
  { src: "sc/d45406f8d0db.mp4", label: "Solar flood light", hook: 7 },
  { src: "sc/631fb721a315.mp4", label: "Cut-resistant gloves", hook: 5 },
  { src: "sc/782920d92e94.mp4", label: "LED pet nail clipper", hook: 6 },
  { src: "sc/3c77d15fbf7e.mp4", label: "Heated neck massager", hook: 7.5 },
  { src: "sc/a2aa0853b683.mp4", label: "Car seat gap filler", hook: 0 },
];
const t = { headIn: [0, 14], popFrom: 8, popStep: 7, swap: 255, endFrom: 400 };

const W = 330;
const H = Math.round((W * 16) / 9);
const GAP = 26;
const X0 = (1920 - (5 * W + 4 * GAP)) / 2;
const TOP = 250;

const MARK =
  "M.115 38.92 16.505.018h5.986v.985L6.101 39.905H.116v-.985ZM55.893 18.7c-6.882-1.208-12.316-6.642-13.523-13.524l-.371-2.106h-2.58l-.372 2.106c-1.207 6.882-6.641 12.316-13.523 13.523l-2.106.371v2.58l2.106.372c6.882 1.207 12.316 6.641 13.523 13.523l.371 2.106h2.58l.372-2.106c1.207-6.882 6.641-12.316 13.523-13.524l2.106-.37V19.07l-2.106-.37Z";

const Headline: React.FC<{ text: React.ReactNode; o: number }> = ({ text, o }) => (
  <div style={{ position: "absolute", top: 100, left: 0, right: 0, textAlign: "center", fontFamily: sans, fontSize: 72, fontWeight: 500, letterSpacing: "-0.035em", color: tokens.fg, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
    {text}
  </div>
);

export const Showcase: React.FC = () => {
  const f = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const h1 = interpolate(f, t.headIn, [0, 1], clamp) * interpolate(f, [t.swap - 12, t.swap], [1, 0], clamp);
  const h2 = interpolate(f, [t.swap, t.swap + 14], [0, 1], clamp) * interpolate(f, [t.endFrom - 12, t.endFrom], [1, 0], clamp);
  const gridOut = interpolate(f, [t.endFrom - 10, t.endFrom + 14], [0, 1], clamp);
  const end = spring({ frame: f - t.endFrom - 6, fps: sc.fps, config: { damping: 12, stiffness: 140 } });
  const pill = spring({ frame: f - t.endFrom - 16, fps: sc.fps, config: { damping: 9, stiffness: 150, mass: 0.8 } });
  const url = spring({ frame: f - t.endFrom - 30, fps: sc.fps, config: { damping: 11, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ backgroundColor: tokens.bg }}>
      <Background />
      {h1 > 0 && (
        <Headline o={h1} text={<>5 products. 5 AI ads. <span style={{ color: tokens.accent }}>One photo each.</span></>} />
      )}
      {h2 > 0 && <Headline o={h2} text={<>About <span style={{ color: tokens.accent }}>$8.60</span> an ad. 100% AI.</>} />}
      {gridOut < 1 &&
        reels.map((r, i) => {
          const start = t.popFrom + i * t.popStep;
          const p = spring({ frame: f - start, fps: sc.fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
          const x = X0 + i * (W + GAP);
          const o = Math.min(1, p * 1.5) * (1 - gridOut);
          return (
            <div key={r.src} style={{ position: "absolute", left: x, top: TOP, width: W, opacity: o, transform: `translateY(${(1 - p) * 90 + gridOut * -30}px) scale(${(0.86 + 0.14 * p) * (1 - 0.06 * gridOut)})` }}>
              <div style={{ position: "relative", width: W, height: H, borderRadius: 24, overflow: "hidden", boxShadow: `0 0 0 2px ${i === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.16)"}, 0 30px 70px rgba(0,0,0,0.55)` }}>
                <Sequence from={start} layout="none">
                  {r.hook > 0 ? (
                    <Loop durationInFrames={Math.round(r.hook * sc.fps)}>
                      <OffthreadVideo src={staticFile(r.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Loop>
                  ) : (
                    <OffthreadVideo src={staticFile(r.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </Sequence>
              </div>
              <div style={{ marginTop: 18, textAlign: "center", fontFamily: sans, fontSize: 26, color: tokens.fg2 }}>{r.label}</div>
            </div>
          );
        })}
      {f >= t.endFrom - 4 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, fontFamily: sans }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 32% at 50% 48%, rgba(252,82,21,${0.2 * Math.min(1, pill)}), transparent 70%)` }} />
          <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: "-0.035em", color: tokens.fg, opacity: end, transform: `translateY(${(1 - end) * 26}px)` }}>
            With varg how to you can <span style={{ color: tokens.accent }}>scale ads.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: Math.min(1, pill * 1.5) }}>
            <svg width={130} height={92} viewBox="0 0 58 41"><path d={MARK} fill="#fff" /></svg>
            <div style={{ fontSize: 120, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff", marginTop: -14 }}>varg</div>
            <div style={{ width: 300 * Math.min(1, pill) }}>
              <LiquidPill f={f} width={300} height={104} ring={5} text="how to" fontSize={66} fontFamily={sans}
                glare={interpolate(f, [t.endFrom + 40, t.endFrom + 80], [0, 1])}
                glow={interpolate(f, [t.endFrom + 16, t.endFrom + 26, t.endFrom + 70], [0, 1, 0.4], clamp)}
                style={{ opacity: Math.min(1, pill * 2), transformOrigin: "0% 50%", transform: `scale(${0.5 + 0.5 * pill})` }} />
            </div>
          </div>
          <div style={{ padding: "20px 52px", borderRadius: 999, background: `linear-gradient(180deg, #ff7a45, ${tokens.accent} 55%, #e2450c)`, color: "#fff", fontSize: 46, fontWeight: 600, opacity: Math.min(1, url * 1.5), transform: `translateY(${(1 - Math.min(1, url)) * 30}px)`, boxShadow: "0 16px 50px rgba(252,82,21,0.45)" }}>
            varg.ai/how-to →
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile("sfx/pad.wav")} volume={0.35} />
      {reels.map((r, i) => (
        <Sequence key={r.src} from={t.popFrom + i * t.popStep} durationInFrames={20} layout="none">
          <Audio src={staticFile("sfx/key.wav")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence from={t.endFrom + 16} durationInFrames={100} layout="none"><Audio src={staticFile("sfx/resolve.wav")} volume={0.42} /></Sequence>
    </AbsoluteFill>
  );
};
