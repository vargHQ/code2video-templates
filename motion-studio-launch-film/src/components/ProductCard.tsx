import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { camera } from "../config/camera";
import { cardBox, content } from "../config/content";
import { ev } from "../config/timeline";
import { track, inOut } from "../config/ease";
import { tokens } from "../config/tokens";

// Which real captured state is on screen at a global frame.
const screenAt = (f: number): string => {
  const s = content.screens;
  if (f < ev.pressSearch + 4) return s.home;
  if (f < ev.typing[0]) return s.palette;
  let shot: string = s.typed[0];
  ev.typing.forEach((start, i) => {
    if (f >= start) shot = s.typed[i];
  });
  return shot;
};

const Screen: React.FC<{ src: string }> = ({ src }) => (
  <Img
    src={staticFile(src)}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  />
);

export const ProductCard: React.FC = () => {
  const f = useCurrentFrame();
  const c = camera(f);

  // Entrance (opening) and exit (closing) are applied around the frame centre.
  const enter = track(f, ev.cardIn, 0, 1);
  const exit = track(f, ev.cardOut, 0, 1, inOut);
  const lift = (1 - enter) * 70;
  const scaleIn = 0.94 + 0.06 * enter;
  const scaleOut = 1 - 0.82 * exit;
  const opacity = enter * (1 - exit);

  // Slow sheen: one broad low-contrast reflection, clipped to the card.
  const sheenX = interpolate(f, [0, 1199], [-40, 140]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        transformOrigin: "960px 600px",
        transform: `translateY(${lift}px) scale(${scaleIn * scaleOut})`,
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${c.tx - c.fx * c.s}px, ${c.ty - c.fy * c.s}px) scale(${c.s})`,
        }}
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
          <Screen src={f >= ev.guideCut ? content.screens.guide : screenAt(f)} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent ${sheenX - 30}%, rgba(255,255,255,0.045) ${sheenX}%, transparent ${sheenX + 30}%)`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: tokens.radius,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
