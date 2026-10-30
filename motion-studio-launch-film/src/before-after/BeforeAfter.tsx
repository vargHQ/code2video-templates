import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/GeistMono";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { fontFamily as sans } from "../components/Copy";
import { LiquidPill } from "../components/LiquidPill";
import { out, track } from "../config/ease";
import { tokens } from "../config/tokens";

const { fontFamily: mono } = loadFont("normal", { weights: ["400", "500"], subsets: ["latin"] });

// Before / after, 1080x1920 at 30 fps. Before: the one line the dropshipping tutorial says to send
// (vargHQ/how-to-make-ai-videos-for-dropshipping) with the skill found on varg how to. After: the original reel
// that skill made, untouched, with its own sound.
export const ba = {
  fps: 30,
  width: 1080,
  height: 1920,
  reel: { src: "ba/solar-reel.mp4", frames: 1746 }, // 58.2 s, varg-dropship-reel example: solar security flood light
  prompt: "Make a dropshipping guide reel for this product:",
  skill: "varg-dropship-reel",
  url: "varg.ai/how-to",
};
export const t = {
  tagIn: [0, 10],
  panelIn: [6, 26],
  paste: 18,
  skillIn: [30, 48],
  enter: 66,
  wipe: [96, 114], // the divider sweeps up and the reel takes over
  reelFrom: 96,
  afterTag: [104, 190],
  endFrom: 96 + 1746,
  endLen: 105,
} as const;
export const totalFrames = t.endFrom + t.endLen;

const MARK =
  "M.115 38.92 16.505.018h5.986v.985L6.101 39.905H.116v-.985ZM55.893 18.7c-6.882-1.208-12.316-6.642-13.523-13.524l-.371-2.106h-2.58l-.372 2.106c-1.207 6.882-6.641 12.316-13.523 13.523l-2.106.371v2.58l2.106.372c6.882 1.207 12.316 6.641 13.523 13.523l.371 2.106h2.58l.372-2.106c1.207-6.882 6.641-12.316 13.523-13.524l2.106-.37V19.07l-2.106-.37Z";

const Tag: React.FC<{ text: string; o: number; accent?: boolean }> = ({ text, o, accent }) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 40,
      fontWeight: 600,
      letterSpacing: "0.14em",
      padding: "14px 34px",
      borderRadius: 999,
      color: accent ? "#fff" : tokens.fg,
      background: accent ? tokens.accent : "rgba(255,255,255,0.08)",
      boxShadow: accent ? "0 10px 40px rgba(252,82,21,0.45)" : `0 0 0 2px ${tokens.line2}`,
      opacity: o,
      transform: `translateY(${(1 - o) * 20}px)`,
    }}
  >
    {text}
  </div>
);

const Before: React.FC = () => {
  const f = useCurrentFrame();
  const tag = track(f, t.tagIn, 0, 1);
  const panel = spring({ frame: f - t.panelIn[0], fps: ba.fps, config: { damping: 14, stiffness: 150 } });
  const skill = spring({ frame: f - t.skillIn[0], fps: ba.fps, config: { damping: 11, stiffness: 150 } });
  const pasted = f >= t.paste;
  const enter = interpolate(f, [t.enter - 1, t.enter, t.enter + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sent = f >= t.enter;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, gap: 70, fontFamily: sans }}>
      <Tag text="BEFORE" o={tag} />
      <div
        style={{
          width: 920,
          borderRadius: 28,
          background: "rgba(14,14,15,0.97)",
          boxShadow: `0 0 0 2px ${tokens.line2}, 0 50px 120px rgba(0,0,0,0.7), 0 0 ${90 * enter}px rgba(252,82,21,${0.4 * enter})`,
          opacity: Math.min(1, panel * 1.4),
          transform: `translateY(${(1 - panel) * 80}px) scale(${0.94 + 0.06 * panel})`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", height: 76, padding: "0 30px", gap: 14, borderBottom: `2px solid ${tokens.line}` }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 99, background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: "center", fontSize: 30, color: tokens.fg2, marginRight: 90 }}>Claude Code</div>
        </div>
        <div style={{ padding: "40px 40px 44px" }}>
          <div
            style={{
              border: `3px solid ${sent ? tokens.accent : "rgba(255,255,255,0.22)"}`,
              borderRadius: 20,
              padding: "30px 32px",
              fontFamily: mono,
              fontSize: 40,
              lineHeight: 1.45,
              color: "#ececee",
              minHeight: 250,
            }}
          >
            <span style={{ color: tokens.accent }}>{"> "}</span>
            {pasted ? ba.prompt : ""}
            {pasted && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 18, padding: "10px 20px", borderRadius: 14, background: "rgba(255,255,255,0.08)", fontFamily: sans, fontSize: 32, color: tokens.fg2 }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
                one product photo
              </div>
            )}
            {!sent && <span style={{ opacity: Math.floor(f / 12) % 2 ? 0 : 1 }}>▍</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
            <span style={{ fontFamily: mono, fontSize: 30, padding: "4px 18px", borderRadius: 10, color: sent || enter > 0 ? "#fff" : tokens.fg3, background: `rgba(252,82,21,${sent ? 0.9 : enter})` }}>⏎ enter</span>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          opacity: Math.min(1, skill * 1.5),
          transform: `translateY(${(1 - Math.min(1, skill)) * 40}px)`,
        }}
      >
        <div style={{ fontSize: 36, color: tokens.fg2 }}>the skill, found on</div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width={92} height={65} viewBox="0 0 58 41"><path d={MARK} fill="#fff" /></svg>
          <div style={{ fontSize: 84, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff", marginTop: -10 }}>varg</div>
          <LiquidPill f={f} width={218} height={76} ring={4} text="how to" fontSize={48} fontFamily={sans} glare={interpolate(f, [40, 80], [0, 1])} glow={0.4 * Math.min(1, skill)} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 38, color: tokens.fg, padding: "8px 24px", borderRadius: 12, background: "rgba(255,255,255,0.06)" }}>{ba.skill}</div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const a = spring({ frame: f, fps: ba.fps, config: { damping: 12, stiffness: 140 } });
  const pill = spring({ frame: f - 8, fps: ba.fps, config: { damping: 9, stiffness: 150, mass: 0.8 } });
  const url = spring({ frame: f - 22, fps: ba.fps, config: { damping: 11, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46, fontFamily: sans }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at 50% 47%, rgba(252,82,21,${0.22 * Math.min(1, pill)}), transparent 70%)` }} />
      <div style={{ fontSize: 46, color: tokens.fg2, opacity: a }}>Made with</div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: a, transform: `scale(${0.9 + 0.1 * a})` }}>
        <svg width={130} height={92} viewBox="0 0 58 41"><path d={MARK} fill="#fff" /></svg>
        <div style={{ fontSize: 120, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff", marginTop: -14 }}>varg</div>
        <div style={{ width: 300 * Math.min(1, pill) }}>
          <LiquidPill
            f={f + 200}
            width={300}
            height={104}
            ring={5}
            text="how to"
            fontSize={66}
            fontFamily={sans}
            glare={interpolate(f, [26, 60], [0, 1])}
            glow={interpolate(f, [8, 18, 60], [0, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            style={{ opacity: Math.min(1, pill * 2), transformOrigin: "0% 50%", transform: `scale(${0.5 + 0.5 * pill})` }}
          />
        </div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 40, color: tokens.fg, opacity: a }}>skill: {ba.skill}</div>
      <div
        style={{
          marginTop: 10,
          padding: "22px 54px",
          borderRadius: 999,
          background: `linear-gradient(180deg, #ff7a45, ${tokens.accent} 55%, #e2450c)`,
          color: "#fff",
          fontSize: 52,
          fontWeight: 600,
          boxShadow: `0 16px 50px rgba(252,82,21,${0.5 * Math.min(1, url)})`,
          opacity: Math.min(1, url * 1.5),
          transform: `translateY(${(1 - Math.min(1, url)) * 30}px)`,
        }}
      >
        {ba.url} →
      </div>
    </AbsoluteFill>
  );
};

export const BeforeAfter: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = track(f, t.wipe, 0, 1, out); // 0 -> 1: the divider moves from the bottom to the top
  const edgeY = ba.height * (1 - wipe);
  const afterTag = track(f, [t.afterTag[0], t.afterTag[0] + 10], 0, 1) * (1 - track(f, [t.afterTag[1] - 12, t.afterTag[1]], 0, 1));
  return (
    <AbsoluteFill style={{ backgroundColor: tokens.bg }}>
      <Background />
      {f < t.wipe[1] && <Before />}
      <Sequence from={t.reelFrom} durationInFrames={ba.reel.frames}>
        <AbsoluteFill style={{ clipPath: f < t.wipe[1] ? `inset(${edgeY}px 0 0 0)` : undefined }}>
          <OffthreadVideo src={staticFile(ba.reel.src)} style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      </Sequence>
      {f >= t.wipe[0] && f < t.wipe[1] && (
        <div style={{ position: "absolute", left: 0, right: 0, top: edgeY - 3, height: 6, background: tokens.accent, boxShadow: "0 0 40px 8px rgba(252,82,21,0.6)" }} />
      )}
      {afterTag > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Tag text="AFTER" o={afterTag} accent />
            <div style={{ fontFamily: sans, fontSize: 34, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.8)", opacity: afterTag }}>the reel the skill made, untouched</div>
          </div>
        </AbsoluteFill>
      )}
      <Sequence from={t.endFrom} durationInFrames={t.endLen}>
        <AbsoluteFill style={{ backgroundColor: tokens.bg }}>
          <Background />
          <End />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={0} durationInFrames={t.reelFrom + 6} layout="none">
        <Audio src={staticFile("sfx/pad.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={t.paste} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/key.wav")} volume={0.5} /></Sequence>
      <Sequence from={t.enter} durationInFrames={30} layout="none"><Audio src={staticFile("sfx/click.wav")} volume={0.5} /></Sequence>
      <Sequence from={t.wipe[0] - 6} durationInFrames={40} layout="none"><Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} /></Sequence>
      <Sequence from={t.endFrom + 8} durationInFrames={100} layout="none"><Audio src={staticFile("sfx/resolve.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
