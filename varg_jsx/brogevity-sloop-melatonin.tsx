/** @jsxImportSource vargai */
// ============================================================================
// BROGEVITY BRAINROT TEMPLATE (one file = one episode)
// ----------------------------------------------------------------------------
// Format: italian-brainrot character + off-screen narrator who chants the
// character's name and delivers a health fact from the brogevity dataset.
//
// Render:  bunx vargai render brainrot-template.tsx --verbose
//
// Rules when creating a new episode:
//  1. Do NOT touch CHARACTER_PROMPT — it keeps the character consistent and
//     the image cached ($0).
//  2. Only change SCENES: the action part + the narrator line in quotes.
//  3. Narrator line: ~8-12 words per 10-second scene, or the speech won't fit.
//  4. Connect the scenes: same setting ("the same ... on the same ..."),
//     time of day / action continues from the previous scene.
//  5. Lines follow brainrot canon: third-person narrator, name chanting,
//     broken english, rhymes ("Slooparoni / melatonini").
//  6. No style words ("brainrot" etc.) at the start of the image prompt —
//     the model will render them as text on the image. Keep the anti-text
//     tail in the prompt at all times.
//  7. Keep unchanged prompts character-for-character identical — cache hits
//     are free ($0).
// ============================================================================
import { Render, Clip, Image, Video } from "vargai/react"
import { createVarg } from "vargai/ai"

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! })

// ============================== CONFIG ======================================

// --- Character: Sloop (reference image, generated once, cached afterwards) ---
const CHARACTER_PROMPT =
  "hyperrealistic absurd 3D rendered creature: a fusion of a sloth and a wooden sailboat, sleepy smug sloth head on top of a small wooden boat hull with one white sail, furry arms sticking out of the hull, floating on bright blue ocean water, clear sunny sky, dramatic cinematic lighting, surreal photorealistic style, ultra detailed, centered full body shot, absolutely no text, no letters, no words, no captions, no watermark, no logo"

// --- Episode scenes (full prompts, narrator line included) ---
// Episode: "Infrared Light Boosts Melatonin Production" (sleep / anti_aging)
const SCENES: string[] = [
  // Scene 1 — day: sunlight charges the brain with melatonin
  'the sloth-sailboat creature floats on sunny ocean, waves gently rocking, he slowly raises one furry arm toward the blazing sun, golden light glows around his head. An off-screen dramatic deep male narrator voice with slight italian accent chants rhythmically: "Sloop! Sloop! Slooparoni! Sun in the brain make melatonini!" the creature nods proudly. hyperrealistic absurd 3D style, dramatic camera slowly pushing in, no text on screen',

  // Scene 2 — same ocean at sunset: deep sleep, slow aging
  'the same sloth-sailboat creature on the same ocean, sun setting behind him, sky turns orange then starry, his white sail slowly drops over him like a blanket, eyes closing. The same off-screen dramatic narrator voice with slight italian accent chants slower and softer: "He sleep so deep, he age so slow. Sloop... Sloop... Slooparoni." the creature snores once, boat rocks gently. hyperrealistic absurd 3D style, camera slowly pulling back, no text on screen',
]

// --- Render settings ---
const SCENE_DURATION = 10 // seconds per scene (h3-max: 6 or 10)
const TRANSITION = { name: "dissolve", duration: 0.7 }
const WIDTH = 1080
const HEIGHT = 1920
const FPS = 30

// ============================ COMPOSITION ===================================

const character = Image({
  model: varg.imageModel("nano_banana_pro"),
  prompt: CHARACTER_PROMPT,
  aspectRatio: "9:16",
})

const clips = SCENES.map((text) =>
  Video({
    model: varg.videoModel("minimax_h3_max"),
    keepAudio: true,
    prompt: { text, images: [character] },
    duration: SCENE_DURATION,
  })
)

export default (
  <Render width={WIDTH} height={HEIGHT} fps={FPS}>
    {clips.map((clip, i) => (
      <Clip
        duration={SCENE_DURATION}
        transition={i > 0 ? TRANSITION : undefined}
      >
        {clip}
      </Clip>
    ))}
  </Render>
)
