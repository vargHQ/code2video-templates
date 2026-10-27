/** @jsxImportSource vargai */
// Phota Single Clip — renders one image+video combo at a time
//
// Usage:
//   IMG=phota VID=grok bun run render templates/phota-single.tsx
//
// IMG options: phota, grok, nb2
// VID options: grok, kling

import { resolve } from "node:path";
import { Clip, Image, Render, Title, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const FONT = resolve(import.meta.dir, "../../assets/fonts/aeonik-black.otf");
const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

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

// ── Image selection ──────────────────────────────────────────────────────
const IMG = process.env.IMG ?? "phota";
const VID = process.env.VID ?? "grok";

const IMAGE_LABELS: Record<string, string> = {
  phota: "Phota",
  grok: "Grok Image",
  nb2: "Nano Banana 2",
};

const VIDEO_LABELS: Record<string, string> = {
  grok: "Grok Video",
  kling: "Kling v3",
};

// Base phota image (needed for nb2 as reference)
const photaImg = Image({
  prompt: IMAGE_PROMPT,
  model: varg.imageModel("phota"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "1K", output_format: "jpeg" } },
});

const IMAGES: Record<string, ReturnType<typeof Image>> = {
  phota: photaImg,
  grok: Image({
    prompt: IMAGE_PROMPT,
    model: varg.imageModel("grok-imagine-image"),
    aspectRatio: "9:16",
  }),
  nb2: Image({
    prompt: { text: IMAGE_PROMPT, images: [photaImg] },
    model: varg.imageModel("nano-banana-2"),
    aspectRatio: "9:16",
    providerOptions: { varg: { resolution: "1K" } },
  }),
};

const img = IMAGES[IMG]!;
const isKling = VID === "kling";

const vid = Video({
  prompt: { text: VIDEO_PROMPT, images: [img] },
  model: varg.videoModel(isKling ? "kling-v3" : "grok-imagine"),
  duration: isKling ? 5 : 6,
});

const label = `${IMAGE_LABELS[IMG]} + ${VIDEO_LABELS[VID]}`;

export default (
  <Render width={1080} height={1920} shortest>
    <Clip duration={isKling ? 5 : 6}>
      {vid}
      <Title position="top" color="#ffffff" fontPath={FONT} outline={4} outlineColor="black">
        {label}
      </Title>
    </Clip>
  </Render>
);
