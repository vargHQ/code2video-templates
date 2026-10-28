import { AbsoluteFill } from "remotion";
import { tokens } from "../config/tokens";

export const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: tokens.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1.2px, transparent 1.3px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 45% 35% at 50% 100%, rgba(252,82,21,0.10), transparent 70%)",
      }}
    />
  </AbsoluteFill>
);
