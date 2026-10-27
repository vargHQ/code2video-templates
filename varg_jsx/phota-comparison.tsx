/** @jsxImportSource vargai */
// Phota Comparison — Full Image × Video Model Grid
//
// 3 image models × 2 video models = 6 clips, each labeled:
//
//   Image Models:   Phota, Grok Imagine Image, Nano Banana 2
//   Video Models:   Grok Imagine, Kling v3
//
// Nano Banana 2 is edit-only — we generate a base with Phota, then
// re-interpret it through nano-banana-2/edit with the same prompt.
//
// Cost estimate:
//   Images: 1 phota (9) + 1 grok-imagine-image (3) + 1 nano-banana-2 (5) = 17 credits
//   Videos: 3 grok-imagine (300) + 3 kling-v3 (450) = 750 credits
//   Music: 30 credits
//   Total: ~797 credits ($7.97)
//
// Usage:
//   bun run render templates/phota-comparison.tsx

import { resolve } from "node:path";
import { Clip, Image, Music, Render, Title, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const FONT = resolve(import.meta.dir, "../../assets/fonts/aeonik-black.otf");

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Prompt ───────────────────────────────────────────────────────────────
const IMAGE_PROMPT =
  "Adult woman mid-20s, long platinum-blonde hair slicked back into a tight low bun with clean center part and a few baby hairs. " +
  "Fair skin with light tan, natural texture with visible pores and light freckles across nose and upper cheeks. " +
  "Almond-shaped light grey-hazel eyes, soft feminine face with high prominent cheekbones, defined jawline with slightly pointed chin. " +
  "Wearing a black zip-up cotton hoodie zipped to upper chest with visible silver zipper, relaxed streetwear fit. " +
  "Rectangular slim black sunglasses with dark lenses. White wired earphones hanging down the front splitting at chest level. " +
  "Small colorful star stickers on cheeks — one green, one pink — below the sunglasses line. " +
  "Single brown backpack strap over one shoulder. Long almond nude cream manicure nails. " +
  "Holding a large clear plastic cup with pale green iced drink, ice pieces, flat lid, dark green straw inserted between slightly parted lips as if sipping. " +
  "Left hand holds the cup near shoulder height close to camera so it appears large in foreground, fingers wrapped around cup, nails clearly visible. " +
  "Outdoor low-angle selfie, subject filling most of the frame, head upright with slight forward tilt, neutral slightly unimpressed expression, deadpan selfie vibe. " +
  "Outside under a leafy tree, tree trunk on left edge, dense green leaves overhead, bright blue sky behind. " +
  "Natural daylight with mild backlight, sun filtered by leaves creating rim light around hairline and subtle glow on cup lid, dappled leaf light in background. " +
  "iPhone selfie camera, 1x wide 26mm equivalent, slightly low angle pointing upward emphasizing sky and leaves. " +
  "Vertical 9:16 tight portrait, face centered, cup dominates left-lower quadrant. Sharp focus on lips straw sunglasses stickers and nails, background leaves slightly softer. Photorealistic.";

const VIDEO_PROMPT =
  "She takes a slow sip from the straw, cheeks barely moving. A gentle breeze stirs the baby hairs at her hairline and sways the earphone cables. " +
  "Dappled sunlight shifts through the leaves above, casting moving patterns of light and shadow. " +
  "She lowers the cup slightly, eyes still locked on camera through the dark sunglasses. Deadpan energy. Subtle camera drift.";

// ── Image Generation ─────────────────────────────────────────────────────

// 1. Phota (text-to-image)
const photaImg = Image({
  prompt: IMAGE_PROMPT,
  model: varg.imageModel("phota"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "1K", output_format: "jpeg" } },
});

// 2. Grok Imagine Image (text-to-image)
const grokImg = Image({
  prompt: IMAGE_PROMPT,
  model: varg.imageModel("grok-imagine-image"),
  aspectRatio: "9:16",
});

// 3. Nano Banana 2 (edit-only — use phota base as reference)
const nanoBanana2Img = Image({
  prompt: { text: IMAGE_PROMPT, images: [photaImg] },
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "1K" } },
});

// ── Video Generation: Full Grid ──────────────────────────────────────────

// Phota × Grok Imagine
const photaGrok = Video({
  prompt: { text: VIDEO_PROMPT, images: [photaImg] },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

// Phota × Kling v3
const photaKling = Video({
  prompt: { text: VIDEO_PROMPT, images: [photaImg] },
  model: varg.videoModel("kling-v3"),
  duration: 5,
});

// Grok Image × Grok Imagine
const grokGrok = Video({
  prompt: { text: VIDEO_PROMPT, images: [grokImg] },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

// Grok Image × Kling v3
const grokKling = Video({
  prompt: { text: VIDEO_PROMPT, images: [grokImg] },
  model: varg.videoModel("kling-v3"),
  duration: 5,
});

// Nano Banana 2 × Grok Imagine
const nb2Grok = Video({
  prompt: { text: VIDEO_PROMPT, images: [nanoBanana2Img] },
  model: varg.videoModel("grok-imagine"),
  duration: 6,
});

// Nano Banana 2 × Kling v3
const nb2Kling = Video({
  prompt: { text: VIDEO_PROMPT, images: [nanoBanana2Img] },
  model: varg.videoModel("kling-v3"),
  duration: 5,
});

// ── Compose ──────────────────────────────────────────────────────────────
export default (
  <Render width={1080} height={1920} shortest>
    <Music
      prompt="lo-fi chill beats, warm vinyl crackle, laid-back cafe vibes, soft Rhodes piano, gentle boom-bap drums"
      model={varg.musicModel("music_v1")}
      volume={0.35}
      duration={35}
    />

    {/* ── Phota row ── */}
    <Clip duration={5} transition={{ name: "fade", duration: 0.4 }}>
      {photaGrok}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Phota + Grok Video</Title>
    </Clip>

    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {photaKling}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Phota + Kling v3</Title>
    </Clip>

    {/* ── Grok Imagine Image row ── */}
    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {grokGrok}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Grok Image + Grok Video</Title>
    </Clip>

    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {grokKling}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Grok Image + Kling v3</Title>
    </Clip>

    {/* ── Nano Banana 2 row ── */}
    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {nb2Grok}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Nano Banana 2 + Grok Video</Title>
    </Clip>

    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {nb2Kling}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">Nano Banana 2 + Kling v3</Title>
    </Clip>
  </Render>
);
