/**
 * varg render template — T09 · HIGH-SPEED SPLASH — freeze + reverse                         ○ Seedance 9:16 (no face; product card recommended)
 * 9:16 · Seedance 2.5 omni_reference · 5 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_f600204d5e7c.mp4
 * STATUS:           ◐ rendered on Seedance 9:16 before PRODUCT_CARD existed — re-run as written
 * ALL VERSIONS:
 *   still → file_4f7f54fd95f2.png   Seedance 9:16 → file_f600204d5e7c.mp4 ($2.03) · H3 Max 16:9 → file_57d2d6b0b0b8.mp4
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
// T09 · HIGH-SPEED SPLASH — freeze + reverse                         ○ Seedance 9:16 (no face; product card recommended)
// ─────────────────────────────────────────────────────────────────────────────
const T09_still = still(
  "High-speed photograph, 1/16000s, 100mm macro at f/11, two bare-bulb strobes. " + CAN_REF.replace("the exact can", "The exact can") + " has just plunged into a glass tank of clear water: the moment of impact is frozen — a crown-shaped splash rising around it, hundreds of individual droplets suspended in the air, a sheet of water peeling up the can's side, air bubbles streaming below the surface. Pure black background, the strobes back-lighting the water so every droplet is a bright rim-lit sphere, the can's orange saturated against black. Razor-sharp droplets, no motion blur, no glow, no floating debris.",
  [PRODUCT_CARD]);
const T09_video = `@image1 as first frame. @image2 defines the can's exact shape, proportions and finish only.

High-speed studio shot, 1/16000 look, locked camera on a glass water tank against black, two back-lighting strobes, the framing of @image1 never changes.
0-2.5s: Extreme slow motion: the crown splash continues to bloom upward and outward, each droplet a separate rim-lit sphere climbing and slowing, a thin sheet of water peeling up the can's side, the can sinking a few centimeters, bubbles unfurling below the surface.
2.5-4.5s: Time reverses at the same slow speed: the droplets fall back, the crown collapses into the surface, the sheet slides back down, and the can rises out of the water dry.
4.5-5s: The can lifts clear of the surface and hangs in the air above a perfectly still tank.
<deep slowed water impact, then the same sound reversed, a final still silence> no music, no dialogue.
Photoreal high-speed photography, no motion blur, no glow, no floating debris. Avoid jitter, flicker. No text, no logos.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={5}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T09_video, images: [T09_still, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={5}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
