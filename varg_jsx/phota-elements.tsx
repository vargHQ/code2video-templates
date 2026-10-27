/** @jsxImportSource vargai */
// Phota Elements — Before / After Showcase
//
// Demonstrates Phota's text-to-image + edit capabilities:
// 1. Generate a base scene with phota (text-to-image)
// 2. Use phota/edit to transform into 2 elemental variants
// 3. Animate each with grok-imagine video
// 4. Compose as fast-cut montage
//
// Cost estimate: 3 phota images (27 credits) + 3 grok videos (300 credits) = ~$3.27
//
// Usage:
//   bun run render templates/phota-elements.tsx

import { Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Step 1: Generate base image with Phota text-to-image ─────────────────
const baseImage = Image({
  prompt:
    "A woman in her late 20s stands at the edge of a cliff overlooking a vast landscape at golden hour. She wears a flowing white dress, dark hair blowing in the wind. Cinematic, photorealistic, 8K, dramatic lighting. Shot on 35mm anamorphic lens.",
  model: varg.imageModel("phota"),
  aspectRatio: "9:16",
  providerOptions: {
    varg: {
      resolution: "1K",
      output_format: "jpeg",
    },
  },
});

// ── Step 2: Use Phota/edit to create elemental variants ──────────────────
// The prompt: { text, images } pattern sends images as reference to the edit endpoint

// WATER: Transform the landscape into crashing ocean waves
const waterImage = Image({
  prompt: {
    text: "Transform the landscape below into a vast raging ocean with massive turquoise waves crashing against the cliff. Dramatic sea spray misting up. Keep the woman exactly the same — same pose, same white dress, same identity. The cliff is now wet black volcanic rock. Stormy dramatic sky with breaks of golden light. Cinematic, photorealistic.",
    images: [baseImage],
  },
  model: varg.imageModel("phota/edit"),
  aspectRatio: "9:16",
  providerOptions: {
    varg: {
      resolution: "1K",
      output_format: "jpeg",
    },
  },
});

// LAVA: Transform the landscape into volcanic hellscape
const lavaImage = Image({
  prompt: {
    text: "Transform the landscape into an active volcanic scene with rivers of glowing orange lava flowing below the cliff. Red and orange glow illuminates her from below. Keep the woman exactly the same — same pose, same white dress, same identity. Embers and ash float through the air. Dark smoky sky with fiery orange horizon. Cinematic, dramatic, photorealistic.",
    images: [baseImage],
  },
  model: varg.imageModel("phota/edit"),
  aspectRatio: "9:16",
  providerOptions: {
    varg: {
      resolution: "1K",
      output_format: "jpeg",
    },
  },
});

// ── Step 3: Animate each scene with Grok Imagine ─────────────────────────
const baseVideo = Video({
  prompt: {
    text: "Slow cinematic push-in toward the woman. Her white dress and hair flutter gently in the wind. Golden hour light shifts across her face. Subtle camera movement.",
    images: [baseImage],
  },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

const waterVideo = Video({
  prompt: {
    text: "Massive ocean waves crash and explode against the cliff below. Sea spray mists upward. Her dress billows dramatically in the storm wind. Camera slowly pushes in. Water surges and recedes.",
    images: [waterImage],
  },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

const lavaVideo = Video({
  prompt: {
    text: "Rivers of lava flow and pulse below the cliff, casting flickering orange light on everything. Embers float upward around her. Her dress catches the warm glow. Camera slowly orbits. Heat haze distortion.",
    images: [lavaImage],
  },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

// ── Step 4: Compose as fast-cut montage ──────────────────────────────────
export default (
  <Render width={1080} height={1920}>
    <Music
      prompt="epic cinematic orchestral, building intensity, dramatic brass and strings, powerful crescendo, elemental force"
      model={varg.musicModel("music_v1")}
      volume={0.5}
      duration={15}
    />

    {/* Base scene — establishing shot */}
    <Clip cutFrom={0.3} cutTo={3.3} transition={{ name: "fade", duration: 0.4 }}>
      {baseVideo}
    </Clip>

    {/* Water transformation — dramatic reveal */}
    <Clip cutFrom={0.3} cutTo={3.3} transition={{ name: "fade", duration: 0.3 }}>
      {waterVideo}
    </Clip>

    {/* Lava transformation — fiery climax */}
    <Clip cutFrom={0.3} cutTo={3.3} transition={{ name: "fade", duration: 0.3 }}>
      {lavaVideo}
    </Clip>

    {/* Hold on lava hero shot */}
    <Clip cutFrom={3.3} cutTo={5.5} duration={3}>
      {lavaVideo}
    </Clip>
  </Render>
);
