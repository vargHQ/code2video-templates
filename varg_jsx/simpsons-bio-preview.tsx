/** @jsxImportSource vargai */
import { Render, Clip, Image } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ============================================================
// SIMPSONS BIO — IMAGE-ONLY PRE-RENDER
// Generates all reference assets + character keyframes as a
// contact-sheet style "video" of stills. No Seedance, no Speech.
// Approve the look here BEFORE spending on Seedance video.
//
// Render: bun run render templates/templates/simpsons-bio-preview.tsx
// ============================================================

// ─── MASTER STYLE DNA (same tokens as production) ────────
const S = "3D cartoon-style character portrait inspired by Pixar and Disney animation, smooth clean skin, large expressive eyes, soft rounded facial details, playful yet realistic, warm balanced lighting, vibrant but natural colors, polished high-resolution finish, subtle shading, balanced proportions, consistent character design throughout";

const CHAR = "[CHARACTER] the SAME Pixar-style 3D character in every shot: late 20s man, smooth clean skin, large expressive eyes, soft rounded facial details, short messy dark brown hair preserved from the reference, thick square-frame black glasses preserved from the reference, light stubble, wearing a black hoodie with a small white varg logo on the chest, calm confident half-smile. Same face shape, same hair, same outfit across every scene. No face drift, no morphing, no proportion changes";

const CAM = "[CAMERA] cinematic composition with rule of thirds, three-plane depth foreground midground background, leading lines pointing toward the character, deliberate negative space. Subtle slow push-in feel, smooth pan, hard cuts between shots. No whip pans, no motion blur";

const NEG = "[AVOID] no live-action photography, no flat 2D cel-shading, no anime style, no Simpsons style, no yellow skin, no face morphing between shots, no style changes mid-clip, no random background elements not described above, all props serve the story, all background characters render in the same Pixar 3D style as the main character, consistent 3D cartoon rendering throughout";

// ─── ALEX'S REAL REFERENCE PHOTO ──────────────────────────
const alexRef = "https://uu.varg.ai/1778543733810_0zordpfm.png";

// ─── PIXAR-STYLIZED CHARACTER REFERENCE ───────────────────
// Transforms the real photo into a Pixar/Disney 3D cartoon
// while preserving identifying features. Identity seed for
// every keyframe.
const alexSimpsonsRef = Image({
  prompt: {
    text: `Transform this photo into a 3D cartoon-style character portrait. Preserve the person's unique facial features and hairstyle while giving them smooth, clean skin, large expressive eyes, and soft rounded facial details. The style should be inspired by Pixar and Disney animation — playful yet realistic, with warm lighting, balanced proportions, and subtle shading. Make the colors vibrant but natural, with a polished, high-resolution finish. Preserve from the reference: the same face shape, the same dark messy hairstyle, the same thick square-frame black glasses, the same light stubble pattern. He wears a black hoodie with a small white varg logo on the chest. Three-quarter body framing, neutral confident half-smile, hands relaxed at sides, clean soft-grey studio background. This is the master identity reference — every future scene must keep this exact face. ${NEG}.`,
    images: [alexRef]
  },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

// ============================================================
// REFERENCE ASSETS (pre-generated world)
// ============================================================

const colorScript = Image({
  prompt: `${S}. A horizontal color script poster showing 6 mood panels side by side, each panel one act of a tech founder's life. Each panel is a soft Pixar-style color swatch with a tiny stylized silhouette figure showing posture. Panel 1 CHAOS warm yellow and orange, figure split between a gaming chair and a study desk. Panel 2 NOSTALGIA warm amber and cream university afternoon, figure with arms full of papers and a laptop. Panel 3 STRUGGLE cool grey-blue European loft, figure leaning over a server rack. Panel 4 TRIUMPH bright vivid gold and warm white, figure with multiple arms doing parallel tasks. Panel 5 MASTERY polished teal and gold San Francisco sunset, figure standing tall facing a skyline. Panel 6 WARMTH cozy orange living room, figure relaxed and self-aware. Smooth color flow left to right. No words, no captions, no letters. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const propSheet = Image({
  prompt: `${S}. A clean Pixar-style 3D reference sheet on a soft grey studio background, showing 3 recurring props from a tech founder's life story arranged in a 3x3 grid. Each prop in 3 versions evolving left to right. Row 1 THE MUG: a chipped white teenage mug, then a plain dented metal startup mug with a coffee stain ring, then a sleek navy ceramic mug with steam rising. Row 2 THE SCREEN: a chunky old CRT monitor, then a beat-up silver laptop covered in stickers, then a sleek ultrawide curved monitor on a clean desk. Row 3 THE BOOK: a thick worn workbook with a folded corner, then a worn phrasebook with sticky notes, then a clean black hardcover notebook. All rendered as Pixar-style 3D objects with soft shading and warm lighting, evolution from worn to polished. No text labels, no letters. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const bgChars = Image({
  prompt: `${S}. A Pixar-style 3D character lineup showing 5 supporting cast members standing side by side on a clean soft grey background. Character 1 THE SUPERVISOR: friendly elderly man, wild fluffy white hair, long thin grey beard, big round bottle-cap glasses, purple knit sweater vest over a white shirt, warm amused smile, hands clasped behind back. Character 2 THE COFOUNDER: tall slim woman, sharp dark bob haircut, olive-green field jacket, calm smirk and one raised eyebrow, arms crossed. Character 3 THE HOTEL GUEST: stocky middle-aged man, slicked-back grey hair, burgundy velvet jacket, oversized gold wristwatch, curious squint. Character 4 THE HACKATHON KID: very young person, messy bright orange hair, oversized electric-blue hoodie, laptop tucked under one arm, wide excited grin. Character 5 THE SF INVESTOR: athletic woman, sleek blonde ponytail, clean white blazer over a black tee, designer sunglasses, holding a phone, sharp listening expression. All five Pixar-style characters clearly distinct, arranged left to right. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

// ─── LOCATION BOARDS (empty environments per act) ─────────

const loc1 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style teenage bedroom at night, no characters present. Warm yellow and orange palette, glowing screen light. ${CAM}. Right third: a chunky old gaming monitor on a wooden desk, screen glowing blue with a paused video game lobby. Left third: a small black chalkboard nailed to the wall covered in dense handwritten math equations and a half-finished geometry diagram in white chalk. Foreground: edge of an unmade bed with a math textbook lying open face-down. Midground: an empty gaming chair pulled out at an angle, a mechanical keyboard and gaming mouse on the desk. Background: a window showing a moonlit row of grey apartment blocks. Environmental storytelling: a shelf with five mismatched small trophy cups stacked next to a gaming headset, a leaning stack of thick study workbooks, a crumpled empty energy drink can on the floor. Warm chaotic teenage energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const loc2 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style university physics lecture hall during late afternoon, no characters present. Warm amber and cream palette. ${CAM}. Upper two thirds of the frame: a long green chalkboard on the back wall covered in dense handwritten mathematical equations and a clean neural network diagram in white chalk. Foreground: the corner of a wooden front-row desk with two open notebooks side by side and a fountain pen lying across both. Midground: rows of empty wooden lecture-hall desks angled toward the chalkboard, slanting amber sunlight beams through tall windows. Background: a brick wall with a small red logo poster pinned next to an old physics chart. Leading lines: the wooden desk rows converge toward the chalkboard. Environmental storytelling: a coffee mug with stains on a desk, a wall calendar with marks on every day of one month, a small framed revenue chart pinned by the door showing a curve climbing upward. Warm nostalgic study energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const loc3 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style early-stage AI startup loft in a converted European warehouse, no characters present. Cool grey-blue palette. ${CAM}. Left third: a server rack with four GPU tower units and blinking orange and green indicator lights. Foreground: a folding table covered in scattered paper invoices and an open empty pizza box. Midground: a long messy workbench with nine open laptops in a row, each laptop screen glowing softly with a different colorful chart. Background: a brick wall with a hand-painted small company logo, a single window showing a grey overcast sky. Leading lines: black cables snake along the concrete floor from the rack toward the workbench. Environmental storytelling: a small framed gilded portrait propped against the wall, a whiteboard with one bold word underlined three times in red marker, two small foreign-language dictionaries stacked next to a phrasebook. Cold focused early-startup energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const loc4 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style four-quadrant split workspace, no characters present, showing four different work environments combined in one impossible room. Bright vivid gold and warm white celebratory palette. ${CAM}. A central pillar splits the room along the vertical center line into four equal quadrants. Quadrant 1 upper-left: a small hackathon stage with a giant glowing projector screen displaying a world map dotted with thousands of tiny lights. Quadrant 2 upper-right: a long judge table with a tall blank festival sign and a row of empty leather chairs. Quadrant 3 lower-left: a sleek food-tech office with a wall chart climbing upward and a small diagonal sticker on it. Quadrant 4 lower-right: a chaotic desk with ten open laptops arranged in a wide arc, each laptop glowing softly. Background: a tall window flooding all four quadrants with warm gold sunlight. Environmental storytelling: a colorful celebratory banner hanging across the central pillar, a small globe on the foreground table with bright pins marking several cities. Triumphant parallel-lives energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const loc5 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style modern AI studio loft in San Francisco at sunset, no characters present. Polished teal and warm gold palette. ${CAM}. Upper third of the frame: a wide curved wall of eight monitors all glowing with soft abstract colorful imagery. Foreground: edge of a clean standing desk with a sleek navy ceramic mug, a closed slim laptop, and a single black hardcover notebook. Midground: a polished concrete floor softly reflecting the monitor wall, a swivel chair pulled out as if just left. Background: a floor-to-ceiling window on the right showing the Bay Bridge lit up at sunset, downtown skyline glowing teal and gold. Leading lines: the polished floor seams converge from the foreground toward the monitor wall. Environmental storytelling: a small framed photo on the desk showing a cozy bedroom interior, a tiny chalkboard on the wall, a stack of three books on the desk. Calm confident founder energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

const loc6 = Image({
  prompt: `${S}. [SCENE] An EMPTY Pixar-style suburban living room in a classic family-sitcom composition, no characters present. Cozy warm orange and brown palette. ${CAM}. Center: a soft orange couch facing forward, an old CRT television on a wooden stand in front of it slightly to the right. Foreground: a coffee table with a half-finished cup of coffee, a math textbook open face-down, and a gaming controller. Midground: the empty orange couch with a single throw pillow. Background: a wall covered in many small framed photos — bedroom interiors, server rooms, crowds, city skylines, a child's crayon drawing of a rocket. The television screen glows softly with abstract colorful imagery. Leading lines: the rug pattern stripes point from the doorway toward the couch. Environmental storytelling: every framed photo on the wall is a different scene callback, the gaming controller and the coffee cup match objects from earlier in the story. Warm self-aware ending energy. Cinematic Pixar lighting. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

// ============================================================
// CHARACTER KEYFRAMES — Alex's identity placed into each scene
// Single reference (alexSimpsonsRef). Scene described in text.
// ============================================================

const k1 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into a teenage bedroom at night, rendered as a 16-year-old younger version of him with the same face shape, same dark messy hair, same square-frame glasses, but smaller frame, plain black hoodie. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He sits on a gaming chair in the center of the frame, body angled three-quarters toward camera. His right hand rests on a gaming mouse facing a chunky old gaming monitor glowing blue on his right. His left hand stretches out behind him holding a piece of white chalk pressed against a small black chalkboard on the wall covered in handwritten math equations. He is doing both at once. Eyes focused, tongue of concentration sticking out slightly. Warm yellow and orange palette, glowing screen light. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

const k2 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into a university lecture hall during late afternoon, rendered as a young university student version of him in his signature black hoodie with a small white varg logo on the chest. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He stands at the front of the hall facing camera three-quarters, in front of a long green chalkboard covered in dense handwritten mathematical equations and a neural network diagram in white chalk. Both his arms are raised mid-lecture, one piece of white chalk in each hand simultaneously writing on two different parts of the chalkboard. Two open notebooks lie on the lectern in front of him. In the front row of empty wooden lecture-hall desks sits a friendly elderly Pixar-style man with wild fluffy white hair, long thin grey beard, big round bottle-cap glasses, purple knit sweater vest, mouth open mid-laugh with both hands raised in warm amused surrender. Warm amber afternoon sunlight slants through tall windows. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

const k3 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into an early-stage AI startup loft in a converted European warehouse, wearing his signature black hoodie with a small white varg logo on the chest. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He stands at center frame between a tall server rack with four GPU towers on the left and a long workbench of laptops on the right. His right hand inserts a server blade into the rack while his left hand reaches across to gesture toward a framed gilded portrait propped against the wall. Leaning against the brick wall on the right is a Pixar-style tall slim woman with a sharp dark bob and an olive-green field jacket, her arms crossed and a calm smirk on her face. Behind the workbench, several blurred figures sit at the laptops out of focus. Cool grey-blue palette. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

const k4 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into a four-quadrant split workspace combining four different work environments in one impossible room, wearing his signature black hoodie with a small white varg logo on the chest. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He stands at center frame in front of a central pillar that splits the room into four equal zones. His body is oriented straight toward camera with a calm confident half-smile and a relaxed posture (two arms only, normal proportions). He holds a microphone in one hand and a small SOLD sign in the other. Quadrant 1 upper-left: a small hackathon stage with a giant glowing projector screen showing a world map dotted with thousands of tiny lights. Quadrant 2 upper-right: a long judge table with empty leather chairs. Quadrant 3 lower-left: a sleek office wall chart climbing upward. Quadrant 4 lower-right: a chaotic desk with ten open glowing laptops in a wide arc. In the upper-left quadrant cheering: a young Pixar-style person with messy bright orange hair and an oversized electric-blue hoodie. Warm gold sunlight. Triumphant energy. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

const k5 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into a modern AI studio loft in San Francisco at sunset, wearing his signature black hoodie with a small white varg logo on the chest. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He stands at a clean standing desk on the left third of the frame, body facing three-quarters toward camera. His right hand rests calmly on a closed slim laptop. His left hand is wrapped around a sleek navy ceramic mug with steam rising from it. He looks softly toward a wide curved wall of eight monitors on his right, each glowing with abstract colorful imagery. Behind him a floor-to-ceiling window shows the Bay Bridge lit up at sunset and a downtown skyline glowing teal and gold. A small framed photo of a cozy bedroom interior sits on the desk. Calm confident posture. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

const k6 = Image({
  prompt: { text: `${S}. Place the same person from the reference image into a cozy suburban living room in a classic family-sitcom composition, wearing his signature black hoodie with a small white varg logo on the chest. Maintain his exact face and identity from the reference image, no face changes. ${CAM}. He sits in the center of a soft orange couch facing camera, posture relaxed and self-aware. He holds a gaming controller in his right hand and an open math textbook in his left hand simultaneously, balancing both as if it's the most natural thing in the world. An old CRT television in front of him glows softly with abstract colorful imagery. The wall behind the couch is covered in many small framed photos showing bedroom interiors, server rooms, crowds, city skylines, and a child's crayon drawing of a rocket. Cozy warm orange and brown palette. Pixar-style cinematic lighting. ${NEG}.`, images: [alexSimpsonsRef] },
  model: varg.imageModel("nano-banana-2/edit"),
  aspectRatio: "16:9"
});

// ============================================================
// CONTACT SHEET RENDER
// Each image gets 2 seconds. Total: ~32s of still preview.
// Order: identity → world → keyframes (act 1 → 6)
// ============================================================

export default (
  <Render width={1920} height={1080}>
    {/* IDENTITY */}
    <Clip duration={2}>{alexSimpsonsRef}</Clip>

    {/* WORLD REFERENCES */}
    <Clip duration={2}>{colorScript}</Clip>
    <Clip duration={2}>{propSheet}</Clip>
    <Clip duration={2}>{bgChars}</Clip>

    {/* LOCATION BOARDS (empty environments) */}
    <Clip duration={2}>{loc1}</Clip>
    <Clip duration={2}>{loc2}</Clip>
    <Clip duration={2}>{loc3}</Clip>
    <Clip duration={2}>{loc4}</Clip>
    <Clip duration={2}>{loc5}</Clip>
    <Clip duration={2}>{loc6}</Clip>

    {/* CHARACTER KEYFRAMES (Alex placed into each act's location) */}
    <Clip duration={2}>{k1}</Clip>
    <Clip duration={2}>{k2}</Clip>
    <Clip duration={2}>{k3}</Clip>
    <Clip duration={2}>{k4}</Clip>
    <Clip duration={2}>{k5}</Clip>
    <Clip duration={2}>{k6}</Clip>
  </Render>
);
