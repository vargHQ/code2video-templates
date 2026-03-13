/** @jsxImportSource vargai */
// Fashion Photoshoot — Clothing Brand Catalog
//
// Generates studio + editorial photos of a character wearing a product.
// Uses dual-reference prompting: one reference for character consistency,
// one for garment consistency.
//
// Customize by swapping CHARACTER_URL and PRODUCT_URL env vars for batch generation:
//   CHARACTER_URL="https://..." PRODUCT_URL="https://..." bun run render templates/fashion-photoshoot.tsx
//
// Usage: bun run render templates/fashion-photoshoot.tsx

import { Clip, Image, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const GARMENT = "vintage band t-shirt with distressed eagle graphic print, black cotton, slightly oversized fit";
const CHAR_FIDELITY = "Maximum consistency with the character's facial features, body proportions, skin tone, hairstyle and identity. Exact reproduction. No reinterpretation.";
const GARMENT_FIDELITY = "Maximum consistency with the clothing from reference: identical print design, fabric texture, print placement, color accuracy, scale of graphic, and material behavior. Do not redraw or alter the garment in any way.";

// ── Character + Product references ──────────────────────────────────────
// Default: generate a character inline. Override with CHARACTER_URL env var for batch runs.
const defaultCharacter = Image({
  prompt: "Young man, mid-20s, light stubble, messy brown hair, relaxed expression, athletic build. Full body standing pose, neutral grey background, photorealistic",
  model: varg.imageModel("soul"),
  aspectRatio: "9:16",
  providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } },
});

const CHARACTER = process.env.CHARACTER_URL ?? defaultCharacter;

// Default: generate a flat-lay product shot. Override with PRODUCT_URL env var.
const defaultProduct = Image({
  prompt: `Flat lay product photography. ${GARMENT}. Neatly laid out on white background, perfectly smooth, no wrinkles. Clean commercial product shot, studio lighting, 8K.`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "1:1",
});

const PRODUCT = process.env.PRODUCT_URL ?? defaultProduct;
const REFS = [CHARACTER, PRODUCT];

// ── Studio Shots ────────────────────────────────────────────────────────

const studioFullBody = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Full-body shot. Person from first reference wearing the exact garment from second reference. Standing naturally with weight on one hip, one hand in pocket. Paired with black slim jeans and white sneakers. Clean white cyclorama studio background, soft even lighting, no harsh shadows. Fashion e-commerce photography.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

const studioMedium = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Medium shot from waist up. Same person, same garment. Relaxed pose, arms crossed loosely, slight smirk. Clean white studio background, even soft lighting. The t-shirt graphic is fully visible and sharp. Fashion catalog photography.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

const studioCloseup = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Tight close-up of the t-shirt graphic print on the chest. Person's chin and neck visible at top of frame. The distressed eagle print is in sharp focus, showing fabric texture, print detail, and slight natural creasing. Clean white background, macro-style detail shot.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

// ── Editorial Shots (varied environments) ───────────────────────────────

const editorialGraffiti = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Person wearing the garment, leaning against a colorful graffiti wall in an urban alley. Golden hour side light casting long shadows. Paired with black cargo pants and combat boots. Confident stance, looking off-camera. Street style editorial photography.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

const editorialWarehouse = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Person wearing the garment inside an industrial warehouse. Concrete floor, exposed steel beams, large windows letting in diffused overcast light. Walking toward camera with purpose, hands in pockets. Dramatic directional light from left. Fashion editorial photography.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

const editorialRooftop = Image({
  prompt: { text: `${CHAR_FIDELITY}. ${GARMENT_FIDELITY}. Person wearing the garment on a rooftop at dusk. City skyline blurred in background with warm bokeh lights. Leaning on railing, wind catching the t-shirt slightly. Shot from above at a slight angle. Warm twilight golden tones. Lifestyle editorial photography.`, images: REFS },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "9:16",
  providerOptions: { varg: { resolution: "2K" } },
});

// ── Animate key shots for a slideshow video ─────────────────────────────

const vidStudio = Video({ prompt: { text: "Model shifts weight casually, adjusts shirt collar, relaxed subtle movement", images: [studioFullBody] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const vidGraffiti = Video({ prompt: { text: "Model pushes off wall, takes a step forward, golden light flickers on face", images: [editorialGraffiti] }, model: varg.videoModel("kling-v2.5"), duration: 5 });
const vidRooftop = Video({ prompt: { text: "Wind catches the shirt, model looks out over city, peaceful confident expression", images: [editorialRooftop] }, model: varg.videoModel("kling-v2.5"), duration: 5 });

// ── Final Render ────────────────────────────────────────────────────────
export default (
  <Render width={1080} height={1920}>
    {/* Studio shots */}
    <Clip duration={1.5}>{studioFullBody}</Clip>
    <Clip duration={1.5}>{studioMedium}</Clip>
    <Clip duration={1.5}>{studioCloseup}</Clip>

    {/* Editorial shots — animated */}
    <Clip cutFrom={0.3} cutTo={2.5}>{vidStudio}</Clip>
    <Clip cutFrom={0.3} cutTo={2.5}>{vidGraffiti}</Clip>
    <Clip cutFrom={0.3} cutTo={2.5}>{vidRooftop}</Clip>

    {/* Editorial stills */}
    <Clip duration={1.5}>{editorialWarehouse}</Clip>
  </Render>
);
