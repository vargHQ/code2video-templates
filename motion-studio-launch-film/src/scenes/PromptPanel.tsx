import { loadFont } from "@remotion/google-fonts/GeistMono";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { fontFamily as sans } from "../components/Copy";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { track } from "../config/ease";
import { canvas, tokens } from "../config/tokens";

const { fontFamily: mono } = loadFont("normal", { weights: ["400", "500"], subsets: ["latin"] });

// What "Copy prompt" does: the copied text, pasted into Claude Code. Only the paste and the Enter key are shown;
// nothing the agent answers is invented.
export const PromptPanel: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.panelIn[0] || f >= ev.panelOut[1]) return null;
  const inn = spring({ frame: f - ev.panelIn[0], fps: canvas.fps, config: { damping: 15, stiffness: 160, mass: 0.9 } });
  const out = track(f, ev.panelOut, 0, 1);
  const lines = content.prompt.split("\n");
  const shown = Math.floor(interpolate(f, [ev.paste[0], ev.paste[1]], [0, lines.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const enter = interpolate(f, [ev.enter - 2, ev.enter, ev.enter + 16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sent = f >= ev.enter;

  return (
    <div
      style={{
        position: "absolute",
        left: 980,
        top: 250,
        width: 860,
        opacity: Math.min(1, inn * 1.4) * (1 - out),
        transform: `translateX(${(1 - inn) * 140 + out * 60}px) scale(${0.96 + 0.04 * inn})`,
        borderRadius: 20,
        background: "rgba(14,14,15,0.97)",
        boxShadow: `0 0 0 1px ${tokens.line2}, 0 40px 100px rgba(0,0,0,0.7), 0 0 ${60 * enter}px rgba(252,82,21,${0.35 * enter})`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: 52, padding: "0 20px", borderBottom: `1px solid ${tokens.line}`, gap: 10 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c, opacity: 0.9 }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", fontFamily: sans, fontSize: 20, color: tokens.fg2, marginRight: 60 }}>Claude Code</div>
      </div>
      <div style={{ padding: "26px 28px 30px" }}>
        <div
          style={{
            border: `2px solid ${sent ? tokens.accent : "rgba(255,255,255,0.22)"}`,
            borderRadius: 14,
            padding: "18px 22px",
            fontFamily: mono,
            fontSize: 21,
            lineHeight: 1.5,
            color: "#e8e8ea",
            whiteSpace: "pre-wrap",
            minHeight: 120,
          }}
        >
          <span style={{ color: tokens.accent }}>{"> "}</span>
          {lines.slice(0, shown).join("\n")}
          <span style={{ opacity: Math.floor(f / 18) % 2 ? 0 : 1, color: tokens.fg }}>{sent ? "" : "▍"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: sans, fontSize: 19, color: tokens.fg3 }}>
          <span>Pasted from varg how to · Copy prompt</span>
          <span
            style={{
              fontFamily: mono,
              color: enter > 0.05 || sent ? "#fff" : tokens.fg3,
              background: `rgba(252,82,21,${Math.max(enter, sent ? 0.9 : 0)})`,
              borderRadius: 8,
              padding: "2px 12px",
              transform: `scale(${1 + 0.15 * enter})`,
            }}
          >
            ⏎ enter
          </span>
        </div>
      </div>
    </div>
  );
};
