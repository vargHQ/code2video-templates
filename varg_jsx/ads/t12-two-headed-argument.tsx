/**
 * varg render template — T12 · TWO-HEADED ARGUMENT                                          ○ H3 Max 9:16 ("ну окей"); Seedance + anatomy for reuse
 * 9:16 · Seedance 2.5 omni_reference · 6 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_d480fdd0ab67.mp4 (H3 Max, 9:16)
 * STATUS:           ○ H3 Max only ("ну окей"); Seedance block below not yet run
 * ALL VERSIONS:
 *   still → file_b4151ad84e51.jpg   H3 Max 16:9 → file_b1fc2ee237ee.mp4 · H3 Max 9:16 → file_d480fdd0ab67.mp4
 *
 * How it works: the still is generated WITH the character card and the product card as references,
 * then the video gets the still as @image1 (first frame) plus the same cards with explicit roles.
 * Change only the text between the beat timestamps to make a new variant; keep the roles.
 * Cost: still ≈ $0.08 · video ≈ $2.43.
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
// T12 · TWO-HEADED ARGUMENT                                          ○ H3 Max 9:16 ("ну окей"); Seedance + anatomy for reuse
// ─────────────────────────────────────────────────────────────────────────────
const CONJOINED = "the conjoined woman from the first reference image — one body, one red-and-blue leather jacket, one pair of black jeans, two heads with curly dark hair on the same shoulders";
const T12_still = still(
  "Studio portrait shot on a Phase One with a 110mm lens at f/5.6, 1/125s, ISO 50, against a seamless black backdrop on a black acrylic floor. " + CONJOINED.replace("the conjoined", "The conjoined") + " — stands at the center holding " + CAN_REF + " in both hands at chest height. The left head looks down at the can with a soft pleased smile; the right head is turned toward the left one, eyebrow raised, lips parted mid-word. Clamshell lighting: beauty dish key above the lens, silver reflector below, catchlights at 11 o'clock in all four eyes; a thin 3200K rim from behind on the leather. Skin with pores and fine hairs, leather grain, jacket zipper teeth sharp, neutral white balance, gentle Portra 400 tone.",
  [CARD.twoHeaded, PRODUCT_CARD]);
const T12_video = `@image1 as first frame. @image2 defines ONE conjoined woman — one torso, one jacket, one pair of legs, TWO heads from the SAME shoulders, never two separate women. @image3 defines the can's exact shape and finish only.

Studio portrait, locked camera, same framing as the first frame. The conjoined woman keeps one body; her feet stay planted; only her two heads and hands move.
0-2s: The left head, smiling at the can, says softly: {Honestly? It's perfect.}
2-4s: The right head turns to her, eyebrow up: {Perfect is a strong word.}
4-6s: Both heads look down at the can, then the right head, quietly: {...it's perfect.} Both nod.
<studio room tone, two similar female voices> no music.
Keep her one body with two heads in every frame. Avoid jitter, flicker, identity drift, splitting characters. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T12_video, images: [T12_still, CARD.twoHeaded, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={6}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
