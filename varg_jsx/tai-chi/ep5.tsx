/** @jsxImportSource vargai */
// Formula Care — Episode 5: "No Excuses" (Block 4 of the reference, ~70-80s)
//
// Forest-walk dialogue, the longest block: 12 kling-v3 clips with native
// dialogue audio, alternating 4 camera setups:
//   walk-wide (4 clips) / OTS S2 (3) / solo T2 (3) / standing two-shot (2)
//
// NEW-SDK one-pass pipeline (no manual silencedetect, no second render):
//   - async <DialogueClip> component: awaits vid.audio.speechRange() and
//     trims each clip to its spoken line automatically
//   - Captions src={vid.audio} per clip — Whisper transcribes automatically
//   - audio: "native" instead of keepAudio+generate_audio
//   - Music without duration → resolves to final timeline length
//
// IMPORTANT: Image prompts are byte-identical to
// ref-images.ts → cache hits ($0),
// reproducing the approved stills (incl. the locTrail-as-last-reference
// chaining pattern for background color consistency).
//
// Moderation rule: body words ("menopause belly") ONLY inside spoken
// dialogue lines, never in scene/image descriptions.
//
// Usage: nohup bun run render ep5.tsx > output/formula-care/ep5/render.log 2>&1 &
// Cost:  ~$13-14 — images cached ($0) + 99s kling-v3 native audio (14¢/s) + music

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const KLING = varg.videoModel("kling-v3");
const AR = "9:16" as const;

// ── Reference frames from the source video (uploaded to varg files) ──────
const REF_S2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_36f0c2f3aa92.jpg"; // ref_84s
const REF_T2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_294182c8eb03.jpg"; // ref_94s
const REF_WALK_WIDE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_ba8e2a4e238a.jpg"; // ref_65s

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

const locTrail = Image({
  prompt: {
    text: "Recreate this location exactly but completely EMPTY, no people: a dirt walking trail through a sunlit summer deciduous forest, oaks and maples, lush green ferns and wildflowers along the edges, dappled golden sunlight filtering through the canopy, the path receding into the distance. Fresh warm atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_WALK_WIDE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites (byte-identical prompts → cache hit)
// ═════════════════════════════════════════════════════════════════════════

const SAME_B4 =
  "First reference image is Woman T2 (fit Asian woman in her 60s, long silver-grey hair, olive green sports tank and black bike shorts, grey sneakers). Second reference image is Woman S2 (plus-size woman in her 50s, curly auburn-brown hair, grey t-shirt and black leggings, sneakers). Third reference image is the sunlit forest trail. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the trail exactly as in the location reference.";

// 4A: wide two-shot — walking toward camera side by side
const walkWide = Image({
  prompt: {
    text: `${SAME_B4} Wide shot on the forest trail: both women walking toward the camera side by side mid-stride, Woman T2 on the left with her silver-grey hair pulled back in a low ponytail exactly as in her reference card, Woman S2 on the right, turned slightly toward each other in friendly conversation. Dappled sunlight through the trees, ferns along the path, candid documentary feel, photorealistic`,
    images: [t2Card, s2Card, locTrail],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// 4D: standing two-shot — spatial anchor, chained from walkWide + locTrail
const standTwoShot = Image({
  prompt: {
    text: `First reference image shows two women walking side by side on a sunlit forest trail: Woman T2 on the left (fit Asian woman in her 60s, silver-grey hair in a low ponytail, olive green sports tank, black bike shorts, grey sneakers) and Woman S2 on the right (plus-size woman in her 50s, curly auburn-brown hair, grey t-shirt, black leggings, sneakers). Second reference image is the empty forest trail location — its colors, lighting and atmosphere are the ground truth for the background. Render the SAME two women at the SAME spot on the SAME trail moments later: they have stopped walking and now stand still facing each other in conversation, Woman T2 on the left gesturing mid-explanation, Woman S2 on the right listening with a hopeful smile, hands relaxed, full-body framing. The background — trees, ferns, path, lighting, color tone — must match the second reference location exactly. Photorealistic`,
    images: [walkWide, locTrail],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// 4B: OTS close-up on S2 — chained from standTwoShot: same spot, same positions.
// s2Card rides along as the identity ground truth: close-ups magnify chain
// drift (gen-3 of the chain), so the face must be pinned to the card.
const otsS2 = Image({
  prompt: {
    text: `First reference image shows two women standing facing each other on a sunlit forest trail: Woman T2 on the left (silver-grey low ponytail, olive green tank) and Woman S2 on the right (curly auburn-brown hair, grey t-shirt). Second reference image is Woman S2's character card — her face, age and features in this card are the ground truth: reproduce this exact woman, a plus-size woman in her 50s. Third reference image is the empty forest trail location — its colors, lighting and atmosphere are the ground truth for the background. Render the SAME moment at the SAME spot on the trail from a different camera angle: over-the-shoulder close-up shot from behind Woman T2's left shoulder looking at Woman S2. Woman S2 in sharp focus from the waist up, her face exactly matching the second reference card, speaking with an earnest questioning expression, gesturing with one hand. The back of Woman T2's head and shoulder fill the left foreground edge, softly blurred, her silver-grey ponytail catching the light. Both women keep exactly the same outfits and standing positions as in the first reference. Green forest bokeh background matching the third reference location's colors and light, warm dappled sunlight, photorealistic`,
    images: [standTwoShot, s2Card, locTrail],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// 4C: solo medium close-up of T2 — chained from standTwoShot: same spot, same
// positions. t2Card pins T2's face; S2's blurred shoulder/arm stays visible at
// the right frame edge (as in the reference video) so the shot reads as part
// of the conversation, not a lone monologue.
const soloT2 = Image({
  prompt: {
    text: `First reference image shows two women standing facing each other on a sunlit forest trail: Woman T2 on the left (silver-grey low ponytail, olive green tank, black bike shorts) and Woman S2 on the right (curly auburn-brown hair, grey t-shirt). Second reference image is Woman T2's character card — her face, age and features in this card are the ground truth: reproduce this exact woman, a fit Asian woman in her 60s. Third reference image is the empty forest trail location — its colors, lighting and atmosphere are the ground truth for the background. Render the SAME moment at the SAME spot on the trail from a different camera angle: medium close-up on Woman T2 from mid-thigh up, standing where she stands in the first reference, her face exactly matching the second reference card, speaking warmly toward Woman S2, hands gently gesturing in front of her as she explains. Woman S2 is mostly off-frame on the right, but the edge of her shoulder and upper arm in the grey t-shirt remains visible at the right edge of the frame, softly out of focus in the near foreground, showing she is standing right there listening. The sunlit green forest behind matches the third reference location's colors and light, softly blurred, calm confident presence, photorealistic`,
    images: [standTwoShot, t2Card, locTrail],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 4 — Videos: 12 kling-v3 clips, native dialogue audio
// ═════════════════════════════════════════════════════════════════════════

// Shared scene descriptions per camera setup
const WALK_SCENE = `Sunlit summer forest trail with oaks, ferns and dappled golden light.
Both women walk toward the camera side by side at a relaxed pace, the camera slowly dollying backward in front of them.
The fit grey-haired Asian woman in the olive tank and black bike shorts walks on the left, the plus-size woman with curly auburn hair in the grey t-shirt walks on the right, turned slightly toward each other in friendly conversation.
Candid documentary feel, natural walking rhythm, warm dappled sunlight.`;

const OTS_SCENE = `Sunlit forest trail, over-the-shoulder close-up from behind the grey-haired woman's blurred shoulder, looking at the curly-haired woman in the grey t-shirt, in sharp focus from the waist up.
Green forest bokeh, warm dappled sunlight, intimate conversational framing, static camera.`;

const SOLO_SCENE = `Sunlit forest trail, medium close-up on the fit grey-haired Asian woman in the olive tank, framed from mid-thigh up, speaking warmly toward her friend.
The friend's blurred shoulder and upper arm in a grey t-shirt stay visible at the right edge of the frame in the near foreground — she is standing right there listening; keep her shoulder in frame the whole time.
Softly blurred green forest behind, warm dappled light, calm confident presence, static camera.`;

const STAND_SCENE = `Sunlit forest trail, full-body two-shot: the two women stand facing each other in conversation, the grey-haired woman on the left gesturing as she explains, the curly-haired woman on the right listening.
Dappled sunlight, ferns along the path, static camera, candid documentary feel.`;

// 5.1 (8s, walk-wide): S2 loves the walks
const vid1 = Video({
  prompt: {
    text: `${WALK_SCENE}
The curly-haired woman says warmly, a bit wistfully: "I really love these walks, but let's be honest, I can't get out here every single day."
Soft forest ambience, birds, footsteps on dirt.`,
    images: [walkWide],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.2 (8s, walk-wide): S2 — not realistic
const vid2 = Video({
  prompt: {
    text: `${WALK_SCENE}
The curly-haired woman continues, counting off on her fingers with a resigned smile: "Between work, bad weather, and my knees acting up... it's just not realistic."
Soft forest ambience, footsteps on dirt.`,
    images: [walkWide],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.3 (8s, walk-wide): T2 — the biggest trap
const vid3 = Video({
  prompt: {
    text: `${WALK_SCENE}
The grey-haired woman replies with calm conviction, turning her head toward her friend: "And you have to force yourself. That's the biggest trap women over 50 fall into."
Soft forest ambience, footsteps on dirt.`,
    images: [walkWide],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.4 (8s, walk-wide): T2 — guilt and giving up
const vid4 = Video({
  prompt: {
    text: `${WALK_SCENE}
The grey-haired woman continues, gesturing gently with one hand while walking: "If you can't hit 10,000 steps outside, you feel guilty and just give up completely."
Soft forest ambience, footsteps on dirt.`,
    images: [walkWide],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.5 (8s, OTS S2): the guilt is exhausting
const vid5 = Video({
  prompt: {
    text: `${OTS_SCENE}
The curly-haired woman nods emphatically and says with earnest frustration: "Exactly, the guilt is exhausting. So what am I supposed to do if I'm stuck at home?"
Soft forest ambience.`,
    images: [otsS2],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.6 (10s, solo T2): the 7-minute routine
const vid6 = Video({
  prompt: {
    text: `${SOLO_SCENE}
She says with warm enthusiasm, gesturing softly: "That's exactly why I created the 7-minute Tai Chi walking routine. You do it right in your living room. No shoes. No equipment."
Soft forest ambience.`,
    images: [soloT2],
  },
  model: KLING,
  duration: 10,
  audio: "native",
});

// 5.7 (9s, solo T2): heals your joints
const vid7 = Video({
  prompt: {
    text: `${SOLO_SCENE}
She continues confidently, hands drawing a gentle arc: "It gives you incredible fat-burning benefits, but it actually heals your joints instead of pounding them on the pavement."
Soft forest ambience.`,
    images: [soloT2],
  },
  model: KLING,
  duration: 9,
  audio: "native",
});

// 5.8 (8s, OTS S2): just 7 minutes?
const vid8 = Video({
  prompt: {
    text: `${OTS_SCENE}
The curly-haired woman raises her eyebrows, skeptical but hopeful, and asks: "Wait... just 7 minutes in my living room? Is that really going to help me lose this stubborn menopause belly?"
Soft forest ambience.`,
    images: [otsS2],
  },
  model: KLING,
  duration: 8,
  audio: "native",
});

// 5.9 (10s, stand two-shot): cortisol
const vid9 = Video({
  prompt: {
    text: `${STAND_SCENE}
The grey-haired woman explains warmly, gesturing as she speaks: "Yes, because it actively lowers your cortisol. When you do gentle, mindful stepping at home, your nervous system relaxes."
The curly-haired woman listens closely, nodding.
Soft forest ambience.`,
    images: [standTwoShot],
  },
  model: KLING,
  duration: 10,
  audio: "native",
});

// 5.10 (6s, stand two-shot): lets the weight go
const vid10 = Video({
  prompt: {
    text: `${STAND_SCENE}
The grey-haired woman finishes her thought with a calm smile: "Your body stops holding onto stress and finally lets the weight go."
The curly-haired woman's face lights up with understanding.
Soft forest ambience.`,
    images: [standTwoShot],
  },
  model: KLING,
  duration: 6,
  audio: "native",
});

// 5.11 (7s, OTS S2): no excuses
const vid11 = Video({
  prompt: {
    text: `${OTS_SCENE}
The curly-haired woman smiles with growing resolve and says: "No gym, no bad weather excuses... I can definitely do 7 minutes in my living room."
Soft forest ambience.`,
    images: [otsS2],
  },
  model: KLING,
  duration: 7,
  audio: "native",
});

// 5.12 (9s, solo T2): prime era CTA
const vid12 = Video({
  prompt: {
    text: `${SOLO_SCENE}
She looks warmly toward the camera and says with inviting energy: "That's how you step into your prime era. Tap the link below to join our spring challenge and let's transform your body right from home."
Soft forest ambience.`,
    images: [soloT2],
  },
  model: KLING,
  duration: 9,
  audio: "native",
});

// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION — one-pass auto-trim via speechRange (new SDK)
// ═════════════════════════════════════════════════════════════════════════

const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 60,
} as const;

type Vid = typeof vid1;

const shots: Array<{ vid: Vid; max: number }> = [
  { vid: vid1, max: 8 },
  { vid: vid2, max: 8 },
  { vid: vid3, max: 8 },
  { vid: vid4, max: 8 },
  { vid: vid5, max: 8 },
  { vid: vid6, max: 10 },
  { vid: vid7, max: 9 },
  { vid: vid8, max: 8 },
  { vid: vid9, max: 10 },
  { vid: vid10, max: 6 },
  { vid: vid11, max: 7 },
  { vid: vid12, max: 9 },
];

// Resolve all speech ranges at module scope (top-level await) so clip
// durations are known up front — needed for the Music start offset schedule
// in formula-care-full.tsx. speechRange() runs whisper + word timings under
// the resolver (cached); 0.15s lead-in, 0.1s tail.
const timings = await Promise.all(
  shots.map(async ({ vid, max }) => {
    const r = await vid.audio.speechRange({ pad: 0.15 });
    const start = r ? Math.max(0, r.start - 0.15) : 0;
    const end = r ? Math.min(max, r.end + 0.1) : max;
    return { start, end, duration: end - start };
  }),
);

console.log(
  `ep5 clip durations: ${timings.map((t) => t.duration.toFixed(2)).join(", ")}`,
);

// Exported for formula-care-full.tsx — prompts stay here (single source of
// truth → cache hits). `clips` is a plain array of <Clip> elements; the full
// video spreads them under one <Render> with cumulative Music start offsets.
export const clips = shots.map(({ vid }, i) => {
  const { start, end } = timings[i]!;
  return (
    <Clip cutFrom={start} cutTo={end} duration={end - start}>
      {vid}
      <Captions src={vid.audio} {...CAPTION_STYLE} />
    </Clip>
  );
});

export const duration = timings.reduce((sum, t) => sum + t.duration, 0);

// Music config (without `start`) — single source of truth for the prompt.
// formula-care-full.tsx spreads this and adds a cumulative `start` offset.
export const musicProps = {
  prompt:
    "Warm organic acoustic folk background music, gentle fingerpicked guitar and soft strings, hopeful outdoorsy mood, steady calm energy, unobtrusive",
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
