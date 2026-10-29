import { interpolate } from "remotion";

// The varg how to pill: a liquid-metal chrome ring around a dark core, as on varg.ai/how-to (there a shader;
// here a frame-driven conic gradient so every render is identical). `ringOnly` draws just the ring and the glare,
// to lay over a captured pill and leave its text untouched.
export const chrome = (deg: number) =>
  `conic-gradient(from ${deg}deg, #fbfbfc, #6e6e72 11%, #ececee 21%, #86868b 33%, #ffffff 46%, #58585d 60%, #dadadc 73%, #77777b 87%, #fbfbfc)`;

export const LiquidPill: React.FC<{
  f: number; // global frame
  width: number;
  height: number;
  ring: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  glare?: number; // 0..1 position of the moving glare, <0 or >1 = off
  glow?: number; // 0..1 orange bloom
  ringOnly?: boolean;
  style?: React.CSSProperties;
}> = ({ f, width, height, ring, text, fontSize, fontFamily, glare = -1, glow = 0, ringOnly = false, style }) => {
  const angle = f * 2.2; // the metal keeps flowing
  const glareX = interpolate(glare, [0, 1], [-60, 160]);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 9999,
        boxShadow: ringOnly
          ? undefined
          : `0 0 0 1px rgba(0,0,0,0.3), 0 ${height * 0.1}px ${height * 0.18}px rgba(0,0,0,0.35), 0 0 ${height * 1.1 * glow}px ${height * 0.16 * glow}px rgba(252,82,21,${0.8 * glow})`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background: chrome(angle),
          padding: ring,
          WebkitMask: ringOnly ? "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)" : undefined,
          WebkitMaskComposite: ringOnly ? "xor" : undefined,
          maskComposite: ringOnly ? "exclude" : undefined,
        }}
      />
      {!ringOnly && (
        <div style={{ position: "absolute", inset: ring, borderRadius: 9999, background: "linear-gradient(#202020, #000)" }} />
      )}
      {text && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontSize,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#fff",
            backgroundImage: `linear-gradient(100deg, #e9e9ec 0%, #ffffff ${glareX - 8}%, #ffd2bf ${glareX}%, #ffffff ${glareX + 8}%, #d8d8dc 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            paddingBottom: fontSize ? fontSize * 0.06 : 0,
          }}
        >
          {text}
        </div>
      )}
      {glare >= 0 && glare <= 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            overflow: "hidden",
            mixBlendMode: "screen",
            background: `linear-gradient(105deg, transparent ${glareX - 22}%, rgba(255,255,255,0.55) ${glareX}%, transparent ${glareX + 22}%)`,
          }}
        />
      )}
    </div>
  );
};
