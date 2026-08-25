/** @jsxImportSource vargai */
import { Render, Clip, Video, Captions } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const vid = Video({
  src: "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_773865368849.mp4",
  duration: 8,
});

export default (
  <Render width={1080} height={1920}>
    <Clip duration={8}>
      {vid}
      <Captions
        src={vid.audio}
        style="tiktok"
        position="bottom"
        prompt="person named Flo, period tracking app"
      />
    </Clip>
  </Render>
);
