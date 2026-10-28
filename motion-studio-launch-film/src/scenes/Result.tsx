import { useCurrentFrame } from "remotion";
import { TopLine } from "../components/Copy";
import { content } from "../config/content";
import { ev } from "../config/timeline";
import { track } from "../config/ease";
import { tokens } from "../config/tokens";

export const Result: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ev.result1In[0] || f >= ev.cardOut[0] + 18) return null;
  const a = track(f, ev.result1In, 0, 1) * (1 - track(f, ev.result1Out, 0, 1));
  const bIn = track(f, ev.result2In, 0, 1);
  const bOut = track(f, [ev.closingStart, ev.closingStart + 18], 0, 1);
  return (
    <>
      {f < ev.result1Out[1] && (
        <TopLine opacity={a} y={(1 - a) * 22} size={tokens.labelSize + 6}>
          {content.results[0]}
        </TopLine>
      )}
      {f >= ev.result2In[0] && (
        <TopLine opacity={bIn * (1 - bOut)} y={(1 - bIn) * 22} size={tokens.labelSize + 6}>
          {content.results[1]}
        </TopLine>
      )}
    </>
  );
};
