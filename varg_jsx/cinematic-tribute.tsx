/** @jsxImportSource vargai */
// Cinematic Tribute — 8-Scene Character Montage
//
// A production-level template showing reference-based character consistency
// across 8 scenes, clip trimming, fade transitions, music with ducking,
// voiceover, and TikTok-style captions.
//
// Uses the gateway (`createVarg`) for all AI calls — a single VARG_API_KEY
// replaces separate fal/elevenlabs/replicate keys.
//
// Usage: bun run render templates/cinematic-tribute.tsx
//
// Key techniques:
//   - Reference image consistency: all scenes pass the same character ref
//   - cutFrom/cutTo: trims AI warm-up frames (~0.3s static at clip start)
//   - ducking: auto-lowers music volume when speech is playing
//   - Non-sequential ordering: clips arranged for editorial pacing, not generation order

import { Render, Clip, Image, Video, Speech, Music, Captions } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Character + Style ───────────────────────────────────────────────────
const STYLE = "vintage color photograph, film grain texture, cool blue tones, moody atmospheric lighting, soft focus";
const CHARACTER = "same man from reference, sharp jawline, dark stubble, intense gaze, weathered expression";
const CHARACTER_SPEAKING = `${CHARACTER}, lips slightly parted, speaking`;

// Generate a character reference once — reused in all 8 scenes
const characterRef = Image({
  prompt: "Man in his late 30s, sharp jawline, dark stubble, intense dark eyes, wearing a black leather jacket over grey t-shirt. Dramatic side lighting, neutral dark background. Portrait, photorealistic",
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
});

// ── Scene Images (all reference the same character for consistency) ──────

const img1 = Image({
  prompt: { text: `Medium close-up portrait, ${CHARACTER_SPEAKING}, in a dimly lit workshop, tools on wall behind, warm tungsten light, focused intensity, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img2 = Image({
  prompt: { text: `Close-up portrait, ${CHARACTER_SPEAKING}, in a recording studio, vintage microphone visible, dramatic shadows, raw emotional expression, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img3 = Image({
  prompt: { text: `Medium shot, ${CHARACTER}, on stage under a single spotlight, guitar in hand, powerful stance, smoke and stage lights, wild energy, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img4 = Image({
  prompt: { text: `Portrait, ${CHARACTER}, quiet contemplative pose, looking downward, soft diffused window light, vulnerable expression, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img5 = Image({
  prompt: { text: `Close-up of man's face, ${CHARACTER}, eyes filled with determination, jaw clenched, intense emotional expression, moody dark lighting, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img6 = Image({
  prompt: { text: `Close-up hands on guitar strings, ${CHARACTER} playing, fingers on fretboard, worn hands, intimate creative moment, dim candlelit atmosphere, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img7 = Image({
  prompt: { text: `Medium shot from below, ${CHARACTER} on stage with guitar raised high, intense performance, audience silhouettes, stage lights, raw power, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

const img8 = Image({
  prompt: { text: `Wide shot, ${CHARACTER} alone in empty room, sitting on floor against wall, looking haunted, pale blue light through window, solitary, ${STYLE}`, images: [characterRef] },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
});

// ── Animate to Video ────────────────────────────────────────────────────

const vid1 = Video({ prompt: { text: "man holding guitar, fingers moving gently on strings, sad contemplative gaze", images: [img1] }, model: varg.videoModel("kling-v2.5"), duration: 10 });
const vid2 = Video({ prompt: { text: "man in studio, raw emotional expression, voice trembling, intense focus", images: [img2] }, model: varg.videoModel("kling-v2.5"), duration: 10 });
const vid3 = Video({ prompt: { text: "man on stage with guitar, explosive energy, body swaying, passionate performance", images: [img3] }, model: varg.videoModel("kling-v2.5"), duration: 10 });
const vid4 = Video({ prompt: { text: "man in quiet pose, head tilted, troubled gaze, gentle defeated movement", images: [img4] }, model: varg.videoModel("kling-v2.5"), duration: 10 });
const vid5 = Video({ prompt: { text: "man's jaw clenches, eyes show determination, brow furrows, intense expression", images: [img5] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const vid6 = Video({ prompt: { text: "fingers playing guitar strings, hand movement, strings vibrating, intimate moment", images: [img6] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const vid7 = Video({ prompt: { text: "man thrashing on stage with guitar, intense movement, powerful performance", images: [img7] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const vid8 = Video({ prompt: { text: "man sits alone in empty room, slow movement, withdrawn isolated pose", images: [img8] }, model: varg.videoModel("kling-v2.5"), duration: 5 });

// ── Voiceover ───────────────────────────────────────────────────────────

const speech = Speech({
  voice: "adam",
  model: varg.speechModel("eleven_turbo_v2"),
  children: "He came from nothing. His pain became a voice for the voiceless. Raw, authentic, unfiltered. He changed everything. Though he burned too bright, too fast. His echo will never fade.",
});

// ── Final Render ────────────────────────────────────────────────────────
// Clips are ordered for editorial pacing (not generation order):
// intimate → studio → anguish → guitar detail → stage energy → thrash → contemplation → solitude

export default (
  <Render width={1080} height={1920}>
    <Music
      prompt="dark melancholic rock instrumental, distorted guitar, heavy atmosphere, building crescendo"
      model={varg.musicModel("music_v1")}
      volume={0.15}
      loop
      ducking
      duration={16}
    />

    <Clip duration={2} cutFrom={0.3} cutTo={2.3}>
      {vid1}
    </Clip>

    <Clip duration={2} cutFrom={0.3} cutTo={2.3} transition={{ name: "fade", duration: 0.15 }}>
      {vid2}
    </Clip>

    <Clip duration={2} cutFrom={0.2} cutTo={2.2} transition={{ name: "fade", duration: 0.15 }}>
      {vid5}
    </Clip>

    <Clip duration={2} cutFrom={0.2} cutTo={2.2} transition={{ name: "fade", duration: 0.15 }}>
      {vid6}
    </Clip>

    <Clip duration={2} cutFrom={0.3} cutTo={2.3} transition={{ name: "fade", duration: 0.15 }}>
      {vid3}
    </Clip>

    <Clip duration={2} cutFrom={0.2} cutTo={2.2} transition={{ name: "fade", duration: 0.15 }}>
      {vid7}
    </Clip>

    <Clip duration={2} cutFrom={0.3} cutTo={2.3} transition={{ name: "fade", duration: 0.15 }}>
      {vid4}
    </Clip>

    <Clip duration={2} cutFrom={0.2} cutTo={2.2} transition={{ name: "fade", duration: 0.15 }}>
      {vid8}
    </Clip>

    <Captions src={speech} style="tiktok" position="bottom" />
  </Render>
);
