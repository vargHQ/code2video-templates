/** @jsxImportSource vargai */
// Layout Examples: Split, Grid, Slider, Packshot
//
// Demonstrates four layout components in one template.
// Each section is a separate clip showing a different layout pattern.
//
// Usage: bun run render templates/layouts.tsx

import { Clip, Grid, Image, Music, Packshot, Render, Slider, Split, Title, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Shared style ────────────────────────────────────────────────────────
const CHARACTER = "woman in her 30s, brown hair, green eyes";

// ════════════════════════════════════════════════════════════════════════
// SECTION 1: Split Screen (Before / After)
// ════════════════════════════════════════════════════════════════════════

const beforeImage = Image({
  prompt: `${CHARACTER}, tired expression, messy hair, oversized grey sweatshirt, dim bedroom, morning light, photorealistic`,
  model: varg.imageModel("soul"),
  aspectRatio: "9:16",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

const afterImage = Image({
  prompt: { text: `${CHARACTER}, confident smile, styled hair, fitted black blazer, bright modern office, photorealistic`, images: [beforeImage] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const beforeVideo = Video({ prompt: { text: "woman sighs, rubs eyes, looks tired", images: [beforeImage] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const afterVideo = Video({ prompt: { text: "woman smiles confidently, adjusts blazer collar, proud posture", images: [afterImage] }, model: varg.videoModel("kling-v2.5"), duration: 5 });

// ════════════════════════════════════════════════════════════════════════
// SECTION 2: Video Grid (2x2 Four Elements)
// ════════════════════════════════════════════════════════════════════════

const elements = [
  { name: "water", prompt: "Crystal clear ocean wave crashing in slow motion, turquoise water, white foam, cinematic" },
  { name: "fire", prompt: "Campfire flames dancing in the dark, warm orange glow, sparks floating upward, close-up" },
  { name: "earth", prompt: "Aerial view of rolling green hills with morning mist, golden sunrise light, cinematic" },
  { name: "air", prompt: "Wispy clouds drifting across bright blue sky, time-lapse speed, rays of sunlight breaking through" },
];

const elementVideos = elements.map((e) =>
  Video({ prompt: e.prompt, model: varg.videoModel("kling-v2.5"), duration: 5 })
);

// ════════════════════════════════════════════════════════════════════════
// SECTION 3: Slider (Day vs Night)
// ════════════════════════════════════════════════════════════════════════

const dayCity = Video({ prompt: "Busy city street at noon, bright sunlight, people walking, modern skyscrapers, cinematic wide shot", model: varg.videoModel("kling-v2.5"), duration: 5 });
const nightCity = Video({ prompt: "Same city street at night, neon lights reflecting on wet pavement, moody atmosphere, cinematic wide shot", model: varg.videoModel("kling-v2.5"), duration: 5 });

// ════════════════════════════════════════════════════════════════════════
// SECTION 4: Packshot (End Card)
// ════════════════════════════════════════════════════════════════════════

const packshotBg = Image({
  prompt: "Abstract gradient background, deep navy blue to warm orange, smooth transitions, clean minimal",
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "16:9",
});

// ════════════════════════════════════════════════════════════════════════
// Final Render
// ════════════════════════════════════════════════════════════════════════

export default (
  <Render width={1920} height={1080}>
    <Music prompt="modern ambient electronic, cinematic, building energy" model={varg.musicModel("music_v1")} volume={0.3} />

    {/* Split Screen: Before / After */}
    <Clip duration={4}>
      <Split direction="horizontal">
        {beforeVideo}
        {afterVideo}
      </Split>
      <Title position="top" color="#ffffff">Monday vs Friday</Title>
    </Clip>

    {/* Video Grid: Four Elements */}
    <Clip duration={5}>
      <Grid columns={2} rows={2}>
        {elementVideos[0]}
        {elementVideos[1]}
        {elementVideos[2]}
        {elementVideos[3]}
      </Grid>
      <Title position="bottom" color="#ffffff">Four Elements</Title>
    </Clip>

    {/* Slider: Day vs Night */}
    <Clip duration={4}>
      <Slider direction="horizontal">
        {dayCity}
        {nightCity}
      </Slider>
      <Title position="top" color="#ffffff">Day / Night</Title>
    </Clip>

    {/* Packshot: End Card */}
    <Clip duration={4}>
      <Packshot
        background={packshotBg}
        title="YOUR BRAND"
        titleColor="#ffffff"
        cta="Get Started"
        ctaColor="#FF6B00"
        ctaTextColor="#ffffff"
        ctaPosition="bottom"
        blinkCta={true}
        blinkFrequency={0.8}
        duration={4}
      />
    </Clip>
  </Render>
);
