/** @jsxImportSource vargai */
// Product Showcase — 4-Scene Product Video
//
// A universal product advertising template following the classic formula:
//   Scene 1: Hero (product alone on elegant surface)
//   Scene 2: Features (text overlay highlighting key benefits)
//   Scene 3: Lifestyle (character using the product)
//   Scene 4: Result (close-up showing the outcome)
//
// Customize by changing the CONFIG object below.
//
// Usage: bun run render templates/product-showcase.tsx

import { Captions, Clip, Image, Music, Packshot, Render, Speech, Title, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config — change these to match your product ─────────────────────────
const CONFIG = {
  productName: "AeroSound Pro",
  productDescription: "Premium wireless noise-cancelling headphones with 40-hour battery life",
  voiceover: "Introducing AeroSound Pro. Premium noise cancellation that adapts to your environment. Crystal clear audio with 40 hours of battery life. Experience sound the way it was meant to be heard.",
  musicPrompt: "modern sleek tech commercial, ambient electronic, premium feel",
  character: "young professional man, late 20s, short dark hair, clean-shaven, wearing a navy crew-neck sweater",
  features: [
    "Active Noise Cancellation",
    "40-Hour Battery Life",
    "Hi-Res Audio Certified",
    "Adaptive Sound Control",
  ],
};

// ── Character for lifestyle & result scenes ─────────────────────────────
const character = Image({
  prompt: `${CONFIG.character}, photorealistic portrait, neutral expression, studio lighting`,
  model: varg.imageModel("soul"),
  aspectRatio: "16:9",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

// ── Scene 1: Hero — Product alone ───────────────────────────────────────
const heroImage = Image({
  prompt: `Product photography. ${CONFIG.productDescription}. Sleek matte black finish. Centered on a clean white marble surface. Soft gradient background. Single dramatic spotlight from above. Subtle reflection on surface. Shot on 100mm macro, f/2.8, studio lighting. Premium commercial aesthetic.`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "16:9",
});

const heroVideo = Video({
  prompt: { text: "Slow 360-degree rotation revealing product details, dramatic lighting shifts, premium commercial feel", images: [heroImage] },
  model: varg.videoModel("kling-v2.5"),
  duration: 5,
});

// ── Scene 2: Features — Text overlay ────────────────────────────────────
const featuresBg = Image({
  prompt: { text: `Soft dreamy background with the product floating slightly off-center, shallow depth of field, bokeh light orbs, dark moody atmosphere, premium commercial aesthetic`, images: [heroImage] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

const featuresVideo = Video({
  prompt: { text: "Product gently floating with subtle rotation, ambient particles drifting, dreamy atmosphere", images: [featuresBg] },
  model: varg.videoModel("kling-v2.5"),
  duration: 5,
});

// ── Scene 3: Lifestyle — Character using the product ────────────────────
const lifestyleImage = Image({
  prompt: {
    text: `Same person from the first reference wearing the headphones from the second reference. Sitting at a modern desk in a bright loft apartment, eyes closed, enjoying music. Natural window light, warm afternoon glow. Photorealistic, editorial quality.`,
    images: [character, heroImage],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

const lifestyleVideo = Video({
  prompt: { text: "Person nods gently to music, opens eyes and smiles, touches headphone ear cup, relaxed natural movement", images: [lifestyleImage] },
  model: varg.videoModel("kling-v2.5"),
  duration: 5,
});

// ── Scene 4: Result — Close-up outcome ──────────────────────────────────
const resultImage = Image({
  prompt: {
    text: `Close-up of the same person wearing the headphones, peaceful expression, eyes closed, slight smile. Shallow depth of field, warm backlight creating rim light on hair and headphones. Premium lifestyle photography.`,
    images: [character, heroImage],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

const resultVideo = Video({
  prompt: { text: "Person slowly opens eyes, peaceful smile, camera pulls back slightly revealing the full headphone design", images: [resultImage] },
  model: varg.videoModel("kling-v2.5"),
  duration: 5,
});

// ── Voiceover ───────────────────────────────────────────────────────────
const voiceover = Speech({
  model: varg.speechModel("eleven_v3"),
  voice: "adam",
  children: CONFIG.voiceover,
});

// ── Final Render ────────────────────────────────────────────────────────
export default (
  <Render width={1920} height={1080}>
    <Music prompt={CONFIG.musicPrompt} model={varg.musicModel("music_v1")} volume={0.15} ducking />

    {/* Scene 1: Hero */}
    <Clip duration={3.5} transition={{ name: "fade", duration: 0.5 }}>
      {heroVideo}
    </Clip>

    {/* Scene 2: Features */}
    <Clip duration={4} transition={{ name: "fade", duration: 0.5 }}>
      {featuresVideo}
      <Title position="center" color="#ffffff">
        {CONFIG.features.join("\n")}
      </Title>
    </Clip>

    {/* Scene 3: Lifestyle */}
    <Clip duration={3.5} transition={{ name: "fade", duration: 0.5 }}>
      {lifestyleVideo}
    </Clip>

    {/* Scene 4: Result */}
    <Clip duration={3} transition={{ name: "fade", duration: 0.5 }}>
      {resultVideo}
    </Clip>

    {/* Packshot */}
    <Clip duration={4}>
      <Packshot
        background={heroImage}
        title={CONFIG.productName}
        titleColor="#ffffff"
        cta="Shop Now"
        ctaColor="#1a1a1a"
        ctaTextColor="#ffffff"
        ctaPosition="bottom"
        blinkCta
        duration={4}
      />
    </Clip>

    <Captions src={voiceover} style="karaoke" color="#ffffff" />
  </Render>
);
