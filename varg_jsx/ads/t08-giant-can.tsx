/**
 * varg render template — T08 · GIANT CAN — scale                                            ○ H3 Max 9:16 (approved by Alex, can at distance)
 * 9:16 · Seedance 2.5 omni_reference · 6 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_5e7d9fed9438.mp4 (H3 Max, 9:16)
 * STATUS:           ○ H3 Max only, approved visually; Seedance block below not yet run
 * ALL VERSIONS:
 *   still → file_8465696f4fcb.jpg   H3 Max 16:9 → file_49db6d24edcc.mp4 · H3 Max 9:16 → file_5e7d9fed9438.mp4
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
// T08 · GIANT CAN — scale                                            ○ H3 Max 9:16 (approved by Alex, can at distance)
// ─────────────────────────────────────────────────────────────────────────────
const T08_still = still(
  "Photograph shot on a 24mm at f/8 from street level in a dense downtown at midday, looking up between glass towers. " + CAN_REF.replace("the exact can", "The exact can") + ", the size of a forty-storey building, stands in the middle of the avenue like a monument, its top catching the sun, its curved wall reflecting the surrounding facades, a ring of condensation darkening the asphalt at its base. At the base, small, the walking sandwich character from the first reference image looks up at it, one hand shading its eyes. Real city light, hard sun from top-right, atmospheric haze at the top of the can, no lens flare, no glow, no tilt-shift.",
  [CARD.sandwich, PRODUCT_CARD]);
const T08_video = `@image1 as first frame. @image2 defines the walking sandwich's exact look only. @image3 defines the can's exact shape, proportions and finish only.

Downtown, camera at street level, same framing as the first frame.
0-3s: Slow smooth tilt up the full height of the giant can, sunlight sliding along its curved wall, windows of the towers reflected in it.
3-5s: At the top, a single huge condensation drop lets go and falls.
5-6s: Tilt back down fast to the sandwich character at the base looking up as the drop lands in front of it with a heavy splash, soaking the asphalt.
<city ambience, wind at height, one big wet impact> no music, no dialogue.
Avoid jitter, flicker, identity drift. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T08_video, images: [T08_still, CARD.sandwich, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={6}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
