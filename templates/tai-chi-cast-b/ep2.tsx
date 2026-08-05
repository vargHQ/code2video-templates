/** @jsxImportSource vargai */
// Tai Chi — Episode 2, Cast B: Gym Ad (5 Scenes, ~22s, Native Audio)
//
// Same structure as ../tai-chi/ep2.tsx, different cast. Built to exercise the
// SDK end-to-end on a cold path: every character/scene image here is new, so
// the resolveLazy fan-out is real network traffic (that is the point — it is
// what the concurrency semaphore from sdk#225 has to bound).
//
// Cast swap vs ../tai-chi/ep2.tsx:
//   A1 (client):  overweight woman, late 50s, grey hair
//                 -> very dark-skinned heavyset man, ~50, close-cropped
//                    greying hair
//   A2 (trainer): slim Asian trainer, 30s
//                 -> albino Asian trainer, 25, white hair, very pale skin,
//                    pale blue-grey eyes
//
// No photo references: ../tai-chi/ep2.tsx edits real client photos through
// nano-banana-pro/edit. There are no photos for this cast, so the character
// cards are generated from text with plain nano-banana-pro. Everything
// downstream (scene composites via /edit, kling-v3 videos) is unchanged.
//
// The gym location prompt is byte-identical to ../tai-chi/ep2.tsx, so it hits
// the existing cache at $0.
//
// ── Staged rendering ────────────────────────────────────────────────────
// Image generation is money. STAGE renders a cheap subset first so the cast
// can be eyeballed before committing to kling-v3:
//
//   STAGE=cards   2 character cards          ~$0.30
//   STAGE=scenes  + 5 scene composites       ~$0.75 (cards reused, $0)
//   (unset)       + 5 kling-v3 videos, music ~$3.85 (images reused, $0)
//
// Every stage renders the SAME Image() objects, so cache keys match and each
// stage is free for the next. Deliberately NOT a standalone `await Image()`
// script: that path calls the raw generateImage and is not withCache-wrapped
// (see sdk/src/react/resolve.ts — "cacheKey below is inert here"), so a
// preview would neither read nor write the cache and every image would be
// paid for twice.
//
// Usage:
//   STAGE=cards  bun run render templates/tai-chi-cast-b/ep2.tsx -o output/tai-chi-cast-b/cards.mp4
//   STAGE=scenes bun run render templates/tai-chi-cast-b/ep2.tsx -o output/tai-chi-cast-b/scenes.mp4
//                bun run render templates/tai-chi-cast-b/ep2.tsx -o output/tai-chi-cast-b/ep2.mp4
//
// Scene breakdown (same beats and timings as ../tai-chi/ep2.tsx):
//   1. (6s) Squats + "You do not need to spend hours sweating..."
//   2. (4s) Back view + "If your back looks like this"
//   3. (4s) Front belly + "If your belly looks like this"
//   4. (7s) Arms close-up + "If your arms look like this. Simply join our
//           beginner Tai Chi Challenge this Monday, August 10th"
//   5. (6s) Happy squat + "Forget the diets and cardio to get a beautifully
//           toned body in exactly 28 days"

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("seedream-5-pro");
const IMG_BASE = varg.imageModel("seedream-5-pro");
const AR = "9:16" as const;
const AUDIO_ON = { varg: { generate_audio: true } };

const STAGE = process.env.STAGE ?? "";

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character cards (text-only, no photo refs for this cast)
// ═════════════════════════════════════════════════════════════════════════

// A1: heavyset man ~50. Outfit fixed for the whole video — sleeveless tank
// and shorts — so belly, arms and legs stay visible across all five scenes.
const a1Card = Image({
  prompt:
    "Full-body character reference card of a heavyset man in his early 50s with very dark deep ebony skin, short close-cropped black hair greying at the temples, short greying beard stubble, kind tired eyes. He is overweight with a large round belly and soft heavy upper arms. He wears a plain dark grey sleeveless athletic tank top and snug dark knee-length workout shorts, barefoot. His belly shape is clearly visible through the fitted tank, arms fully bare, legs bare from the knee down. Standing straight facing camera, neutral relaxed pose, arms at his sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
  model: IMG_BASE,
  aspectRatio: AR,
});

// A2: albino Asian trainer, 25. Very pale skin and white hair are the
// identity anchors — stated redundantly so the /edit composites below keep
// them under gym daylight instead of drifting to an ordinary dark-haired
// trainer.
const a2Card = Image({
  prompt:
    "Full-body character reference card of a young Asian woman in her mid 20s with albinism: naturally stark white hair in a long straight ponytail, very pale ivory-white skin, pale blue-grey eyes, fine white eyebrows and eyelashes, slim athletic build. She is a fitness trainer and wears a fitted fitness uniform: sporty teal crop top and matching full-length teal leggings, clean white athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
  model: IMG_BASE,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location card
// ═════════════════════════════════════════════════════════════════════════

// Byte-identical to ../tai-chi/ep2.tsx — cache hit, $0.
const gymLoc = Image({
  prompt:
    "Empty modern gym interior with huge floor-to-ceiling windows letting in bright natural daylight, green trees visible outside. Light wooden floor, a few yoga mats rolled in a corner, rack of dumbbells along one wall, mirrors on the opposite wall. No people. Clean airy atmosphere, warm daylight, photorealistic, 9:16 portrait framing",
  model: IMG_BASE,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites
// ═════════════════════════════════════════════════════════════════════════

const SAME =
  "First reference image is Man A (heavyset dark-skinned man in his early 50s, deep ebony skin, short greying hair, dark grey sleeveless tank top and dark shorts, barefoot). Second reference image is Woman B (Asian albino fitness trainer in her mid 20s, stark white ponytail, very pale ivory skin, pale blue-grey eyes, teal crop top and teal leggings with white sneakers). Third reference image is the gym location with huge windows. Keep Man A's face, deep ebony skin tone, greying hair, body shape and outfit EXACTLY as in his reference card. Keep Woman B's face, stark white hair, pale ivory skin, eyes, body and outfit EXACTLY as in her reference card. Keep the gym EXACTLY as in the location reference. Do not swap, mix or lighten skin tones, do not change either person's hair, and do not alter the location.";

const scene1 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Man A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside him closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene2 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Man A stands facing away from the camera, seen from behind head to toe in his dark grey tank top and dark shorts, his bare arms and lower legs visible, rounded slouching posture. Woman B stands beside him on the left, pointing a finger toward his rounded upper back and shoulders while looking at the camera. Huge windows with daylight in the background, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene3 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Man A stands facing the camera head to toe, neutral stoic expression, his large round belly clearly visible pressing against the fitted tank top above his shorts. Woman B stands beside him on the left, slightly crouched, pointing an open hand at his belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene4 = Image({
  prompt: {
    text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both people. Man A faces the camera holding his right arm raised out to the side, the soft heavy skin of his bare upper arm clearly visible, part of his belly visible below. Woman B stands on the left, pointing at his raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene5 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Man A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside him facing the camera, laughing warmly and giving him an encouraging thumbs-up. Both look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 4 — Videos: kling-v3 with native audio, dialogue in prompts
// ═════════════════════════════════════════════════════════════════════════

// Scene 1 (6s): Squats + opening hook
const vid1 = Video({
  prompt: {
    text: `Modern gym with huge floor-to-ceiling windows, green trees outside, bright daylight.
The heavyset dark-skinned man performs slow controlled squats, bending his knees and rising, arms stretched forward, concentrated effort on his face.
The pale white-haired albino trainer stands beside him facing the camera, gesturing warmly while speaking.
Static medium-wide shot, natural daylight, candid atmosphere.
The trainer speaks in a clear encouraging voice: "You do not need to spend hours sweating to transform your shape by summer."
Soft gym ambient sounds, quiet footsteps on wooden floor.`,
    images: [scene1],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

// Scene 2 (4s): Back view + posture line
const vid2 = Video({
  prompt: {
    text: `Same gym with huge windows. The heavyset dark-skinned man stands still with his back to the camera, full body visible, shoulders rounded.
The pale white-haired albino trainer stands beside him on the left, pointing toward his upper back, looking at the camera while speaking.
Subtle natural movement, the trainer's hand gestures as she talks.
Static camera, full-body framing.
The trainer says matter-of-factly: "If your back looks like this."
Soft gym ambient sounds.`,
    images: [scene2],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 3 (4s): Front view + belly line
const vid3 = Video({
  prompt: {
    text: `Same gym with huge windows. Front-facing full-body shot.
The heavyset dark-skinned man stands facing the camera with a neutral stoic expression, standing still, his round belly visible under the fitted tank top.
The pale white-haired albino trainer stands beside him, slightly crouched, gesturing with an open hand toward his midsection while looking at the camera.
Static camera, natural daylight.
The trainer says: "If your belly looks like this."
Soft gym ambient sounds.`,
    images: [scene3],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 4 (7s): Arms close-up + Tai Chi pitch
//
// Prompt is byte-identical to the original tai-chi/ep2.tsx (only the character
// descriptions differ). The first cast-b render of this exact text produced an
// arm chimera — kling-v3 merged the man's dark arm and the trainer's pale one
// because their silhouettes overlap in the close-up. The prompt is not the
// problem, the seed is: this cast just landed on a bad roll. Pinning an
// explicit seed rerolls the animation (new cacheKey) while keeping the text,
// scene4 input, and every other clip untouched and served from cache.
const vid4 = Video({
  prompt: {
    text: `Same gym, tight close-up on both people's upper bodies.
The heavyset dark-skinned man holds his arm raised out to the side, soft heavy upper arm visible, standing still.
The pale white-haired albino trainer points at the raised arm, then looks directly into the camera speaking with confident energy.
Static intimate close-up framing.
The trainer says clearly and confidently: "If your arms look like this. Simply join our beginner Tai Chi Challenge this Monday, August 10th."
Soft gym ambient, the trainer's voice is clear and motivating.`,
    images: [scene4],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 7,
  // Reroll seed (see comment above). Nested under `varg.fal` so it both
  // reaches the underlying fal kling-v3 call and lands in the cache key —
  // a flat `{ seed }` would be dropped server-side and leave the key
  // unchanged, re-serving the chimera from cache.
  providerOptions: { varg: { fal: { generate_audio: true, seed: 20260803 } } },
});

// Scene 5 (6s): Happy finish + 28 days promise
const vid5 = Video({
  prompt: {
    text: `Same gym with huge windows, medium-wide shot.
The heavyset dark-skinned man rises up from a squat and stands tall, breaking into a big proud smile, raising his arms slightly in triumph.
The pale white-haired albino trainer beside him laughs warmly, gives him a thumbs-up, both genuinely happy and celebrating.
Static camera, bright natural daylight, joyful energy.
The trainer says with conviction: "Forget the diets and cardio to get a beautifully toned body in exactly 28 days."
Happy laughter, soft gym ambient sounds.`,
    images: [scene5],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION — hard cuts, UGC style, auto-trimmed via speechRange
// ═════════════════════════════════════════════════════════════════════════

const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 64,
} as const;

const vids = [vid1, vid2, vid3, vid4, vid5];
const maxDur = [6, 4, 4, 7, 6];

const MUSIC_PROMPT =
  "Upbeat gentle background fitness music, soft piano and light percussion, positive uplifting mood, energetic but not overwhelming";

// The default export is an async function, not a bare element, so nothing
// above this point runs at import time. That matters: `speechRange()` below
// awaits each video, which triggers kling-v3 generation. As a top-level await
// it would fire on every STAGE — a "cards" preview would silently spend the
// full video budget. Video() calls themselves are lazy and cost nothing until
// awaited, so defining vid1..vid5 above is free.
// biome-ignore lint/style/noDefaultExport: CLI entrypoint contract
export default async function () {
  // Preview stages: stills only, no video and no music spend.
  if (STAGE === "cards" || STAGE === "scenes") {
    const preview =
      STAGE === "cards"
        ? [a1Card, a2Card, gymLoc]
        : [scene1, scene2, scene3, scene4, scene5];

    console.log(`STAGE=${STAGE} — rendering ${preview.length} stills, no video`);

    return (
      <Render width={1080} height={1920} fps={30}>
        {preview.map((img) => (
          <Clip duration={2}>{img}</Clip>
        ))}
      </Render>
    );
  }

  // speechRange() returns spoken-word boundaries from whisper word timings.
  // 0.15s lead-in keeps the gesture before the line, 0.1s tail stops the line
  // cutting off abruptly.
  const timings = await Promise.all(
    vids.map(async (vid, i) => {
      const r = await vid.audio.speechRange({ pad: 0.15 });
      const start = r ? Math.max(0, r.start - 0.15) : 0;
      const end = r ? Math.min(maxDur[i]!, r.end + 0.1) : maxDur[i]!;
      return { start, end, duration: end - start };
    }),
  );

  console.log(
    `cast-b clip durations: ${timings.map((t) => t.duration.toFixed(2)).join(", ")}`,
  );

  const clips = vids.map((vid, i) => {
    const { start, end } = timings[i]!;
    return (
      <Clip cutFrom={start} cutTo={end} duration={end - start}>
        {vid}
        <Captions src={vid.audio} {...CAPTION_STYLE} />
      </Clip>
    );
  });

  const duration = timings.reduce((sum, t) => sum + t.duration, 0);

  return (
    <Render width={1080} height={1920} fps={30}>
      <Music
        prompt={MUSIC_PROMPT}
        model={varg.musicModel("music_v1")}
        volume={0.1}
        ducking
        duration={duration}
      />
      {clips}
    </Render>
  );
}
