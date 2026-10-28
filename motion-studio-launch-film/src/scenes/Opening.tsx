import { useCurrentFrame } from "remotion";
import { TopLine } from "../components/Copy";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { track } from "../config/ease";
import { tokens } from "../config/tokens";

export const Opening: React.FC = () => {
  const f = useCurrentFrame(); // global: this layer is not inside a Sequence
  if (f >= ev.headlineOut[1]) return null;
  const inn = track(f, ev.headlineIn, 0, 1);
  const out = track(f, ev.headlineOut, 0, 1);
  const o = content.opening;
  return (
    <TopLine opacity={inn * (1 - out)} y={(1 - inn) * 26 - out * 18}>
      {o.before}
      <span style={{ color: tokens.accent }}>{o.accent}</span>
      {o.after}
    </TopLine>
  );
};
