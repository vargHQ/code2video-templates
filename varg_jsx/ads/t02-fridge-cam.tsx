/**
 * varg render template — T02 · FRIDGE CAM — POV from the shelf                              ✅ identity-lock verified
 * 9:16 · Seedance 2.5 omni_reference · 6 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_b89227f2d679.mp4
 * STATUS:           ✅ rendered exactly as written, identity verified (gorilla + can)
 * ALL VERSIONS:
 *   still → file_b3174b843e4e.jpg   video → file_b89227f2d679.mp4 (720×1280, 6 s, $2.43)
 *   earlier: still file_448f02c48463 · H3 Max 16:9 file_685061da54eb · H3 Max 9:16 file_13687271335b
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
// T02 · FRIDGE CAM — POV from the shelf                              ✅ identity-lock verified
// ─────────────────────────────────────────────────────────────────────────────
const T02_still = still(
  "Fridge-cam still: a wide-angle camera sits on the middle shelf INSIDE a refrigerator looking out. The fridge door has just been opened and the pink gorilla from the first reference image fills the doorway, bending down to peer in, lit by the fridge's cold 6500K interior LED from below and the warm kitchen light behind it; its hand is reaching toward camera for " + CAN_REF + ", which sits on the shelf edge in the foreground, beaded with condensation, slightly out of focus. Around the camera: a milk carton, a jar, a half lemon, a wire shelf. Ultra-wide 12mm look, cold-warm color split, fur strands lit from beneath, sensor noise in the shadows, no HDR.",
  [CARD.gorilla, PRODUCT_CARD]);
const T02_video = `@image1 as first frame. ${LOCK("the pink gorilla's exact face, fur and body", 2, 3)}

Fridge-cam: the camera is fixed on the middle shelf inside the refrigerator, the framing of @image1 never changes, cold 6500K LED inside, warm kitchen behind.
0-2s: The gorilla peers in, squints at the shelves, its breath fogs faintly in the cold light.
2-4s: Its big hand reaches past the lens and grabs the can right in front of the camera, condensation smearing on the aluminum.
4-6s: It straightens up out of frame, we hear the can crack open with a sharp hiss, its face leans back down for one last look into the lens, and it swings the fridge door shut — the frame goes black.
<fridge hum, a wet grab, can pull-tab hiss, door thump, then silence> no music, no dialogue.
${KEEP("the gorilla", 2, 3)}`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T02_video, images: [T02_still, CARD.gorilla, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={6}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
