/**
 * varg render template — T03 · OSTRICH — one gulp                                           ◐ rendered without product card
 * 9:16 · Seedance 2.5 omni_reference · 5 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_0ca920d85a22.mp4
 * STATUS:           ◐ rendered on Seedance 9:16 before PRODUCT_CARD existed (text-only can) — re-run as written to lock the can
 * ALL VERSIONS:
 *   still (no can card) → file_78a2ea50d130.jpg   Seedance 9:16 → file_0ca920d85a22.mp4 ($2.03)
 *   H3 Max attempt (rejected by Alex) → file_85881efbcc8e.mp4
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
// T03 · OSTRICH — one gulp                                           ◐ rendered without product card
// ─────────────────────────────────────────────────────────────────────────────
const T03_still = still(
  "Editorial still photographed on a Hasselblad medium format, 80mm at f/4, 1/125s, ISO 100. Tight portrait of the ostrich from the first reference image against a seamless black studio backdrop: its head fills the upper two thirds of the frame, one huge glassy eye dead center with the softbox reflected as a rectangular catchlight, every eyelash and skin wrinkle sharp, the beak holding " + CAN_REF + ", its brushed surface picking up a thin orange rim light from behind. Key: large octabox camera-right, slightly above. Rim: warm 3200K strip light behind the head. Floor: black acrylic with a faint reflection of the neck. Fine film grain like Portra 800, neutral white balance, natural feather microtexture, no plastic sheen, no over-sharpening.",
  [CARD.ostrich, PRODUCT_CARD]);
const T03_video = `@image1 as first frame. ${LOCK("the ostrich's exact look", 2, 3)}

Black studio, hard orange rim light, locked camera on a tripod, the framing of @image1 never changes.
0-1s: The ostrich holds the can in its beak and stares into the lens, perfectly still.
1-3s: It throws its head straight back in one fast motion until the neck is a vertical line up the frame and the beak points at the ceiling, upends the can and chugs it in one continuous swallow, a visible bulge travelling down the long neck, a thin stream spilling at the beak.
3-4.2s: The head whips back down to the lens; the beak opens and drops the empty crumpled can, which bounces once on the black floor.
4.2-5s: The ostrich stares into the lens, unblinking, one feather settling.
<one long gulp, a metallic clink and bounce, studio room tone> no music, no dialogue.
${KEEP("the ostrich", 2, 3)}`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={5}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T03_video, images: [T03_still, CARD.ostrich, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={5}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
