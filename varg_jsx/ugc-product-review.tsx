/** @jsxImportSource vargai */
// UGC Product Review — Whiteboard-Style Guru Testimonial
//
// Pipeline:
//   1. Generate product image on clean background (Nano Banana Pro)
//   2. Generate "guru persona" character portrait (Soul)
//   3. AI writes a video-style script from product name + description
//   4. Segmented voiceover → per-segment lipsync (VEED Fabric)
//   5. B-roll product intercuts between talking segments
//   6. TikTok captions + background music
//
// Vertical 9:16 format — optimized for TikTok, Reels, Shorts.
//
// Usage: bun run render templates/ugc-product-review.tsx

import { createVarg, elevenlabs } from "vargai/ai";
import { Captions, Clip, Image, Music, Render, render, Speech, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config — change these to match your product ─────────────────────────
const CONFIG = {
  productName: "HYDRO FLASK",
  productDescription:
    "Wide Mouth Water Bottle 946 ml (32 oz) — Vacuum Insulated Stainless Steel Water Bottle with Leak Proof Flex Cap and Powder Coat",
  character:
    "athletic man, early 30s, short brown hair, light stubble, wearing a fitted grey t-shirt, energetic and enthusiastic expression, whiteboard behind him with handwritten bullet points",
  musicPrompt:
    "upbeat energetic lo-fi hip hop, fast-paced tutorial vibes, popular science YouTube energy, motivational",
  voice: "TX3LPaxmHKxFdv7VOQHJ", // Liam — energetic, social media
};

// ── Product image — clean studio shot ───────────────────────────────────
const productImage = Image({
  prompt: `Professional product photography of ${CONFIG.productName}. ${CONFIG.productDescription}. Clean white background, centered, soft studio lighting, slight shadow underneath. Commercial catalog style. High detail, photorealistic.`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
});

// ── Character — guru persona portrait ───────────────────────────────────
const guruPortrait = Image({
  prompt: `${CONFIG.character}, looking directly at camera with excited passionate expression, natural iPhone selfie angle from slightly above, indoor room with whiteboard behind showing handwritten notes, warm natural lighting, photorealistic, UGC influencer style`,
  model: varg.imageModel("soul"),
  aspectRatio: "9:16",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

// ── Character holding product composite ─────────────────────────────────
const guruWithProduct = Image({
  prompt: {
    text: `Same person from first reference holding the product from second reference in their right hand, showing it to camera with enthusiasm. Whiteboard behind with handwritten bullet points: "Cold 24hrs", "No Sweat", "Grip". Excited energetic expression, direct eye contact. Natural room lighting, UGC review style. Photorealistic.`,
    images: [guruPortrait, productImage],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

// ── Segmented voiceover ─────────────────────────────────────────────────
const { audio, segments } = await Speech({
  model: elevenlabs.speechModel("eleven_v3"),
  voice: CONFIG.voice,
  children: [
    `Yo let me tell you about this ${CONFIG.productName}.`,
    `I've been testing water bottles for years and this one is different. Vacuum insulated, keeps ice cold for twenty-four hours straight.`,
    `The powder coat grip? No condensation, no slipping. And this flex cap is leak proof — I literally throw this in my gym bag.`,
    `If you're still using a basic plastic bottle, you need to upgrade. Link below.`,
  ],
});

// ── Lipsync talking head per segment ────────────────────────────────────

// Segment 0: Hook — "Yo let me tell you about this..."
const talking0 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [guruWithProduct], audio: segments[0] },
});

// Segment 1: Explanation — "I've been testing water bottles..."
const talking1 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [guruWithProduct], audio: segments[1] },
});

// Segment 3: CTA — "If you're still using a basic plastic bottle..."
const talking3 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [guruWithProduct], audio: segments[3] },
});

// ── B-roll — product closeup for intercut ───────────────────────────────
const productCloseup = Image({
  prompt: `Extreme closeup of ${CONFIG.productName} water bottle being held, condensation-free powder coat surface, flex cap detail visible, dramatic shallow depth of field, warm lighting, product hero shot, UGC review style`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
  zoom: "in",
});

// ── Final Render ────────────────────────────────────────────────────────
const demo = (
  <Render width={1080} height={1920}>
    <Music
      prompt={CONFIG.musicPrompt}
      model={varg.musicModel("music_v1")}
      volume={0.08}
      ducking
      duration={audio.duration}
    />

    {/* Scene 1: Hook — guru grabs attention */}
    <Clip duration={segments[0]!.duration}>{talking0}</Clip>

    {/* Scene 2: Explanation — testing and results */}
    <Clip duration={segments[1]!.duration}>{talking1}</Clip>

    {/* Scene 3: B-roll — product closeup while features are described */}
    <Clip duration={segments[2]!.duration} transition={{ name: "fade", duration: 0.3 }}>
      {productCloseup}
    </Clip>

    {/* Scene 4: CTA — back to guru for the close */}
    <Clip duration={segments[3]!.duration} transition={{ name: "fade", duration: 0.3 }}>
      {talking3}
    </Clip>

    {/* Full continuous voiceover */}
    {audio}

    {/* TikTok-style captions */}
    <Captions src={audio} style="tiktok" color="#ffffff" />
  </Render>
);

async function main() {
  const result = await render(demo, {
    output: "output/ugc-product-review.mp4",
    cache: ".cache/ai-ugc-product-review",
  });

  console.log(
    `Done: output/ugc-product-review.mp4 (${(result.video.byteLength / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
