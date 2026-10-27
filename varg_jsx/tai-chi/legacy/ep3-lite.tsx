/** @jsxImportSource vargai */
// Formula Care — Episode 3 LITE: 2 clips, captions via .audio
//
// Simplified version of ep3: only 2 video clips (before + after),
// captions generated automatically from video audio via vid.audio
// (no manual SRT file needed).
//
// Usage: nohup bun run render templates/clients/formula-care-ep3-lite.tsx > output/ep3-lite/render.log 2>&1 &

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const AR = "9:16" as const;
const AUDIO_ON = { varg: { generate_audio: true } };

// ── Reference frames ─────────────────────────────────────────────────────
const REF_MIRROR_BEFORE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_19e299bcfac7.jpg";
const REF_MIRROR_AFTER = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_71e156edd9d7.jpg";

// ── Character cards (cache hits from ep3) ────────────────────────────────
const tCard = Image({
  prompt: {
    text: "Full-body character reference card of the slim Asian woman on the LEFT side of the photo (the one holding the phone): same face, same black ponytail, same athletic build. She wears a navy blue sports bra and matching navy full-length leggings, barefoot. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const sBeforeCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body shape. Plus-size Asian woman in her 50s. She wears a heather grey tank top and black loose shorts, barefoot. Standing straight facing camera, relaxed neutral expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const sAfterCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body. She wears an emerald green sports bra and matching emerald green full-length leggings, barefoot. Standing straight facing camera, radiant happy expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_AFTER],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ── Location card ────────────────────────────────────────────────────────
const locSunroom = Image({
  prompt: {
    text: "Recreate this interior location exactly but completely EMPTY, no people, no reflections of people in the mirror: bright home sunroom with large white-framed windows, green garden visible outside, warm wooden floor, a tall fiddle-leaf fig plant and several potted plants on stands, a full-height mirror in a thin wooden frame reflecting the room. Clean airy daylight atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ── Scene composites ─────────────────────────────────────────────────────
const SAME_B2_BEFORE =
  "First reference image is Woman T (slim Asian trainer, black ponytail, navy sports bra and navy leggings). Second reference image is Woman S (plus-size Asian woman in her 50s, long grey-streaked hair, grey tank top and black shorts). Third reference image is the bright sunroom with the full-height mirror. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the room exactly as in the location reference.";

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

const mirrorAfter = Image({
  prompt: {
    text: `${SAME_B2_AFTER} Change ONLY the following: Woman T on the left now wears a black sports bra and black leggings instead of navy, still holding the iPhone up at chest height in the same selfie pose. Woman S on the right now looks exactly as in the second reference — emerald green sports set, toned figure — with a glowing proud happy smile, standing on the same floor spot in the same pose. Everything else — positions, camera, framing, lighting, room — stays identical to the first reference. Photorealistic`,
    images: [mirrorBefore, sAfterCard],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ── Videos: 2 clips only (before + after) ────────────────────────────────

// Clip 1 (10s, before): T sets up the bet
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

// Clip 2 (9s, after): S day-28 result
const vid2 = Video({
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

// ── Composition ──────────────────────────────────────────────────────────
// Captions via vid.audio — the SDK extracts audio from each video,
// transcribes it with Whisper, and generates word-level captions.
// No manual SRT file needed: the computation graph handles it.
export default (
  <Render width={1080} height={1920} fps={30}>
    <Music
      prompt="Soft warm acoustic home workout background music, light guitar and gentle rhythm, hopeful positive mood, unobtrusive"
      model={varg.musicModel("music_v1")}
      volume={0.1}
      ducking
    />

    {/* Before: T sets up the bet */}
    <Clip cutFrom={0.3} cutTo={10.0} duration={9.7}>
      {vid1}
      <Captions
        src={vid1.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={60}
      />
    </Clip>

    {/* After: S day-28 result */}
    <Clip cutFrom={0.68} cutTo={9.04} duration={8.36}>
      {vid2}
      <Captions
        src={vid2.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={60}
      />
    </Clip>
  </Render>
);
