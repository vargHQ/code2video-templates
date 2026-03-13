/** @jsxImportSource vargai */
// Adventure Showcase — Multi-Environment Character Video
//
// Demonstrates the SCENE_INDEX pattern: a single template file that renders
// different environments depending on an environment variable. Each environment
// has 3 shots (wide, close-up, hero) with image reference chaining for
// visual consistency, fast cuts, and a packshot end card.
//
// Usage:
//   bun run render templates/adventure-showcase.tsx                 # renders scene 0 (skydiving)
//   SCENE_INDEX=1 bun run render templates/adventure-showcase.tsx   # renders scene 1 (arctic)
//   SCENE_INDEX=2 bun run render templates/adventure-showcase.tsx   # renders scene 2 (desert)

import { elevenlabs, fal, higgsfield } from "vargai/ai";
import { Clip, Image, Music, Packshot, Render, Video } from "vargai/react";

// ── Character ───────────────────────────────────────────────────────────
// Generate a consistent character once, reused across all shots.
const CHAR = "Use the provided character reference. Maximum consistency with the character's facial features, bone structure, skin tone, hair color, hair texture, body proportions and identity. Exact reproduction of the person.";

const character = Image({
  prompt: "Athletic woman, early 30s, sun-kissed skin, dark brown hair pulled back in a ponytail, strong jaw, determined expression. Portrait, neutral background, photorealistic",
  model: higgsfield.imageModel("soul", { styleId: higgsfield.styles.REALISTIC }),
  aspectRatio: "9:16",
});

// ── Scene Definitions ───────────────────────────────────────────────────
interface Shot { image: string; motion: string }
interface Scene { name: string; music: string; a: Shot; b: Shot; c: Shot }

const SCENES: Scene[] = [
  {
    name: "skydiving",
    music: "epic adrenaline electronic, pumping bass, extreme sports energy",
    a: {
      image: `${CHAR}. Aerial view of a volcanic island chain far below, brilliant turquoise ocean, scattered white clouds. She stands at the open cargo door of a military transport plane, wearing a black skydiving jumpsuit with orange accent stripes, black goggles pushed up on forehead, parachute pack on back. Gripping the door frame, wind whipping her ponytail. Photorealistic, 8K.`,
      motion: "Camera pushes forward toward the open door, wind buffets her hair and jumpsuit, she takes a deep breath and leans forward",
    },
    b: {
      image: `${CHAR}. Extreme close-up of her face in freefall, cheeks rippling from wind, ecstatic wide grin, tears streaming sideways from wind. Black goggles pushed up on forehead, sky rushing past behind her. Same black jumpsuit with orange stripes visible at collar. Shot on 50mm, photorealistic.`,
      motion: "Face fills the frame, wind pulls at her skin, she lets out a joyful scream, eyes bright with adrenaline",
    },
    c: {
      image: `${CHAR}. She floats under a deployed black parachute with orange accents, arms spread wide in triumph. Below her stretches a volcanic island with emerald green slopes meeting turquoise lagoons. Golden hour sunset backlights the scene. Same black jumpsuit with orange stripes. Wide shot from slightly below, photorealistic, cinematic.`,
      motion: "Slow gentle descent, she spreads her arms wide, golden light washes over her face, peaceful triumphant expression",
    },
  },
  {
    name: "arctic",
    music: "atmospheric ambient, icy synths, vast frozen wilderness, epic orchestral swells",
    a: {
      image: `${CHAR}. Standing on a ridge of blue glacial ice overlooking a vast Arctic landscape. Jagged ice formations stretch to the horizon under pale twilight sky with green aurora borealis. She wears a dark navy expedition parka with fur-lined hood down, insulated pants, mountaineering boots. Holding ice axes at her sides. Photorealistic, 8K, wide shot.`,
      motion: "Camera slowly cranes upward revealing the massive scale of the glacier, wind kicks up ice crystals around her feet",
    },
    b: {
      image: `${CHAR}. Close-up portrait on the glacier. Frost on her eyebrows and loose strands of hair. Breath visible as white vapor. Ruddy wind-burned cheeks, determined eyes squinting against the cold. Same dark navy parka with fur-lined hood framing her face. Aurora borealis reflects green light on her skin. Shot on 85mm, photorealistic.`,
      motion: "She exhales a cloud of frozen breath, blinks ice crystals from her lashes, eyes scanning the horizon with quiet resolve",
    },
    c: {
      image: `${CHAR}. She stands at the edge of a glowing blue ice cave, one hand touching the crystalline wall. The cave interior glows ethereal blue and turquoise from light filtering through the ice. Same dark navy parka. Her face lit by the ice glow from below, eyes wide with wonder. Wide-angle shot, photorealistic, cinematic.`,
      motion: "She steps into the ice cave, reaches out to touch the glowing wall, camera follows her into the blue light",
    },
  },
  {
    name: "desert",
    music: "cinematic orchestral, sweeping strings, golden hour warmth, adventure theme",
    a: {
      image: `${CHAR}. Standing atop a massive sand dune in the Sahara at golden hour. Endless rolling dunes stretch to the horizon in warm amber and gold tones. Long dramatic shadow cast behind her. She wears a loose linen shirt, cargo pants, desert boots, and a shemagh scarf draped around her neck. Holding a brass compass in one hand. Wide shot, photorealistic, 8K.`,
      motion: "Camera orbits slowly around her, her scarf and shirt flutter in the desert wind, sand grains drift across the dune ridge",
    },
    b: {
      image: `${CHAR}. Close-up as she crouches in the desert sand, examining the brass compass in her palm. Warm golden light illuminates one side of her face, the other in cool shadow. Sand particles caught in the air. Same linen shirt, thin layer of dust on her skin. Shallow depth of field, desert dunes blurred behind. Shot on 85mm, photorealistic.`,
      motion: "She looks down at the compass, it catches the sunlight, she looks up toward the horizon with growing determination",
    },
    c: {
      image: `${CHAR}. She walks toward camera through a narrow canyon with towering red sandstone walls. Dramatic shaft of golden light cuts through the slot canyon from above, illuminating her and leaving the walls in deep shadow. Same linen outfit, dusty. Arms slightly outstretched touching the canyon walls on either side. Photorealistic, cinematic.`,
      motion: "She strides confidently through the light shaft, camera pulls back slowly revealing the canyon scale, golden light wraps around her",
    },
  },
];

// ── Scene selection via env var ─────────────────────────────────────────
const SCENE_INDEX = parseInt(process.env.SCENE_INDEX ?? "0", 10);
const scene = SCENES[SCENE_INDEX] ?? SCENES[0];

// ── Generate images with reference chaining ─────────────────────────────
const imgA = Image({ prompt: { text: scene.a.image, images: [character] }, model: fal.imageModel("nano-banana-pro/edit"), aspectRatio: "9:16", providerOptions: { fal: { resolution: "2K" } } });
const imgB = Image({ prompt: { text: scene.b.image, images: [character, imgA] }, model: fal.imageModel("nano-banana-pro/edit"), aspectRatio: "9:16", providerOptions: { fal: { resolution: "2K" } } });
const imgC = Image({ prompt: { text: scene.c.image, images: [character, imgA] }, model: fal.imageModel("nano-banana-pro/edit"), aspectRatio: "9:16", providerOptions: { fal: { resolution: "2K" } } });

// ── Animate each shot ───────────────────────────────────────────────────
const vidA = Video({ prompt: { text: scene.a.motion, images: [imgA] }, model: fal.videoModel("kling-v2.5"), duration: 5 });
const vidB = Video({ prompt: { text: scene.b.motion, images: [imgB] }, model: fal.videoModel("kling-v2.5"), duration: 5 });
const vidC = Video({ prompt: { text: scene.c.motion, images: [imgC] }, model: fal.videoModel("kling-v2.5"), duration: 5 });

// ── Final Render — fast cuts + packshot ─────────────────────────────────
export default (
  <Render width={1080} height={1920}>
    <Music prompt={scene.music} model={elevenlabs.musicModel()} volume={0.5} />

    {/* Shot A: Wide / establishing — fast cut */}
    <Clip cutFrom={0.3} cutTo={2.0}>{vidA}</Clip>

    {/* Shot B: Close-up / face — fast cut */}
    <Clip cutFrom={0.3} cutTo={1.8}>{vidB}</Clip>

    {/* Shot C: Hero / dramatic — slow-mo payoff */}
    <Clip cutFrom={0.5} cutTo={2.2} duration={2.5}>{vidC}</Clip>

    {/* Packshot end card */}
    <Clip duration={5}>
      <Packshot
        background={imgA}
        title="YOUR BRAND"
        titleColor="#ffffff"
        cta="Watch More"
        ctaColor="#FF6B00"
        ctaTextColor="#ffffff"
        ctaPosition="bottom"
        blinkCta
        blinkFrequency={0.8}
        duration={5}
      />
    </Clip>
  </Render>
);
