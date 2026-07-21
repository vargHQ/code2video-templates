/** @jsxImportSource vargai */
// Formula Care — Episode 2: Gym Ad (5 Scenes, ~22s, Native Audio)
//
// Built from real photo refs of both actors:
//   A1 (client):  https://uu.varg.ai/1784576476121_3hb7fv71.jpeg
//   A2 (trainer): https://uu.varg.ai/1784576485522_vbgd4amk.jpeg
//
// Pipeline:
//   1. Character profile cards (full-body, fixed outfit) from photo refs
//   2. Location card (gym with big windows, no people)
//   3. Scene composites 1-5 referencing [a1Card, a2Card, gymLoc]
//   4. kling-v3 videos with native audio (dialogue embedded in prompts)
//   5. Captions via vid.audio — Whisper transcribes each clip's audio
//      automatically. No manual SRT file, no two-pass workflow.
//
// IMPORTANT: Image prompts must stay byte-identical to
// formula-care-ep2-images.ts so they hit the cache ($0).
//
// Scene breakdown:
//   1. (6s) Squats + "You do not need to spend hours sweating..."
//   2. (4s) Back view + "If your booty looks like this"
//   3. (4s) Front belly + "If your belly looks like this"
//   4. (7s) Arms close-up + "If your arms look like this. Simply join our
//           beginner Tai Chi Challenge this Monday, July 27th"
//   5. (6s) Happy squat + "Forget the diets and cardio to get a beautifully
//           toned body in exactly 28 days"
//
// Usage: nohup bun run render ep2.tsx > output/formula-care/ep2/render.log 2>&1 &
// Cost:  ~$12-15 — 8 images (cached: $0) + 5 kling-v3 videos w/ audio + music

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const IMG_BASE = varg.imageModel("nano-banana-pro");
const AR = "9:16" as const;
const AUDIO_ON = { varg: { generate_audio: true } };

// ── Photo references ────────────────────────────────────────────────────
const A1_PHOTO = "https://uu.varg.ai/1784576476121_3hb7fv71.jpeg";
const A2_PHOTO = "https://uu.varg.ai/1784576485522_vbgd4amk.jpeg";

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character profile cards (identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const a1Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same grey hair, same body shape. Overweight woman in her late 50s with grey hair. She wears a simple dark sports bra top and snug high-waisted dark athletic shorts (underwear-style workout shorts), barefoot. Her belly is fully exposed and visible, arms bare, legs bare from mid-thigh down. Standing straight facing camera, neutral relaxed pose, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A1_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const a2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same hair, same slim build. Slim Asian fitness trainer in her 30s. She wears a fitted fitness uniform: sporty crop top and full-length leggings in matching color, clean athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A2_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location card
// ═════════════════════════════════════════════════════════════════════════

const gymLoc = Image({
  prompt:
    "Empty modern gym interior with huge floor-to-ceiling windows letting in bright natural daylight, green trees visible outside. Light wooden floor, a few yoga mats rolled in a corner, rack of dumbbells along one wall, mirrors on the opposite wall. No people. Clean airy atmosphere, warm daylight, photorealistic, 9:16 portrait framing",
  model: IMG_BASE,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites (identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const SAME =
  "First reference image is Woman A (overweight late-50s woman with grey hair, dark sports bra and dark athletic shorts, barefoot). Second reference image is Woman B (slim Asian trainer in her 30s in fitted fitness uniform with sneakers). Third reference image is the gym location with huge windows. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the gym exactly as in the location reference.";

const scene1 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Woman A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside her closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene2 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing away from the camera, seen from behind head to toe in her dark sports bra and dark athletic shorts, her bare legs visible. Woman B crouches beside her on the left, pointing a finger toward Woman A's hips and thighs while looking at the camera. Huge windows with daylight in the background, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene3 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing the camera head to toe, neutral stoic expression, her bare belly fully visible above the dark athletic shorts, hips and part of her rear visible. Woman B stands beside her on the left, slightly crouched, pointing an open hand at Woman A's belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene4 = Image({
  prompt: {
    text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both women. Woman A faces the camera holding her right arm raised out to the side, the soft loose skin of her bare upper arm clearly visible, part of her belly visible below. Woman B stands on the left, pointing at Woman A's raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene5 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Woman A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside her facing the camera, laughing warmly and giving Woman A an encouraging thumbs-up. Both women look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
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
The older grey-haired woman performs slow controlled squats, bending her knees and rising, arms stretched forward, concentrated effort on her face.
The slim Asian trainer stands beside her facing the camera, gesturing warmly while speaking.
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

// Scene 2 (4s): Back view + booty line
const vid2 = Video({
  prompt: {
    text: `Same gym with huge windows. The older grey-haired woman stands still with her back to the camera, full body visible.
The slim Asian trainer crouches beside her on the left, pointing toward the woman's hips, looking at the camera while speaking.
Subtle natural movement, the trainer's hand gestures as she talks.
Static camera, full-body framing.
The trainer says matter-of-factly: "If your booty looks like this."
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
The older grey-haired woman stands facing the camera with a neutral stoic expression, standing still, her bare belly visible.
The slim Asian trainer stands beside her, slightly crouched, gesturing with an open hand toward the woman's midsection while looking at the camera.
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
const vid4 = Video({
  prompt: {
    text: `Same gym, tight close-up on both women's upper bodies.
The older grey-haired woman holds her arm raised out to the side, soft upper arm visible, standing still.
The slim Asian trainer points at the raised arm, then looks directly into the camera speaking with confident energy.
Static intimate close-up framing.
The trainer says clearly and confidently: "If your arms look like this. Simply join our beginner Tai Chi Challenge this Monday, July 27th."
Soft gym ambient, the trainer's voice is clear and motivating.`,
    images: [scene4],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 7,
  providerOptions: AUDIO_ON,
});

// Scene 5 (6s): Happy finish + 28 days promise
const vid5 = Video({
  prompt: {
    text: `Same gym with huge windows, medium-wide shot.
The older grey-haired woman rises up from a squat and stands tall, breaking into a big proud smile, raising her arms slightly in triumph.
The slim Asian trainer beside her laughs warmly, gives her a thumbs-up, both women genuinely happy and celebrating.
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

// Auto-trim: speechRange() returns the actual spoken-word boundaries
// (first word start → last word end) from whisper word timings. We add a
// small lead-in (0.15s) so the gesture before the line is preserved, and a
// 0.1s tail so the line doesn't cut off abruptly. This replaces the old
// hardcoded cutFrom/cutTo values (measured via ffmpeg silencedetect) with
// accurate per-clip speech boundaries — no dead air at clip starts.
//
// Old hardcoded trims (for reference):
//   vid1: cut 0.2-5.6  vid2: cut 0.2-2.9  vid3: cut 1.5-4.0
//   vid4: cut 0.9-7.0  vid5: cut 0.3-6.0

const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 64,
} as const;

const ep2Vids = [vid1, vid2, vid3, vid4, vid5];
const ep2Max = [6, 4, 4, 7, 6];

const ep2Timings = await Promise.all(
  ep2Vids.map(async (vid, i) => {
    const r = await vid.audio.speechRange({ pad: 0.15 });
    const start = r ? Math.max(0, r.start - 0.15) : 0;
    const end = r ? Math.min(ep2Max[i]!, r.end + 0.1) : ep2Max[i]!;
    return { start, end, duration: end - start };
  }),
);

console.log(
  `ep2 clip durations: ${ep2Timings.map((t) => t.duration.toFixed(2)).join(", ")}`,
);

// Exported for formula-care-full.tsx — prompts stay here (single source of
// truth → cache hits). `clips` is a plain array of <Clip> elements; the full
// video spreads them under one <Render> with cumulative Music start offsets.
export const clips = ep2Vids.map((vid, i) => {
  const { start, end } = ep2Timings[i]!;
  return (
    <Clip cutFrom={start} cutTo={end} duration={end - start}>
      {vid}
      <Captions src={vid.audio} {...CAPTION_STYLE} />
    </Clip>
  );
});

export const duration = ep2Timings.reduce((sum, t) => sum + t.duration, 0);

// Music config (without `start`) — single source of truth for the prompt.
// formula-care-full.tsx spreads this and adds a cumulative `start` offset.
export const musicProps = {
  prompt:
    "Upbeat gentle background fitness music, soft piano and light percussion, positive uplifting mood, energetic but not overwhelming",
  model: varg.musicModel("music_v1"),
  volume: 0.1,
  ducking: true,
  duration,
} as const;

export const music = <Music {...musicProps} />;

export default (
  <Render width={1080} height={1920} fps={30}>
    {music}
    {clips}
  </Render>
);
