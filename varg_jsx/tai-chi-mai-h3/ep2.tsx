/** @jsxImportSource vargai */
// Formula Care — Episode 2: Gym Ad — MAI + H3 variant
//
// Model swap vs ../tai-chi/ep2.tsx:
//   images: nano-banana-pro/edit  →  nano-banana-pro/edit (composite, kept)
//                                    + mai_image_2_5 (new photoreal finish)
//   video:  kling-v3              →  minimax_h3
//
// Why the two-stage image pipeline:
//   MAI-Image-2.5/edit takes ONE input image ("Provide one http(s) or data:
//   URL" in its fal schema). The ep2 scene composites need THREE refs
//   (A1 card + A2 card + gym location). So nano-banana-pro/edit — which
//   handles multi-ref natively — builds the composite, then MAI does a
//   single-image finishing pass for photorealism / skin / light. One ref in,
//   one ref out: stays inside MAI's documented contract.
//
//     A1 photo ─┐
//               ├─ nano_banana_pro/edit ─→ composite ─→ mai_image_2_5 ─→ scene
//     A2 photo ─┤        (3 refs)                          (1 ref)
//     gym loc  ─┘
//
// H3 constraints baked in below:
//   - duration is an INTEGER 5..15 (scenes 2 and 3 were 4s → now 5s)
//   - native stereo audio is ALWAYS ON — there is no generate_audio flag
//   - image-to-video ignores aspect_ratio; output follows the input image,
//     so the 9:16 stills drive the vertical framing
//   - resolution ("768P" | "2K", default "2K") is fal-options only
//   - any request with files auto-routes to h3/image-to-video
//
// Verified live against api.varg.ai before writing this file:
//   mai_image_2_5 + files  → fal:microsoft/mai-image-2.5/edit, 6c   (768x1376
//     in → 768x1376 out: the finishing pass preserves the 9:16 frame exactly)
//   nano-banana-pro/edit   → fal:nano_banana_pro/edit, 16c (3 refs accepted)
//   minimax_h3 + files, 5s → fal:minimax/h3/image-to-video, 137c actual;
//     output 1440x2560 h264 + 32kHz STEREO aac; whisper transcribed the
//     generated audio back as the exact scripted line, so speechRange() has
//     real word timings to trim on.
//
// NOTE: the character/location card prompts are byte-identical to
// ../tai-chi/ep2.tsx, so those two nano-banana calls hit the existing
// cache at $0. Everything downstream is new.
//
// Scene breakdown:
//   1. (6s) Squats + "You do not need to spend hours sweating..."
//   2. (5s) Back view + "If your booty looks like this"
//   3. (5s) Front belly + "If your belly looks like this"
//   4. (7s) Arms close-up + "If your arms look like this. Simply join our
//           beginner Tai Chi Challenge this Monday, July 27th"
//   5. (6s) Happy squat + "Forget the diets and cardio to get a beautifully
//           toned body in exactly 28 days"
//
// Usage: nohup bun run render templates/tai-chi-mai-h3/ep2.tsx \
//          -o output/tai-chi-mai-h3/ep2.mp4 \
//          > output/tai-chi-mai-h3/ep2/render.log 2>&1 &
//
// Cost (from scratch, measured rates):
//   29s minimax_h3 @ 26c/s ............ $7.54   (5s clip billed 137c actual)
//   5 nano-banana composites @ 16c .... $0.80
//   5 MAI finishing passes @ 6c ....... $0.30
//   2 cards + 1 location .............. $0.48   ($0 if ../tai-chi ran first)
//   music + whisper ................... ~$0.10
//                                        ------
//                                        ~$9.20
// vs ~$4.60 for the kling-v3 original — h3 is 26c/s against kling's 14c/s.

import { Captions, Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// Composite stage — multi-ref capable. The id string must stay byte-identical
// to ../tai-chi/ep2.tsx: the SDK cache key embeds the literal modelId, so the
// hyphenated spelling is what hits the existing cache. (The API normalizes
// "-" → "_" on its side, so it still resolves to nano_banana_pro/edit.)
const IMG_COMPOSITE = varg.imageModel("nano-banana-pro/edit");
// Finishing stage — single-ref, photoreal. Canonical id is underscored;
// passing files auto-routes to fal:microsoft/mai-image-2.5/edit.
const IMG_FINISH = varg.imageModel("mai_image_2_5");
const IMG_BASE = varg.imageModel("nano-banana-pro");

const VID = varg.videoModel("minimax_h3");
const AR = "9:16" as const;

// H3 has no audio toggle — audio is native and always on. `resolution` is not
// a unified field, so it must ride in through provider_options.
//
// GOTCHA (verified against the live API): @vargai/gateway unwraps
// `providerOptions.varg` STRAIGHT into the request's `provider_options`, but
// the API expects that object keyed BY PROVIDER. An unkeyed bag is silently
// DROPPED — POSTing {resolution:"BOGUS"} unkeyed returns valid:true, while
// {fal:{resolution:"BOGUS"}} correctly 400s. So the inner object has to carry
// the `fal` key itself: varg → { fal: { … } } → provider_options.fal.
// (The templates CLAUDE.md line "use the varg namespace, NOT fal" is about
// the OUTER key only — the provider key still belongs on the inside.)
const H3_OPTS = { varg: { fal: { resolution: "2K" } } };

// ── Photo references ────────────────────────────────────────────────────
const A1_PHOTO = "https://uu.varg.ai/1784576476121_3hb7fv71.jpeg";
const A2_PHOTO = "https://uu.varg.ai/1784576485522_vbgd4amk.jpeg";

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character profile cards (prompts identical to ../tai-chi/ep2.tsx
//          → cache hit, $0)
// ═════════════════════════════════════════════════════════════════════════

const a1Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same grey hair, same body shape. Overweight woman in her late 50s with grey hair. She wears a simple dark sports bra top and snug high-waisted dark athletic shorts (underwear-style workout shorts), barefoot. Her belly is fully exposed and visible, arms bare, legs bare from mid-thigh down. Standing straight facing camera, neutral relaxed pose, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A1_PHOTO],
  },
  model: IMG_COMPOSITE,
  aspectRatio: AR,
});

const a2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same hair, same slim build. Slim Asian fitness trainer in her 30s. She wears a fitted fitness uniform: sporty crop top and full-length leggings in matching color, clean athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A2_PHOTO],
  },
  model: IMG_COMPOSITE,
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
// STEP 3 — Scene composites (nano-banana, 3 refs) → MAI finishing pass
// ═════════════════════════════════════════════════════════════════════════

const SAME =
  "First reference image is Woman A (overweight late-50s woman with grey hair, dark sports bra and dark athletic shorts, barefoot). Second reference image is Woman B (slim Asian trainer in her 30s in fitted fitness uniform with sneakers). Third reference image is the gym location with huge windows. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the gym exactly as in the location reference.";

// The MAI pass is a *finishing* edit, not a re-composition: it must not move
// anyone, change the framing, or restyle the wardrobe. Only render quality.
const FINISH =
  "Photorealistic finishing pass on this image. Keep the composition, framing, poses, faces, body shapes, clothing and background exactly as they are — do not move, add or remove anything. Improve only the photographic realism: natural skin texture with visible pores and fine detail, realistic subsurface light on skin, accurate soft daylight falloff from the windows, true-to-life fabric weave on the sportswear, natural color grading, crisp focus on the subjects with gentle depth of field, shot on a full-frame camera with an 85mm lens. No illustration, no plastic skin, no over-smoothing, no added text or watermarks.";

/** nano-banana composite (3 refs) → MAI single-ref photoreal finish. */
const finish = (composite: ReturnType<typeof Image>) =>
  Image({
    prompt: { text: FINISH, images: [composite] },
    model: IMG_FINISH,
    aspectRatio: AR,
  });

const scene1 = finish(
  Image({
    prompt: {
      text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Woman A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside her closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
      images: [a1Card, a2Card, gymLoc],
    },
    model: IMG_COMPOSITE,
    aspectRatio: AR,
  }),
);

const scene2 = finish(
  Image({
    prompt: {
      text: `${SAME} Full-body shot inside the gym. Woman A stands facing away from the camera, seen from behind head to toe in her dark sports bra and dark athletic shorts, her bare legs visible. Woman B crouches beside her on the left, pointing a finger toward Woman A's hips and thighs while looking at the camera. Huge windows with daylight in the background, photorealistic`,
      images: [a1Card, a2Card, gymLoc],
    },
    model: IMG_COMPOSITE,
    aspectRatio: AR,
  }),
);

const scene3 = finish(
  Image({
    prompt: {
      text: `${SAME} Full-body shot inside the gym. Woman A stands facing the camera head to toe, neutral stoic expression, her bare belly fully visible above the dark athletic shorts, hips and part of her rear visible. Woman B stands beside her on the left, slightly crouched, pointing an open hand at Woman A's belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
      images: [a1Card, a2Card, gymLoc],
    },
    model: IMG_COMPOSITE,
    aspectRatio: AR,
  }),
);

const scene4 = finish(
  Image({
    prompt: {
      text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both women. Woman A faces the camera holding her right arm raised out to the side, the soft loose skin of her bare upper arm clearly visible, part of her belly visible below. Woman B stands on the left, pointing at Woman A's raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
      images: [a1Card, a2Card, gymLoc],
    },
    model: IMG_COMPOSITE,
    aspectRatio: AR,
  }),
);

const scene5 = finish(
  Image({
    prompt: {
      text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Woman A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside her facing the camera, laughing warmly and giving Woman A an encouraging thumbs-up. Both women look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
      images: [a1Card, a2Card, gymLoc],
    },
    model: IMG_COMPOSITE,
    aspectRatio: AR,
  }),
);

// ═════════════════════════════════════════════════════════════════════════
// STEP 4 — Videos: minimax_h3 image-to-video, native stereo audio
// ═════════════════════════════════════════════════════════════════════════
//
// Durations are integers >= 5 (H3 floor). Scenes 2 and 3 were 4s under
// kling-v3; at 5s the extra second is absorbed by the speechRange auto-trim
// below, so the cut length is unchanged.

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
  model: VID,
  keepAudio: true,
  duration: 6,
  providerOptions: H3_OPTS,
});

// Scene 2 (5s): Back view + booty line
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
  model: VID,
  keepAudio: true,
  duration: 5,
  providerOptions: H3_OPTS,
});

// Scene 3 (5s): Front view + belly line
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
  model: VID,
  keepAudio: true,
  duration: 5,
  providerOptions: H3_OPTS,
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
  model: VID,
  keepAudio: true,
  duration: 7,
  providerOptions: H3_OPTS,
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
  model: VID,
  keepAudio: true,
  duration: 6,
  providerOptions: H3_OPTS,
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

const ep2Vids = [vid1, vid2, vid3, vid4, vid5];
const ep2Max = [6, 5, 5, 7, 6];

const ep2Timings = await Promise.all(
  ep2Vids.map(async (vid, i) => {
    const r = await vid.audio.speechRange({ pad: 0.15 });
    const start = r ? Math.max(0, r.start - 0.15) : 0;
    const end = r ? Math.min(ep2Max[i]!, r.end + 0.1) : ep2Max[i]!;
    return { start, end, duration: end - start };
  }),
);

console.log(
  `ep2 (mai+h3) clip durations: ${ep2Timings.map((t) => t.duration.toFixed(2)).join(", ")}`,
);

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
