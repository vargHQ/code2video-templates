/** @jsxImportSource vargai */
// Talking Head with Lipsync + Captions
//
// Full pipeline: character generation → image editing → video animation →
// voiceover → lipsync → captions + background music.
//
// Usage: bun run render templates/talking-head.tsx

import { Captions, Clip, Image, Music, Render, Speech, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const CHARACTER = "young woman, mid-20s, warm brown eyes, shoulder-length wavy dark hair, casual white t-shirt";
const VOICEOVER_TEXT = "Hey! So I just discovered this amazing new tool that lets you create videos with AI. You literally write a few lines of code and it generates everything — the character, the voice, even the music. Let me show you how it works.";

// ── Step 1: Generate base character ─────────────────────────────────────
const baseCharacter = Image({
  prompt: `${CHARACTER}, looking directly at camera, natural selfie angle, warm smile, soft indoor lighting, photorealistic`,
  model: varg.imageModel("soul"),
  aspectRatio: "9:16",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

// ── Step 2: Animate character to video ──────────────────────────────────
const animatedCharacter = Video({
  prompt: { text: "woman speaking naturally to camera, subtle head movements, friendly expression, slight hand gestures", images: [baseCharacter] },
  model: varg.videoModel("kling-v2.5"),
});

// ── Step 3: Generate voiceover ──────────────────────────────────────────
const voiceover = Speech({
  model: varg.speechModel("eleven_v3"),
  voice: "rachel",
  children: VOICEOVER_TEXT,
});

// ── Step 4: Lipsync video + audio ───────────────────────────────────────
const lipsynced = Video({
  prompt: { video: animatedCharacter, audio: voiceover },
  model: varg.videoModel("sync-v2-pro"),
});

// ── Final Render ────────────────────────────────────────────────────────
export default (
  <Render width={1080} height={1920}>
    <Music prompt="upbeat lo-fi background, chill electronic, podcast vibes" model={varg.musicModel("music_v1")} volume={0.1} />
    <Clip duration={5}>
      {lipsynced}
    </Clip>
    <Captions src={voiceover} style="tiktok" color="#ffffff" />
  </Render>
);
