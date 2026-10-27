/**
 * varg render template — T06 · PORTAL — camera follows her into the brand world            ◐ rendered without product card
 * 9:16 · Seedance 2.5 omni_reference · 5 s · identity lock (still + character card + product card)
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_262de6866cc5.mp4
 * STATUS:           ◐ rendered on Seedance 9:16 before PRODUCT_CARD existed — re-run as written
 * ALL VERSIONS:
 *   still v2 → file_e890e5287388.jpg (v1 subway, rejected: file_e57bba57d1be)   Seedance 9:16 → file_262de6866cc5.mp4 ($2.03)
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
// T06 · PORTAL — camera follows her into the brand world            ◐ rendered without product card
// ─────────────────────────────────────────────────────────────────────────────
const T06_still = still(
  "Cinematic frame shot on an Alexa 35 with a 40mm anamorphic lens, T2, from directly behind the subject at waist height. The woman in the red top from the first reference image walks away from camera across a bleak grey concrete rooftop under a flat overcast sky, one step from a tall oval portal standing on the roof: through the portal we see, in the same perspective, a completely different place — a sun-drenched orange desert canyon at golden hour, warm dust in the air, and far inside it " + CAN_REF + " standing on a rock. Her right arm and half her body are already inside, lit warm 3000K by the canyon sun; the rest of her is cold 6000K grey. The portal's rim is a thin bright orange line that lights the wet concrete at her feet. Anamorphic horizontal flare from the rim, oval bokeh, film grain, no glow beyond the rim, no fantasy particles.",
  [CARD.womanRed, PRODUCT_CARD]);
const T06_video = `@image1 as first frame. ${LOCK("the woman's exact look", 2, 3)}

Anamorphic 40mm, handheld steadicam that FOLLOWS the woman from behind at waist height.
0-1.2s: On the grey overcast rooftop she takes the last step and walks through the tall oval portal; the camera follows right behind her and passes through the orange rim too — the light flares horizontally across the lens as we cross.
1.2-3.5s: We are now inside the golden desert canyon with her: the camera keeps tracking behind her as she walks deeper, then slowly swings around her right shoulder to reveal the new world ahead — towering orange rock walls, warm dust in the sunbeams, the can standing on a rock, birds crossing the sky.
3.5-5s: She stops, picks up the can, and turns to look back past the camera; behind us the portal contracts and closes with a soft thump, leaving only canyon.
<wind on the roof, a whoosh crossing the portal, desert quiet, a low hum as it closes> no music, no dialogue.
${KEEP("the woman", 2, 3)} No fantasy particles.`;

export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={5}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: T06_video, images: [T06_still, CARD.womanRed, PRODUCT_CARD] }}
        aspectRatio="9:16"
        duration={5}
        keepAudio
        providerOptions={SEEDANCE}
      />
    </Clip>
  </Render>
);
