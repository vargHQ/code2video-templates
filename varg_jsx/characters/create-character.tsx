/** @jsxImportSource vargai */
// Character Template v4 — AI Persona Showcase Reel
//
// Structure (from ai_persona_script_v4):
//   ACT 1 — MEET THE PERSONA
//     Seg 0: Intro name drop           (VEED talking)
//     Seg 1: Full body — the look      (Kling v3 animated)
//     Seg 2: Close-up — the details    (Kling v3 animated)
//     Seg 3: Rotation — every angle    (Kling v3 animated)
//     Seg 4: Hook line — identity      (VEED talking)
//   ACT 2 — VOICE RANGE
//     Seg 5: Excited                   (VEED talking)
//     Seg 6: Calm / trustworthy        (VEED talking)
//     Seg 7: Playful                   (VEED talking)
//   ACT 3 — FIT & CLOSE
//     Seg 8: Niche fit                 (Kling v3 animated)
//     Seg 9: CTA                       (VEED talking)
//     End card: 3s silent hold         (static image)
//
// Rules: Hard cuts only. ~2s per segment. Audio drives all durations.
// All image prompts preserved character-for-character from v3 for cache hits.
//
// Usage:
//   nohup bun run render characters/create-character.tsx --verbose \
//     -o output/characters/sarah-casual/character-v4.mp4 \
//     > output/characters/sarah-casual/render-v4.log 2>&1 &
//
// Cost: ~965 credits ($9.65) — 9 cached images, 2 new images, 6 VEED, 4 Kling v3
//
// KNOWN ISSUES:
// - Lipsync desync: VEED Fabric talking clips may have audio/video duration mismatch.
//   The speech segment audio duration (from ElevenLabs) doesn't always match the
//   video duration that VEED generates. This causes lip movement to drift out of
//   sync with the voiceover, especially on shorter segments (<2s). Possible fixes:
//     1. Pad short speech segments with a brief pause to give VEED more room
//     2. Use sync-v2-pro as a second-pass lipsync instead of VEED Fabric
//     3. Ensure Kling duration = ceil(segment.duration) so video >= audio (done)
//   For Kling clips: duration is now Math.ceil(segment.duration) with min 3s,
//   and NO cutFrom/cutTo trimming — lets the video match audio naturally.
// - 4K images exceed fal's 10MB upload limit for Kling v3. Workaround: generate
//   separate 2K versions (IMG_OPTS_2K) for Kling input images.

import { Captions, Clip, Image, Music, Render, Speech, Video } from "vargai/react";
import { createVarg, elevenlabs } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ═══════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════

const CONFIG = {
  name: "sarah-casual",
  referenceImage: "https://s3.varg.ai/person.png",
  voiceId: "jqcCZkN6Knx8BJ5TBdYR",
  aspectRatio: "9:16" as const,
  resolution: "4K" as const,

  characterName: "Sarah",
  age: "twenty-four",
  vibe: "your girl next door",

  description:
    "young woman, mid-20s, natural skin with visible pores, warm complexion, " +
    "relaxed confident expression",
  outfitDescription:
    "casual everyday outfit matching the reference — same fabric, same colors, " +
    "same fit, same proportions",

  primaryNiche: "skincare",
  niches: "skincare, beauty, wellness, and lifestyle",
};

// ═══════════════════════════════════════════════════════════════════════
// SPEECH — ~2s per segment, tight cuts
// ═══════════════════════════════════════════════════════════════════════

const SPEECH = [
  // ACT 1 — MEET THE PERSONA
  `I'm ${CONFIG.characterName}. I'm ${CONFIG.age}, ${CONFIG.vibe}.`,           // 0 — intro
  "Here's my full look.",                                                       // 1 — full body
  "Every detail, up close.",                                                    // 2 — close-up
  "And from every angle.",                                                      // 3 — rotation
  "Here are three examples of my campaigns.",                                    // 4 — hook line

  // ACT 2 — VOICE RANGE
  "Oh my god, you need to try this!",                                           // 5 — excited
  "I've been using this for two weeks now.",                                     // 6 — calm
  "Why did nobody tell me about this sooner?",                                  // 7 — playful

  // ACT 3 — FIT & CLOSE
  `Perfect for ${CONFIG.niches}.`,                                              // 8 — niche fit
  "Want me on your next campaign? Let's go.",                                   // 9 — CTA
];

// ═══════════════════════════════════════════════════════════════════════
// PROMPT CONSTANTS (identical to v3 — DO NOT CHANGE, these hit cache)
// ═══════════════════════════════════════════════════════════════════════

const CONSISTENCY =
  "consistent face, hairstyle, proportions, and body structure from the reference";

const OUTFIT_CONSISTENCY =
  "wearing the exact same outfit from the reference images, including the same " +
  "colors, patterns, textures, and fit";

const PHOTOGRAPHY =
  "Photorealistic, shot on medium format film. Natural skin texture with visible " +
  "pores — not airbrushed.";

// ═══════════════════════════════════════════════════════════════════════
// IMAGE PROMPTS — Preserved character-for-character from v3 for cache
// ═══════════════════════════════════════════════════════════════════════

// CACHED — Intro studio shot
const INTRO_SCENE = [
  `Cinematic portrait of the same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Modern studio with warm beige background, soft directional lighting.",
  "Natural confident pose, looking directly at camera with a warm genuine smile.",
  PHOTOGRAPHY,
  "Shot on Sony A7III with 85mm f/1.4 lens, shallow depth of field.",
].join(" ");

// CACHED — Full body front portrait
const FRONT_PROMPT = [
  `Photorealistic full-length front portrait of the same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `She is ${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Warm beige background color with a soft light shadow on the left side.",
  "Clean, minimal studio lighting. Natural relaxed posture, hands by her sides.",
  "High detail in clothing texture and stitching.",
  PHOTOGRAPHY, "High-end fashion photography.",
].join(" ");

// CACHED — Close-up editorial
const CLOSEUP_PROMPT = [
  `Close-up editorial studio shot of the person from the reference, ${OUTFIT_CONSISTENCY}.`,
  CONFIG.outfitDescription + ".",
  "The clothing must be replicated with perfect one-to-one consistency.",
  "Focus tightly on the upper part of the garment to clearly show texture, fibers,",
  "and the exact pattern from the reference.",
  "Maintain full consistency of the person's face, hair, and skin tone.",
  "Warm beige studio background with a soft left-side shadow.",
  "High-end fashion lighting, sharp detail.",
  PHOTOGRAPHY,
].join(" ");

// CACHED — Back view
const BACK_PROMPT = [
  "Full back-view studio shot of the same person from the reference,",
  "with perfect consistency of body proportions, hairstyle, and posture.",
  CONFIG.description + ".",
  "She is wearing the exact same outfit from the reference.",
  CONFIG.outfitDescription + ".",
  "Every detail of the clothing must match the reference outfit precisely.",
  "Warm beige background color with a soft shadow on the left side.",
  "Clean, soft studio lighting, neutral tones.",
  PHOTOGRAPHY, "High-resolution fashion photography.",
  "Natural relaxed back-facing pose, showing the full back clearly.",
].join(" ");

// NEW — Hook line (medium close-up, talking to camera, lean-in)
const HOOK_SCENE = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Medium close-up, slight off-center framing for editorial feel.",
  "Talking directly to camera with natural expression, slight lean-in for intimacy.",
  "Modern studio with warm beige background, soft directional lighting.",
  PHOTOGRAPHY,
  "Shot on Sony A7III with 85mm f/1.4 lens, shallow depth of field.",
].join(" ");

// CACHED — Product review (bedroom vanity, cream sweater)
const PRODUCT_SCENE = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  "Wearing a cozy oversized cream knit sweater, relaxed fit.",
  "Sitting at a bedroom vanity with warm fairy lights in background.",
  "Holding a skincare product in one hand near face, excited genuine expression.",
  "Natural iPhone selfie angle, warm golden bedroom lighting.",
  "UGC influencer style, authentic and relatable.",
  PHOTOGRAPHY,
].join(" ");

// CACHED — Testimonial (couch, sage green top)
const TESTIMONIAL_SCENE = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  "Wearing a fitted sage green ribbed top, clean smart-casual look.",
  "Sitting casually on a modern beige linen couch, cozy living room.",
  "Speaking to camera with calm sincere expression, one hand gesturing naturally.",
  "Soft diffused window light from the side, neutral warm tones.",
  "Testimonial style, conversational and trustworthy.",
  PHOTOGRAPHY,
].join(" ");

// CACHED — GRWM (bathroom, athleisure)
const GRWM_SCENE = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  "Wearing a black athletic crop top and high-waisted leggings, athleisure look.",
  "Standing at a bright modern bathroom mirror with ring light reflection.",
  "Playful expression, applying product to face, get-ready-with-me vibe.",
  "Clean bright bathroom lighting, white marble counter, skincare bottles visible.",
  "Tutorial format, fun and energetic.",
  PHOTOGRAPHY,
].join(" ");

// CACHED — Niche fit (power pose, studio)
const NICHE_PROMPT = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Standing confidently in a bright clean studio, hands on hips, power pose.",
  "Warm beige background. Soft even studio lighting.",
  "Model agency card vibe, professional yet approachable.",
  PHOTOGRAPHY,
].join(" ");

// CACHED — CTA (outdoor cafe)
const CTA_SCENE = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Outdoor cafe table, golden hour sunlight, bokeh city lights in background.",
  "Confident warm direct gaze at camera, slight smile, hand resting on table.",
  "Editorial lifestyle feel, approachable and professional.",
  PHOTOGRAPHY,
  "Shot on Sony A7III with 85mm f/1.4 lens, shallow depth of field.",
].join(" ");

// NEW — End card (clean studio, persona name)
const ENDCARD_PROMPT = [
  `Same person from the reference, ${CONSISTENCY}.`,
  CONFIG.description + ".",
  `${OUTFIT_CONSISTENCY}. ${CONFIG.outfitDescription}.`,
  "Standing centered in a clean studio, confident smile, direct eye contact.",
  "Warm beige background, soft even lighting.",
  "Portrait framing from chest up, professional headshot energy.",
  PHOTOGRAPHY,
].join(" ");

// ═══════════════════════════════════════════════════════════════════════
// GENERATION
// ═══════════════════════════════════════════════════════════════════════

const IMG_MODEL = varg.imageModel("nano-banana-2");
const IMG_OPTS = { varg: { resolution: CONFIG.resolution } };
const IMG_OPTS_2K = { varg: { resolution: "2K" } }; // For Kling input — 4K exceeds fal 10MB limit
const REF = CONFIG.referenceImage;

// ── Audio-first: segmented speech ───────────────────────────────────────

const { audio, segments } = await Speech({
  model: elevenlabs.speechModel("eleven_v3"),
  voice: CONFIG.voiceId,
  children: SPEECH,
});

// ── Images (9 cached + 2 new) ───────────────────────────────────────────

const introImage = Image({      // CACHED
  prompt: { text: INTRO_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const frontImage = Image({      // CACHED
  prompt: { text: FRONT_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const closeupImage = Image({    // CACHED
  prompt: { text: CLOSEUP_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const backImage = Image({       // CACHED
  prompt: { text: BACK_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const hookImage = Image({       // NEW
  prompt: { text: HOOK_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const productImage = Image({    // CACHED
  prompt: { text: PRODUCT_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const testimonialImage = Image({ // CACHED
  prompt: { text: TESTIMONIAL_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const grwmImage = Image({       // CACHED
  prompt: { text: GRWM_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const nicheImage = Image({      // CACHED
  prompt: { text: NICHE_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const ctaImage = Image({        // CACHED
  prompt: { text: CTA_SCENE, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

const endCardImage = Image({    // NEW
  prompt: { text: ENDCARD_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS,
});

// ── 2K images for Kling input (4K exceeds fal 10MB upload limit) ────────

const frontImage2K = Image({
  prompt: { text: FRONT_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS_2K,
});

const closeupImage2K = Image({
  prompt: { text: CLOSEUP_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS_2K,
});

const backImage2K = Image({
  prompt: { text: BACK_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS_2K,
});

const nicheImage2K = Image({
  prompt: { text: NICHE_PROMPT, images: [REF] },
  model: IMG_MODEL, aspectRatio: CONFIG.aspectRatio, providerOptions: IMG_OPTS_2K,
});

// ── Kling v3 animated clips — segs 1, 2, 3, 8 ─────────────────────────
// Duration = ceil(segment.duration), min 3s (Kling v3 minimum).
// No cutFrom/cutTo — let the video match the audio naturally.

const KLING = varg.videoModel("kling-v3");
const klingDur = (segIdx: number) => Math.max(3, Math.ceil(segments[segIdx]!.duration));

const frontVid = Video({
  model: KLING, keepAudio: false, duration: klingDur(1),
  prompt: { text: "model shifts weight to one hip, subtle fabric movement, relaxed confident pose", images: [frontImage2K] },
});

const closeupVid = Video({
  model: KLING, keepAudio: false, duration: klingDur(2),
  prompt: { text: "subtle breathing movement, fabric texture catches light, gentle natural motion", images: [closeupImage2K] },
});

const backVid = Video({
  model: KLING, keepAudio: false, duration: klingDur(3),
  prompt: { text: "slight head turn, hair shifts naturally, soft shoulder movement", images: [backImage2K] },
});

const nicheVid = Video({
  model: KLING, keepAudio: false, duration: klingDur(8),
  prompt: { text: "confident subtle pose shift, hands adjust on hips, professional energy", images: [nicheImage2K] },
});

// ── VEED Fabric talking clips — segs 0, 4, 5, 6, 7, 9 ─────────────────

const VEED = varg.videoModel("veed-fabric-1.0");
const VEED_OPTS = { varg: { resolution: "720p" } };

const introTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [introImage], audio: segments[0] },
  providerOptions: VEED_OPTS,
});

const hookTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [hookImage], audio: segments[4] },
  providerOptions: VEED_OPTS,
});

const productTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [productImage], audio: segments[5] },
  providerOptions: VEED_OPTS,
});

const testimonialTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [testimonialImage], audio: segments[6] },
  providerOptions: VEED_OPTS,
});

const grwmTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [grwmImage], audio: segments[7] },
  providerOptions: VEED_OPTS,
});

const ctaTalking = Video({
  model: VEED, keepAudio: false,
  prompt: { images: [ctaImage], audio: segments[9] },
  providerOptions: VEED_OPTS,
});

// ═══════════════════════════════════════════════════════════════════════
// RENDER — Hard cuts only. Duration = segment.duration. Audio drives all.
// ═══════════════════════════════════════════════════════════════════════

export default (
  <Render width={1080} height={1920}>
    <Music
      model={varg.musicModel("music_v1")}
      prompt="minimal lo-fi beat, warm soft piano, gentle and modern, model agency reel vibe"
      volume={0.08}
      ducking
      duration={audio.duration + 3}
    />

    {/* ═══ ACT 1 — MEET THE PERSONA ═══════════════════════════════ */}

    {/* Seg 0: INTRO — name drop */}
    <Clip duration={segments[0]!.duration}>
      {introTalking}
      {segments[0]}
    </Clip>

    {/* Seg 1: FULL BODY — the look (Kling v3 animated) */}
    <Clip duration={segments[1]!.duration}>
      {frontVid}
      {segments[1]}
    </Clip>

    {/* Seg 2: CLOSE-UP — the details (Kling v3 animated) */}
    <Clip duration={segments[2]!.duration}>
      {closeupVid}
      {segments[2]}
    </Clip>

    {/* Seg 3: ROTATION — every angle (Kling v3 animated) */}
    <Clip duration={segments[3]!.duration}>
      {backVid}
      {segments[3]}
    </Clip>

    {/* Seg 4: HOOK LINE — persona identity */}
    <Clip duration={segments[4]!.duration}>
      {hookTalking}
      {segments[4]}
    </Clip>

    {/* ═══ ACT 2 — VOICE RANGE ════════════════════════════════════ */}

    {/* Seg 5: EXCITED */}
    <Clip duration={segments[5]!.duration}>
      {productTalking}
      {segments[5]}
    </Clip>

    {/* Seg 6: CALM */}
    <Clip duration={segments[6]!.duration}>
      {testimonialTalking}
      {segments[6]}
    </Clip>

    {/* Seg 7: PLAYFUL */}
    <Clip duration={segments[7]!.duration}>
      {grwmTalking}
      {segments[7]}
    </Clip>

    {/* ═══ ACT 3 — FIT & CLOSE ════════════════════════════════════ */}

    {/* Seg 8: NICHE FIT (Kling v3 animated) */}
    <Clip duration={segments[8]!.duration}>
      {nicheVid}
      {segments[8]}
    </Clip>

    {/* Seg 9: CTA */}
    <Clip duration={segments[9]!.duration}>
      {ctaTalking}
      {segments[9]}
    </Clip>

    {/* End card — 3s silent hold */}
    <Clip duration={3}>{endCardImage}</Clip>

    {/* Captions still need full audio for word timing */}
    <Captions src={audio} style="tiktok" color="#ffffff" />
  </Render>
);
