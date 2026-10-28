import { Composition } from "remotion";
import { canvas } from "./config/tokens";
import { Launch } from "./Launch";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Launch"
    component={Launch}
    durationInFrames={canvas.frames}
    fps={canvas.fps}
    width={canvas.width}
    height={canvas.height}
  />
);
