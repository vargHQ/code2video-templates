import { Composition } from "remotion";
import { canvas } from "./config/tokens";
import { Examples } from "./examples/Examples";
import { Launch } from "./Launch";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Launch" component={Launch} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {/* "Lots of examples": the Recent feed and the Make a video page scrolling with every preview playing */}
    <Composition id="Examples" component={Examples} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);
