# Visual direction

Propose three directions tailored to the product, each in two sentences: opening image, dominant material, typography, and transition idea. Examples to adapt:

- Editorial: oversized typography, restrained layout, and a sharply framed product detail.
- Product stage: a calm background, a legible interface card, and transitions driven by the demonstrated action.
- Tactile: original paper or material shapes supporting the product, with deliberate texture and measured movement.

Recommend one direction based on the brief, screen readability, and available assets. Record the decision and implement it consistently. Borrow a reference's timing or composition principle while using original copy, assets, and arrangement.

## Set tokens before motion

Define background, text, primary accent, muted color, spacing, radii, typefaces, and font weights in shared settings. Prefer one display face and one interface face. Use installed or supplied fonts and verify their actual rendered appearance.

Each shot needs a main subject, a focal point, and intentional empty space. Give product labels enough size and contrast at phone viewing scale. Long explanations belong in another shot or in the accompanying post.

Create the opening, action, result, and closing stills. Use actual product content. Inspect the longest headline and result label before animating their containers.

## Light and material

Use reflections to describe a surface. Keep soft sheen clipped inside the intended card and thin rim glints on its edges. Limit brightness so the actual interface remains readable at the brightest frame.

For a quiet reading hold, reduce decorative movement. Let the important transformation own attention. Use glow, particles, glass, and camera movement only when they support the selected direction and the product action.

Record deliberate exceptions in this file. A revision to one scene must retain the film's shared typography, palette, and object proportions.

## Specify the scene as a designed frame

Write a compact style contract with exact colors, type families and weights, spacing scale, safe margins, card radius, shadow layers, light direction, and material roughness/opacity where relevant. Set the camera position and depth ordering before adding parallax. Let the product content carry the main visual information.

Define visual roles explicitly: headline owns the promise, screen owns the demonstration, accent owns the active control, result label owns the payoff. Test the frame at phone scale. Use the longest real copy and actual UI state; a short placeholder does not establish that the layout works. The final reading hold must have enough contrast and space at the brightest lighting moment.

For a luminous product direction, use one broad low-contrast reflection plus one thin moving edge highlight. Mask both to their surface. Keep highlight timing slow during reading holds. Use depth through overlap, contact shadows, and coherent light; avoid covering the interface with decorative haze.

## Official implementation resources

- [Animation properties](https://www.remotion.dev/docs/animating-properties)

## Decision (2026-10-28)

Directions offered: (1) Editorial: giant "How to" type with the screen as a detail; (2) Product stage: one card on the site's own dark dot field, the search is the action; (3) Tactile: paper cut-outs of result cards. Chosen: **2, product stage**, because the screens are the proof and the site is already dark and typographic.
Closing (revised 2026-10-29, founder: the "how to" button looked flat and still): built in vector, not a logo crop.
The mark is the site's SVG; "how to" is `LiquidPill`, a frame-driven chrome conic ring (2.2 deg/frame) around a dark
core with white-to-silver letters, a moving glare and an orange bloom on its entrance; the URL is a solid accent
button (#ff7a45 -> #fc5215 -> #e2450c) with its own glare. The same ring is laid over the captured hero pill.
Tokens (src/config/tokens.ts): bg #070708, accent #fc5215 (sampled pixel), fg #fff, fg2 #a1a1aa, line rgba(255,255,255,.13), radius 22, safe 96. Type: Geist 500 (substitute for the site's licensed Aeonik), display 68 px, labels 58 px, tracking -0.03em. One broad sheen (4.5% white) clipped to the card + 1 px top rim; contact shadow 40/90.
