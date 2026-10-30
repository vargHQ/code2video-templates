import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { TopLine } from "../components/Copy";
import { LiquidPill } from "../components/LiquidPill";
import { cardBox, Clip, fitScale as k } from "../config/content";
import { inOut, track } from "../config/ease";
import { ev } from "../config/timeline";
import { canvas, tokens } from "../config/tokens";
import { Closing } from "../scenes/Closing";
import { ex } from "./content";
import { scroll, xt } from "./timeline";

type P = { x: number; y: number };
type R = { x: number; y: number; w: number; h: number };
const box = (r: R) => ({ position: "absolute" as const, left: r.x * k, top: r.y * k, width: r.w * k, height: r.h * k });

// Camera: a gentle push about the card centre while the feeds scroll (keeps the card under the text slot).
const camScale = (f: number) =>
  1 + 0.12 * track(f, xt.zoomIn, 0, 1, inOut) * (1 - track(f, xt.zoomOut, 0, 1, inOut)) + 0.12 * track(f, xt.zoomIn2, 0, 1, inOut);
const CX = cardBox.x + cardBox.w / 2;
const CY = cardBox.y + cardBox.h / 2;
const toComp = (p: P, s: number) => ({ x: CX + (cardBox.x + p.x * k - CX) * s, y: CY + (cardBox.y + p.y * k - CY) * s });

// A whole captured page scrolling under the fixed sidebar, with its previews playing in place.
export const ScrollingPage: React.FC<{ page: string; top: string; pageH: number; clips: Clip[]; scrollPx: number }> = ({ page, top, pageH, clips, scrollPx }) => {
  const sy = scrollPx * 2; // source px
  const view = { top: sy - 400, bottom: sy + 1800 + 400 };
  return (
    <>
      <div style={{ position: "absolute", left: ex.sidebarW * k, top: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -ex.sidebarW * k, top: -sy * k, width: cardBox.w, height: pageH * k }}>
          <Img src={staticFile(page)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          {clips.map((c) => {
            if (c.rect.y + c.rect.h < view.top || c.rect.y > view.bottom) return null; // only what is on screen
            return (
              <div key={c.src + c.rect.y}>
                <div style={{ ...box(c.rect), borderRadius: c.radius * k, overflow: "hidden" }}>
                  <Loop durationInFrames={Math.max(24, Math.round(c.seconds * canvas.fps))}>
                    <OffthreadVideo src={staticFile(c.src)} muted style={{ width: "100%", height: "100%", objectFit: c.fit }} />
                  </Loop>
                </div>
                {c.keep?.map((r, i) => (
                  <div key={i} style={{ ...box(r), borderRadius: r.r * k, overflow: "hidden" }}>
                    <Img src={staticFile(page)} style={{ position: "absolute", left: -r.x * k, top: -r.y * k, width: cardBox.w, height: pageH * k, maxWidth: "none" }} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {/* the fixed sidebar, from the viewport capture */}
      <div style={{ position: "absolute", left: 0, top: 0, width: ex.sidebarW * k, bottom: 0, overflow: "hidden" }}>
        <Img src={staticFile(top)} style={{ position: "absolute", left: 0, top: 0, width: cardBox.w, height: cardBox.h, maxWidth: "none" }} />
      </div>
    </>
  );
};

// Which skill page of the click-through is open at frame f (-1 = the grid).
const skillAt = (f: number) => {
  const i = Math.floor((f - xt.clickStart) / xt.clickStep);
  if (i < 0) return -1;
  const last = ex.skills.length - 1;
  const idx = Math.min(i, last);
  const opened = xt.clickStart + idx * xt.clickStep + xt.clickCut;
  return f >= opened ? idx : -1;
};

const SkillPage: React.FC<{ i: number }> = ({ i }) => {
  const s = ex.skills[i];
  const c = s.clip;
  return (
    <>
      <Img src={staticFile(s.screen)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ ...box(c.rect), borderRadius: c.radius * k, overflow: "hidden" }}>
        <Loop durationInFrames={Math.max(24, Math.round(c.seconds * canvas.fps))}>
          <OffthreadVideo src={staticFile(c.src)} muted style={{ width: "100%", height: "100%", objectFit: c.fit }} />
        </Loop>
      </div>
      {c.keep?.map((r, j) => (
        <div key={j} style={{ ...box(r), borderRadius: r.r * k, overflow: "hidden" }}>
          <Img src={staticFile(s.screen)} style={{ position: "absolute", left: -r.x * k, top: -r.y * k, width: cardBox.w, height: cardBox.h, maxWidth: "none" }} />
        </div>
      ))}
    </>
  );
};

export const Card: React.FC = () => {
  const f = useCurrentFrame();
  const s = camScale(f);
  const enter = track(f, xt.cardIn, 0, 1);
  const exit = track(f, ev.cardOut, 0, 1, inOut);
  const sheenX = interpolate(f, [0, 1199], [-40, 140]);
  const recentScroll = track(f, xt.scrollRecent, 0, scroll.recent, inOut);
  const makeScroll = track(f, xt.scrollMake, 0, scroll.make, inOut);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transformOrigin: "960px 600px",
        transform: `translateY(${(1 - enter) * 60}px) scale(${(0.95 + 0.05 * enter) * (1 - 0.82 * exit)})`,
      }}
    >
      <AbsoluteFill style={{ transformOrigin: `${CX}px ${CY}px`, transform: `scale(${s})` }}>
        <div
          style={{
            position: "absolute",
            left: cardBox.x,
            top: cardBox.y,
            width: cardBox.w,
            height: cardBox.h,
            borderRadius: tokens.radius,
            overflow: "hidden",
            backgroundColor: tokens.bg,
            boxShadow: `0 0 0 1px ${tokens.line2}, 0 40px 90px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.5)`,
          }}
        >
          {f < xt.recentCut && (
            <>
              <Img src={staticFile(ex.screens.home)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              <div style={box(ex.anchors.heroPill)}>
                <LiquidPill
                  f={f}
                  width={ex.anchors.heroPill.w * k}
                  height={ex.anchors.heroPill.h * k}
                  ring={6 * k}
                  ringOnly
                  glare={interpolate(f, xt.heroGlare as unknown as number[], [0, 1])}
                />
              </div>
            </>
          )}
          <Sequence from={xt.recentCut} durationInFrames={xt.makeCut - xt.recentCut} layout="none">
            <ScrollingPage page={ex.screens.recentPage} top={ex.screens.recentTop} pageH={ex.pageH.recent} clips={ex.clips.recent} scrollPx={recentScroll} />
          </Sequence>
          <Sequence from={xt.makeCut} layout="none">
            {skillAt(f) < 0 && (
              <ScrollingPage page={ex.screens.makePage} top={ex.screens.makeTop} pageH={ex.pageH.make} clips={ex.clips.make} scrollPx={makeScroll} />
            )}
          </Sequence>
          {ex.skills.map((_, i) => {
            const from = xt.clickStart + i * xt.clickStep + xt.clickCut;
            const to = i === ex.skills.length - 1 ? 1200 : xt.clickStart + (i + 1) * xt.clickStep;
            return (
              <Sequence key={i} from={from} durationInFrames={to - from} layout="none">
                <SkillPage i={i} />
              </Sequence>
            );
          })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent ${sheenX - 30}%, rgba(255,255,255,0.04) ${sheenX}%, transparent ${sheenX + 30}%)`,
            }}
          />
          <div style={{ position: "absolute", inset: 0, borderRadius: tokens.radius, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MAKE_SCROLL_SRC = scroll.make * 2;
const cardInView = (r: R): R => ({ x: r.x, y: r.y - MAKE_SCROLL_SRC, w: r.w, h: r.h });
const center = (r: R): P => ({ x: r.x + r.w / 2, y: r.y + r.h * 0.45 });
const cardPasses = ex.skills.map((s, i) => {
  const base = xt.clickStart + i * xt.clickStep;
  const ring = cardInView(s.card);
  const from = i === 0 ? { x: 1700, y: 1500 } : center(cardInView(ex.skills[i - 1].card));
  return { show: [base, base + xt.clickCut] as [number, number], from, to: center(ring), move: [base, base + xt.clickMove] as const, press: base + xt.clickPress, ring, ringRadius: 14, end: base + xt.clickCut };
});

const passes: { show: [number, number]; from: P; to: P; move: readonly [number, number]; press: number; ring: R; ringRadius?: number; end: number }[] = [
  { show: [xt.cursorIn, xt.recentCut], from: { x: 1500, y: 1200 }, to: ex.anchors.recentLink, move: xt.cursorToRecent, press: xt.pressRecent, ring: ex.anchors.recentLinkRect, end: xt.recentCut },
  { show: [xt.cursorToMake[0] - 6, xt.makeCut], from: { x: 1500, y: 1100 }, to: ex.anchors.makeLink, move: xt.cursorToMake, press: xt.pressMake, ring: ex.anchors.makeLinkRect, end: xt.makeCut },
  ...cardPasses,
];

export const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  const pass = passes.find((p) => f >= p.show[0] && f < p.show[1]);
  if (!pass) return null;
  const s = camScale(f);
  const tx = track(f, pass.move, 0, 1, inOut);
  const ty = track(f, [pass.move[0] + 3, pass.move[1]], 0, 1, inOut);
  const p = toComp({ x: pass.from.x + (pass.to.x - pass.from.x) * tx, y: pass.from.y + (pass.to.y - pass.from.y) * ty }, s);
  const o = track(f, [pass.show[0], pass.show[0] + 8], 0, 1) * (1 - track(f, [pass.press + 2, pass.end], 0, 1));
  const ringO = track(f, [pass.press - 12, pass.press], 0, 1) * (1 - track(f, [pass.press + 2, pass.end], 0, 1));
  const tl = toComp(pass.ring, s);
  const dip = 1 - 0.14 * interpolate(f, [pass.press - 4, pass.press, pass.press + 8], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {ringO > 0 && (
        <div
          style={{
            position: "absolute",
            left: tl.x,
            top: tl.y,
            width: pass.ring.w * k * s,
            height: pass.ring.h * k * s,
            borderRadius: pass.ringRadius ?? 10,
            boxShadow: `0 0 0 3px ${tokens.accent}, 0 0 40px rgba(252,82,21,0.35)`,
            opacity: ringO,
          }}
        />
      )}
      <svg
        width={34}
        height={46}
        viewBox="0 0 17 23"
        style={{ position: "absolute", left: p.x - 2, top: p.y - 2, opacity: o, transformOrigin: "2px 2px", transform: `scale(${dip})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))" }}
      >
        <path d="M1 1 L1 18.5 L5.6 14.2 L8.6 21 L11.6 19.7 L8.7 13 L15 13 Z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const Copy: React.FC = () => {
  const f = useCurrentFrame();
  const h = track(f, xt.headlineIn, 0, 1) * (1 - track(f, xt.headlineOut, 0, 1));
  const a = track(f, xt.label1In, 0, 1) * (1 - track(f, xt.label1Out, 0, 1));
  const b = track(f, xt.label2In, 0, 1) * (1 - track(f, xt.label2Out, 0, 1));
  const c3 = track(f, xt.label3In, 0, 1) * (1 - track(f, xt.label3Out, 0, 1));
  const o = ex.opening;
  return (
    <>
      {f < xt.headlineOut[1] && (
        <TopLine opacity={h} y={(1 - h) * 26}>
          {o.before}
          <span style={{ color: tokens.accent }}>{o.accent}</span>
          {o.after}
        </TopLine>
      )}
      {f >= xt.label1In[0] && f < xt.label1Out[1] && (
        <TopLine opacity={a} y={(1 - a) * 22} size={tokens.labelSize + 6}>
          {ex.labels[0]}
        </TopLine>
      )}
      {f >= xt.label2In[0] && f < xt.label2Out[1] && (
        <TopLine opacity={b} y={(1 - b) * 22} size={tokens.labelSize + 6}>
          {ex.labels[1]}
        </TopLine>
      )}
      {f >= xt.label3In[0] && f < xt.label3Out[1] && (
        <TopLine opacity={c3} y={(1 - c3) * 22} size={tokens.labelSize + 6}>
          {ex.labels[2]}
        </TopLine>
      )}
    </>
  );
};

const cues: { id: string; file: string; at: number; gain: number }[] = [
  { id: "whoosh-in", file: "sfx/whoosh.wav", at: 10, gain: 0.18 },
  { id: "click-recent", file: "sfx/click.wav", at: xt.pressRecent, gain: 0.55 },
  { id: "reveal-recent", file: "sfx/reveal.wav", at: xt.recentCut, gain: 0.3 },
  { id: "scroll-1", file: "sfx/whoosh.wav", at: xt.scrollRecent[0] - 10, gain: 0.14 },
  { id: "click-make", file: "sfx/click.wav", at: xt.pressMake, gain: 0.55 },
  { id: "reveal-make", file: "sfx/reveal.wav", at: xt.makeCut, gain: 0.3 },
  { id: "scroll-2", file: "sfx/whoosh.wav", at: xt.scrollMake[0] - 10, gain: 0.12 },
  ...ex.skills.flatMap((_, i) => {
    const base = xt.clickStart + i * xt.clickStep;
    return [
      { id: `click-card-${i}`, file: "sfx/click.wav", at: base + xt.clickPress, gain: 0.5 },
      { id: `reveal-card-${i}`, file: "sfx/reveal.wav", at: base + xt.clickCut, gain: 0.18 },
    ];
  }),
  { id: "whoosh-out", file: "sfx/whoosh.wav", at: ev.cardOut[0] + 5, gain: 0.25 },
  { id: "resolve", file: "sfx/resolve.wav", at: ev.pillIn[0] + 2, gain: 0.42 },
  { id: "shine", file: "sfx/reveal.wav", at: ev.pillGlare[0] + 4, gain: 0.16 },
];

export const Examples: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Card />
    <Cursor />
    <Copy />
    <Closing />
    <Audio src={staticFile("sfx/pad.wav")} volume={0.32} />
    {cues.map((c) => (
      <Sequence key={c.id} from={c.at} durationInFrames={210} layout="none">
        <Audio src={staticFile(c.file)} volume={c.gain} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
