/** @jsxImportSource vargai */
// Data-Driven Slideshow
//
// Demonstrates array-based scene generation: define items in a list,
// generate images for each, animate them, and stitch into a video with music.
//
// Usage: bun run render templates/slideshow.tsx

import { elevenlabs, fal } from "vargai/ai";
import { Clip, Image, Music, Render, Video } from "vargai/react";

const STYLE = "round plush body, fuzzy felt texture, small black dot eyes, tiny curved smile, Pixar style cuteness";

const FRUITS = [
  { name: "orange", prompt: `Kawaii orange character, ${STYLE}, green leaf on top` },
  { name: "strawberry", prompt: `Kawaii strawberry character, ${STYLE}, tiny green leaves` },
  { name: "lemon", prompt: `Kawaii lemon character, ${STYLE}, small green leaf` },
  { name: "blueberry", prompt: `Kawaii blueberry character, ${STYLE}, tiny crown` },
];

const images = FRUITS.map((f) => Image({ prompt: f.prompt, model: fal.imageModel("nano-banana-pro"), aspectRatio: "9:16" }));

const groupImage = Image({
  prompt: { text: `Four kawaii fruits together: orange, strawberry, lemon, blueberry. ${STYLE}`, images },
  model: fal.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

export default (
  <Render width={1080} height={1920}>
    <Music prompt="cute baby song, playful xylophone, kawaii vibes" model={elevenlabs.musicModel()} volume={0.7} />
    {FRUITS.map((f, i) => (
      <Clip key={f.name} duration={2.5}>
        <Video prompt={{ text: "character waves hello, bounces, eyes squint with joy", images: [images[i]] }} model={fal.videoModel("kling-v2.5")} duration={5} />
      </Clip>
    ))}
    <Clip duration={4}>
      <Video prompt={{ text: "all four fruits wave together, bouncing happily", images: [groupImage] }} model={fal.videoModel("kling-v2.5")} duration={5} />
    </Clip>
  </Render>
);
