/**
 * varg render template — AD TEMPLATES · launch-characters cast · 9:16
 *
 * Twelve short ad formats (5–6 s, vertical), each one self-contained below:
 *   STILL  — nano-banana-2 first frame, prompted "as a photographer" (see rnd/nano-banana-prompting.md)
 *   VIDEO  — Seedance 2.5 omni_reference from that still, with IDENTITY LOCK
 *   LINKS  — every generated file this exact block produced, so any clip can be re-run or compared
 *
 * IDENTITY LOCK (the rule that fixes "random gorilla / random can"):
 *   every video gets THREE kinds of reference, each with an explicit role in the prompt —
 *     @image1  the still            → "as first frame"
 *     @imageN  character card(s)    → "defines the pink gorilla's exact face, fur and body only"
 *     @imageN  PRODUCT card         → "defines the can's exact shape, finish, top and pull tab only"
 *   and the still itself is generated WITH the character card and the product card as references,
 *   so the first frame does not argue with the identity refs.
 *   Verified 2026-09-03 on Gorilla Vlog + Fridge Cam: gorilla and can identical across all frames
 *   and across both clips (file_6d483797d9c9, file_b89227f2d679).
 *
 * MODEL CHOICE:
 *   seedance_2_5 (PiAPI, omni_reference, 720p, 9:16 = 720×1280)  ≈ $2.03 / 5 s, $2.43 / 6 s.
 *   minimax_h3_max is CHEAP ($0.51) but takes NO references — only a first frame — so faces and
 *   products drift the moment they move. Through the varg gateway it also ignored the vertical
 *   input until image_url was passed explicitly in provider_options.fal (output 768×1344).
 *   Use H3 Max only for shots with no face and no product held in hand (splash, balloons at distance).
 *   minimax_h3 reference-to-video (2K, ≈ $4.10) is the other identity-safe option; not tested here.
 *
 * PRODUCT: {PRODUCT} is a placeholder. The canonical placeholder can is generated below; for a real
 * client, replace PRODUCT_CARD with their product photo URL(s) and keep the prompt roles unchanged.
 *
 * All 9:16. Render canvas 720×1280 (or 1080×1920 with an upscale step).
 */

// ─────────────────────────────────────────────────────────────────────────────
// 0. REFERENCES
// ─────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";

// Character cards — neutral-background edits of launch/chars originals (see footer-photoshoot-series.tsx §2)
const CARD = {
  gorilla:    S3 + "file_1eea7ddb50e7.jpg", // chars/20 Jimmy
  ostrich:    S3 + "file_aed3e7296be2.jpg", // chars/16
  womanRed:   S3 + "file_c5a9c0d62fc5.jpg", // chars/1
  sandwich:   S3 + "file_5ab7ba96dcbb.jpg", // chars/9
  ghost:      S3 + "file_459db52154d7.jpg", // chars/10
  donut:      S3 + "file_b383724c4be9.jpg", // chars/11
  hoodie:     S3 + "file_f47a48b6d48d.jpg", // chars/4
  claudeCode: S3 + "file_38cbe7b9b96b.jpg", // chars/27
  microwave:  S3 + "file_6880287ba6a7.jpg", // chars/17 (hamster inside)
  twoHeaded:  S3 + "file_a5ca4e68ce6b.jpg", // chars/26 conjoined — describe anatomically, always
};

// PRODUCT CARD — canonical placeholder can. Generated once, reused everywhere.
// Rendered: file_4a0d89ac9dfa.png
const PRODUCT_CARD = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Product reference card photographed on a 100mm macro at f/11, twin softboxes, on a seamless neutral charcoal-grey studio backdrop (#1a1a1c). One and the same small 330 ml slim aluminum beverage can shown twice side by side: on the left straight front view, on the right three-quarter view from slightly above. The can is a uniform matte burnt-orange (#ff5315 family) with a brushed aluminum texture, no label, no text, no logo; a plain silver aluminum top with a standard stay-on pull tab, a thin silver rim at the base, a small vertical highlight along the left edge from the key light, faint fine scuffs near the bottom rim. Both views identical in proportion and finish, sharp edge to edge, neutral white balance, no reflections of the environment, no glow.",
  aspectRatio: "16:9",
});
// const PRODUCT_CARD = "https://.../client-product-front-and-three-quarter.jpg";   // ← client swap

// Phrase reused in every still so the can matches the card
const CAN_REF = "the exact can from the product reference image — same slim proportions, same matte burnt-orange brushed finish, same silver top and pull tab";

// Role lines reused in every video prompt
const LOCK = (who: string, whoIdx: number, canIdx: number) =>
  `@image${whoIdx} defines ${who} only — it must look identical to @image${whoIdx} in every frame. @image${canIdx} defines the can's exact shape, proportions, matte burnt-orange finish, silver top and pull tab only — the can must look identical to @image${canIdx} in every frame.`;
const KEEP = (who: string, whoIdx: number, canIdx: number) =>
  `Keep ${who} identical to @image${whoIdx} and the can identical to @image${canIdx} throughout. Avoid jitter, flicker, identity drift, extra limbs. No text on screen, no logos.`;

const SEEDANCE = { piapi: { input: { mode: "omni_reference", resolution: "720p", aspect_ratio: "9:16", audio: true } } };
const clip = (text: string, images: any[], duration: number) => (
  <Video model={varg.videoModel("seedance_2_5")} prompt={{ text, images }} aspectRatio="9:16" duration={duration} keepAudio providerOptions={SEEDANCE} />
);
const still = (text: string, images: any[]) =>
  Image({ model: varg.imageModel("nano-banana-2"), prompt: { text, images }, aspectRatio: "9:16" });

// ═════════════════════════════════════════════════════════════════════════════
// T01 · GORILLA VLOG — Shibuya fisheye                              ✅ identity-lock verified
// ═════════════════════════════════════════════════════════════════════════════
// still  → file_a036efeb5145.jpg   video → file_6d483797d9c9.mp4 (720×1280, 6 s, $2.43)
// earlier, no product card: still file_7e8e6da3cb0c · H3 Max 16:9 file_419be31ec594 · H3 Max 9:16 file_a89a14dcc62d (drifts)
const T01_still = still(
  "Candid street vlog still shot on a Sony ZV-1 with a fisheye conversion lens, held at arm's length low and tilted up, strong circular barrel distortion bending the buildings inward. The pink gorilla from the first reference image fills the right half of the frame from the chest up, face close to the lens and slightly stretched by the fisheye, mid-sentence, eyebrows up, holding up beside its face " + CAN_REF + ". Behind it, sharp and real, the Shibuya scramble crossing at dusk: dense crowd mid-crossing with umbrellas, the big video screens lit, wet asphalt, taxi brake lights. Handheld tilt, natural Sony color, faint chromatic aberration at the edges, sensor noise in the shadows, fur strands lit cool by the screens on one side and warm by a shop sign on the other, no HDR, no smoothing.",
  [CARD.gorilla, PRODUCT_CARD]);
const T01_video = `@image1 as first frame. ${LOCK("the pink gorilla's exact face, fur and body", 2, 3)}

Handheld fisheye vlog at Shibuya crossing at dusk, the framing of @image1, natural handheld sway, crowd with umbrellas crossing behind.
0-2.5s: The gorilla looks into the lens and says in a low, bored voice: {Everyone keeps asking what I drink.} It lifts the can closer to the fisheye so it distorts. {This.}
2.5-4.5s: It takes a sip, tiny satisfied nod; screens flicker on the buildings behind, a taxi passes.
4.5-6s: It lowers the can, glances at the crowd, and keeps walking; the camera bobs with its steps.
<dense crowd ambience, Shibuya crossing chime, rain on umbrellas, one low gorilla voice> no music.
${KEEP("the gorilla", 2, 3)}`;

// ═════════════════════════════════════════════════════════════════════════════
// T02 · FRIDGE CAM — POV from the shelf                              ✅ identity-lock verified
// ═════════════════════════════════════════════════════════════════════════════
// still → file_b3174b843e4e.jpg   video → file_b89227f2d679.mp4 (720×1280, 6 s, $2.43)
// earlier: still file_448f02c48463 · H3 Max 16:9 file_685061da54eb · H3 Max 9:16 file_13687271335b
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

// ═════════════════════════════════════════════════════════════════════════════
// T03 · OSTRICH — one gulp                                           ◐ rendered without product card
// ═════════════════════════════════════════════════════════════════════════════
// still (no can card) → file_78a2ea50d130.jpg   Seedance 9:16 → file_0ca920d85a22.mp4 ($2.03)
// H3 Max attempt (rejected by Alex) → file_85881efbcc8e.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T04 · IMPOSSIBLE CUT — can sliced like a fruit                     ◐ rendered without product card
// ═════════════════════════════════════════════════════════════════════════════
// first-frame still → file_02ac0bd43a31.png   (cut-open still, used as last frame in the H3 Max try → file_55def0232ed2.png)
// Seedance 9:16, first frame only → file_3f01288ac57f.mp4 ($2.03)   H3 Max first+last (rejected) → file_338043608d45.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T05 · BILLBOARD BREAK — Jimmy climbs out of the billboard         ◐ rendered without product card
// ═════════════════════════════════════════════════════════════════════════════
// still → file_bc0d3d8270e5.jpg   Seedance 9:16 → file_10a0ad5dd2ad.mp4 ($2.03)   H3 Max (little action) → file_c1936d1d4c06.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T06 · PORTAL — camera follows her into the brand world            ◐ rendered without product card
// ═════════════════════════════════════════════════════════════════════════════
// still v2 → file_e890e5287388.jpg (v1 subway, rejected: file_e57bba57d1be)   Seedance 9:16 → file_262de6866cc5.mp4 ($2.03)
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

// ═════════════════════════════════════════════════════════════════════════════
// T07 · BALLOON LIFT — cliff above the clouds (Pinterest ref)       ○ H3 Max only so far (no face, can at distance → ok)
// ═════════════════════════════════════════════════════════════════════════════
// still → file_58ed03237bc5.jpg (mood ref: https://i.pinimg.com/736x/1f/b5/4b/1fb54b7dbdbea2b4aa1e16a890eb702a.jpg)
// H3 Max 16:9 → file_3abbdfd2da52.mp4 · H3 Max 9:16 → job_4aef4eaedca4 (pending at time of writing)
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

// ═════════════════════════════════════════════════════════════════════════════
// T08 · GIANT CAN — scale                                            ○ H3 Max 9:16 (approved by Alex, can at distance)
// ═════════════════════════════════════════════════════════════════════════════
// still → file_8465696f4fcb.jpg   H3 Max 16:9 → file_49db6d24edcc.mp4 · H3 Max 9:16 → file_5e7d9fed9438.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T09 · HIGH-SPEED SPLASH — freeze + reverse                         ○ Seedance 9:16 (no face; product card recommended)
// ═════════════════════════════════════════════════════════════════════════════
// still → file_4f7f54fd95f2.png   Seedance 9:16 → file_f600204d5e7c.mp4 ($2.03) · H3 Max 16:9 → file_57d2d6b0b0b8.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T10 · MICROWAVE POV — camera inside                                ○ H3 Max 9:16 (approved); Seedance + cards recommended for reuse
// ═════════════════════════════════════════════════════════════════════════════
// still → file_326f1f7fa7e3.jpg   H3 Max 16:9 → file_18e6e17802c2.mp4 · H3 Max 9:16 → file_7e0c19911283.mp4
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

// ═════════════════════════════════════════════════════════════════════════════
// T11 · NATURE DOC — waterhole                                       ○ H3 Max 9:16 (approved "ахуенно"); Seedance + cards for reuse
// ═════════════════════════════════════════════════════════════════════════════
// still → file_f0bb8e975a96.jpg   H3 Max 16:9 → file_501c6c37a8b0.mp4 · H3 Max 9:16 → file_4fafdf69adb2.mp4
const T11_still = still(
  "Wildlife documentary frame, shot on a 600mm f/4 telephoto from a hide at dusk, compressed perspective, heat haze softening the far background. At a shallow savanna waterhole the pink gorilla from the first reference image crouches at the water's edge and drinks, its reflection broken by ripples, dust hanging in the last orange sunlight from behind camera-right. Twenty meters behind it, out of focus, the ostrich from the second reference image stands in tall dry grass, waiting. No other characters. Beside the gorilla in the mud sits " + CAN_REF + ", scratched. Kodak Vision3 500T look, warm dusk grade, visible film grain, natural fur texture wet at the muzzle, no HDR, no glow, no cartoon proportions.",
  [CARD.gorilla, CARD.ostrich, PRODUCT_CARD]);
const T11_video = `@image1 as first frame. @image2 defines the pink gorilla's exact face, fur and body only. @image3 defines the ostrich only. @image4 defines the can's exact shape and finish only.

Wildlife documentary, 600mm telephoto from a hide, locked, heat haze shimmering, same framing as the first frame.
0-3s: The gorilla drinks from the waterhole, ripples spreading, then lifts its head and looks slowly toward the ostrich in the background.
3-5s: It picks up the can from the mud, looks at it, and takes a long drink from it instead.
5-6s: It turns and looks straight down the lens. A calm British narrator whispers: {Only the dominant male drinks first.}
<crickets, wind in dry grass, water drips, one whispered narrator line> no music.
Keep all identities to their reference images. Avoid jitter, flicker, identity drift. No text, no logos.`;

// ═════════════════════════════════════════════════════════════════════════════
// T12 · TWO-HEADED ARGUMENT                                          ○ H3 Max 9:16 ("ну окей"); Seedance + anatomy for reuse
// ═════════════════════════════════════════════════════════════════════════════
// still → file_b4151ad84e51.jpg   H3 Max 16:9 → file_b1fc2ee237ee.mp4 · H3 Max 9:16 → file_d480fdd0ab67.mp4
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION — one clip per template; comment out what you don't need.
// Cost per clip ≈ $2.03 (5 s) / $2.43 (6 s) on Seedance 2.5 + $0.08 per still.
// ─────────────────────────────────────────────────────────────────────────────
export default (
  <Render width={720} height={1280} fps={24}>
    <Clip duration={6}>{clip(T01_video, [T01_still, CARD.gorilla, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={6}>{clip(T02_video, [T02_still, CARD.gorilla, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={5}>{clip(T03_video, [T03_still, CARD.ostrich, PRODUCT_CARD], 5)}</Clip>
    <Clip duration={5}>{clip(T04_video, [T04_still, PRODUCT_CARD], 5)}</Clip>
    <Clip duration={5}>{clip(T05_video, [T05_still, CARD.gorilla, PRODUCT_CARD], 5)}</Clip>
    <Clip duration={5}>{clip(T06_video, [T06_still, CARD.womanRed, PRODUCT_CARD], 5)}</Clip>
    <Clip duration={6}>{clip(T07_video, [T07_still, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={6}>{clip(T08_video, [T08_still, CARD.sandwich, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={5}>{clip(T09_video, [T09_still, PRODUCT_CARD], 5)}</Clip>
    <Clip duration={6}>{clip(T10_video, [T10_still, CARD.microwave, CARD.hoodie, CARD.claudeCode, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={6}>{clip(T11_video, [T11_still, CARD.gorilla, CARD.ostrich, PRODUCT_CARD], 6)}</Clip>
    <Clip duration={6}>{clip(T12_video, [T12_still, CARD.twoHeaded, PRODUCT_CARD], 6)}</Clip>
  </Render>
);

/*
 * STATUS LEGEND
 *   ✅ rendered exactly as written above, identity verified (T01, T02)
 *   ◐  rendered on Seedance 9:16 but BEFORE the product card existed — still had a text-only can;
 *      re-run as written to lock the can (T03–T06, T09)
 *   ○  rendered only on H3 Max (first frame only, no identity lock) — approved visually, but any reuse
 *      with a real client product must go through the Seedance block above (T07, T08, T10, T11, T12)
 *
 * DROPPED: Deity Points (Alex: "just no") — still file_4c8f578c31b3.jpg, H3 Max file_c04c1cb4f49e.mp4.
 * Tilt-Shift Diorama (approved, H3 Max 9:16 file_3a2cc62de14f.mp4) has no character close-ups; keep on H3 Max.
 *
 * BOARD with every version side by side: vargHQ/rnd/footer-loop-board.html
 * Prompting rules: vargHQ/rnd/nano-banana-prompting.md · idea bank: vargHQ/rnd/viral-templates-h3max.md
 */
