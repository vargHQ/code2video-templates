// Formula Care — Blocks 2-4 (ep3/ep4/ep5): Scene Images Only
//
// Reference video breakdown: output/formula-care-ref/SCRIPT.md
// Character/location refs are frames extracted from the reference video,
// uploaded to varg files:
//   ref_25s (block2 before: T navy + S grey tank, mirror selfie)
//   ref_40s (block2 after: T black + S green, slimmer)
//   ref_55s (block3 porch tai chi: T2 + S2)
//   ref_84s (block4 OTS S2 close-up)
//   ref_94s (block4 solo T2 close-up)
//   ref_65s (block4 wide walk two-shot)
//
// KLING CONSTRAINT: kling-v3 = 3..15s integer per clip; dialogue quality is
// best <=10s. Shot plan per composite (for the ep templates later):
//   Block 2 "before" (16.3s): clip 2.1a T line 10s + clip 2.1b S line 6s
//   Block 2 "after" (15.5s):  clip 2.2a S line 9s  + clip 2.2b T+S 7s
//   Block 3 (12.6s): clip 3.1 wide tai chi 8s (VO) + clip 3.2 close S2 5s
//   Block 4 (67.4s): 8 clips 6-10s alternating wide/OTS/solo/two-shot
//
// Usage: bun run ref-images.ts
// Output: output/formula-care-ref/images/ grouped chronologically:
//   block2-mirror-bet/    (ep3: t-card, s-before/after-card, location-sunroom, composites)
//   block3-porch-taichi/  (ep4: t2-card, s2-card, location-porch, composites)
//   block4-forest-walk/   (ep5: t2-card, s2-card copies, location-trail, composites)

import { Image } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_BASE = varg.imageModel("nano-banana-pro");
const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const AR = "9:16" as const;
const OUT = "output/formula-care-ref/images";

// ── Reference frames from the source video (uploaded to varg files) ──────
const REF_MIRROR_BEFORE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_19e299bcfac7.jpg"; // ref_25s
const REF_MIRROR_AFTER = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_71e156edd9d7.jpg"; // ref_40s
const REF_PORCH = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_a59f5154fc3d.jpg"; // ref_55s
const REF_S2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_36f0c2f3aa92.jpg"; // ref_84s
const REF_T2_CLOSE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_294182c8eb03.jpg"; // ref_94s
const REF_WALK_WIDE = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_ba8e2a4e238a.jpg"; // ref_65s

// ═════════════════════════════════════════════════════════════════════════
// STEP 1 — Character profile cards
// ═════════════════════════════════════════════════════════════════════════

// T: slim Asian trainer ~40s, black ponytail (Block 2)
const tCard = Image({
  prompt: {
    text: "Full-body character reference card of the slim Asian woman on the LEFT side of the photo (the one holding the phone): same face, same black ponytail, same athletic build. She wears a navy blue sports bra and matching navy full-length leggings, barefoot. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S "before": plus-size Asian woman ~50s, long grey-streaked hair (Block 2)
const sBeforeCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body shape. Plus-size Asian woman in her 50s. She wears a heather grey tank top and black loose shorts, barefoot. Standing straight facing camera, relaxed neutral expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S "after": same woman, emerald green set, toned (Block 2 day-28)
const sAfterCard = Image({
  prompt: {
    text: "Full-body character reference card of the woman on the RIGHT side of the photo: same face, same long grey-streaked hair, same body. She wears an emerald green sports bra and matching emerald green full-length leggings, barefoot. Standing straight facing camera, radiant happy expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_MIRROR_AFTER],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// T2: slim Asian woman ~60s, long grey hair in low ponytail (Blocks 3-4)
const t2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same long silver-grey hair pulled back in a low ponytail, same slim toned build. Fit Asian woman in her 60s. She wears an olive green racerback sports tank and black bike shorts, grey athletic sneakers. Standing straight facing camera, warm calm expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_T2_CLOSE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// S2: plus-size woman ~50s, curly auburn-brown hair (Blocks 3-4)
const s2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same shoulder-length curly auburn-brown hair, same body shape. Plus-size woman in her 50s. She wears a heather grey crew-neck t-shirt and black full-length leggings, grey athletic sneakers. Standing straight facing camera, friendly open expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [REF_S2_CLOSE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 2 — Location cards (no people)
// ═════════════════════════════════════════════════════════════════════════

// L2: bright home sunroom with full-height mirror (Block 2)
const locSunroom = Image({
  prompt: {
    text: "Recreate this interior location exactly but completely EMPTY, no people, no reflections of people in the mirror: bright home sunroom with large white-framed windows, green garden visible outside, warm wooden floor, a tall fiddle-leaf fig plant and several potted plants on stands, a full-height mirror in a thin wooden frame reflecting the room. Clean airy daylight atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_MIRROR_BEFORE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// L3: covered wooden porch in misty forest (Block 3)
const locPorch = Image({
  prompt: {
    text: "Recreate this location exactly but completely EMPTY, no people: covered wooden porch deck of a mountain cabin, thick timber posts and beams, weathered wooden deck boards, surrounded by tall coniferous forest in dense morning fog, soft diffused grey-blue light, mist drifting between the pine trees. Serene moody atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_PORCH],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// L4: sunlit forest trail (Block 4)
const locTrail = Image({
  prompt: {
    text: "Recreate this location exactly but completely EMPTY, no people: a dirt walking trail through a sunlit summer deciduous forest, oaks and maples, lush green ferns and wildflowers along the edges, dappled golden sunlight filtering through the canopy, the path receding into the distance. Fresh warm atmosphere, photorealistic, 9:16 portrait framing",
    images: [REF_WALK_WIDE],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// STEP 3 — Scene composites
// ═════════════════════════════════════════════════════════════════════════

// ── Block 2: mirror selfie before/after ──────────────────────────────────

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

// ── Block 3: porch tai chi ───────────────────────────────────────────────

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

// ── Block 4: forest walk dialogue ────────────────────────────────────────

const SAME_B4 =
  "First reference image is Woman T2 (fit Asian woman in her 60s, long silver-grey hair, olive green sports tank and black bike shorts, grey sneakers). Second reference image is Woman S2 (plus-size woman in her 50s, curly auburn-brown hair, grey t-shirt and black leggings, sneakers). Third reference image is the sunlit forest trail. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the trail exactly as in the location reference.";

// 4A: wide two-shot — walking toward camera side by side
// (hair: low ponytail explicitly, must match all other block-4 shots)
const walkWide = Image({
  prompt: {
    text: `${SAME_B4} Wide shot on the forest trail: both women walking toward the camera side by side mid-stride, Woman T2 on the left with her silver-grey hair pulled back in a low ponytail exactly as in her reference card, Woman S2 on the right, turned slightly toward each other in friendly conversation. Dappled sunlight through the trees, ferns along the path, candid documentary feel, photorealistic`,
    images: [t2Card, s2Card, locTrail],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// 4D: standing two-shot — spatial anchor for 4B/4C (defined first, chained below).
// Chained from walkWide (poses/spot) + locTrail passed explicitly as the LAST
// reference so the background color/lighting/grade matches all block-4 shots.
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
  console.log("Step 1/3: character cards + locations (8 images)...");
  await Promise.all([
    save("block2-mirror-bet/t-card", tCard),
    save("block2-mirror-bet/s-before-card", sBeforeCard),
    save("block2-mirror-bet/s-after-card", sAfterCard),
    save("block3-porch-taichi/t2-card", t2Card),
    save("block3-porch-taichi/s2-card", s2Card),
    save("block2-mirror-bet/location-sunroom", locSunroom),
    save("block3-porch-taichi/location-porch", locPorch),
    save("block4-forest-walk/location-trail", locTrail),
  ]);

  console.log("Step 2/3: scene composites (8 images)...");
  await Promise.all([
    save("block2-mirror-bet/b2-mirror-before", mirrorBefore),
    save("block2-mirror-bet/b2-mirror-after", mirrorAfter),
    save("block3-porch-taichi/b3-porch-taichi", porchTaiChi),
    save("block3-porch-taichi/b3-porch-s2-joy", porchS2Joy),
    save("block4-forest-walk/b4-walk-wide", walkWide),
    save("block4-forest-walk/b4-ots-s2", otsS2),
    save("block4-forest-walk/b4-solo-t2", soloT2),
    save("block4-forest-walk/b4-stand-twoshot", standTwoShot),
  ]);

  console.log(`Step 3/3: done. All images in ${OUT}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
