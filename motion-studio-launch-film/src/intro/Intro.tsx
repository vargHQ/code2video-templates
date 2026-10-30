import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { fontFamily as sans, TopLine } from "../components/Copy";
import { Cursor as LaunchCursor } from "../components/Cursor";
import { LiquidPill } from "../components/LiquidPill";
import { ProductCard } from "../components/ProductCard";
import { cardBox } from "../config/content";
import { inOut, track } from "../config/ease";
import { canvas, tokens } from "../config/tokens";
import { Card as ExamplesCard, Cursor as ExamplesCursor, ScrollingPage } from "../examples/Examples";
import { Closing } from "../scenes/Closing";
import { PromptPanel } from "../scenes/PromptPanel";
import { tr } from "../trends/content";

// Introducing varg how to: 32 s at 60 fps, cut on the beat grid of its own track (ElevenLabs Music, 120 BPM,
// first beat 0.015 s, beat 0.501 s, break at 15 s, drop at 16 s). Reuses the Launch, Examples, Before/After and
// Showcase pieces; every cut and every click lands on a beat.
export const B = (n: number) => Math.round(0.9 + n * 30.06); // frame of beat n
export const introFrames = 1920;

// Shots [start, end) in global frames
export const s = {
  wall: [0, B(3)], // 12 finished videos, frame one is a finished picture
  type: [B(3), B(8)], // "How to make any video with AI agents." word groups on beats 3, 4, 5
  search: [B(8), 368], // Launch: click Search, type "dropshipping", click the first row on beat 12
  skill: [368, 505], // Launch: the skill page, its reel playing, push in
  copy: [505, B(20)], // Launch: Copy prompt on beat 17, paste, Enter
  ba: [B(20), B(26)], // Before/After: the wipe on beat 21, the reel it made
  showcase: [B(26), B(30)], // five ads, one photo each
  intro: [B(30), B(36)], // break: "Introducing" on beat 30, the name on the drop (beat 32), sub-line on beat 33
  trends: [B(36), B(42)], // Discover trends scrolling, every post playing
  catalog: [B(42), B(50)], // Make a video: cards clicked on beats 44 and 47
  recent: [B(50), 1720], // the Recent feed drifting: new skills every day
  closing: [1720, introFrames], // the shared liquid-metal end card
} as const;

const W = (src: string) => staticFile(`intro/wall2/${src}.mp4`);
// The opening wall: what people make with skills from varg how to. `trim` skips a slow first second (seconds).
const portrait = [
  { src: "luxury", trim: 0 }, // luxury product commercial
  { src: "stunt", trim: 0 }, // caught-on-phone stunt
  { src: "cctv", trim: 0 }, // backyard security-cam product hook (solar flood light)
  { src: "familyfilm", trim: 0 }, // 3D animated family film
  { src: "catclipper", trim: 0 }, // LED pet nail clipper hook
  { src: "exploded", trim: 0 }, // 3D product exploded-view reveal
  { src: "theproblem", trim: 0 }, // problem → Vs → solution (car seat gap filler)
  { src: "character3d", trim: 0 }, // 3D character animation built by an agent
];
const landscape = [
  { src: "duo", trim: 3 }, // iPhone Duo fold
  { src: "musicvideo", trim: 0 }, // agent-directed music video, lyrics in the world
  { src: "speccommercial", trim: 2 }, // AI spec commercial
  { src: "p5paint", trim: 1.2 }, // p5 paint animation
];

const Tile: React.FC<{ src: string; trim: number; x: number; y: number; w: number; h: number; i: number }> = ({ src, trim, x, y, w, h, i }) => {
  const f = useCurrentFrame();
  const pop = spring({ frame: f + 40 - i * 2, fps: canvas.fps, config: { damping: 16, stiffness: 140 } }); // settled at frame 0
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, overflow: "hidden", boxShadow: `0 0 0 1px ${tokens.line2}, 0 20px 50px rgba(0,0,0,0.5)`, transform: `scale(${0.9 + 0.1 * pop})` }}>
      <OffthreadVideo src={W(src)} muted trimBefore={Math.round(trim * canvas.fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const gap = 12, pw = 222, ph = 395, lw = 456, lh = 256;
  const top = (1080 - (ph + gap + lh)) / 2;
  const x0p = (1920 - (8 * pw + 7 * gap)) / 2;
  const x0l = (1920 - (4 * lw + 3 * gap)) / 2;
  const push = interpolate(f, [0, s.type[1]], [1, 1.07]);
  const dim = track(f, [s.type[0], s.type[0] + 14], 0, 1);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, filter: `blur(${dim * 7}px)` }}>
      {portrait.map((t, i) => <Tile key={t.src} {...t} i={i} x={x0p + i * (pw + gap)} y={top} w={pw} h={ph} />)}
      {landscape.map((t, i) => <Tile key={t.src} {...t} i={i + 8} x={x0l + i * (lw + gap)} y={top + ph + gap} w={lw} h={lh} />)}
      <AbsoluteFill style={{ background: `rgba(7,7,8,${0.8 * dim})` }} />
    </AbsoluteFill>
  );
};

// Masked word reveal: the group rises out of a line, lands slow.
const Words: React.FC<{ at: number; children: React.ReactNode; size: number; color?: string }> = ({ at, children, size, color = tokens.fg }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - at, fps: canvas.fps, config: { damping: 18, stiffness: 160 } });
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: size * 0.12 }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, color, opacity: f >= at ? 1 : 0 }}>{children}</span>
    </span>
  );
};

const Tagline: React.FC = () => {
  const f = useCurrentFrame();
  const o = 1 - track(f, [s.type[1] - 10, s.type[1]], 0, 1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 500, letterSpacing: "-0.04em", opacity: o, textAlign: "center", lineHeight: 1.04 }}>
      <div style={{ fontSize: 132 }}>
        <Words at={B(3)} size={132}>How to make&nbsp;</Words>
        <Words at={B(4)} size={132} color={tokens.accent}>any video</Words>
      </div>
      <div style={{ fontSize: 132 }}>
        <Words at={B(5)} size={132}>with AI agents.</Words>
      </div>
    </AbsoluteFill>
  );
};

// A segment of another film's timeline: `src` frame `from` plays at global frame `at`.
const Seg: React.FC<{ at: number; len: number; from: number; children: React.ReactNode }> = ({ at, len, from, children }) => (
  <Sequence from={at} durationInFrames={len} layout="none">
    <Sequence from={-from} layout="none">{children}</Sequence>
  </Sequence>
);

const Line: React.FC<{ span: readonly [number, number]; children: React.ReactNode }> = ({ span, children }) => {
  const f = useCurrentFrame();
  if (f < span[0] || f >= span[1]) return null;
  const a = track(f, [span[0], span[0] + 16], 0, 1) * (1 - track(f, [span[1] - 10, span[1]], 0, 1));
  return <TopLine opacity={a} y={(1 - a) * 18} size={tokens.labelSize + 6}>{children}</TopLine>;
};

const Chip: React.FC<{ span: readonly [number, number]; children: React.ReactNode }> = ({ span, children }) => {
  const f = useCurrentFrame();
  if (f < span[0] || f >= span[1]) return null;
  const a = spring({ frame: f - span[0], fps: canvas.fps, config: { damping: 14, stiffness: 170 } }) * (1 - track(f, [span[1] - 8, span[1]], 0, 1));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: Math.min(1, a) }}>
      <div style={{ fontFamily: sans, fontSize: 34, fontWeight: 600, color: "#fff", padding: "12px 30px", borderRadius: 999, background: tokens.accent, boxShadow: "0 12px 40px rgba(252,82,21,0.4)", transform: `translateY(${(1 - Math.min(1, a)) * 20}px)` }}>
        {children}
      </div>
    </div>
  );
};

// Before/After: the 9:16 film in a phone frame, the line on the right.
const BeforeAfterShot: React.FC = () => {
  const f = useCurrentFrame(); // local
  const a = spring({ frame: f, fps: canvas.fps, config: { damping: 16, stiffness: 150 } });
  const H = 940, Wd = Math.round((H * 9) / 16);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 300, top: 70, width: Wd, height: H, borderRadius: 44, overflow: "hidden", boxShadow: `0 0 0 3px ${tokens.accent}, 0 40px 100px rgba(0,0,0,0.65)`, transform: `translateY(${(1 - a) * 50}px)` }}>
        {/* the film's wipe (30 fps frame 96) lands on beat 21 */}
        <OffthreadVideo src={staticFile("intro/before-after.mp4")} muted trimBefore={Math.round(2.7 * 60)} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 300 + Wd + 120, top: 380, width: 820, fontFamily: sans, opacity: a }}>
        <div style={{ fontSize: 34, color: tokens.fg2, marginBottom: 18 }}>For example</div>
        <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.05 }}>
          One product photo → <span style={{ color: tokens.accent }}>a video ad.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Showcase: the five-up grid, its own headline cropped away.
const ShowcaseShot: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 190, width: 1920, height: 860, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile("intro/showcase.mp4")} muted trimBefore={Math.round(1.8 * 60)} /* all five tiles are in by 1.8 s */ style={{ position: "absolute", left: 0, top: -230, width: 1920, height: 1080 }} />
      </div>
    </AbsoluteFill>
  );
};

const IntroTitle: React.FC = () => {
  const f = useCurrentFrame();
  const pill = spring({ frame: f - B(32), fps: canvas.fps, config: { damping: 9, stiffness: 150, mass: 0.8 } });
  const mark = spring({ frame: f - B(32) + 6, fps: canvas.fps, config: { damping: 14, stiffness: 150 } });
  const glow = interpolate(f, [B(32), B(32) + 10, B(32) + 60], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = track(f, [s.intro[1] - 10, s.intro[1]], 0, 1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: sans, opacity: 1 - out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 32% at 50% 50%, rgba(252,82,21,${0.28 * glow}), transparent 70%)` }} />
      <div style={{ fontSize: 46, color: tokens.fg2, marginBottom: 34 }}>
        <Words at={B(30)} size={46} color={tokens.fg2}>Introducing</Words>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 34, height: 200 }}>
        <svg width={190} height={134} viewBox="0 0 58 41" style={{ opacity: Math.min(1, mark * 1.4), transform: `scale(${0.6 + 0.4 * mark})` }}>
          <path d="M.115 38.92 16.505.018h5.986v.985L6.101 39.905H.116v-.985ZM55.893 18.7c-6.882-1.208-12.316-6.642-13.523-13.524l-.371-2.106h-2.58l-.372 2.106c-1.207 6.882-6.641 12.316-13.523 13.523l-2.106.371v2.58l2.106.372c6.882 1.207 12.316 6.641 13.523 13.523l.371 2.106h2.58l.372-2.106c1.207-6.882 6.641-12.316 13.523-13.524l2.106-.37V19.07l-2.106-.37Z" fill="#fff" />
        </svg>
        <div style={{ fontSize: 168, fontWeight: 500, letterSpacing: "-0.04em", color: "#fff", marginTop: -20, opacity: Math.min(1, mark * 1.4) }}>varg</div>
        <div style={{ width: 440 * Math.min(1, pill) }}>
          <LiquidPill f={f} width={440} height={150} ring={8} text="how to" fontSize={96} fontFamily={sans}
            glare={interpolate(f, [B(33), B(36)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} glow={glow}
            style={{ opacity: Math.min(1, pill * 2), transformOrigin: "0% 50%", transform: `perspective(900px) rotateY(${(1 - pill) * -55}deg) scale(${0.5 + 0.5 * pill})` }} />
        </div>
      </div>
      <div style={{ marginTop: 40, fontSize: 52, fontWeight: 500, letterSpacing: "-0.03em" }}>
        <Words at={B(33)} size={52}>AI video skills for Claude Code, Codex and Grok.</Words>
      </div>
    </AbsoluteFill>
  );
};

// Discover trends: the whole captured page drifting under the sidebar, every post playing.
const TrendsShot: React.FC = () => {
  const f = useCurrentFrame(); // local
  const len = s.trends[1] - s.trends[0];
  const sc = interpolate(f, [0, len], [1.04, 1.12]);
  return (
    <AbsoluteFill style={{ transformOrigin: "960px 600px", transform: `scale(${sc})` }}>
      <div style={{ position: "absolute", left: cardBox.x, top: cardBox.y, width: cardBox.w, height: cardBox.h, borderRadius: tokens.radius, overflow: "hidden", backgroundColor: tokens.bg, boxShadow: `0 0 0 1px ${tokens.line2}, 0 40px 90px rgba(0,0,0,0.65)` }}>
        <ScrollingPage page={tr.screens.page} top={tr.screens.top} pageH={tr.pageH} clips={tr.clips as never} scrollPx={track(f, [0, len], 250, 2600, inOut)} />
      </div>
    </AbsoluteFill>
  );
};

const cue = (at: number, file: string, gain: number, len = 60) => (
  <Sequence key={file + at} from={at} durationInFrames={len} layout="none"><Audio src={staticFile(file)} volume={gain} /></Sequence>
);

export const Intro: React.FC = () => {
  const L = (span: readonly [number, number]) => span[1] - span[0];
  return (
    <AbsoluteFill style={{ backgroundColor: tokens.bg }}>
      <Background />
      <Sequence from={s.wall[0]} durationInFrames={s.type[1]} layout="none"><Wall /></Sequence>
      <Tagline />
      {/* Launch film pieces, re-timed onto the beat grid (src frame -> global frame) */}
      <Seg at={s.search[0]} len={L(s.search)} from={s.search[0] - 175}><ProductCard /><LaunchCursor /></Seg>
      <Seg at={s.skill[0]} len={L(s.skill)} from={194}><ProductCard /><LaunchCursor /></Seg>
      <Seg at={s.copy[0]} len={L(s.copy)} from={380}><ProductCard /><PromptPanel /><LaunchCursor /></Seg>
      <Sequence from={s.ba[0]} durationInFrames={L(s.ba)} layout="none"><BeforeAfterShot /></Sequence>
      <Sequence from={s.showcase[0]} durationInFrames={L(s.showcase)} layout="none"><ShowcaseShot /></Sequence>
      <Sequence from={s.intro[0]} durationInFrames={L(s.intro)} layout="none"><Sequence from={-s.intro[0]} layout="none"><IntroTitle /></Sequence></Sequence>
      <Sequence from={s.trends[0]} durationInFrames={L(s.trends)} layout="none"><TrendsShot /></Sequence>
      {/* Examples: card presses at its frames 648 and 738 land on beats 44 and 47 */}
      <Seg at={s.catalog[0]} len={L(s.catalog)} from={s.catalog[0] - (B(44) - 648)}><ExamplesCard /><ExamplesCursor /></Seg>
      <Seg at={s.recent[0]} len={L(s.recent)} from={180}><ExamplesCard /></Seg>
      <Sequence from={s.closing[0] - 910} layout="none"><Closing /></Sequence>

      <Line span={[s.search[0] + 4, s.search[1]]}>Type what you want to make.</Line>
      <Line span={s.skill}>See the real result first.</Line>
      <Line span={s.copy}>Copy the prompt. Your agent makes it.</Line>
      <Chip span={[B(19), s.copy[1]]}>You approve the price first.</Chip>
      <Line span={s.showcase}>Every product gets its own video ad.</Line>
      <Line span={s.trends}>Remake what's trending.</Line>
      <Line span={s.catalog}>2,000+ AI video skills, updated daily.</Line>
      <Line span={s.recent}>Every skill shows a real example.</Line>

      {/* the track: 32 s, a short fade on the last beat */}
      <Audio src={staticFile("intro/music.mp3")} volume={(fr) => interpolate(fr, [0, introFrames - 40, introFrames], [0.9, 0.9, 0], { extrapolateRight: "clamp" })} />
      {cue(B(8) + 6, "sfx/click.wav", 0.35)}
      {cue(361, "sfx/click.wav", 0.35)}
      {cue(511, "sfx/click.wav", 0.35)}
      {cue(587, "sfx/click.wav", 0.3)}
      {cue(B(44), "sfx/click.wav", 0.3)}
      {cue(B(47), "sfx/click.wav", 0.3)}
      {[s.search[0], s.ba[0], s.intro[0], s.trends[0], s.closing[0]].map((at) => cue(at - 12, "sfx/whoosh.wav", 0.1, 50))}
    </AbsoluteFill>
  );
};
