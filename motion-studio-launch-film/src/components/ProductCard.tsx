import { AbsoluteFill, Img, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { camera } from "../config/camera";
import { cardBox, Clip, content, fitScale } from "../config/content";
import { ev } from "../config/timeline";
import { track, inOut } from "../config/ease";
import { LiquidPill } from "./LiquidPill";
import { canvas, tokens } from "../config/tokens";

// Which real captured state is on screen at a global frame.
const screenAt = (f: number): string => {
  const s = content.screens;
  if (f >= ev.scroll[1]) return s.grid;
  if (f >= ev.gridCut) {
    const i = Math.floor(((f - ev.scroll[0]) / (ev.scroll[1] - ev.scroll[0])) * s.scroll.length);
    return s.scroll[Math.min(s.scroll.length - 1, i)];
  }
  if (f >= ev.skillCut) return s.skill;
  if (f < ev.pressSearch + 4) return s.home;
  if (f < ev.typing[0]) return s.palette;
  let shot: string = s.typed[0];
  ev.typing.forEach((start, i) => {
    if (f >= start) shot = s.typed[i];
  });
  return shot;
};

const k = fitScale;
const box = (r: { x: number; y: number; w: number; h: number }) => ({
  position: "absolute" as const,
  left: r.x * k,
  top: r.y * k,
  width: r.w * k,
  height: r.h * k,
});

// A preview the page autoplays, looping from the moment its page appears.
const PlayingClip: React.FC<{ clip: Clip; screen: string }> = ({ clip, screen }) => (
  <>
    <div style={{ ...box(clip.rect), borderRadius: clip.radius * k, overflow: "hidden" }}>
      <Loop durationInFrames={Math.round(clip.seconds * canvas.fps)}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          muted
          style={{ width: "100%", height: "100%", objectFit: clip.fit }}
        />
      </Loop>
    </div>
    {/* UI the page draws over the video (badges, play button), restored from the capture */}
    {clip.keep?.map((r, i) => (
      <div key={i} style={{ ...box(r), borderRadius: r.r * k, overflow: "hidden" }}>
        <Img
          src={staticFile(screen)}
          style={{ position: "absolute", left: -r.x * k, top: -r.y * k, width: cardBox.w, height: cardBox.h, maxWidth: "none" }}
        />
      </div>
    ))}
  </>
);

export const ProductCard: React.FC = () => {
  const f = useCurrentFrame();
  const c = camera(f);

  const enter = track(f, ev.cardIn, 0, 1);
  const exit = track(f, ev.cardOut, 0, 1, inOut);
  const lift = (1 - enter) * 60;
  const scaleIn = 0.95 + 0.05 * enter;
  const scaleOut = 1 - 0.82 * exit;
  const opacity = enter * (1 - exit);
  const sheenX = interpolate(f, [0, 1199], [-40, 140]);

  return (
    <AbsoluteFill
      style={{ opacity, transformOrigin: "960px 600px", transform: `translateY(${lift}px) scale(${scaleIn * scaleOut})` }}
    >
      <AbsoluteFill
        style={{ transformOrigin: "0 0", transform: `translate(${c.tx - c.fx * c.s}px, ${c.ty - c.fy * c.s}px) scale(${c.s})` }}
      >
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
          <Img src={staticFile(screenAt(f))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          {f < ev.pressSearch + 4 && (
            // the hero "How to" pill: on the site its chrome ring is a live shader, frozen in the capture
            <div style={{ ...box(content.anchors.heroPill), display: "block" }}>
              <LiquidPill
                f={f}
                width={content.anchors.heroPill.w * k}
                height={content.anchors.heroPill.h * k}
                ring={6 * k}
                ringOnly
                glare={interpolate(f, ev.heroGlare as unknown as number[], [0, 1])}
              />
            </div>
          )}
          <Sequence from={ev.skillCut} durationInFrames={ev.gridCut - ev.skillCut} layout="none">
            {content.clips.skill.map((clip) => <PlayingClip key={clip.src} clip={clip} screen={content.screens.skill} />)}
          </Sequence>
          <Sequence from={ev.scroll[1]} layout="none">
            {content.clips.grid.map((clip) => <PlayingClip key={clip.src} clip={clip} screen={content.screens.grid} />)}
          </Sequence>
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
