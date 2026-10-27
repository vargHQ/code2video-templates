/** @jsxImportSource vargai */
// Formula Care — Episode 3: "The Bet" (Block 2 of the reference video, ~33s)
//
// Mirror-selfie before/after story in the sunroom. Two composites
// (before / after day-28), 4 kling-v3 clips with native dialogue audio.
// Captions via vid.audio — Whisper transcribes each clip's audio
// automatically. No manual SRT file, no two-pass workflow.
//
// IMPORTANT: All Image prompts are byte-identical to
// ref-images.ts so they hit the cache ($0)
// and reproduce the exact approved stills.
//
// Line assignment (user's shot-by-shot script; casting/location per the
// reference video):
//   2.1a (10s, before): T  "Sarah and I just made a bet..."
//   2.1b (8s,  before): S  "If my body stays the same... firm things up."
//                       T  "Challenge accepted."
//   2.2a (9s,  after):  S  "Day 28 and I really thought I would win..."
//   2.2b (8s,  after):  T  "See? Women over 50..." (both nod) "...gentle flow."
//
// Usage: nohup bun run render ep3.tsx > output/formula-care/ep3/render.log 2>&1 &
// Cost:  ~$5-6 — images cached ($0) + 35s kling-v3 native audio (14¢/s) + music

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const AR = "9:16" as const;
const AUDIO_ON = { varg: { generate_audio: true } };

// ── Reference frames from the source video (uploaded to varg files) ──────
const REF_MIRROR_BEFORE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_19e299bcfac7.jpg"; // ref_25s
const REF_MIRROR_AFTER = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_71e156edd9d7.jpg"; // ref_40s

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character cards (byte-identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

// T: slim Asian trainer ~40s, black ponytail
const tCard = Image({
  prompt: {
    text: "Full-body character reference card of the slim Asian woman on the LEFT side of the photo (the one holding the phone): same face, same black ponytail, same athletic build. She wears a navy blue sports bra and matching navy full-length leggings, barefoot. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S "before": plus-size Asian woman ~50s, long grey-streaked hair
const sBeforeCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body shape. Plus-size Asian woman in her 50s. She wears a heather grey tank top and black loose shorts, barefoot. Standing straight facing camera, relaxed neutral expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S "after": same woman, emerald green set, toned (day 28)
const sAfterCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body. She wears an emerald green sports bra and matching emerald green full-length leggings, barefoot. Standing straight facing camera, radiant happy expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_AFTER],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location card (byte-identical prompt → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const locSunroom = Image({
  prompt: {
    text: "Recreate this interior location exactly but completely EMPTY, no people, no reflections of people in the mirror: bright home sunroom with large white-framed windows, green garden visible outside, warm wooden floor, a tall fiddle-leaf fig plant and several potted plants on stands, a full-height mirror in a thin wooden frame reflecting the room. Clean airy daylight atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites (byte-identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const SAME_B2_BEFORE =
  "First reference image is Woman T (slim Asian trainer, black ponytail, navy sports bra and navy leggings). Second reference image is Woman S (plus-size Asian woman in her 50s, long grey-streaked hair, grey tank top and black shorts). Third reference image is the bright sunroom with the full-height mirror. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the room exactly as in the location reference.";

// 2A: before — mirror selfie, T holds phone, S beside her
const mirrorBefore = Image({
  prompt: {
    text: `${SAME_B2_BEFORE} Vertical mirror selfie shot: both women stand side by side facing the full-height mirror, seen as their reflection head to toe. Woman T on the left holds an iPhone up at chest height taking the mirror selfie, smiling as she speaks. Woman S on the right stands relaxed next to her, slight skeptical smile, arms loose. Bright natural daylight from the windows, plants around, warm candid home atmosphere, photorealistic`,
    images: [tCard, sBeforeCard, locSunroom],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const SAME_B2_AFTER =
  "First reference image is the BEFORE photo: both women taking a mirror selfie in the sunroom. Second reference image is Woman S's day-28 look: emerald green sports bra and emerald green leggings, toned figure. Reproduce the first reference EXACTLY — same camera position, same camera distance, same framing scale, same room, same mirror, same plants, and both women standing on EXACTLY the same floor spots in the same poses.";

// 2B: after (day 28) — chained from mirrorBefore so positions/framing match 1:1
const mirrorAfter = Image({
  prompt: {
    text: `${SAME_B2_AFTER} Change ONLY the following: Woman T on the left now wears a black sports bra and black leggings instead of navy, still holding the iPhone up at chest height in the same selfie pose. Woman S on the right now looks exactly as in the second reference — emerald green sports set, toned figure — with a glowing proud happy smile, standing on the same floor spot in the same pose. Everything else — positions, camera, framing, lighting, room — stays identical to the first reference. Photorealistic`,
    images: [mirrorBefore, sAfterCard],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 4 — Videos: kling-v3 native audio, dialogue in prompts
// ═════════════════════════════════════════════════════════════════════════

// 2.1a (10s): T sets up the bet
const vid1 = Video({
  prompt: {
    text: `Bright home sunroom with large white windows, green garden outside, potted plants, warm wooden floor. Vertical mirror selfie shot: both women seen as their reflection in the full-height mirror.
The slim Asian trainer with the black ponytail on the left holds an iPhone up at chest height filming the mirror selfie, speaking cheerfully toward the mirror.
The plus-size woman with long grey-streaked hair on the right stands relaxed beside her, listening with a slight skeptical smile.
Static camera, candid home atmosphere, natural daylight.
The trainer says brightly: "Sarah and I just made a bet. I promised she would completely tone her body in 28 days if she drops the endless 10K steps and switches to Tai Chi."
Quiet room ambience.`,
    images: [mirrorBefore],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 10,
  providerOptions: AUDIO_ON,
});

// 2.1b (8s): S doubts + T "Challenge accepted."
const vid2 = Video({
  prompt: {
    text: `Same bright sunroom, same vertical mirror selfie framing: both women seen as their reflection in the full-height mirror.
The slim Asian trainer with the black ponytail on the left keeps holding the iPhone up, now listening.
The plus-size woman with long grey-streaked hair on the right speaks toward the mirror with a playful skeptical expression, shrugging lightly.
Static camera, candid home atmosphere, natural daylight.
The grey-haired woman says skeptically: "If my body stays the same, this whole program is free. There is zero chance slow movements will actually firm things up."
Then the trainer replies with a confident grin: "Challenge accepted."
Quiet room ambience.`,
    images: [mirrorBefore],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 8,
  providerOptions: AUDIO_ON,
});

// 2.2a (9s): S day-28 result
const vid3 = Video({
  prompt: {
    text: `Same bright sunroom, same vertical mirror selfie framing weeks later: both women seen as their reflection in the full-height mirror.
The slim Asian trainer on the left now wears a black sports set and holds the iPhone up filming.
The woman with long grey-streaked hair on the right wears an emerald green sports set and glows with proud happiness, speaking excitedly toward the mirror, gesturing lightly.
Static camera, candid home atmosphere, natural daylight.
The woman in green says joyfully: "Day 28 and I really thought I would win the bet. I feel incredibly light, and my sister actually asked if I lost 20 pounds."
Quiet room ambience.`,
    images: [mirrorAfter],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 9,
  providerOptions: AUDIO_ON,
});

// 2.2b (8s): T conclusion, both nod
const vid4 = Video({
  prompt: {
    text: `Same bright sunroom, same vertical mirror selfie framing: both women seen as their reflection in the full-height mirror.
The slim Asian trainer in the black sports set on the left holds the iPhone up and speaks warmly toward the mirror.
The woman in the emerald green sports set on the right smiles proudly.
Mid-clip both women turn slightly toward each other and nod in agreement, then look back at the mirror.
Static camera, candid home atmosphere, natural daylight.
The trainer says warmly: "See? Women over 50 do not need exhausting cardio." Both women nod at each other. The trainer adds: "They just need the right gentle flow."
Quiet room ambience.`,
    images: [mirrorAfter],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 8,
  providerOptions: AUDIO_ON,
});

// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION — hard cut at the before/after jump, auto-trimmed via speechRange
// ═════════════════════════════════════════════════════════════════════════

// Auto-trim: speechRange() returns the actual spoken-word boundaries from
// whisper word timings. 0.15s lead-in preserves the gesture before the line,
// 0.1s tail avoids abrupt cutoff. Replaces the old hardcoded trims (measured
// via ffmpeg silencedetect in a two-pass workflow) with accurate per-clip
// speech boundaries — no dead air at clip starts.
//
// Old hardcoded trims (for reference):
//   vid1: cut 0.30-10.04 (9.74s)  vid2: cut 0.58-8.04 (7.46s)
//   vid3: cut 0.68-9.04  (8.36s)  vid4: cut 0.00-7.93 (7.93s)

const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 60,
} as const;

const ep3Vids = [vid1, vid2, vid3, vid4];
const ep3Max = [10, 8, 9, 8];

const ep3Timings = await Promise.all(
  ep3Vids.map(async (vid, i) => {
    const r = await vid.audio.speechRange({ pad: 0.15 });
    const start = r ? Math.max(0, r.start - 0.15) : 0;
    const end = r ? Math.min(ep3Max[i]!, r.end + 0.1) : ep3Max[i]!;
    return { start, end, duration: end - start };
  }),
);

console.log(
  `ep3 clip durations: ${ep3Timings.map((t) => t.duration.toFixed(2)).join(", ")}`,
);

// Exported for formula-care-full.tsx — prompts stay here (single source of
// truth → cache hits). `clips` is a plain array of <Clip> elements; the full
// video spreads them under one <Render> with cumulative Music start offsets.
export const clips = ep3Vids.map((vid, i) => {
  const { start, end } = ep3Timings[i]!;
  return (
    <Clip cutFrom={start} cutTo={end} duration={end - start}>
      {vid}
      <Captions src={vid.audio} {...CAPTION_STYLE} />
    </Clip>
  );
});

export const duration = ep3Timings.reduce((sum, t) => sum + t.duration, 0);

// Music config (without `start`) — single source of truth for the prompt.
// formula-care-full.tsx spreads this and adds a cumulative `start` offset.
export const musicProps = {
  prompt:
    "Soft warm acoustic home workout background music, light guitar and gentle rhythm, hopeful positive mood, unobtrusive",
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
