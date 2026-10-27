/**
 * varg render template — T10 · MICROWAVE POV — camera inside                                ○ H3 Max 9:16 (approved); Seedance + cards recommended for reuse
 * 9:16 · Seedance 2.5 omni_reference · 6 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_7e0c19911283.mp4 (H3 Max, 9:16)
 * STATUS:           ○ H3 Max only, approved visually; Seedance block below not yet run
 * ALL VERSIONS:
 *   still → file_326f1f7fa7e3.jpg   H3 Max 16:9 → file_18e6e17802c2.mp4 · H3 Max 9:16 → file_7e0c19911283.mp4
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
// T10 · MICROWAVE POV — camera inside                                ○ H3 Max 9:16 (approved); Seedance + cards recommended for reuse
// ─────────────────────────────────────────────────────────────────────────────
const T10_still = still(
  "Still from a tiny action camera mounted INSIDE a microwave, 14mm ultra-wide, looking outward through the closed door glass. In the foreground, sharp, the hamster from the first reference image sits on the glass turntable beside " + CAN_REF + ", both lit by the microwave's warm 2700K interior bulb from above-left, the metal mesh of the door window casting a fine grid across the frame. Beyond the glass, softer and slightly green from the window tint, two faces pressed close to the door: the curly-haired young man in a light-blue hoodie and the red-haired man in a blue tee from the second and third reference images, eyes wide. Slight lens flare from the bulb, sensor noise in the dark corners, no HDR, fur with individual hairs.",
  [CARD.microwave, CARD.hoodie, CARD.claudeCode, PRODUCT_CARD]);
const T10_video = `@image1 as first frame. @image2 defines the hamster and microwave only. @image3 defines the hoodie guy's face only. @image4 defines the red-haired guy's face only. @image5 defines the can's exact shape and finish only.

Action cam inside the microwave, locked, same framing as the first frame.
0-2s: The hamster looks up at the lens, whiskers twitching, then pats the can beside it with one paw like a proud owner.
2-4s: Outside the glass, the two guys' faces lean in closer, eyes widening; one of them taps the glass, the whole frame shudders slightly.
4-6s: The turntable begins to rotate slowly, carrying the hamster and the can in a gentle circle; the hamster keeps staring into the lens the whole way round.
<microwave hum, a soft tap on glass, muffled voices> no music, no dialogue.
Keep all identities to their reference images. Avoid jitter, flicker, identity drift. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T10_video, images: [T10_still, CARD.microwave, CARD.hoodie, CARD.claudeCode, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={6}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
