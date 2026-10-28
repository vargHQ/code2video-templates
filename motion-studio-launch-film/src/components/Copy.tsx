import { loadFont } from "@remotion/google-fonts/Geist";
import { tokens } from "../config/tokens";

export const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

// The single text slot above the card: headline in the opening, result labels later.
export const TopLine: React.FC<{ opacity: number; y: number; size?: number; children: React.ReactNode }> = ({
  opacity,
  y,
  size = tokens.displaySize,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 352,
      top: 74,
      width: 1216,
      fontFamily,
      fontWeight: tokens.weightDisplay,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: "-0.03em",
      color: tokens.fg,
      opacity,
      transform: `translateY(${y}px)`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
