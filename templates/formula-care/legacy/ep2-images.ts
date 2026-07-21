// Formula Care — Episode 2: Scene Images Only
//
// Generates all still images for the 5-scene gym ad using real photo refs:
//   A1 (client):  https://uu.varg.ai/1784576476121_3hb7fv71.jpeg
//   A2 (trainer): https://uu.varg.ai/1784576485522_vbgd4amk.jpeg
//
// Pipeline:
//   1. Character profile cards (full-body, fixed outfit) from photo refs
//   2. Location card (empty gym with big windows, no people)
//   3. Scene composites 1-5 referencing [a1Card, a2Card, gymLoc]
//
// Output: output/formula-care-ep2/*.png
// Usage:  bun run ep2-images.ts

import { Image } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_BASE = varg.imageModel("nano-banana-pro");
const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const AR = "9:16" as const;
const OUT = "output/formula-care-ep2";

// ── Photo references ────────────────────────────────────────────────────
const A1_PHOTO = "https://uu.varg.ai/1784576476121_3hb7fv71.jpeg";
const A2_PHOTO = "https://uu.varg.ai/1784576485522_vbgd4amk.jpeg";

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character profile cards
// ═════════════════════════════════════════════════════════════════════════

// A1: overweight woman late 50s, grey hair. Fixed outfit for the whole video:
// sports bra top + short workout shorts so belly, arms and legs stay visible.
const a1Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same grey hair, same body shape. Overweight woman in her late 50s with grey hair. She wears a simple dark sports bra top and snug high-waisted dark athletic shorts (underwear-style workout shorts), barefoot. Her belly is fully exposed and visible, arms bare, legs bare from mid-thigh down. Standing straight facing camera, neutral relaxed pose, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A1_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// A2: Asian trainer in her 30s, slim, fitness uniform.
const a2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same hair, same slim build. Slim Asian fitness trainer in her 30s. She wears a fitted fitness uniform: sporty crop top and full-length leggings in matching color, clean athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A2_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location card (L1: gym with big windows, no people)
// ═════════════════════════════════════════════════════════════════════════

const gymLoc = Image({
  prompt:
    "Empty modern gym interior with huge floor-to-ceiling windows letting in bright natural daylight, green trees visible outside. Light wooden floor, a few yoga mats rolled in a corner, rack of dumbbells along one wall, mirrors on the opposite wall. No people. Clean airy atmosphere, warm daylight, photorealistic, 9:16 portrait framing",
  model: IMG_BASE,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites (refs: [a1Card, a2Card, gymLoc])
// ═════════════════════════════════════════════════════════════════════════

const SAME =
  "First reference image is Woman A (overweight late-50s woman with grey hair, dark sports bra and dark athletic shorts, barefoot). Second reference image is Woman B (slim Asian trainer in her 30s in fitted fitness uniform with sneakers). Third reference image is the gym location with huge windows. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the gym exactly as in the location reference.";

// Scene 1: A2 talks to camera, A1 does squats — medium-wide
const scene1 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Woman A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside her closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 2: A1 from the back, full body; A2 crouches pointing at her booty
const scene2 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing away from the camera, seen from behind head to toe in her dark sports bra and dark athletic shorts, her bare legs visible. Woman B crouches beside her on the left, pointing a finger toward Woman A's hips and thighs while looking at the camera. Huge windows with daylight in the background, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 3: A1 front, belly fully visible; A2 points at the belly
const scene3 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing the camera head to toe, neutral stoic expression, her bare belly fully visible above the dark athletic shorts, hips and part of her rear visible. Woman B stands beside her on the left, slightly crouched, pointing an open hand at Woman A's belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 4: same setup as scene 3, but close shot on arms
const scene4 = Image({
  prompt: {
    text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both women. Woman A faces the camera holding her right arm raised out to the side, the soft loose skin of her bare upper arm clearly visible, part of her belly visible below. Woman B stands on the left, pointing at Woman A's raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 5: A1 finishes a squat, both happy — medium-wide like scene 1
const scene5 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Woman A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside her facing the camera, laughing warmly and giving Woman A an encouraging thumbs-up. Both women look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// Resolve & save
// ═════════════════════════════════════════════════════════════════════════

async function save(name: string, el: ReturnType<typeof Image>) {
  const resolved = await el;
  const path = `${OUT}/${name}.png`;
  await Bun.write(path, await resolved.file.data());
  console.log(`saved ${path}${resolved.file.url ? ` (${resolved.file.url})` : ""}`);
  return resolved;
}

async function main() {
  // Step 1+2 in parallel: character cards + location
  console.log("Step 1/3: character cards + location...");
  await Promise.all([save("a1-card", a1Card), save("a2-card", a2Card), save("location-gym", gymLoc)]);

  // Step 3: scenes (reference the resolved cards)
  console.log("Step 2/3: scene composites...");
  await Promise.all([
    save("scene1-squat", scene1),
    save("scene2-booty-back", scene2),
    save("scene3-belly-front", scene3),
    save("scene4-arms-close", scene4),
    save("scene5-happy-squat", scene5),
  ]);

  console.log(`Step 3/3: done. All images in ${OUT}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
