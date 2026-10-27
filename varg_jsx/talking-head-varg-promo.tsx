/** @jsxImportSource vargai */
// Talking Head — Varg AI Promo
//
// Pipeline: character image → voiceover → veed lipsync → captions + music
// PiP logo overlay in top-left corner.
//
// Usage: bun run render templates/talking-head-varg-promo.tsx

import { Captions, Clip, Image, Music, Overlay, Render, Speech, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const CHARACTER = "young woman, mid-20s, warm brown eyes, shoulder-length wavy dark hair, casual white t-shirt";
const VOICEOVER_TEXT = "Varg AI is just insane. I was created with image, video, speech, music, captions. Now creators don't need to pick models, they just get videos. Like this one!";
const LOGO_URL = "https://s3.varg.ai/uploads/images/group-1321316698_18e51bfe.png";

// ── Build template (async to await speech duration) ─────────────────────
const build = async () => {
  // Step 1: Generate base character
  const baseCharacter = Image({
    prompt: `${CHARACTER}, looking directly at camera, natural selfie angle, warm smile, soft indoor lighting, photorealistic`,
    model: varg.imageModel("soul"),
    aspectRatio: "9:16",
    providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
  });

  // Step 2: Generate voiceover (await to get duration)
  const voiceover = await Speech({
    model: varg.speechModel("eleven_v3"),
    voice: "fDeOZu1sNd7qahm2fV4k",
    children: VOICEOVER_TEXT,
  });

  // Step 3: Lipsync — veed takes image + audio directly
  const talking = Video({
    model: varg.videoModel("veed-fabric-1.0"),
    keepAudio: true,
    prompt: { images: [baseCharacter], audio: voiceover },
    providerOptions: { varg: { resolution: "720p" } },
  });

  // Step 4: Logo as static image for PiP overlay
  const logo = Image({ src: LOGO_URL });

  return (
    <Render width={1080} height={1920}>
      <Music prompt="upbeat lo-fi background, chill electronic, podcast vibes" model={varg.musicModel("music_v1")} volume={0.12} duration={voiceover.duration} ducking />
      <Clip duration={voiceover.duration}>
        {talking}
        <Overlay left="35%" top="42%" width="30%" start={0.2} end={1.1}>
          {logo}
        </Overlay>
      </Clip>
      <Captions src={voiceover} style="tiktok" color="#ffffff" activeColor="#FF8C42" fontSize={72} wordsPerLine={3} position="bottom" />
    </Render>
  );
};

export default build();
