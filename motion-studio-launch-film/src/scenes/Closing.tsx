import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../components/Copy";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { track } from "../config/ease";
import { tokens } from "../config/tokens";

export const Closing: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.logoIn[0]) return null;
  const logo = track(f, ev.logoIn, 0, 1);
  const line = track(f, ev.lineIn, 0, 1);
  const url = track(f, ev.urlIn, 0, 1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
      <Img
        src={staticFile(content.logo)}
        style={{
          width: 690,
          height: 184,
          opacity: logo,
          transform: `scale(${0.9 + 0.1 * logo})`,
          marginTop: -60,
        }}
      />
      <div
        style={{
          marginTop: 34,
          fontSize: 64,
          fontWeight: 500,
          letterSpacing: "-0.03em",
          color: tokens.fg,
          opacity: line,
          transform: `translateY(${(1 - line) * 22}px)`,
        }}
      >
        {content.closingLine}
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "16px 34px",
          borderRadius: 999,
          border: `2px solid ${tokens.accent}`,
          color: tokens.accent,
          fontSize: 40,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          opacity: url,
          transform: `translateY(${(1 - url) * 18}px)`,
        }}
      >
        {content.closingUrl}
      </div>
    </AbsoluteFill>
  );
};
