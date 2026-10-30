import { Composition } from "remotion";
import { canvas } from "./config/tokens";
import { BeforeAfter, ba, totalFrames } from "./before-after/BeforeAfter";
import { Examples } from "./examples/Examples";
import { Launch } from "./Launch";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Launch" component={Launch} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {/* "Lots of examples": the Recent feed and the Make a video page scrolling with every preview playing */}
    <Composition id="Examples" component={Examples} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {/* Before / after: the one-line prompt + the skill from varg how to -> the original reel it made (9:16) */}
    <Composition id="BeforeAfter" component={BeforeAfter} durationInFrames={totalFrames} fps={ba.fps} width={ba.width} height={ba.height} />
  </>
);
