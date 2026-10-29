import { useCurrentFrame } from "remotion";
import { TopLine } from "../components/Copy";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { track } from "../config/ease";
import { tokens } from "../config/tokens";

export const Result: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.label1In[0] || f >= ev.label2Out[1]) return null;
  const a = track(f, ev.label1In, 0, 1) * (1 - track(f, ev.label1Out, 0, 1));
  const m = track(f, ev.label1bIn, 0, 1) * (1 - track(f, ev.label1bOut, 0, 1));
  const bIn = track(f, ev.label2In, 0, 1);
  const bOut = track(f, ev.label2Out, 0, 1);
  return (
    <>
      {f < ev.label1Out[1] && (
        <TopLine opacity={a} y={(1 - a) * 22} size={tokens.labelSize + 6}>
          {content.results[0]}
        </TopLine>
      )}
      {f >= ev.label1bIn[0] && f < ev.label1bOut[1] && (
        <TopLine opacity={m} y={(1 - m) * 22} size={tokens.labelSize + 6}>
          {content.results[1]}
        </TopLine>
      )}
      {f >= ev.label2In[0] && (
        <TopLine opacity={bIn * (1 - bOut)} y={(1 - bIn) * 22} size={tokens.labelSize + 6}>
          {content.results[2]}
        </TopLine>
      )}
    </>
  );
};
