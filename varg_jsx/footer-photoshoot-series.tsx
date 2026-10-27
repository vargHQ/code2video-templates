/** @jsxImportSource vargai */
import { Clip, Image, Render, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

/**
 * varg render template — FOOTER LOOP · GLOSSY PHOTOSHOOT SERIES
 * 7 clips, ~34 s, 1920×1080 @ 24 fps, strobe-flash transitions.
 *
 * Idea: the launch/chars cast does a high-fashion photoshoot on a mirror-black set.
 * Camera locked, every strobe pop = a new group of friends in a new pose, each group
 * gets one gag. Every clip starts AND ends on the same white FLASH frame, so clips
 * concatenate in any order and the flash itself is the transition.
 *
 * Pipeline per clip:
 *   original char (URL) ──card()──► neutral card ──group()──► group still ──► Seedance 2.5 multishot
 * Group stills are the composition references (@imageN); character cards are added when
 * a character's identity needs extra anchoring (android helmet, conjoined woman).
 *
 * Multishot: one 5 s Seedance generation holds up to 3 groups with strobe cuts between
 * them (@imageN per group). Minimum Seedance duration is 4 s.
 *
 * Learned the hard way (see notes at the bottom): moderation, conjoined twins, the hamster.
 *
 * Cost reference (720p): 5 s ≈ $2.03 · 4 s ≈ $1.62 · nano-banana-2 still ≈ $0.08.
 *
 * RENDERED RESULT (this exact template, v7, 39 s, 1280×720, with audio):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_d57fa4a3733f.mp4
 *   clips (same S3 prefix):
 *     1 test        file_097e4912d662.mp4
 *     2 A  Jimmy    file_91f59e34d23c.mp4
 *     3 B  sword    file_6e99082c5180.mp4
 *     4 microwave   file_c1f2037548cd.mp4
 *     5 C  deity    file_b300cf14f7ac.mp4
 *     6 D  roar     file_b38d71f9fbb4.mp4
 *     7 E  android  file_a0d339c4c15e.mp4
 *     8 revenge     file_eae85481df0c.mp4
 *   board: vargHQ/rnd/footer-loop-board.html
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORIGINAL CHARACTERS — launch/chars/N.png uploaded to varg (N = file number)
// ─────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";
const CHARS = {
  womanRed:     S3 + "file_f0ef788a481a.png", // 1  woman in red top
  blazer:       S3 + "file_1893f210e2e9.png", // 2  woman in grey blazer
  leather:      S3 + "file_4e1f3fadf446.png", // 3  young woman, black leather jacket
  hoodie:       S3 + "file_f59cf2964128.png", // 4  young man, light-blue hoodie
  bathrobe:     S3 + "file_7a3e19eceb15.png", // 5  woman in white bathrobe + towel turban
  muscle:       S3 + "file_48030bf11609.png", // 6  huge muscular man, red shorts — STILLS ONLY (see notes)
  rainbow:      S3 + "file_0603f9b46e3c.png", // 7  man, rainbow shirt + leopard pants
  burger:       S3 + "file_33b3ea1d07d9.png", // 8  man in white tee holding a burger
  sandwich:     S3 + "file_495407e9ffac.png", // 9  walking sandwich
  ghost:        S3 + "file_9321e2951b65.png", // 10 ghost in a bedsheet
  donut:        S3 + "file_2e62c399bd16.png", // 11 smiling donut
  hawaiian:     S3 + "file_6869b3af21dd.png", // 12 big man in Hawaiian shirt
  latex:        S3 + "file_aea55dc3d3e5.png", // 13 woman in shiny red latex
  uniform:      "https://uu.varg.ai/1788395227924_y4ol4945.png", // 14 man in red fast-food uniform + cap
  wheelchair:   S3 + "file_267b11b81507.png", // 15 mustached man in overalls, wheelchair
  ostrich:      S3 + "file_8f458fdf1347.png", // 16 ostrich
  microwave:    S3 + "file_06206ae6c4bd.png", // 17 microwave with a HAMSTER inside (see notes)
  bunny:        S3 + "file_7f198afcb77e.png", // 18 small yellow bunny-eared plush
  dachshund:    S3 + "file_a35c97002c4e.png", // 19 dachshund
  gorilla:      S3 + "file_a4243ffa065a.png", // 20 pink gorilla ("Jimmy")
  carrot:       S3 + "file_8ad931f8f59c.png", // 21 round man covered in "carrots" (= varg logos in the original)
  knight:       S3 + "file_205645673254.png", // 22 armored knight, glowing blue sword
  octopus:      S3 + "file_7a8c16bf6b45.png", // 23 octopus in a glass jar
  deity:        S3 + "file_c654f31673b6.png", // 24 bearded figure in red-and-gold robes
  android:      S3 + "file_5e2da5177209.png", // 25 figure in dark full-face helmet + tactical suit
  twoHeaded:    S3 + "file_c9650b6053e5.png", // 26 CONJOINED two-headed woman, red-and-blue jacket
  claudeCode:   "https://uu.varg.ai/1788395246144_p2bjaa0d.png", // 27 red-haired man, blue tee
  blonde:       "https://uu.varg.ai/1788395217581_lkta39oc.png", // 28 blonde woman in mint green
  beigeSuit:    "https://uu.varg.ai/1788395236847_qzhzykyp.png", // 29 man in beige suit
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. NEUTRAL CARDS — strip the game-show stage, keep identity 1:1
// ─────────────────────────────────────────────────────────────────────────────
const CARD_PROMPT =
  "Keep this exact character or subject — identical design, face, outfit, colors, pose, proportions and expression — and re-render as a clean full-body reference card: remove the game-show stage, screens and crowd entirely; place the subject standing on a seamless neutral charcoal-grey studio backdrop (#1a1a1c) with soft even key light and a faint warm orange rim light from behind. Head-to-toe framing, centered, crisp detail, natural texture. No text, no logos, no other people.";

const card = (url: string) =>
  Image({ model: varg.imageModel("nano-banana-2"), prompt: { text: CARD_PROMPT, images: [url] }, aspectRatio: "16:9" });

const C = Object.fromEntries(Object.entries(CHARS).map(([k, url]) => [k, card(url)])) as Record<keyof typeof CHARS, ReturnType<typeof card>>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE SET — shared prefix for every group still
// ─────────────────────────────────────────────────────────────────────────────
const SET =
  "Glossy high-fashion editorial photo caught at the instant of a strobe flash, mirror-black glossy floor, seamless black backdrop, big softbox key, hard saturated orange (#ff5315) rim light from behind, flash bloom in the corner, crisp floor reflections, 85mm, razor sharp, deep blacks. ";
const KEEP = " Keep each character's exact design. No text, no logos.";

const group = (text: string, refs: any[]) =>
  Image({ model: varg.imageModel("nano-banana-2"), prompt: { text: SET + text + KEEP, images: refs }, aspectRatio: "16:9" });

// Conjoined woman — "two-headed woman" reads as TWO women. Always describe anatomically:
const CONJOINED =
  "a CONJOINED two-headed woman — she is ONE single person with ONE torso, ONE red-and-blue leather jacket, ONE pair of black jeans, ONE pair of legs, TWO arms, and TWO heads with curly dark hair growing side by side from the SAME pair of shoulders, exactly as in the reference image";

// ─────────────────────────────────────────────────────────────────────────────
// 4. GROUP STILLS (composition references)
// ─────────────────────────────────────────────────────────────────────────────

// Flash frame — first/last frame of EVERY clip (the transition)
const FLASH = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt: "A full-frame photographic strobe flash: almost pure white frame, slightly blown out, soft warm orange lens flare bloom in the upper right, faint hexagonal bokeh ghosts, the barest hint of a dark glossy studio floor at the bottom edge dissolving into white. No objects, no people, no text.",
  aspectRatio: "16:9",
});

const G_duo = group(
  "A wide editorial duo portrait, two friends posing chest-up against the black backdrop. On the left, the pink gorilla — bright magenta fur, large friendly round eyes, broad grin — throws a peace sign with his right hand and drapes his left arm around the ghost's shoulders. On the right, the ghost — a classic cartoon bedsheet ghost, pure white fabric draped over a child-sized figure, two uneven black oval eye-holes cut out, a small round mouth-hole — leans into the gorilla's side and kicks one foot up behind it, the sheet lifting slightly at the hem. Both look straight into the camera lens with magazine-cover confidence. Shot on a 50mm lens at f/2.8, shallow depth of field, crisp floor reflection. Visible fabric texture on the sheet, visible fur strands on the gorilla — not airbrushed.",
  [C.gorilla, C.ghost]);

const G_trio = group(
  "Three friends posing together like a band: the walking sandwich, the smiling donut and the ostrich from the reference images. The sandwich in the middle with arms spread wide, the donut leaning on it with a hand on its hip, the ostrich on the other side lowering its head into frame with a dramatic side-eye, all confident and playful.",
  [C.sandwich, C.donut, C.ostrich]);

const G_five = group(
  "Five friends crammed together for a group shot: the woman in the red top, " + CONJOINED + ", the man in the beige suit, the dachshund, and the microwave with a cat inside. The woman in red crouches in front holding the dachshund, the two-headed woman and the man in the suit stand behind with arms around each other's shoulders laughing, the microwave sits on a black apple box at the side with the cat peeking out, everyone squeezed in like a group selfie, joyful energy. 50mm.",
  [C.womanRed, C.twoHeaded, C.beigeSuit, C.dachshund, C.microwave]);

const G_hawaiian = group(
  "Three friends posing together: the big man in the Hawaiian shirt throws his arms wide like a host, the round man covered in carrots leans against him laughing, and the ostrich stands behind them with its head resting on the Hawaiian-shirt man's shoulder, all looking at the lens.",
  [C.hawaiian, C.carrot, C.ostrich]);

const G_action = group(
  "Three friends posing together like an action-movie poster: the young woman in the black leather jacket in the middle with arms crossed, the figure in the helmet and tactical suit on one side in a low crouch, and the woman in the shiny red latex outfit on the other side striking a fierce pose with one hand on her hip, all facing the lens.",
  [C.leather, C.android, C.latex]);

const G_nerds = group(
  "Three friends posing together: the young man in the light-blue hoodie and the red-haired man in the blue tee crouch on either side of the microwave with a cat inside, which sits on a black apple box in the middle; both men point at the cat with huge grins like proud parents, the cat stares deadpan at the lens.",
  [C.hoodie, C.claudeCode, C.microwave]);

const G_corporate = group(
  "Three colleagues posing like a corporate team photo gone wrong: the woman in the grey blazer and the man in the beige suit stand back to back with arms crossed, very serious, while between them on a black pedestal sits the glass jar with an octopus inside, one tentacle poking out of the lid and resting on the man's shoulder.",
  [C.blazer, C.beigeSuit, C.octopus]);

const G_disco = group(
  "Three friends posing together: the man in the rainbow-striped shirt and leopard pants strikes a disco point-to-the-sky pose, the blonde woman in the mint-green outfit leans on him laughing, and the ghost in a bedsheet floats between them doing jazz hands, all facing the lens.",
  [C.rainbow, C.blonde, C.ghost]);

const G_knightCrew = group(
  "Four friends posing together: the man in the red fast-food uniform and cap salutes with a spatula, the mustached man in overalls in the wheelchair pops a wheelie in front, the small yellow bunny-eared plush character sits on his lap, and the armored knight with a glowing blue sword stands behind holding the sword upright like a ceremonial guard, all facing the lens.",
  [C.uniform, C.wheelchair, C.bunny, C.knight]);

const G_deity = group(
  "Three friends posing together: the bearded figure in the red-and-gold robes stands in the middle with arms open in a welcoming gesture, the smiling donut character hugs one leg, and the dachshund sits at his feet looking up adoringly; all facing the lens, warm and funny.",
  [C.deity, C.donut, C.dachshund]);

const G_women = group(
  "Five women posing together like a girl-group album cover: the woman in the red top, the woman in the white bathrobe and towel turban, the blonde in the mint-green outfit, the young woman in the black leather jacket, and the woman in the grey blazer — staggered in a V, confident fashion poses, some hands on hips, one crouching in front, all looking at the lens. 50mm.",
  [C.womanRed, C.bathrobe, C.blonde, C.leather, C.blazer]);

const G_creatures = group(
  "Seven non-human friends crammed together for one big group photo: the walking sandwich, the smiling donut, the ghost in a bedsheet, the ostrich, the pink gorilla, the glass jar with an octopus, and the microwave with a cat inside — the gorilla in the back holding the microwave up, the ostrich's neck arching over everyone, the sandwich and donut in front, the ghost peeking from the side, the octopus jar on the floor, chaotic and joyful, everyone looking at the lens. 35mm wide.",
  [C.sandwich, C.donut, C.ghost, C.ostrich, C.gorilla, C.octopus, C.microwave]);

const G_redTeam = group(
  "Four friends posing together: the woman in the shiny red latex outfit and the man in the red fast-food uniform and cap stand back to back like a red-themed duo, the small yellow bunny-eared plush character sits on the man's cap, and the round man covered in carrots does a dramatic lunge in front pointing at the lens.",
  [C.latex, C.uniform, C.bunny, C.carrot]);

const G_wheelchairCrew = group(
  "Four friends posing together: the mustached man in overalls in the wheelchair in front doing a big double thumbs-up, the armored knight with the glowing blue sword kneeling beside him on one knee like a loyal guard, the red-haired man in the blue tee and the young man in the light-blue hoodie standing behind them flashing peace signs, all facing the lens.",
  [C.wheelchair, C.knight, C.claudeCode, C.hoodie]);

const G_food = group(
  "Three friends posing together: the man in the white tee holding a burger holds his burger up next to his face like a phone, the walking sandwich character leans on his shoulder, and the smiling donut character sits on the floor in front with legs crossed — a food-lovers band photo, all grinning at the lens.",
  [C.burger, C.sandwich, C.donut]);

const G_spa = group(
  "Three friends posing together: the woman in the white bathrobe and towel turban does a dramatic hair-flip with the towel, the big man in the Hawaiian shirt beside her flexes both arms with a huge open-mouthed grin, and the dachshund sits between them wearing a tiny towel on its back, all looking at the lens.",
  [C.bathrobe, C.hawaiian, C.dachshund]);
// (original spa group had the muscular man — moderation rejects him in video, so he was swapped out)

// Jimmy — the gorilla being yelled at from both sides
const G_jimmy = group(
  "The pink gorilla sits on a black apple box in the center, facing camera, arms folded, utterly deadpan and unimpressed. On its left, " + CONJOINED + " — leans in with both heads crammed against the gorilla's left ear, both mouths wide open mid-shout, hands gesturing frantically toward something off-frame. On its right, the blonde woman in the mint-green outfit leans in shouting into the gorilla's right ear, grabbing its arm and pointing off-frame, wide-eyed and hysterical with excitement. The conjoined woman must never appear as two separate women.",
  [C.gorilla, C.twoHeaded, C.blonde]);

// Microwave CLOSED — reference for the revenge clip (edit of G_nerds)
const G_microwaveClosed = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt: {
    text: "Keep this exact scene, set, framing, lighting and both men: the glossy black photo studio with mirror floor and orange rim light, the young man in the light-blue hoodie and the red-haired man in the blue tee crouching on either side of the microwave on a black apple box. Change only this: the microwave door is now CLOSED and latched, the interior glows warm orange, and a tabby cat with orange-and-brown striped fur, white paws and yellow eyes is clearly visible through the door window, sitting on the glass plate glaring straight at the camera. Not a black cat, not a hamster. Both men have panicked wide-eyed faces, hands hovering toward the door handle as if about to open it. No text, no logos.",
    images: [G_nerds],
  },
  aspectRatio: "16:9",
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SHARED VIDEO PREAMBLE / SUFFIX
// ─────────────────────────────────────────────────────────────────────────────
const STUDIO =
  "Glossy photo studio, mirror-black floor, black backdrop, softbox key, hard orange rim light, locked-off camera, same framing for every shot. Hard strobe cuts — each cut is a 3-frame white flash.";
const END = "Keep every character's exact design. Avoid jitter, flicker, identity drift, extra limbs. No text, no logos.";
const SEEDANCE_OPTS = { varg: { piapi: { input: { mode: "omni_reference", resolution: "1080p", audio: true } } } };
// Strict route for clips that hit the less-restriction copyright filter
const SEEDANCE_OPTS_STRICT = { varg: { piapi: { input: { mode: "omni_reference", resolution: "1080p", audio: true }, task_type: "seedance-2.5" } } };

const seedance = (text: string, images: any[], duration: number) => (
  <Video model={varg.videoModel("seedance_2_5")} prompt={{ text, images }} aspectRatio="16:9" duration={duration} keepAudio providerOptions={SEEDANCE_OPTS} />
);
const seedanceStrict = (text: string, images: any[], duration: number) => (
  <Video model={varg.videoModel("seedance_2_5")} prompt={{ text, images }} aspectRatio="16:9" duration={duration} keepAudio providerOptions={SEEDANCE_OPTS_STRICT} />
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLIPS (final prompts that rendered)
// ─────────────────────────────────────────────────────────────────────────────

// 1 · TEST multishot — duo → trio → five
const CLIP1 = `@image1 as first frame. @image5 as last frame. @image2 defines the first group and their exact designs: the pink gorilla and the ghost. @image3 defines the second group and their exact designs: the ostrich, the walking sandwich and the smiling donut. @image4 defines the third group and their exact designs: the woman in red, the two-headed woman, the man in the beige suit, the dachshund and the microwave with a cat.

${STUDIO} Fast-paced photoshoot edited with hard strobe cuts.
0-1.6s: From the flash of @image1: the gorilla and the ghost pose; the gorilla lifts the ghost overhead like a trophy, the sheet flutters. <strobe pop> hard cut on a white flash.
1.6-3.3s: The ostrich, sandwich and donut pose like a band; the donut rolls a quick circle and the ostrich photobombs with an open beak. <strobe pop> hard cut on a white flash.
3.3-5s: The five-friends group squeezed together laughing; the cat steps out of the microwave and the dachshund jumps into the woman's arms; they snap into a final pose and the strobe fires and stays — frame blows out to white, ending exactly on @image5.
<rapid camera shutter clicks, strobe pops, laughter> no music.
${END}`;

// 2 · A v4 — "Jimmy! Jimmy! Jimmy!"
const CLIP_A = `@image1 as first frame. @image5 as last frame. @image2 defines group one: burger man, walking sandwich, smiling donut. @image3 defines group two exactly as posed: the pink gorilla (Jimmy) sitting deadpan, arms folded; on its left ONE conjoined woman — one torso, one red-and-blue jacket, one pair of legs, TWO heads from the SAME shoulders, never two separate women — both heads at its left ear; on its right the blonde in mint green at its right ear. @image4 defines group three: Hawaiian-shirt man, carrot man, ostrich.

${STUDIO}
0-1.4s: From the flash of @image1: the burger man takes a bite out of the sandwich's corner; the sandwich screams silently, the donut gasps and rolls out of frame. <strobe pop> white flash cut.
1.4-3.6s: Hold the pose of @image3. The conjoined woman's feet stay planted and her body stays one piece; only her two heads bob and her hands flail as both mouths shout into the gorilla's left ear, pointing off-frame: {Jimmy! Jimmy! Jimmy! Jimmy, look!} The blonde shouts into its right ear: {Jimmy! Jimmy! Jimmy!} — hysterical, like they just saw something amazing and need him to look NOW. The gorilla stays deadpan, arms folded, slowly blinks once at camera. <strobe pop> white flash cut.
3.6-5s: Hawaiian-shirt man and carrot man pose big; the ostrich lunges at the lens until its giant eye fills the frame; strobe fires and stays — blows out to white, ending exactly on @image5.
<shutter clicks, strobe pops, overlapping excited female voices shouting Jimmy, one slow gorilla exhale> no music.
Keep every character's exact design; the conjoined woman remains one body with two heads in every frame. Avoid jitter, flicker, identity drift, extra limbs, splitting characters. No text, no logos.`;

// 3 · B v5 — sword twirl (blade must never vanish) → juggler
const CLIP_B = `@image1 as first frame. @image4 as last frame. @image2 defines group one: the mustached man in overalls in the wheelchair in front, the armored knight with the glowing blue energy blade kneeling beside him, the red-haired guy and the hoodie guy behind. @image3 defines group two: red latex woman, red fast-food uniform man, yellow bunny plush, carrot man.

${STUDIO}
0-2.5s: From the flash of @image1: the knight stands and twirls the glowing blue energy blade in a fast baton-style spin in front of him, the blade staying lit and clearly visible the whole time, tracing a bright blue circle of light; the wheelchair man spins his chair a full 360 in sync with the blade; the two guys behind bob their heads to the rhythm. The knight finishes with the blade raised straight up, still glowing. <strobe pop> white flash cut.
2.5-5s: The fast-food uniform man juggles a soccer ball on knees, head and shoulders like a pro, the bunny plush bounces on his cap in rhythm, the latex woman and the carrot man clap along; he catches the ball on the back of his neck, freezes in a pose, and the strobe fires and stays — blows out to white, ending exactly on @image4.
<shutter clicks, strobe pops, energy blade whoosh loops, wheelchair squeak, ball thuds> no music.
The blade must stay lit and visible in every frame it appears in — it never vanishes. ${END}`;

// 4 · MICROWAVE — lock the cat in and press START (4 s, single group)
const CLIP_MICRO = `@image1 as first frame. @image3 as last frame. @image2 defines the whole scene exactly: the glossy black photo studio with mirror floor and orange rim light, the young man in the light-blue hoodie and the red-haired man in the blue tee crouching on either side of a microwave on a black apple box, a small animal sitting inside the microwave with the door open. Keep this exact set, framing and characters.

One continuous locked-off shot, no cuts, medium wide framing as in @image2.
0-0.7s: From the white flash of @image1 the scene of @image2 appears; the two guys exchange a slow mischievous look.
0.7-1.4s: The hoodie guy reaches over and swings the microwave door SHUT with one finger. It clicks closed; the animal is now seen through the door window.
1.4-2.2s: The red-haired guy dramatically presses the START button. The microwave interior lights up warm orange, a hum begins, the glass plate starts turning.
2.2-3.3s: Through the window the animal rotates slowly on the plate, completely unbothered, staring straight into the lens; both guys lean in from the sides and watch, fascinated, faces lit orange by the microwave light.
3.3-4s: All three look at the camera at once; the strobe fires and stays — the frame blows out to white, ending exactly on @image3.
<studio room tone, a door click, a microwave beep, a low hum> no music.
Keep both men's and the animal's exact designs. The door must visibly close. Avoid jitter, flicker, identity drift, extra limbs. No text, no logos.`;

// 5 · C — deity meme point → five women + dachshund → octopus steals sunglasses
const CLIP_C = `@image1 as first frame. @image5 as last frame. @image2 defines group one and their exact designs: the bearded figure in red-and-gold robes, the smiling donut, the dachshund. @image3 defines group two: five women — red top, white bathrobe with towel turban, blonde in mint green, black leather jacket, grey blazer. @image4 defines group three: the woman in the grey blazer, the man in the beige suit, the glass jar with an octopus on a pedestal.

${STUDIO}
0-1.6s: From the flash of @image1: the robed figure raises one hand and dramatically points a finger straight at the lens like a meme, a golden glow flares behind his head; the donut drops to its knees in worship, the dachshund sprints a full circle around them at top speed. <strobe pop> white flash cut.
1.6-3.3s: The five women hold a fierce girl-group pose; the dachshund tears through between their legs, the bathrobe woman shrieks and jumps, the others crack up, then they all snap back into an even fiercer pose. <strobe pop> white flash cut.
3.3-5s: The blazer woman and the suit man stand back to back, very serious; a tentacle slides out of the jar, plucks the sunglasses off the suit man's face and puts them on the jar lid; the man stays deadpan, then the strobe fires and stays — blows out to white, ending exactly on @image5.
<shutter clicks, strobe pops, a choir hit, dog paws skittering, a shriek and laughter, a wet squelch> no music.
${END}`;

// 6 · D — roar → disco ghost → eight creatures
const CLIP_D = `@image1 as first frame. @image5 as last frame. @image2 defines group one and their exact designs: the woman in the white bathrobe and towel turban, the big man in the Hawaiian shirt, the dachshund. @image3 defines group two: the man in the rainbow-striped shirt and leopard pants, the blonde woman in mint green, the ghost in a bedsheet. @image4 defines group three: seven non-human friends — sandwich, donut, ghost, ostrich, pink gorilla, octopus jar, microwave with a cat.

${STUDIO}
0-1.6s: From the flash of @image1: the Hawaiian-shirt man plants his feet, flexes and ROARS at the lens with his whole body, so hard the bathrobe woman's towel turban flies off her head; the dachshund trots from the man's left side to the woman's right side across the foreground, tail wagging, four paws clearly stepping one after another. <strobe pop> white flash cut.
1.6-3.3s: The rainbow-shirt man does a disco spin and points to the sky, the blonde woman twirls with him; the ghost tries to twirl too and spins so fast it lifts off the floor and hovers, dizzy, then drops back down. <strobe pop> white flash cut.
3.3-5s: The seven creatures are crammed together; the gorilla hoists the microwave overhead, the ostrich stretches its neck over everyone and stares dead into the lens; all freeze in a pose and the strobe fires and stays — blows out to white, ending exactly on @image5.
<shutter clicks, strobe pops, one huge roar, dog paws skittering, disco whoosh> no music.
${END}`;

// 7 · E v2 — blade+ball juggling → android robot dance → gorilla pulls the sheet, nothing under it
const CLIP_E = `@image1 as first frame. @image6 as last frame. @image2 defines group one: red fast-food uniform man, mustached man in overalls in the wheelchair, yellow bunny plush, armored knight with glowing blue energy blade. @image3 defines group two: young woman in black leather jacket, the android in the dark helmet, woman in shiny red latex. @image4 defines the android precisely: dark full-face helmet with smooth visor, dark tactical suit — keep this exact helmet and suit, no other mask. @image5 defines group three: pink gorilla and the ghost in a bedsheet.

${STUDIO}
0-1.6s: From the flash of @image1: the knight tosses the glowing energy blade spinning up, the uniform man catches it and juggles the blade with a soccer ball, the bunny bounces on the wheelchair man's head, the wheelchair man pops a wheelie. <strobe pop> white flash cut.
1.6-3.3s: The android breaks into a stiff robot dance with glitchy jerky freezes, as if buffering, visor catching orange light; the latex woman throws a high kick over its head; the leather-jacket woman stays deadpan, arms crossed, slowly raises one eyebrow. <strobe pop> white flash cut.
3.3-5s: The gorilla yanks the ghost's bedsheet off — nothing underneath, the empty sheet hangs in its fist; the gorilla screams and hides behind the sheet; strobe fires and stays — blows out to white, ending exactly on @image6.
<shutter clicks, strobe pops, energy blade whoosh, ball thuds, servo glitches, gorilla shriek> no music.
${END}`;

// 8 · FINALE — the cat's revenge (5 s, from the CLOSED-microwave reference)
const CLIP_REVENGE = `@image1 as first frame. @image4 as last frame. @image2 defines the whole scene exactly and is the state at the start: closed microwave on a black apple box, interior glowing orange, the cat visible through the door window, the hoodie guy and the red-haired guy crouching on either side in panic. @image3 defines the cat's exact look — a tabby cat with orange-and-brown striped fur, white paws, yellow eyes, not a black cat, not a hamster.

One continuous locked-off shot, slapstick cartoon comedy, no cuts, same framing as @image2.
0-0.6s: From the white flash of @image1 the scene of @image2 appears: the microwave hums, the cat glares through the window, both men panic — wide-eyed, mouths open.
0.6-1.4s: The red-haired guy slaps the STOP button; the hoodie guy grabs the door handle and yanks the MICROWAVE DOOR open toward camera. The door swings wide.
1.4-2.2s: The cat is visible inside the open microwave. It pulls its front paws out first, then its back legs, stepping deliberately onto the edge of the apple box — a clear, readable exit, not an instant teleport. Both men lean back.
2.2-3.2s: The instant all four paws are clear, the cat LEAPS onto the hoodie guy's face; he topples backward off frame flailing; the cat springs onto the red-haired guy's head, he stumbles off the other side. Comedic overreaction, the empty microwave rocks on its box.
3.2-5s: The cat drops onto the black box, sits down neatly, licks a paw, stares straight into the lens, tail flicking; the strobe fires and stays — blows out to white, ending exactly on @image4.
<microwave hum, a beep, a door creak, paws on cardboard, a furious cat yowl, two yelps, thuds, then silence and a soft purr> no music.
The cat is a tabby, not black, not a hamster. No blood, no injuries, pure cartoon slapstick. No text, no logos.`;

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPOSITION — flash-to-flash, straight cuts
// ─────────────────────────────────────────────────────────────────────────────
export default (
  <Render width={1920} height={1080} fps={24}>
    <Clip duration={5}>{seedance(CLIP1,       [FLASH, G_duo, G_trio, G_five, FLASH], 5)}</Clip>
    <Clip duration={5}>{seedance(CLIP_A,      [FLASH, G_food, G_jimmy, G_hawaiian, FLASH], 5)}</Clip>
    <Clip duration={5}>{seedance(CLIP_B,      [FLASH, G_wheelchairCrew, G_redTeam, FLASH], 5)}</Clip>
    <Clip duration={4}>{seedance(CLIP_MICRO,  [FLASH, G_nerds, FLASH], 4)}</Clip>
    <Clip duration={5}>{seedance(CLIP_C,      [FLASH, G_deity, G_women, G_corporate, FLASH], 5)}</Clip>
    <Clip duration={5}>{seedance(CLIP_D,      [FLASH, G_spa, G_disco, G_creatures, FLASH], 5)}</Clip>
    {/* CLIP_E removed — content moderation rejects it in 1080p (knight + wheelchair group still) */}
    <Clip duration={5}>{seedance(CLIP_REVENGE,[FLASH, G_microwaveClosed, G_nerds, FLASH], 5)}</Clip>
  </Render>
);

/*
 * ── NOTES FROM THE 15 ITERATIONS ─────────────────────────────────────────────
 * MODERATION (PiAPI, Seedance 2.5 less-restriction):
 *  · chars/6 (muscular man) is rejected in every video request — real-face likeness. Stills only.
 *  · Any "severed / popped-off arm" wording next to a sword is rejected, even "snap-on toy part".
 *  · A group still of knight + android + wheelchair was rejected regardless of prompt; the same
 *    android in the action-trio still passes. When a still is rejected, swap the still, not the words.
 *  · Cat slapstick without blood/injury passes. Locking the cat in the microwave passes.
 *  · Rejected jobs are not billed.
 * ANATOMY:
 *  · "two-headed woman" → two women. Use CONJOINED above + a still of the exact pose + let the
 *    PARTNER move, not her. Took three attempts; v4 (Jimmy) holds.
 *  · Name the character identity you care about with its own @imageN card (android helmet drifted
 *    to a different mask until C.android was passed explicitly).
 * TIMING:
 *  · 3 groups per 5 s works; the model sometimes gives one group most of the time. Put the gag you
 *    care about FIRST. A single gag with beats (microwave) deserves its own 4 s clip.
 *  · Gags that ask the model to make something disappear ("sword dies", "handle falls off")
 *    produce artifacts. Prefer gags where things stay visible and move.
 * REFS:
 *  · One microwave card as @image made the model copy the card's grey background and static
 *    layout. Pass the group still (scene) as the scene ref, cards only for identity.
 *  · chars/17 holds a HAMSTER, not a cat. Prompts said "cat", so stills show a cat and one video
 *    showed the hamster. Pick one and align CHARS.microwave's card prompt before the next run.
 *  · chars/21 "carrots" are varg logos in the original — left as carrots on purpose.
 */
