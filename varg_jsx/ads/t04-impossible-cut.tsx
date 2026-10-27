/**
 * varg render template — T04 · IMPOSSIBLE CUT — can sliced like a fruit                     ◐ rendered without product card
 * 9:16 · Seedance 2.5 omni_reference · 5 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_3f01288ac57f.mp4
 * STATUS:           ◐ rendered on Seedance 9:16 before PRODUCT_CARD existed — re-run as written
 * ALL VERSIONS:
 *   first-frame still → file_02ac0bd43a31.png   (cut-open still, used as last frame in the H3 Max try → file_55def0232ed2.png)
 *   Seedance 9:16, first frame only → file_3f01288ac57f.mp4 ($2.03)   H3 Max first+last (rejected) → file_338043608d45.mp4
 *
 * How it works: the still is generated WITH the character card and the product card as references,
 * then the video gets the still as @image1 (first frame) plus the same cards with explicit roles.
 * Change only the text between the beat timestamps to make a new variant; keep the roles.
 * Cost: still ≈ $0.08 · video ≈ $2.03.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — identical in every ads/*.tsx file (no imports allowed in varg render)
// ─────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";

// Character cards — neutral-background edits of launch/chars originals (footer-photoshoot-series.tsx §2)
const CARD = {
  gorilla:    S3 + "file_1eea7ddb50e7.jpg", // chars/20 Jimmy
  ostrich:    S3 + "file_aed3e7296be2.jpg", // chars/16
  womanRed:   S3 + "file_c5a9c0d62fc5.jpg", // chars/1
  sandwich:   S3 + "file_5ab7ba96dcbb.jpg", // chars/9
  hoodie:     S3 + "file_f47a48b6d48d.jpg", // chars/4
  claudeCode: S3 + "file_38cbe7b9b96b.jpg", // chars/27
  microwave:  S3 + "file_6880287ba6a7.jpg", // chars/17 (hamster inside)
  twoHeaded:  S3 + "file_a5ca4e68ce6b.jpg", // chars/26 conjoined — describe anatomically, always
};

// PRODUCT CARD — canonical placeholder can (rendered: file_4a0d89ac9dfa.png).
// For a client: replace with their product photo URL(s), keep the prompt roles unchanged.
const PRODUCT_CARD = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Product reference card photographed on a 100mm macro at f/11, twin softboxes, on a seamless neutral charcoal-grey studio backdrop (#1a1a1c). One and the same small 330 ml slim aluminum beverage can shown twice side by side: on the left straight front view, on the right three-quarter view from slightly above. The can is a uniform matte burnt-orange (#ff5315 family) with a brushed aluminum texture, no label, no text, no logo; a plain silver aluminum top with a standard stay-on pull tab, a thin silver rim at the base, a small vertical highlight along the left edge from the key light, faint fine scuffs near the bottom rim. Both views identical in proportion and finish, sharp edge to edge, neutral white balance, no reflections of the environment, no glow.",
  aspectRatio: "16:9",
});
// const PRODUCT_CARD = "https://.../client-product-front-and-three-quarter.jpg";

const CAN_REF = "the exact can from the product reference image — same slim proportions, same matte burnt-orange brushed finish, same silver top and pull tab";
const LOCK = (who: string, whoIdx: number, canIdx: number) =>
  `@image${whoIdx} defines ${who} only — it must look identical to @image${whoIdx} in every frame. @image${canIdx} defines the can's exact shape, proportions, matte burnt-orange finish, silver top and pull tab only — the can must look identical to @image${canIdx} in every frame.`;
const KEEP = (who: string, whoIdx: number, canIdx: number) =>
  `Keep ${who} identical to @image${whoIdx} and the can identical to @image${canIdx} throughout. Avoid jitter, flicker, identity drift, extra limbs. No text on screen, no logos.`;
const CONJOINED = "the conjoined woman from the first reference image — one body, one red-and-blue leather jacket, one pair of black jeans, two heads with curly dark hair on the same shoulders";

// Seedance 2.5 via PiAPI, omni_reference (multi-ref with @imageN roles), 9:16 → 720×1280, native audio
const SEEDANCE = { piapi: { input: { mode: "omni_reference", resolution: "720p", aspect_ratio: "9:16", audio: true } } };
const still = (text: string, images: any[]) =>
  Image({ model: varg.imageModel("nano-banana-2"), prompt: { text, images }, aspectRatio: "9:16" });

// ─────────────────────────────────────────────────────────────────────────────
// T04 · IMPOSSIBLE CUT — can sliced like a fruit                     ◐ rendered without product card
// ─────────────────────────────────────────────────────────────────────────────
const T04_still = still(
  "ASMR macro food photograph on a 100mm macro at f/5.6, soft window light from the left, on a dark slate board — the FIRST frame before the cut. " + CAN_REF.replace("the exact can", "The exact can") + " stands whole and intact at the center of the slate, a few water beads on it. A chef's knife hovers just above it, blade horizontal, edge touching the top rim, a hand in a dark sleeve gripping the handle, about to press down. Beside the can lies half a real orange, cut face up, glistening, as a hint of what is inside. Shallow depth of field on the can and blade, real reflections on the aluminum, slate texture, no glow, no HDR.",
  [PRODUCT_CARD]);
const T04_video = `@image1 as first frame. @image2 defines the can's exact shape, proportions, matte burnt-orange finish, silver top and pull tab only.

Macro food ASMR on a dark slate board, soft window light from the left, locked camera on a 100mm macro, the framing of @image1 never changes.
0-1s: The knife rests on the top rim of the whole can. A beat of stillness, a water bead slides down the aluminum.
1-2.5s: The hand presses the blade down slowly; the aluminum yields with a soft crunch and the knife sinks straight through the center of the can from top to bottom in one clean vertical cut.
2.5-4s: The two halves tip apart and fall open onto the slate, revealing that the inside of the can is a ripe orange citrus: glistening segments, juice vesicles catching the light, juice running out across the slate.
4-5s: The hand lifts the knife away; one drop of juice falls from the blade; the halves rest, glistening.
<blade through thin metal, wet citrus tearing, a single drip> no music, no dialogue.
Photoreal macro, real reflections on the aluminum, no glow. Avoid jitter, flicker. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={5}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T04_video, images: [T04_still, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={5}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
