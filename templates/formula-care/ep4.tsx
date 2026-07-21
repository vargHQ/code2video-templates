/** @jsxImportSource vargai */
// Formula Care — Episode 4: "Morning Stiffness" (Block 3 of the reference, ~14s)
//
// Misty porch tai chi. VO-driven block: one Speech call with 2 segments
// (T2's voiceover), muted wide kling clip under the VO, plus one short
// native-audio clip where S2 says "It feels so good" to camera.
//
//   Clip 1 (VO seg 0): wide synchronized tai chi, muted kling
//                      "If you wake up feeling too stiff to move..."
//   Clip 2 (native):   S2 mid-flow, delighted: "It feels so good."
//   Clip 3 (VO seg 1): back to the wide tai chi (tail of the same clip)
//                      "We start this Monday with the ultimate spring reset challenge."
//
// IMPORTANT: Image prompts are byte-identical to
// ref-images.ts → cache hits ($0),
// reproducing the approved stills.
//
// New-SDK features used (same as updated ep3):
//   - Speech segments: one call, per-segment timing drives clip durations
//   - audio: "native" on the S2 clip (replaces keepAudio+generate_audio)
//   - Captions src={segment} / src={vid.audio} per clip
//   - Music without duration → resolves to final timeline length
//
// Usage: nohup bun run render ep4.tsx > output/formula-care/ep4/render.log 2>&1 &
// Cost:  ~$2.2 — images cached ($0) + 12s muted kling (11.2¢/s) + 5s native
//        kling (14¢/s) + speech + music

import { Captions, Clip, Image, Music, Render, Speech, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const AR = "9:16" as const;

// ── Reference frames from the source video (uploaded to varg files) ──────
const REF_PORCH = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_a59f5154fc3d.jpg"; // ref_55s
const REF_S2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_36f0c2f3aa92.jpg"; // ref_84s
const REF_T2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_294182c8eb03.jpg"; // ref_94s

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character cards (byte-identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

// T2: slim Asian woman ~60s, long grey hair in low ponytail
const t2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same long silver-grey hair pulled back in a low ponytail, same slim toned build. Fit Asian woman in her 60s. She wears an olive green racerback sports tank and black bike shorts, grey athletic sneakers. Standing straight facing camera, warm calm expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_T2_CLOSE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S2: plus-size woman ~50s, curly auburn-brown hair
const s2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same shoulder-length curly auburn-brown hair, same body shape. Plus-size woman in her 50s. She wears a heather grey crew-neck t-shirt and black full-length leggings, grey athletic sneakers. Standing straight facing camera, friendly open expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_S2_CLOSE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location card (byte-identical prompt → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const locPorch = Image({
  prompt: {
    text: "Recreate this location exactly but completely EMPTY, no people: covered wooden porch deck of a mountain cabin, thick timber posts and beams, weathered wooden deck boards, surrounded by tall coniferous forest in dense morning fog, soft diffused grey-blue light, mist drifting between the pine trees. Serene moody atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_PORCH],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites (byte-identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const SAME_B3 =
  "First reference image is Woman T2 (fit Asian woman in her 60s, long silver-grey hair in a low ponytail, olive green sports tank and black bike shorts). Second reference image is Woman S2 (plus-size woman in her 50s, curly auburn-brown hair, grey t-shirt and black leggings). Third reference image is the covered wooden porch in the misty coniferous forest. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the porch exactly as in the location reference.";

// 3A: wide — both doing synchronized tai chi, T2 front, S2 behind-right
const porchTaiChi = Image({
  prompt: {
    text: `${SAME_B3} Wide shot on the misty porch: both women barefoot performing the exact same slow tai chi movement in unison, both palms raised forward at shoulder height in a gentle push, knees softly bent, weight shifted to one leg. Woman T2 in the foreground left, Woman S2 slightly behind her on the right mirroring the pose, focused peaceful faces. Fog and pine trees behind them, soft diffused morning light, photorealistic`,
    images: [t2Card, s2Card, locPorch],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// 3B: medium — S2 mid-flow, delighted, T2 partially in frame
const porchS2Joy = Image({
  prompt: {
    text: `${SAME_B3} Medium shot on the misty porch: Woman S2 in the center mid tai chi flow, arms sweeping gracefully to one side, genuine delighted smile as if saying how good it feels. Woman T2 visible in the left foreground slightly out of focus continuing her own flow. Fog and pine forest background, soft diffused light, photorealistic`,
    images: [t2Card, s2Card, locPorch],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 4 — T2 voiceover: two Speech calls (gateway provider returns no
// alignment metadata, so Speech segments are unavailable — one call per
// VO line gives us exact durations the same way)
// ═════════════════════════════════════════════════════════════════════════

const vo1 = await Speech({
  model: varg.speechModel("eleven_v3"),
  voice: "rachel",
  children:
    "If you wake up feeling too stiff to move, stop forcing heavy workouts. Seven minutes of Tai Chi heals your joints and melts the fat.",
});

const vo2 = await Speech({
  model: varg.speechModel("eleven_v3"),
  voice: "rachel",
  children: "We start this Monday with the ultimate spring reset challenge.",
});

console.log(`VO1: ${vo1.duration.toFixed(2)}s, VO2: ${vo2.duration.toFixed(2)}s`);

// ═════════════════════════════════════════════════════════════════════════
// STEP 5 — Videos
// ═════════════════════════════════════════════════════════════════════════

// Wide tai chi (12s, MUTED — VO covers it; 11.2¢/s without native audio).
// One long take: the head feeds Clip 1 (under VO seg 0), the tail feeds
// Clip 3 (under VO seg 1). The user's shot notes: long slow step forward
// barefoot, arms raised with spread fingers.
const vidWide = Video({
  prompt: {
    text: `Covered wooden porch of a mountain cabin surrounded by tall pine forest in dense morning fog, soft diffused grey-blue light.
Two women barefoot perform the exact same slow tai chi movement in perfect unison: a long slow step forward, arms rising upward with fingers gently spread, then palms pushing forward at shoulder height, knees softly bent, weight shifting smoothly.
The fit grey-haired Asian woman in the olive tank leads in the front left, the plus-size woman with curly auburn hair mirrors her slightly behind on the right.
Slow graceful continuous movement, both women calm and focused, mist drifting between the pines behind them.
Static wide shot, serene meditative atmosphere.`,
    images: [porchTaiChi],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false,
  duration: 12,
});

// S2 close (5s, NATIVE audio): "It feels so good."
const vidS2 = Video({
  prompt: {
    text: `Same misty porch, medium shot. The plus-size woman with curly auburn-brown hair in the grey t-shirt flows through a slow tai chi movement, arms sweeping gracefully to one side.
Mid-movement she breaks into a genuine delighted smile, glances toward the camera and says warmly: "It feels so good."
The grey-haired woman in the olive tank is visible in the left foreground, softly out of focus, continuing her own flow.
Static camera, fog and pine forest behind, soft diffused morning light, serene atmosphere.
Quiet forest ambience, birds faint in the distance.`,
    images: [porchS2Joy],
  },
  model: varg.videoModel("kling-v3"),
  duration: 5,
  audio: "native",
});

// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION
// ═════════════════════════════════════════════════════════════════════════

// Clip 1/3 durations come straight from the resolved VO durations — no
// manual measurement. The 12s wide take is split: head under vo1, tail
// under vo2. Clip 2 runs the full 5s native clip on pass 1; trim after QA
// if S2's line leaves dead air.

const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 60,
} as const;

// Exported for formula-care-full.tsx — prompts stay here (single source of
// truth → cache hits). `clips` is a plain array of <Clip> elements; the full
// video spreads them under one <Render> with cumulative Music start offsets.
export const clips = [
  // 3.1: wide synchronized tai chi under VO line 1
  <Clip cutFrom={0.3} cutTo={0.3 + vo1.duration} duration={vo1.duration}>
    {vidWide}
    {vo1}
    <Captions src={vo1} {...CAPTION_STYLE} />
  </Clip>,

  // 3.2: S2 to camera — "It feels so good." (native audio)
  <Clip duration={5}>
    {vidS2}
    <Captions src={vidS2.audio} {...CAPTION_STYLE} />
  </Clip>,

  // 3.3: back to the wide take (its tail) under VO line 2
  <Clip cutFrom={12 - vo2.duration} cutTo={12} duration={vo2.duration}>
    {vidWide}
    {vo2}
    <Captions src={vo2} {...CAPTION_STYLE} />
  </Clip>,
];

// vo1.duration + 5 + vo2.duration — resolved at module load (top-level await)
export const duration = vo1.duration + 5 + vo2.duration;

// Music config (without `start`) — single source of truth for the prompt.
// formula-care-full.tsx spreads this and adds a cumulative `start` offset.
export const musicProps = {
  prompt:
    "Calm meditative ambient music with soft flute and gentle nature pads, peaceful morning mood, slow and serene, unobtrusive",
  model: varg.musicModel("music_v1"),
  volume: 0.12,
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
