/** @jsxImportSource vargai */
// Negative Marketing — Fear Hook + Product Reveal
//
// Multi-scene ad using fear-based hooks to drive product interest:
//   Scene 1: Expert talking head delivers alarming opener (lipsync)
//   Scene 2: Dramatic product b-roll (cinematic hero shot)
//   Scene 3: Expert talking head delivers the reveal/solution (lipsync)
//   Scene 4: Packshot with CTA
//
// Uses `await Speech()` with children array for per-phrase segments.
// Continuous voiceover plays at the Render level for smooth audio.
// VEED Fabric generates lipsync videos with keepAudio: false to avoid
// doubling up with the full voiceover track.
//
// Usage: bun run render templates/negative-marketing.tsx

import { createVarg, elevenlabs } from "vargai/ai";
import { Captions, Clip, Image, Music, Packshot, Render, render, Speech, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const CONFIG = {
  expert:
    "serious male tech reviewer in his 30s, short dark hair, trimmed beard, wearing black turtleneck, intense focused expression",
  productName: "iPhone 17 Pro",
  productCta: "Upgrade Now",
  musicPrompt:
    "dark tense cinematic underscore, deep bass drone, suspenseful electronic, conspiracy documentary mood, building tension",
  voice: "q0IMILNRPxOgtBTS4taI",
};

// ── Product reference — iPhone 16 Pro Desert Titanium ───────────────────
const PRODUCT_REF = "https://s3.varg.ai/uploads/images/iphone-17-pro-max-grip_9f326642.webp";

// ── Segmented voiceover ─────────────────────────────────────────────────
// Direct ElevenLabs provider for character-level alignment → segments.
const { audio, segments } = await Speech({
  model: elevenlabs.speechModel("eleven_v3"),
  voice: CONFIG.voice,
  children: [
    "I hate this phone before i ",
    "It's not what it seems.",
    "But there's one phone that actually changed this. Titanium build, on-device AI processing, seven years of updates. This is the phone they didn't want you to know about.",
    "It's not what it seems.",
    "But there's one phone that actually changed this. Titanium build, on-device AI processing, seven years of updates. This is the phone they didn't want you to know about.",
  ],
});

// ── Expert portrait ─────────────────────────────────────────────────────
const portrait = Image({
  prompt: `Ultra-realistic portrait of a ${CONFIG.expert}. Dark moody background, dramatic side lighting, documentary style, looking directly at camera with concerned expression, speaking. Photorealistic, 8K`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
});

const portraitWithPhone = Image({
  prompt: {text: `Ultra-realistic portrait of a ${CONFIG.expert} holding a ${CONFIG.productName}. Dark moody background, dramatic side lighting, documentary style, looking directly at camera with concerned expression, speaking. Photorealistic, 8K`, images: [portrait, PRODUCT_REF]},
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
});

// ── Scene 1: Alarming opener — lipsync talking head ─────────────────────
const talking1 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [portraitWithPhone], audio: segments[0] },
});

// ── Scene 2: Dramatic product b-roll ────────────────────────────────────
const productHero = Image({
  prompt: {
    text: `Same phone from reference, dramatic cinematic product shot. Phone floating in dark void, volumetric light beams cutting through darkness, lens flares on titanium edges, particles floating in air. Premium tech commercial aesthetic, dark moody atmosphere, Apple keynote style. 8K.`,
    images: [PRODUCT_REF],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const productVideo = Video({
  prompt: {
    text: "Phone rotates slowly revealing all angles, dramatic light sweeps across surface, volumetric beams shift, lens flares dance on edges, premium cinematic reveal",
    images: [productHero],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: 5,
});

// ── Scene 3: Reveal / solution — lipsync talking head ───────────────────
const talking3 = Video({
  model: varg.videoModel("veed-fabric-1.0"),
  keepAudio: false,
  prompt: { images: [portrait], audio: segments[2] },
});

// ── Final Render ────────────────────────────────────────────────────────
const demo = (
  <Render width={1080} height={1920}>
    <Music prompt={CONFIG.musicPrompt} model={varg.musicModel("music_v1")} volume={0.12} ducking duration={audio.duration} />

    {/* Scene 1: Fear hook — expert talking head */}
    <Clip duration={segments[0]!.duration}>{talking1}</Clip>

    {/* Scene 2: Product b-roll — cinematic iPhone reveal */}
    <Clip duration={segments[1]!.duration} transition={{ name: "fade", duration: 0.3 }}>
      {productVideo}
    </Clip>

    {/* Scene 3: Solution reveal — expert talking head */}
    <Clip duration={segments[2]!.duration} transition={{ name: "fade", duration: 0.3 }}>
      {talking3}
    </Clip>

    {/* Scene 4: Packshot with CTA */}
    <Clip duration={4}>
      <Packshot
        background={productHero}
        title={CONFIG.productName}
        titleColor="#ffffff"
        cta={CONFIG.productCta}
        ctaColor="#FF6B35"
        ctaTextColor="#ffffff"
        ctaPosition="bottom"
        blinkCta
        duration={4}
      />
    </Clip>

    {/* Full continuous voiceover — smooth, no splicing */}
    {audio}

    {/* TikTok-style captions synced to voiceover */}
    <Captions src={audio} style="tiktok" color="#ffffff" />
  </Render>
);

async function main() {
  const result = await render(demo, {
    output: "output/negative-marketing.mp4",
    cache: ".cache/ai-negative-marketing-v2",
  });

  console.log(
    `Done: output/negative-marketing.mp4 (${(result.video.byteLength / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
