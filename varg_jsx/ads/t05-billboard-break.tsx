/**
 * varg render template — T05 · BILLBOARD BREAK — Jimmy climbs out of the billboard         ◐ rendered without product card
 * 9:16 · Seedance 2.5 omni_reference · 5 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_10a0ad5dd2ad.mp4
 * STATUS:           ◐ rendered on Seedance 9:16 before PRODUCT_CARD existed — re-run as written
 * ALL VERSIONS:
 *   still → file_bc0d3d8270e5.jpg   Seedance 9:16 → file_10a0ad5dd2ad.mp4 ($2.03)   H3 Max (little action) → file_c1936d1d4c06.mp4
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
// T05 · BILLBOARD BREAK — Jimmy climbs out of the billboard         ◐ rendered without product card
// ─────────────────────────────────────────────────────────────────────────────
const T05_still = still(
  "Street photograph shot on a 35mm at f/5.6 from a sidewalk at dusk, looking up. A huge illuminated billboard on the side of a brick building shows the pink gorilla from the first reference image, but it is breaking the frame: its upper body leans out over the billboard's edge into real space, one big arm hanging down over the street holding " + CAN_REF + ", its shadow falling on the building below, the billboard's own floodlights lighting its fur from beneath. On the sidewalk, tiny in the lower third, three pedestrians stop and look up, one filming with a phone. Wet asphalt, neon reflections, blue hour sky, Cinestill 800T halation on the lights, fine grain, no HDR.",
  [CARD.gorilla, PRODUCT_CARD]);
const T05_video = `@image1 as first frame. ${LOCK("the pink gorilla's exact face, fur and body", 2, 3)}

Blue-hour street, camera on the sidewalk looking up at the billboard, Cinestill 800T halation on the lights.
0-1s: The gorilla on the billboard, already leaning out of the frame, suddenly grabs the billboard's edge with both hands and heaves itself fully out into real space.
1-3s: It swings down the face of the brick building in two big drops — ledge, fire escape — and lands on the sidewalk with a heavy thud in front of the three pedestrians, who stumble back; the camera tilts down to follow it the whole way.
3-4.2s: Standing at full height on the sidewalk, it holds out the can to the nearest pedestrian and says in a low calm voice: {Try this.}
4.2-5s: The pedestrian takes it; the gorilla turns and looks straight into the lens. Behind it the billboard is now an empty lit rectangle.
<street ambience, two heavy impacts, a gasp, one low gorilla line> no music.
${KEEP("the gorilla", 2, 3)} No text on the billboard.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={5}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T05_video, images: [T05_still, CARD.gorilla, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={5}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
