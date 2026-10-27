/** @jsxImportSource vargai */
// UGC Testimonial — Girl Talking with Product
//
// Full pipeline: character + product composite → animated talking head →
// segmented voiceover → per-segment lipsync → TikTok captions + music.
//
// Uses `await Speech()` with children array for per-phrase segments.
// Each segment drives clip duration and lipsync audio.
// Continuous voiceover plays at the Render level for smooth audio.
//
// Usage: bun run render templates/ugc-testimonial.tsx

import { createVarg, elevenlabs } from "vargai/ai";
import { Captions, Clip, Image, Music, Render, render, Speech, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const CONFIG = {
  character:
    "young woman, mid-20s, clear glowing skin, soft wavy brown hair, natural minimal makeup, wearing a cozy cream knit sweater",
  musicPrompt: "soft lo-fi chill beat, warm acoustic guitar, cozy bedroom vibes, gentle and upbeat",
  voice: "dfeOmy6Uay63tNhyO99j",
};

// ── Product reference — CeraVe Moisturizing Cream ───────────────────────
const PRODUCT_REF =
  "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/skincare/moisturizers/moisturizing-cream/moisturizing-cream-12oz-front.jpg";

// ── Segmented voiceover ─────────────────────────────────────────────────
// Direct ElevenLabs provider for character-level alignment → segments.
const { audio, segments } = await Speech({
  model: elevenlabs.speechModel("eleven_v3"),
  voice: CONFIG.voice,
  children: [
    "Okay I have to tell you about this.",
    "I've been using this cream for like two weeks and my skin has literally never been this smooth.",
    "I'm not even exaggerating. The texture, the glow — everything changed.",
    "You need to try this, link is in my bio.",
  ],
});

// ── Step 1: Generate base character ─────────────────────────────────────
const baseCharacter = Image({
  prompt: `${CONFIG.character}, looking directly at camera with excited expression, natural iPhone selfie angle, warm smile, soft indoor lighting, cozy bedroom background, photorealistic`,
  model: varg.imageModel("soul"),
  aspectRatio: "9:16",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

// ── Step 2: Composite character holding the product ─────────────────────
const characterWithProduct = Image({
  prompt: {
    text: `Same woman from first reference holding the product from second reference in her right hand near her face. She holds it up toward camera proudly, showing the product label. Excited genuine smile, direct eye contact. Natural iPhone selfie angle, slightly elevated. Warm cozy bedroom background, soft golden lighting. UGC influencer style, authentic and relatable. Photorealistic.`,
    images: [baseCharacter, PRODUCT_REF],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

// ── Step 3: Lipsync talking head per segment ────────────────────────────
// Segment 0: "Okay I have to tell you about this."
const talking0 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [characterWithProduct], audio: segments[0] },
});

// Segment 1: "I've been using this cream..."
const talking1 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [characterWithProduct], audio: segments[1] },
});

// Segment 3: "You need to try this, link is in my bio."
const talking3 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [characterWithProduct], audio: segments[3] },
});

// ── Final Render ────────────────────────────────────────────────────────
const demo = (
  <Render width={1080} height={1920}>
    <Music prompt={CONFIG.musicPrompt} model={varg.musicModel("music_v1")} volume={0.08} ducking duration={audio.duration} />

    {/* Scene 1: Hook — "Okay I have to tell you about this." */}
    <Clip duration={segments[0]!.duration}>{talking0}</Clip>

    {/* Scene 2: Testimonial — "I've been using this cream..." */}
    <Clip duration={segments[1]!.duration}>{talking1}</Clip>

    {/* Scene 3: B-roll — product closeup while "The texture, the glow..." plays */}
    <Clip duration={segments[2]!.duration} transition={{ name: "fade", duration: 0.3 }}>
      <Image
        prompt="Extreme closeup of cream being applied to cheek, soft golden light, dewy glowing skin, macro beauty shot, UGC bathroom mirror vibes"
        model={varg.imageModel("nano-banana-pro")}
        aspectRatio="9:16"
        zoom="in"
      />
    </Clip>

    {/* Scene 4: CTA — "You need to try this, link is in my bio." */}
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
    output: "output/ugc-testimonial.mp4",
    cache: ".cache/ai-ugc-testimonial-v2",
  });

  console.log(
    `Done: output/ugc-testimonial.mp4 (${(result.video.byteLength / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
