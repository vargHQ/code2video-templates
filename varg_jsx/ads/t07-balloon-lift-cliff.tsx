/**
 * varg render template — T07 · BALLOON LIFT — cliff above the clouds (Pinterest ref)       ○ H3 Max only so far (no face, can at distance → ok)
 * 9:16 · Seedance 2.5 omni_reference · 6 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_3abbdfd2da52.mp4 (H3 Max, 16:9)
 * STATUS:           ○ H3 Max only (no face, can at distance — acceptable); Seedance block below not yet run
 * ALL VERSIONS:
 *   still → file_58ed03237bc5.jpg (mood ref: https://i.pinimg.com/736x/1f/b5/4b/1fb54b7dbdbea2b4aa1e16a890eb702a.jpg)
 *   H3 Max 16:9 → file_3abbdfd2da52.mp4 · H3 Max 9:16 → job_4aef4eaedca4 (pending at time of writing)
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
// T07 · BALLOON LIFT — cliff above the clouds (Pinterest ref)       ○ H3 Max only so far (no face, can at distance → ok)
// ─────────────────────────────────────────────────────────────────────────────
const T07_still = still(
  "Photograph in the mood of the second reference image: a vast sea of clouds seen from above at dawn, a colossal sheer concrete-grey cliff wall rising out of frame on the right, and a narrow stone ledge jutting out from it over the void. On the very tip of the ledge stands " + CAN_REF + ", about the height of a person relative to the ledge — clearly large, not a toy — with a bunch of five pale grey-white latex balloons tied to its pull tab, strings taut, the can just beginning to tilt as it lifts off, one edge already an inch above the stone. Shot on a 35mm at f/8 from a second ledge slightly below and to the left, so the can is seen against the cloud sea and the towering cumulus behind. Cold blue-grey palette, soft diffused morning light from the horizon, the orange can the only warm note. Photoreal, fine grain, no glow, no haze on the can itself.",
  [PRODUCT_CARD, "https://i.pinimg.com/736x/1f/b5/4b/1fb54b7dbdbea2b4aa1e16a890eb702a.jpg"]);
const T07_video = `@image1 as first frame. @image2 defines the can's exact shape, proportions and finish only.

Locked camera, same framing as the first frame.
0-1s: The balloons tug, the can rocks on the ledge tip.
1-4s: The can lifts off slowly and steadily, rising and drifting slightly right over the sea of clouds, strings taut, turning a quarter turn as it climbs, its shadow leaving the stone.
4-6s: It keeps rising toward the top of the frame, small against the towering cloud wall; the ledge is empty.
<wind, distant high-altitude quiet, a faint balloon rubber creak> no music, no dialogue.
Avoid jitter, flicker. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T07_video, images: [T07_still, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={6}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
