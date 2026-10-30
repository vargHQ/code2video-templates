import { Composition } from "remotion";
import { canvas } from "./config/tokens";
import { BeforeAfter, ba, totalFrames } from "./before-after/BeforeAfter";
import { Examples } from "./examples/Examples";
import { sc, Showcase } from "./showcase/Showcase";
import { Intro, introFrames } from "./intro/Intro";
import { Launch } from "./Launch";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Launch" component={Launch} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {/* "Lots of examples": the Recent feed and the Make a video page scrolling with every preview playing */}
    <Composition id="Examples" component={Examples} durationInFrames={canvas.frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {/* Before / after: the one-line prompt + the skill from varg how to -> the original reel it made (9:16) */}
    <Composition id="BeforeAfter" component={BeforeAfter} durationInFrames={totalFrames} fps={ba.fps} width={ba.width} height={ba.height} />
    {/* Showcase: five AI ads made with varg-dropship-reel, side by side, "With varg how to you can scale ads." */}
    <Composition id="Showcase" component={Showcase} durationInFrames={sc.frames} fps={sc.fps} width={sc.width} height={sc.height} />
    {/* Introducing varg how to: 32 s cut on the beat grid of its own 120 BPM track */}
    <Composition id="Intro" component={Intro} durationInFrames={introFrames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);
