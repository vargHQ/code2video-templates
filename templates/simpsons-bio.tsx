/** @jsxImportSource vargai */
import { Render, Clip, Image, Video, Speech, Music, Captions } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ============================================================
// SIMPSONS BIO — ALEX VARG
// Built on SEEDANCE-BIO-STYLE-GUIDE.md
// Audio-first: VO drives clip durations, snapped to Seedance 5/10/15s.
// ============================================================
//
// BEAT SHEET (therefore/but rule — Trey Parker & Matt Stone):
//
// Act 1 — COLD OPEN: 16-year-old Alex, Moscow bedroom, gaming
//   ranked match AND solving a math olympiad at the same time.
//     → BUT: This wasn't a phase. He kept stacking incompatible
//       lives.
//
// Act 2 — ORIGIN: MIPT bachelor's AND Yandex Data School unofficial
//   master's simultaneously. ML thesis = +$12M/yr for Yandex.
//   Supervisor: "we don't know what to give you."
//     → THEREFORE: He turned down the promotion.
//
// Act 3 — STRUGGLE: 2018. 9 elite engineers. Europe. GPUs in
//   2019. Selling AI art in 5-star hotels for 1 ETH before
//   NFTs existed.
//     → BUT: While doing all that, a parallel empire was running.
//
// Act 4 — PARALLEL LIVES: 40k-dev hackathon community. $2M AI
//   competition juries. Food tech to $500k ARR. 10 projects in
//   one year. Hungarian and Russian on top.
//     → THEREFORE: Everything converged on one move.
//
// Act 5 — EMPIRE: SF. varg.ai. Media infrastructure for AI agents.
//     → BUT: It's still the same kid. Still combining things.
//
// Act 6 — PUNCHLINE: Couch gag. Controller + math textbook,
//   varg.ai on the TV. Shrug. Iris-out.
//
// THEREFORE/BUT AUDIT:
//   1→2: but | 2→3: therefore | 3→4: but | 4→5: therefore | 5→6: but
//   "but" count: 3 ✓
// ============================================================

// ─── MASTER STYLE DNA — exact same tokens every prompt ────
// Seedance 2.0 research: layered [Style] [Scene] [Camera] blocks,
// timestamped shots inside one prompt, repeat tokens verbatim.

const S = "3D cartoon-style character portrait inspired by Pixar and Disney animation, smooth clean skin, large expressive eyes, soft rounded facial details, playful yet realistic, warm balanced lighting, vibrant but natural colors, polished high-resolution finish, subtle shading, balanced proportions, consistent character design throughout";

const CHAR = "[CHARACTER] the SAME Pixar-style 3D character in every shot: late 20s man, smooth clean skin, large expressive eyes, soft rounded facial details, short messy dark brown hair preserved from the reference, thick square-frame black glasses preserved from the reference, light stubble, wearing a black hoodie with a small white varg logo on the chest, calm confident half-smile. Same face shape, same hair, same outfit across every scene. No face drift, no morphing, no proportion changes";

const CAM = "[CAMERA] cinematic composition with rule of thirds, three-plane depth foreground midground background, leading lines pointing toward the character, deliberate negative space. Subtle slow push-in, smooth pan, hard cuts between shots. No whip pans, no motion blur";

const NEG = "[AVOID] no live-action photography, no flat 2D cel-shading, no anime style, no Simpsons style, no yellow skin, no face morphing between shots, no style changes mid-clip, no random background elements not described above, all props serve the story, all background characters render in the same Pixar 3D style as the main character, consistent 3D cartoon rendering throughout";

// ─── VOICEOVER (audio-first, biographer third-person) ────
// Narrator voice — documentary biography, not first-person.

const { audio, segments } = await Speech({
  voice: "nPczCjzI2devNBz1zQrb",
  model: varg.speechModel("eleven_v3"),
  children: [
    "Alex Varga has spent his entire life combining things that aren't supposed to combine. At sixteen — a top two hundred League of Legends player in Europe. Same year — a student at one of Moscow's strongest math schools. Fifteen olympiads. Twenty grand in prizes. Classmates who won the International Math Olympiad.",
    "He went on to MIPT, where he completed a bachelor's and an unofficial master's at the same time. His machine learning thesis added twelve million a year to Yandex. His supervisor simply laughed and said: we don't know what to give you for a real master's.",
    "So he turned down the promotion. He hired nine elite engineers from his university and moved to Europe. A year later they were training image models on GPUs and selling AI-generated art in five-star hotels for one ETH — before NFTs existed.",
    "On the side, he built a hackathon community of forty thousand developers. He judged two-million-dollar AI competitions. Grew a food-tech company to half a million ARR — and sold it. Then built ten projects in a single year. He also speaks Hungarian and Russian.",
    "Today, he lives in San Francisco. He runs varg dot ai — building media infrastructure for AI agents. The same kid from the Moscow math school. Still combining things that aren't supposed to combine."
  ]
});

// Seedance hard constraint: clips must be EXACTLY 5, 10, or 15s.
const sd = (d: number): 5 | 10 | 15 => d <= 7 ? 5 : d <= 12 ? 10 : 15;

const d1 = segments[0].duration; // Act 1
const d2 = segments[1].duration; // Act 2
const d3 = segments[2].duration; // Act 3
const d4 = segments[3].duration; // Act 4
const d5 = segments[4].duration; // Act 5 + 6 share the tail

// Each act gets one Seedance clip sized to fit its VO segment.
// Act 5 segment is split between Act 5 (founder reveal) and Act 6 (couch gag).
const ACT1 = sd(d1);
const ACT2 = sd(d2);
const ACT3 = sd(d3);
const ACT4 = sd(d4);
const ACT5 = sd(d5 * 0.6);
const ACT6 = sd(d5 * 0.4);

const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0);

// ============================================================
// CINEMATIC ASSET PRE-GENERATION
// Per style guide: generate the world before placing the
// character in it. These images become the [SCENE] reference
// for each Seedance generation via nano-banana-2/edit.
// ============================================================

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

// Color script — emotional arc reference
const colorScript = Image({
  prompt: `${S}. A horizontal color script poster showing 6 mood panels side by side, each panel one act of a tech founder's life. Each panel is a soft Pixar-style color swatch with a tiny stylized silhouette figure showing posture. Panel 1 CHAOS warm yellow and orange, figure split between a gaming chair and a study desk. Panel 2 NOSTALGIA warm amber and cream university afternoon, figure with arms full of papers and a laptop. Panel 3 STRUGGLE cool grey-blue European loft, figure leaning over a server rack. Panel 4 TRIUMPH bright vivid gold and warm white, figure with multiple arms doing parallel tasks. Panel 5 MASTERY polished teal and gold San Francisco sunset, figure standing tall facing a skyline. Panel 6 WARMTH cozy orange living room, figure relaxed and self-aware. Smooth color flow left to right. No words, no captions, no letters. ${NEG}.`,
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9"
});

// ─── Location Boards (one per act) ────────────────────────
// Each location is an EMPTY environment composed with rule of
// thirds + 3-plane depth + leading lines + environmental
// storytelling props that silently advance the narrative.

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
// ACT KEYFRAMES — character placed into locations via /edit
// One keyframe per act. Each keyframe is the [Scene] reference
// image passed to Seedance. Seedance then animates within
// that scene using its layered timestamped prompt format.
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
// SEEDANCE CLIPS — one per act, sized to VO segment.
// Format follows the research: layered [Style] [Duration]
// [Scene] [Shot 00:00-00:0X] blocks with timestamps that
// segment internal action within a single Seedance call.
// ============================================================

// ─── ACT 1 — THE COLD OPEN ────────────────────────────────
const v1 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT1} seconds. [Scene] Pixar-style teenage bedroom at night, warm yellow and orange palette, soft gaming monitor glow on the character's face. ${CHAR} as a teenage version (16 years old, same face, plain black hoodie). ${CAM}.
[00:00-00:0${Math.floor(ACT1 / 3)}] Shot 1: Wide establishing push-in from the open bedroom doorway toward the teenage character at the gaming desk. He sits in the gaming chair, body facing the glowing monitor. Camera holds steady, very slight forward drift. He clicks the mouse twice.
[00:0${Math.floor(ACT1 / 3)}-00:0${Math.floor((ACT1 * 2) / 3)}] Shot 2: Cut to a medium close-up. His head swivels rapidly from the monitor on his right to the chalkboard on his left. He reaches behind himself with his left hand and writes one line of a geometry proof on the chalkboard without looking, then snaps his head back to the monitor and clicks the mouse. A small cartoon light bulb pops above his head and pulses once.
[00:0${Math.floor((ACT1 * 2) / 3)}-00:${String(ACT1).padStart(2, "0")}] Shot 3: Cut to a triumph hold. He stands on the gaming chair, one arm pumped in victory holding the gaming controller, the other arm holding a small trophy cup. Eyes closed, huge proud grin. Warm yellow triumph rays radiate outward in a Pixar-cartoon style.
${NEG}.`, images: [k1] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT1,
  aspectRatio: "16:9"
});

// ─── ACT 2 — THE ORIGIN ───────────────────────────────────
const v2 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT2} seconds. [Scene] Pixar-style university lecture hall late afternoon, warm amber light through tall windows, long green chalkboard covered in handwritten math equations. ${CHAR} as a young university student version. ${CAM}.
[00:00-00:0${Math.floor(ACT2 / 3)}] Shot 1: Wide shot of the lecture hall. The character stands at the lectern at the front, both arms moving in parallel writing on two different parts of the chalkboard simultaneously with a piece of white chalk in each hand. Camera slowly pushes in from the back row toward him. Amber sunlight beams shift slightly.
[00:0${Math.floor(ACT2 / 3)}-00:0${Math.floor((ACT2 * 2) / 3)}] Shot 2: Cut to a tight two-shot. The Supervisor (Pixar-style friendly elderly man with fluffy wild white hair, long thin grey beard, big round bottle-cap glasses, purple knit sweater vest) sits in the front row of desks. He leans back and laughs warmly, head tilted up, both hands raised in amused surrender. The character stands beside him holding a thick bound thesis, humble half-smile.
[00:0${Math.floor((ACT2 * 2) / 3)}-00:${String(ACT2).padStart(2, "0")}] Shot 3: Cut to a medium close-up of the character at the doorway of the lecture hall. He holds a single sealed envelope in his hand. He slowly crumples the envelope into a ball with one hand, drops it to the floor without looking, and walks out of frame into the warm amber doorway light. Resolved cinematic exit.
${NEG}.`, images: [k2] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT2,
  aspectRatio: "16:9"
});

// ─── ACT 3 — THE STRUGGLE ─────────────────────────────────
const v3 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT3} seconds. [Scene] Pixar-style European startup loft, cool grey-blue palette, brick walls, server rack on the left, workbench of laptops on the right. ${CHAR}. The Cofounder (Pixar-style tall slim woman, sharp dark bob, olive-green field jacket, calm smirk, arms crossed) leans against the right brick wall. ${CAM}.
[00:00-00:0${Math.floor(ACT3 / 3)}] Shot 1: Wide shot of the loft. The character stands at center frame, lifting a folded paper document above his head with quiet pride. Several blurred figures at the workbench look up from their laptops in unison. The Cofounder gives a slow approving nod with her smirk. Camera holds steady on the wide composition.
[00:0${Math.floor(ACT3 / 3)}-00:0${Math.floor((ACT3 * 2) / 3)}] Shot 2: Cut to a tight shot in the server-rack aisle. The character slides a server blade into the rack with both hands. The GPU indicator lights cascade-blink from off to fully lit in a wave across the rack. Behind him several training progress bars on the workbench monitors race from low to high. The framed gilded portrait propped against the wall shimmers and resolves into a more polished version of itself.
[00:0${Math.floor((ACT3 * 2) / 3)}-00:${String(ACT3).padStart(2, "0")}] Shot 3: Cut to an opulent five-star hotel corridor with marble floors and gold sconces. The character stands beside a framed gilded artwork on a display stand. The Hotel Guest (Pixar-style stocky middle-aged man, slicked-back grey hair, burgundy velvet jacket, oversized gold wristwatch, curious squint) examines the artwork through a small monocle, his eyes widen, he hands over a single golden coin with a soft glow. The character pockets it with a calm half-smile. Two other well-dressed hotel guests in the deep background turn to look.
${NEG}.`, images: [k3] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT3,
  aspectRatio: "16:9"
});

// ─── ACT 4 — PARALLEL LIVES ───────────────────────────────
const v4 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT4} seconds. [Scene] Pixar-style four-quadrant split workspace, bright vivid gold and warm white palette. ${CHAR} with normal proportions and two arms. ${CAM}.
[00:00-00:0${Math.floor(ACT4 / 4)}] Shot 1: Wide reveal of the four-quadrant room. The character stands at center frame in front of the splitting pillar, calm confident half-smile, looking around at his four parallel work zones. The Hackathon Kid (Pixar-style very young person, messy bright orange hair, oversized electric-blue hoodie) cheers from the upper-left hackathon quadrant. Camera holds steady on the wide composition.
[00:0${Math.floor(ACT4 / 4)}-00:0${Math.floor((ACT4 * 2) / 4)}] Shot 2: Cut to the upper-left hackathon quadrant. The character holds a microphone toward the giant glowing projector screen. The screen lights up with thousands of tiny dots filling a world map in a steady climb. Confetti begins to fall at the quadrant edges.
[00:0${Math.floor((ACT4 * 2) / 4)}-00:0${Math.floor((ACT4 * 3) / 4)}] Shot 3: Cut to the upper-right judge-table quadrant. The character presses a buzzer with deliberate satisfaction. The projector wall behind the table glows with a giant warm spotlight. Calm half-smile.
[00:0${Math.floor((ACT4 * 3) / 4)}-00:${String(ACT4).padStart(2, "0")}] Shot 4: Cut to the lower-left food-tech quadrant. The character slaps a SOLD sticker onto the wall chart, the sticker expanding warmly across the climbing curve. A colorful banner slides in from the side. He winks at camera once.
${NEG}.`, images: [k4] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT4,
  aspectRatio: "16:9"
});

// ─── ACT 5 — THE EMPIRE ───────────────────────────────────
const v5 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT5} seconds. [Scene] Pixar-style San Francisco AI studio loft at sunset, polished teal and warm gold palette, eight-monitor wall glowing with abstract colorful imagery, Bay Bridge through the window. ${CHAR}. ${CAM}.
[00:00-00:0${Math.floor(ACT5 / 2)}] Shot 1: Wide push-in toward the character standing calmly at the standing desk. The eight-monitor wall behind him glows with shifting colorful imagery — each monitor a soft callback to an earlier act color. The Bay Bridge sunset glow pulses softly through the window. The character's posture is relaxed and centered.
[00:0${Math.floor(ACT5 / 2)}-00:${String(ACT5).padStart(2, "0")}] Shot 2: Cut to a medium close-up of the character at the desk. He picks up the navy ceramic mug, takes a calm sip, sets it back down precisely. The small chalkboard on the wall behind him pulses once with a soft warm glow. He glances toward camera with a small confident half-smile.
${NEG}.`, images: [k5] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT5,
  aspectRatio: "16:9"
});

// ─── ACT 6 — THE PUNCHLINE ────────────────────────────────
const v6 = Video({
  prompt: { text: `[Style] ${S}. [Duration] ${ACT6} seconds. [Scene] Pixar-style cozy suburban living room in a family-sitcom couch composition, warm orange and brown palette, old CRT TV glowing softly, wall of small framed photos behind the couch. ${CHAR}. ${CAM}.
[00:00-00:0${Math.floor(ACT6 / 2)}] Shot 1: Couch gag motion. The character runs into frame from the right side, leaps, lands on the orange couch with a single bounce, settles in. The TV in front of him flickers softly with abstract colorful imagery. He simultaneously picks up a gaming controller in one hand and an open math textbook in the other.
[00:0${Math.floor(ACT6 / 2)}-00:${String(ACT6).padStart(2, "0")}] Shot 2: He turns his head toward camera, looks directly at the lens with a calm self-aware half-smile, and gives a single small shrug. The camera slowly pulls back to reveal the full living room and the wall of small framed callback photos. A circular cinematic iris-out begins, the dark vignette closes in on his face until the frame is full black.
${NEG}.`, images: [k6] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: ACT6,
  aspectRatio: "16:9"
});

// ============================================================
// RENDER — audio-first, clip durations match VO segments
// 16:9 cinematic broadcast format (1920x1080)
// ============================================================

export default (
  <Render width={1920} height={1080}>
    {/* ACT 1 — THE COLD OPEN — VO segment 1 */}
    <Clip duration={d1} transition={{ name: "fade", duration: 0.3 }}>{v1}</Clip>

    {/* ACT 2 — THE ORIGIN — VO segment 2 */}
    <Clip duration={d2} transition={{ name: "fade", duration: 0.3 }}>{v2}</Clip>

    {/* ACT 3 — THE STRUGGLE — VO segment 3 */}
    <Clip duration={d3} transition={{ name: "fade", duration: 0.3 }}>{v3}</Clip>

    {/* ACT 4 — PARALLEL LIVES — VO segment 4 */}
    <Clip duration={d4} transition={{ name: "fade", duration: 0.3 }}>{v4}</Clip>

    {/* ACT 5 — THE EMPIRE — first 60% of VO segment 5 */}
    <Clip duration={d5 * 0.6} transition={{ name: "fade", duration: 0.3 }}>{v5}</Clip>

    {/* ACT 6 — THE PUNCHLINE — remaining 40% of VO segment 5 */}
    <Clip duration={d5 * 0.4}>{v6}</Clip>

    {audio}
    <Captions src={audio} style="bounce" position="bottom" color="#FFFFFF" activeColor="#FED41D" />
    <Music
      prompt="Warm cinematic Pixar-style orchestral underscore, soft strings, gentle piano, playful pizzicato, light percussion, 110 BPM, hopeful curious energy with moments of triumph, no lyrics, no vocals, clean loop"
      model={varg.musicModel("music_v1")}
      volume={0.18}
      duration={totalDuration}
      ducking
    />
  </Render>
);
