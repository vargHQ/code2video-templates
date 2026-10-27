/**
 * varg render template — FOOTER LOOP · HYPERCARS
 * landing-v3 footer background, 26 s seamless loop, 1280×720 @ 24 fps.
 *
 * Structure (first/last-frame chaining, no crossfades):
 *   KF0 glow ─first→ BEAT 1 (hypercar column → wheel) ─last→ KF1 wheel
 *   KF1' ring light ─first→ BEAT 2 (creator conveyor → pupil) ─last→ KF2 pupil
 *   KF2 ─first→ BEAT 3 (style-morph cascade → glow) ─last→ KF0   ⇒ loop closes
 *
 * Every keyframe is generated in this file, so the whole loop is reproducible.
 * Character references are the ORIGINAL launch/chars uploads (URLs below); the
 * neutral-background versions are produced in code from those originals.
 *
 * Seedance 2.5 via varg → PiAPI (omni_reference). Prompts use @imageN, where N
 * is the 1-based position in `images: [...]`. Model held first AND last frame
 * pixel-exact in every test run.
 *
 * Cost reference (720p): Beat 1 8s ≈ $3.24 · Beat 2 10s ≈ $4.05 · Beat 3 8s ≈ $3.24.
 *
 * RENDERED RESULT (this exact template, 26 s, 1280×720):
 *   with audio : https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_b9b19a502791.mp4
 *   muted/web  : https://storage.rendi.dev/files/5e31c7e9-1263-4006-9e72-95259774b19b/5a3762a3-bea4-4fc8-991a-400970ce03ba/footer-loop-720p-muted.mp4
 *   beats      : B1 file_4f5bb9c5e996.mp4 · B2 file_5b2d230674ba.mp4 · B3 file_bd6ac4d5d130.mp4 (same S3 prefix)
 *   board      : vargHQ/rnd/footer-loop-board.html
 */

// ─────────────────────────────────────────────────────────────────────────────
// 0. SHARED STYLE BLOCK + NEGATIVES (kept identical across prompts for cache)
// ─────────────────────────────────────────────────────────────────────────────
const STYLE =
  "STYLE: photoreal cinematic, anamorphic widescreen feel, golden-hour grade pushed toward warm orange (#ff5315 family) in highlights, deep neutral-black shadows, light haze, subtle film grain. No text, no logos, no watermarks, no subtitles, no UI.";
const NEG =
  "Avoid jitter, avoid temporal flicker, avoid identity drift, avoid chaotic composition.";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORIGINAL CHARACTER REFERENCES (launch/chars — uploaded to varg)
//    Only the ones used in this loop. Full 29-map lives in footer-photoshoot-series.tsx
// ─────────────────────────────────────────────────────────────────────────────
const CHARS = {
  womanRed:  "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_f0ef788a481a.png", // chars/1
  sandwich:  "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_495407e9ffac.png", // chars/9
  ghost:     "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_9321e2951b65.png", // chars/10
  donut:     "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_2e62c399bd16.png", // chars/11
  ostrich:   "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_8f458fdf1347.png", // chars/16
  gorilla:   "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_a4243ffa065a.png", // chars/20
  octopus:   "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_7a8c16bf6b45.png", // chars/23
};

// Neutral-background card: strips the game-show stage from an original.
// (Same prompt for every character — identity held 1:1 in all 29 runs.)
const CARD_PROMPT =
  "Keep this exact character or subject — identical design, face, outfit, colors, pose, proportions and expression — and re-render as a clean full-body reference card: remove the game-show stage, screens and crowd entirely; place the subject standing on a seamless neutral charcoal-grey studio backdrop (#1a1a1c) with soft even key light and a faint warm orange rim light from behind. Head-to-toe framing, centered, crisp detail, natural texture. No text, no logos, no other people.";

const card = (url: string) =>
  Image({
    model: varg.imageModel("nano-banana-2"),
    prompt: { text: CARD_PROMPT, images: [url] },
    aspectRatio: "16:9",
  });

const womanRedCard = card(CHARS.womanRed);
const sandwichCard = card(CHARS.sandwich);
const ghostCard    = card(CHARS.ghost);
const donutCard    = card(CHARS.donut);
const ostrichCard  = card(CHARS.ostrich);
const gorillaCard  = card(CHARS.gorilla);
const octopusCard  = card(CHARS.octopus);

// ─────────────────────────────────────────────────────────────────────────────
// 2. KEYFRAMES (the seams of the loop)
// ─────────────────────────────────────────────────────────────────────────────

// KF0 — orange glow. first frame of Beat 1 AND last frame of Beat 3.
const KF0_glow = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Pure near-black background, a single soft warm orange light bloom centered in frame, no shapes, no objects, no text — a diffuse circular glow fading into black, very subtle film grain and faint haze. Cinematic widescreen.",
  aspectRatio: "16:9",
});

// KF1 — hypercar wheel macro (v2; v1 was a round headlight). last frame of Beat 1.
const KF1_wheel = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Extreme macro close-up of the front wheel of an unbranded hypercar: a large multi-spoke matte-black forged rim perfectly centered and filling the frame as a circle, behind the spokes a carbon-ceramic brake disc glowing warm orange (#ff5315) from heat, a thin sky-blue accent line on the rim lip, salt dust on the tire. Everything outside the circle falls to near-black. Sunset backlight. Photoreal cinematic, anamorphic feel, subtle film grain. No logos, no text, no badges.",
  aspectRatio: "16:9",
});

// KF1 v1 — headlight (kept: KF1' was derived from it and the circle position matches)
const KF1_headlight = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Extreme macro close-up of a single round hypercar headlight, lens perfectly centered and filling the frame as a circle, glowing warm orange (#ff5315) from within, faint blue-white LED ring, dust motes in the beam, dark matte body around it falling to near-black. Sunset backlight. Photoreal cinematic, anamorphic feel, subtle film grain. No logos, no text, no badges.",
  aspectRatio: "16:9",
});

// KF1' — ring light, EDIT of the headlight so the circle stays in place. first frame of Beat 2.
const KF1_ringlight = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt: {
    text: "Keep the exact same composition, framing, scale and warm orange glow: replace the car headlight with a circular LED ring light on a tripod in a dark studio, the ring glowing warm orange, a smartphone on a small mount in the very center of the ring where the headlight core was, dark studio background, subtle film grain. No text, no logos.",
    images: [KF1_headlight],
  },
  aspectRatio: "16:9",
});

// KF2 — pupil with orange rim. last frame of Beat 2, first frame of Beat 3.
const KF2_pupil = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "Extreme macro of a human eye, the dark pupil perfectly centered and filling most of the frame as a black circle, with a thin warm orange (#ff5315) ring-light catchlight reflected around the pupil edge and a faint orange rim on the iris. Everything outside the eye falls to near-black. Photoreal cinematic macro, shallow depth of field, natural skin texture on the eyelid edge, subtle film grain. No text.",
  aspectRatio: "16:9",
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONCEPT / STYLE REFERENCES
// ─────────────────────────────────────────────────────────────────────────────

// Divo-style column (unbranded — brand names make the model paint emblems on every car)
const divoColumnStill = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt:
    "High aerial drone shot at sunset: an endless single-file column of identical unbranded hypercars — extremely low and wide stance, matte dark-graphite carbon bodywork with sky-blue aero accents on the splitter, side skirts and rear wing, slim horizontal LED headlights, large rear diffuser — driving in perfect formation one behind another down a dead-straight two-lane highway across a white salt flat, the line of hundreds of cars disappearing over the horizon into a low orange sun. Heat shimmer, long shadows, light haze, salt dust. Photoreal cinematic, anamorphic widescreen, warm orange highlights, deep black shadows, subtle film grain. No logos, no badges, no emblems, no text.",
  aspectRatio: "16:9",
});

// Gorilla style-morph strip — 5 styles in one frame, used as the style reference for Beat 3
const gorillaMorphStrip = Image({
  model: varg.imageModel("nano-banana-2"),
  prompt: {
    text: "Concept frame of a style-morph cascade using exactly the character from the reference image (the pink gorilla — keep its design, face and proportions): one identical medium shot of it sitting behind a small desk holding a smartphone up toward the camera in front of a warm-orange glowing ring light, repeated five times left to right in a horizontal strip on black, identical pose and framing in every panel, rendered in five styles in order: photoreal with warm orange key light, bold 2D anime cel-shaded with thick outlines, claymation with visible fingerprints, glossy toy-like 3D CGI render, neon cyberpunk with magenta and cyan rim light and rain. Panels blend into each other at the edges as a liquid morph. No text, no logos.",
    images: [CHARS.gorilla],
  },
  aspectRatio: "16:9",
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEEDANCE 2.5 PROVIDER OPTIONS
//    omni_reference = multiple @imageN refs; first/last frame via prompt text.
//    Through the gateway use the `varg` namespace.
// ─────────────────────────────────────────────────────────────────────────────
const SEEDANCE_OPTS = {
  varg: { piapi: { input: { mode: "omni_reference", resolution: "720p", audio: true } } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BEAT PROMPTS (final versions that rendered)
// ─────────────────────────────────────────────────────────────────────────────

const BEAT1_PROMPT = `@image1 as first frame. @image2 as last frame. @image3 defines the hypercar design only: extremely low wide stance, matte dark-graphite carbon body, sky-blue aero accents, slim LED headlights, no emblems.

Aerial drone shot of an endless single-file column of identical unbranded hypercars driving one behind another in perfect formation down a dead-straight two-lane highway across a white salt flat at sunset. Heat shimmer, long shadows, salt dust, light haze.
0-1s: From the orange glow of @image1 the shot resolves into a hood-height view right behind the last car, its orange tail lights filling the frame.
1-6s: One continuous steady pull-back-and-climb; the column reveals itself car after car, hundreds of them, an unbroken line disappearing over the horizon into the low orange sun.
6-8s: Camera dives back down toward one car and pushes in on its front wheel until the rim fills the frame as a circle, the brake disc glowing orange behind the spokes, ending exactly on @image2.
${STYLE}
<low engine hum, wind> no music.
${NEG} Avoid cars merging or overlapping, keep the road perfectly straight. No text, no logos, no emblems, no watermarks.`;

const BEAT2_PROMPT = `@image1 as first frame. @image9 as last frame. @image2 defines the woman in the red top only. @image3 defines the walking sandwich character only. @image4 defines the ghost in a bedsheet only. @image5 defines the smiling donut character only. @image6 defines the ostrich only. @image7 defines the pink gorilla only. @image8 defines the octopus in a glass jar only.

A dark factory hall. A wide industrial conveyor belt moves slowly toward the camera carrying UGC filming setups on wooden pallets: each pallet has a small black desk, a warm-orange glowing ring light with a smartphone in its center, and one creator behind it recording. Only practical light from the ring lights, black background, deep shadows, photoreal, subtle film grain.
0-1s: The ring light of @image1 pulls back to reveal the first pallet: the woman in red talks into her phone.
1-8s: One continuous slow crane-up as the belt keeps rolling toward camera; pallets pass one by one with the sandwich holding up a product box, the ghost waving, the donut pointing at its phone, the ostrich pecking at its phone, the gorilla unboxing, the octopus jar glowing — each pallet gets its own beat. Dozens more ring lights recede into the dark; a robotic arm lowers a fresh ring light onto an empty pallet at the far end.
8-10s: Camera pushes into the gorilla's eye until the dark pupil with an orange rim fills the frame, ending exactly on @image9.
<conveyor rumble, soft overlapping chatter, ring light hum> no music.
Preserve every character's exact design, no face distortion. ${NEG} Avoid extra limbs. No text, no logos, no watermarks.`;
// NOTE: the muscular man (chars/6) is rejected by PiAPI moderation in ANY Seedance request
// (real-face likeness). He is fine in nano-banana stills, never in video.

const BEAT3_PROMPT = `@image1 as first frame. @image4 as last frame. @image2 defines the pink gorilla's design, fur and face only. @image3 defines the five rendering styles only.

A single locked-off medium shot, framing never changes: the pink gorilla sits behind a small black desk holding a smartphone up toward the lens in front of a warm-orange glowing ring light, black background. Its pose, phone position and framing stay identical while the rendering style flows from one to the next as one continuous liquid morph — no cuts, no flashes.
0-1s: Pull out of the pupil of @image1; the orange rim becomes the ring light behind the photoreal gorilla, warm orange key light.
1-2.5s: Morph into bold 2D anime illustration, cel-shaded flat coloring, thick confident outlines.
2.5-4s: Morph into claymation — soft moldable clay texture on every surface, visible fingerprint and tool marks.
4-5.5s: Morph into glossy toy-like 3D CGI render, studio HDRI reflections.
5.5-7s: Morph into neon cyberpunk — magenta and cyan rim lights, wet reflective surfaces, light rain.
7-8s: All color drains toward a single warm orange bloom that swallows the frame, ending exactly on @image4.
Keep the gorilla's identity, pose, phone position and framing identical through every style. <soft synth swell> no dialogue.
${NEG} Avoid hard cuts between styles. No text, no logos, no watermarks.`;

// ─────────────────────────────────────────────────────────────────────────────
// 6. COMPOSITION — straight concat, seams are pixel-matched keyframes
// ─────────────────────────────────────────────────────────────────────────────
export default (
  <Render width={1280} height={720} fps={24}>
    {/* BEAT 1 — power: Divo-style column → wheel */}
    <Clip duration={8}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: BEAT1_PROMPT, images: [KF0_glow, KF1_wheel, divoColumnStill] }}
        aspectRatio="16:9"
        duration={8}
        keepAudio
        providerOptions={SEEDANCE_OPTS}
      />
    </Clip>

    {/* BEAT 2 — automation: creator conveyor → pupil */}
    <Clip duration={10}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{
          text: BEAT2_PROMPT,
          images: [
            KF1_ringlight,
            womanRedCard, sandwichCard, ghostCard, donutCard, ostrichCard, gorillaCard, octopusCard,
            KF2_pupil,
          ],
        }}
        aspectRatio="16:9"
        duration={10}
        keepAudio
        providerOptions={SEEDANCE_OPTS}
      />
    </Clip>

    {/* BEAT 3 — creativity: style-morph cascade → glow (closes the loop into Beat 1) */}
    <Clip duration={8}>
      <Video
        model={varg.videoModel("seedance_2_5")}
        prompt={{ text: BEAT3_PROMPT, images: [KF2_pupil, gorillaCard, gorillaMorphStrip, KF0_glow] }}
        aspectRatio="16:9"
        duration={8}
        keepAudio
        providerOptions={SEEDANCE_OPTS}
      />
    </Clip>
  </Render>
);

/*
 * Post for the site: strip audio, faststart, plus webm —
 *   ffmpeg -i out.mp4 -an -c:v libx264 -crf 22 -preset slow -movflags +faststart footer-loop.mp4
 *   ffmpeg -i out.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 footer-loop.webm
 * In landing-v3: full-bleed section under FinalCta + Footer, mask-image fade to #070708 at top,
 * poster = KF0_glow, prefers-reduced-motion → static poster.
 */
