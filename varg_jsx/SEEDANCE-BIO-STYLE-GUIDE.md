# Seedance 2.0 Bio Video Style Guide — Simpsons Edition

A prompting framework for generating 60-90 second person bio videos in The Simpsons animation style using Seedance 2.0.

**Model**: `seedance-2-preview` (quality) or `seedance-2-fast-preview` (iteration)
**Duration**: 80s total from 6 clips (4x15s + 2x10s)
**Aspect ratio**: `16:9`
**Style**: The Simpsons (Matt Groening) — yellow skin, 4-finger hands, overbite mouths, bold black outlines, flat vibrant colors

---

## Table of Contents

1. [The "Therefore, But" Rule](#1-the-therefore-but-rule)
2. [Beat Sheet Template](#2-beat-sheet-template)
3. [Global Style Block](#3-global-style-block)
4. [Character Consistency Block](#4-character-consistency-block)
5. [Cinematic Asset Pre-Generation](#5-cinematic-asset-pre-generation)
   - [5a. Color Script](#5a-color-script)
   - [5b. Location Boards](#5b-location-boards)
   - [5c. Prop Sheet](#5c-prop-sheet)
   - [5d. Background Characters](#5d-background-characters)
6. [6-Act Clip Prompts](#6-six-act-clip-prompts)
7. [Negative Constraints](#7-negative-constraints)
8. [Voiceover, Music & Captions](#8-voiceover-music--captions)
9. [Stitching Order](#9-stitching-order)
10. [Full Example](#10-full-example)

---

## 1. The "Therefore, But" Rule

From Trey Parker & Matt Stone (South Park creators): every scene transition must connect with **"therefore"** or **"but"** — never **"and then."**

- **Therefore**: This happened, *so naturally* the next thing happens.
- **But**: This happened, *however something unexpected* changes the trajectory.
- **And then** (FORBIDDEN): This happened, and then this unrelated thing also happened.

### Why this matters for bio videos

A bio is not a resume read aloud. It's a *story*. Without causal links between scenes, the video becomes a slideshow of disconnected facts. The "therefore/but" rule forces every act to earn its place by being a consequence of or a surprise against the previous act.

### Mandatory ratio

Out of the 5 transitions between 6 acts, at least **2 must be "but"** (unexpected turns). This prevents the video from feeling like a predictable upward ramp and keeps the audience engaged.

```
Act 1 →[therefore/but]→ Act 2 →[therefore/but]→ Act 3 →[therefore/but]→ Act 4 →[therefore/but]→ Act 5 →[therefore/but]→ Act 6
                                    ↑                                                                          ↑
                              at least 2 of these 5 links must be "but"
```

---

## 2. Beat Sheet Template

**Fill this out BEFORE writing any prompts.** This is the narrative spine of the video.

```
BEAT SHEET: [PERSON'S NAME]
============================================================

Act 1 — THE COLD OPEN (15s)
What happens: [Dramatic/funny intro moment that hooks the viewer]
Emotion: [e.g., chaos, surprise, energy]
Color: [e.g., bright chaotic warm tones]

  → [THEREFORE / BUT]: [One sentence explaining the causal link]

Act 2 — THE ORIGIN (15s)
What happens: [Where they came from, childhood/early moment]
Emotion: [e.g., nostalgia, curiosity, innocence]
Color: [e.g., warm amber, soft pastels]

  → [THEREFORE / BUT]: [One sentence explaining the causal link]

Act 3 — THE STRUGGLE (15s)
What happens: [The obstacle, failure, or grind they faced]
Emotion: [e.g., frustration, exhaustion, determination]
Color: [e.g., desaturated grey-blue, cold]

  → [THEREFORE / BUT]: [One sentence explaining the causal link]

Act 4 — THE BREAKTHROUGH (15s)
What happens: [The turning point — the moment everything changed]
Emotion: [e.g., triumph, vindication, excitement]
Color: [e.g., bright gold, vivid warm]

  → [THEREFORE / BUT]: [One sentence explaining the causal link]

Act 5 — THE EMPIRE (10s)
What happens: [What they've built, current state of their work]
Emotion: [e.g., confidence, pride, calm mastery]
Color: [e.g., polished teal-gold, professional warmth]

  → [THEREFORE / BUT]: [One sentence explaining the causal link]

Act 6 — THE PUNCHLINE (10s)
What happens: [Fun Simpsons-style ending — couch gag, gag beat, wink]
Emotion: [e.g., warmth, humor, humanity]
Color: [e.g., cozy warm, Springfield sunset]

============================================================
THEREFORE/BUT AUDIT:
- Transition 1→2: [therefore / but]
- Transition 2→3: [therefore / but]
- Transition 3→4: [therefore / but]
- Transition 4→5: [therefore / but]
- Transition 5→6: [therefore / but]
- "But" count: [must be ≥ 2]
```

### Example: Tech Founder Bio

```
BEAT SHEET: ALEX VARG
============================================================

Act 1 — THE COLD OPEN (15s)
What happens: Alex bursts into a startup office mid-crisis, coffee
spilling, laptop flying, total chaos — freeze frame, looks at camera.
Emotion: Energetic chaos
Color: Bright warm, saturated yellows and oranges

  → BUT: We learn this chaos wasn't always the case...

Act 2 — THE ORIGIN (15s)
What happens: Young Alex sits alone in a childhood bedroom, quietly
tinkering with computer parts, completely absorbed and peaceful.
Emotion: Quiet curiosity, nostalgia
Color: Warm amber, soft afternoon light

  → THEREFORE: That obsession with building things drove them to
    actually try making something real after college.

Act 3 — THE STRUGGLE (15s)
What happens: Alex grinds at a desk buried in rejection letters,
empty ramen cups, 3AM clock on the wall, bank account at zero.
Emotion: Exhaustion, determination
Color: Desaturated grey-blue, cold fluorescent

  → BUT: One random conversation at a coffee shop with a stranger
    changed everything overnight.

Act 4 — THE BREAKTHROUGH (15s)
What happens: Product launches, crowd reacts, phones light up,
newspaper headlines spin into frame, handshakes, confetti.
Emotion: Triumph, vindication
Color: Bright gold, vivid warm, celebratory

  → THEREFORE: The momentum snowballed into a real company with
    a real team and a real office.

Act 5 — THE EMPIRE (10s)
What happens: Alex walks through a polished office, greeting the
team, working calmly at a nice desk with the city visible outside.
Emotion: Calm confidence, pride
Color: Polished teal and warm gold

  → BUT: At the end of the day, they're still the same goofy
    person who spills coffee on themselves.

Act 6 — THE PUNCHLINE (10s)
What happens: Classic couch gag — Alex runs in, jumps on the couch,
spills coffee again, shrugs at camera, iris-out to black.
Emotion: Warmth, humor, self-awareness
Color: Cozy Springfield living room warm tones

============================================================
THEREFORE/BUT AUDIT:
- Transition 1→2: but
- Transition 2→3: therefore
- Transition 3→4: but
- Transition 4→5: therefore
- Transition 5→6: but
- "But" count: 3 ✓
```

---

## 3. Global Style Block

Copy this **word-for-word** into every prompt. Changing even synonyms between clips causes style drift.

```
The Simpsons animated style, Matt Groening art direction,
yellow skin characters with 4-finger hands, overbite mouths,
bold black outlines, flat cel-shaded colors,
2D traditional animation with subtle 3D camera movement,
Springfield-style environments, FOX broadcast animation quality,
vibrant saturated palette, consistent character proportions throughout,
no live-action elements, no photorealistic textures,
no anime style, no 3D Pixar rendering.
```

---

## 4. Character Consistency Block

Define once, paste into every prompt verbatim.

### Template

```
[CHARACTER]
The same Simpsons-style character in every shot:
[AGE_RANGE] [GENDER], yellow skin, [HAIR_DESCRIPTION] hair,
[DISTINCTIVE_FEATURE_1], [DISTINCTIVE_FEATURE_2],
wearing [OUTFIT_DESCRIPTION],
[BODY_TYPE] build, [EXPRESSION_DEFAULT] expression.
Character remains identical across all scenes —
same face shape, same hair, same outfit, no morphing, no drift.
```

### Simpsons Character Design Rules

| Feature | Rule |
|---------|------|
| Skin | Always yellow (`#FED41D` range) |
| Outlines | Bold black, no soft edges |
| Hands | 4 fingers (critical for Simpsons authenticity) |
| Mouths | Overbite shape |
| Eyes | Large, round, white with black dot pupils |
| Hair | Sculpted, blocky, defined shape (not wispy/flowing unless long female hair) |
| Body | Slightly exaggerated proportions — big head, smaller body |

### Example

```
[CHARACTER]
The same Simpsons-style character in every shot:
Mid-30s man, yellow skin, short spiky dark brown hair,
thick-rimmed round glasses, slight stubble,
wearing a navy blue hoodie with a small rocket logo on the chest,
medium build, confident half-smile expression.
Character remains identical across all scenes —
same face shape, same hair, same outfit, no morphing, no drift.
```

---

## 5. Cinematic Asset Pre-Generation

**Generate these BEFORE any video clips.** These reference images anchor the visual world and prevent inconsistency across acts.

Every asset prompt must follow these cinematic composition rules:

| Principle | How to apply |
|-----------|-------------|
| **Rule of thirds** | Key elements placed on intersection points of a 3x3 grid, never dead center |
| **3-plane depth** | Every frame has foreground detail, midground action area, background atmosphere |
| **Leading lines** | Architecture, furniture, shadows point toward where the character will stand |
| **Negative space** | Leave breathing room — don't clutter every inch of the frame |
| **Color storytelling** | Each location's palette reflects the emotional beat of its act |
| **Environmental storytelling** | Props silently tell the story — overflowing trash, trophy on a shelf, growth chart on the wall |

---

### 5a. Color Script

Generate one reference image showing the full emotional color arc of the video. This is the master reference for all other assets.

```
[ASSET TYPE: COLOR SCRIPT]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors.

A horizontal color script showing 6 panels side by side,
each panel representing one act of a character's life story.
Each panel is a simple color mood swatch with a tiny
Simpsons-style silhouette figure showing the character's
emotional posture in that act.

Panel 1 — CHAOS: Bright saturated warm tones, vivid yellow
and orange, energetic scattered composition, figure mid-stumble.

Panel 2 — NOSTALGIA: Soft warm amber and cream tones,
gentle golden afternoon colors, figure sitting peacefully.

Panel 3 — STRUGGLE: Desaturated grey-blue and cold fluorescent
green, muted palette, figure hunched over with weight on shoulders.

Panel 4 — TRIUMPH: Bright vivid gold and warm white,
celebratory explosion of warm color, figure arms raised.

Panel 5 — MASTERY: Polished teal-green and warm gold,
balanced professional palette, figure standing confidently.

Panel 6 — WARMTH: Cozy Springfield sunset orange and
familiar warm yellow, comfortable homey tones,
figure relaxed on a couch.

Smooth color transitions between panels.
Each panel clearly distinct but forming a cohesive arc
from left to right. No text, no labels.
Flat Simpsons-style color rendering, bold outlines.
16:9 aspect ratio.
```

---

### 5b. Location Boards

Generate **one location image per act** (6 total). These are empty environments — no characters — designed for the character to be placed into during video generation.

#### Location Prompt Template

```
[ASSET TYPE: LOCATION BOARD — ACT [N]: [ACT_TITLE]]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors,
Springfield-style environment design,
FOX broadcast animation quality.

[COLOR PALETTE FROM COLOR SCRIPT FOR THIS ACT]

An empty Simpsons-style [LOCATION_DESCRIPTION].
No characters present — this is a background environment only.

COMPOSITION:
- Rule of thirds: [KEY_ELEMENT] positioned on the
  [left/right] third intersection point
- Foreground: [SMALL_DETAIL — e.g., edge of a desk,
  potted plant, coffee cup on a surface]
- Midground: [MAIN_ACTION_AREA — where the character
  will stand/sit, clearly open and uncluttered]
- Background: [ATMOSPHERE — window view, wall details,
  distant buildings, sky]
- Leading lines: [WHAT_POINTS_TO_CHARACTER_AREA —
  e.g., desk edge angles toward center,
  floor tiles converge, light beam direction]
- Negative space: [WHERE_THE_FRAME_BREATHES —
  e.g., open ceiling area, empty wall section]

ENVIRONMENTAL STORYTELLING:
[3-5 specific props/details that silently tell the story
of this act without any text or labels]
- [PROP_1]: [what it communicates]
- [PROP_2]: [what it communicates]
- [PROP_3]: [what it communicates]

[ACT_COLOR_PALETTE] color temperature throughout.
No characters, no text, no watermarks.
16:9 aspect ratio.
```

#### Example: Act 3 Location (The Struggle)

```
[ASSET TYPE: LOCATION BOARD — ACT 3: THE STRUGGLE]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors,
Springfield-style environment design,
FOX broadcast animation quality.

Desaturated grey-blue and cold fluorescent green palette.

An empty Simpsons-style small studio apartment at night,
functioning as a home office. No characters present —
this is a background environment only.

COMPOSITION:
- Rule of thirds: The desk and computer monitor positioned
  on the right third intersection point
- Foreground: Edge of an unmade bed with a laptop charger
  cable dangling off the mattress
- Midground: A cluttered desk with monitor, keyboard,
  and a comically tall tower of papers — main action area
  is the desk chair (empty, slightly askew)
- Background: A window showing a dark Springfield night sky
  with a single flickering streetlight, rain on glass
- Leading lines: The desk lamp's cone of light points
  downward to the chair area, floor cable runs toward desk
- Negative space: Dark ceiling and upper wall area,
  creating oppressive vertical weight

ENVIRONMENTAL STORYTELLING:
- Overflowing trash can with crumpled paper balls
  around it (failed attempts, missed shots)
- A wall with 3 sticky notes: one crossed out,
  one with a question mark, one blank (dwindling ideas)
- 5 empty ramen cups stacked on the desk corner
  (neglecting self-care, grinding)
- Clock on wall showing 3:17 AM
  (unsustainable hours, desperation)
- A single framed photo on the desk turned face-down
  (isolation from personal life)

Cold desaturated grey-blue color temperature throughout.
Fluorescent desk lamp provides the only warm-ish light source.
No characters, no text, no watermarks.
16:9 aspect ratio.
```

---

### 5c. Prop Sheet

Generate **one prop sheet** showing recurring objects that appear across multiple acts. These objects create visual continuity and carry symbolic weight.

#### Prop Sheet Prompt Template

```
[ASSET TYPE: PROP SHEET]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors.

A reference sheet showing [3-5] key recurring props
from a character's life story, arranged in a clean grid.
Each prop is shown in [N] versions representing how it
evolves across the story.

White background, each prop clearly separated,
Simpsons-style flat 4-color rendering with bold outlines,
slightly exaggerated proportions.

ROW 1 — [RECURRING_OBJECT_1 — e.g., "THE MUG"]:
Version A (childhood): [description — e.g., small plastic
  sippy cup with a cartoon rocket on it]
Version B (struggle): [description — e.g., chipped plain
  white mug with coffee stain rings]
Version C (empire): [description — e.g., sleek branded
  ceramic mug with company logo]

ROW 2 — [RECURRING_OBJECT_2 — e.g., "THE COMPUTER"]:
Version A (childhood): [description]
Version B (struggle): [description]
Version C (empire): [description]

ROW 3 — [RECURRING_OBJECT_3 — e.g., "THE CHAIR"]:
Version A (childhood): [description]
Version B (struggle): [description]
Version C (empire): [description]

All props maintain consistent Simpsons-style rendering.
Evolution should be visually obvious at a glance —
from worn/humble to polished/professional.
No characters, no text labels, no watermarks.
16:9 aspect ratio.
```

#### Example

```
[ASSET TYPE: PROP SHEET]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors.

A reference sheet showing 3 key recurring props from a tech
founder's life story, arranged in a clean 3x3 grid.
Each prop shown in 3 versions showing evolution.

White background, each prop clearly separated,
Simpsons-style flat 4-color rendering with bold outlines,
slightly exaggerated proportions.

ROW 1 — THE MUG:
Version A (origin): Small yellow sippy cup with a wobbly
  hand-drawn rocket doodle on it
Version B (struggle): Chipped plain white ceramic mug,
  brown coffee stain ring on the rim, tiny crack on handle
Version C (empire): Sleek navy blue ceramic mug with a
  clean white rocket logo, steam rising perfectly

ROW 2 — THE COMPUTER:
Version A (origin): Chunky beige desktop monitor with
  a green-text terminal screen, oversized keyboard
Version B (struggle): Beat-up silver laptop with stickers
  peeling off, one hinge slightly loose, screen dim
Version C (empire): Sleek ultrawide curved monitor on a
  clean desk stand, wireless peripherals, glowing screen

ROW 3 — THE DESK:
Version A (origin): Small wooden bedroom desk with crayon
  marks and carved initials, one wobbly leg
Version B (struggle): Folding table covered in papers,
  cables everywhere, energy drink cans as bookends
Version C (empire): Clean standing desk with cable management,
  one plant, one framed photo, minimal and polished

All props maintain consistent Simpsons-style rendering.
No characters, no text labels, no watermarks.
16:9 aspect ratio.
```

---

### 5d. Background Characters

Generate **one character lineup** showing recurring background characters who appear across multiple acts. Reusing the same BG characters creates a lived-in world.

#### Background Character Prompt Template

```
[ASSET TYPE: BACKGROUND CHARACTER LINEUP]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors.

A character lineup showing [4-6] Simpsons-style background
characters standing side by side on a white background.
These are supporting cast members for a bio video.

Each character has:
- A distinct silhouette shape (immediately recognizable
  even as a shadow)
- One dominant outfit color (no two characters share
  the same dominant color)
- One exaggerated defining feature (big nose, tall hair,
  tiny glasses, huge mustache, etc.)
- Yellow skin, 4-finger hands, overbite mouth,
  bold black outlines

CHARACTER 1 — [ROLE: e.g., "THE SKEPTIC"]:
[Description — build, hair, outfit color, defining feature,
default expression]

CHARACTER 2 — [ROLE: e.g., "THE SUPPORTER"]:
[Description]

CHARACTER 3 — [ROLE: e.g., "THE MENTOR"]:
[Description]

CHARACTER 4 — [ROLE: e.g., "THE RIVAL"]:
[Description]

All characters clearly distinct from each other and from
the main character. Arranged left to right by height.
No overlapping, no text, no watermarks.
16:9 aspect ratio.
```

#### Example

```
[ASSET TYPE: BACKGROUND CHARACTER LINEUP]

The Simpsons animated style, Matt Groening art direction,
bold black outlines, flat cel-shaded colors.

A character lineup showing 5 Simpsons-style background
characters standing side by side on a white background.
Supporting cast for a tech founder bio video.

CHARACTER 1 — THE SKEPTIC (appears Acts 1, 3, 5):
Short stocky man, yellow skin, balding with a combover,
dominant color: brown suit and brown tie,
defining feature: enormous furrowed unibrow,
default expression: arms crossed, one eyebrow raised,
suspicious frown. In Act 5 this character claps reluctantly.

CHARACTER 2 — THE SUPPORTER (appears Acts 1, 4, 5):
Tall thin woman, yellow skin, long red ponytail,
dominant color: green cardigan,
defining feature: comically oversized round earrings,
default expression: enthusiastic wide smile, both thumbs up.

CHARACTER 3 — THE MENTOR (appears Acts 2, 3):
Elderly man, yellow skin, white Einstein-wild hair,
dominant color: purple sweater vest over white shirt,
defining feature: extremely thick bottle-cap glasses,
default expression: calm knowing smile, hands behind back.

CHARACTER 4 — THE RIVAL (appears Acts 3, 4):
Athletic build woman, yellow skin, sharp black bob haircut,
dominant color: red power blazer,
defining feature: impossibly pointy chin,
default expression: competitive smirk, arms crossed.

CHARACTER 5 — THE INTERN (appears Acts 4, 5, 6):
Very short young person, yellow skin, messy curly brown hair,
dominant color: orange hoodie,
defining feature: giant backpack that's bigger than they are,
default expression: wide-eyed nervous excitement.

All characters clearly distinct from each other.
Arranged left to right by height.
No overlapping, no text, no watermarks.
16:9 aspect ratio.
```

---

## 6. Six-Act Clip Prompts

Each act prompt has this structure:

1. **Global Style Block** (verbatim copy)
2. **Character Block** (verbatim copy)
3. **Narrative Link** (causal connection to previous act)
4. **Shot-by-shot descriptions** with timestamps
5. **Negative Constraints** (verbatim copy)

### Narrative Link Block

Every clip (except Act 1) opens with this block:

```
[NARRATIVE LINK]
This scene follows from Act [N-1] via [THEREFORE/BUT]:
[One sentence from the beat sheet explaining the causal link]
The emotional shift is from [PREVIOUS_EMOTION] to [CURRENT_EMOTION].
The color palette shifts from [PREVIOUS_PALETTE] to [CURRENT_PALETTE].
Visual bridge: [One specific visual element that connects
to the previous scene — e.g., "the same coffee mug from Act 1
now sits on the childhood desk" or "the rejection letter
is crumpled in the same hand that held the trophy in Act 4"]
```

---

### Act 1: THE COLD OPEN (15s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[00:00-00:05] Shot 1: THE HOOK
Wide establishing shot of [LOCATION FROM LOCATION BOARD 1].
Rule of thirds: building entrance on left third.
Camera slowly pushes in toward the entrance.
[CHARACTER_NAME] bursts through the door dramatically,
[RECURRING_PROP version C] in hand, [ACTION — e.g., coffee
spilling from the mug, papers flying everywhere].
Bold exaggerated Simpsons reaction face — eyes bulging,
jaw dropping. Classic physical comedy timing.
[BG CHARACTER — THE SUPPORTER] visible in background,
ducking out of the way with exaggerated shock.

[00:05-00:10] Shot 2: FREEZE AND NARRATOR
Camera snaps to a medium close-up of [CHARACTER_NAME]
frozen mid-stumble in a Simpsons freeze-frame.
Record-scratch energy. Character looks directly at camera
with a deadpan expression. Slight camera zoom-in on face.
[BG CHARACTER — THE SKEPTIC] frozen in background with
arms crossed and unimpressed expression.
3-plane depth: foreground has edge of a fallen coffee cup,
midground is the frozen character, background has
other frozen office workers.

[00:10-00:15] Shot 3: REWIND ENERGY
Quick zoom-out to wide shot. Time-lapse style reverse —
objects fly back into place, [CHARACTER_NAME] walks
backward through the door. Scene rewinds to calm.
Cut to a Springfield-style title card:
bold yellow text on blue background with the person's name.

[NEGATIVE CONSTRAINTS]
```

---

### Act 2: THE ORIGIN (15s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[NARRATIVE LINK]
This scene follows from Act 1 via [THEREFORE/BUT]:
[Beat sheet link — e.g., "BUT: we learn this chaos wasn't
always the case — rewind to where it all started."]
The emotional shift is from [chaotic energy] to [quiet curiosity].
The color palette shifts from [bright warm chaos]
to [soft amber nostalgia].
Visual bridge: [e.g., "The same rocket logo from the adult
hoodie appears as a hand-drawn crayon poster on the
childhood bedroom wall."]

[00:00-00:05] Shot 1: CHILDHOOD SCENE
Interior of [LOCATION FROM LOCATION BOARD 2].
Warm amber afternoon light through Springfield-style windows.
Young version of [CHARACTER_NAME] — same face shape, same
distinctive features, smaller body, wearing kid clothes —
sits on the floor surrounded by [RECURRING_PROP version A]
and [origin-relevant objects].
Rule of thirds: character positioned on right third.
Foreground: edge of a toy box with items spilling out.
Background: [ENVIRONMENTAL STORYTELLING details from
location board — e.g., growth chart on wall, crayon drawings].
Character tinkers with intense focus, tongue sticking out.
[BG CHARACTER — THE MENTOR] visible through a doorway,
watching with a calm knowing smile.

[00:05-00:10] Shot 2: THE SPARK
Close-up of young [CHARACTER_NAME]'s face.
Eyes suddenly widen — classic Simpsons eureka expression.
Camera pulls back to reveal [what they discovered/built].
A light bulb literally appears above their head
(Simpsons visual gag), glowing bright yellow.
Exaggerated proud smile, hands raised presenting the creation.
[RECURRING_PROP version A] visible on the desk beside them.

[00:10-00:15] Shot 3: GROWING UP SEQUENCE
Same room, static camera. Simpsons-style jump cuts:
Young version → teen version → young adult version.
Same face shape in all versions, same distinctive features,
growing taller with each cut.
[RECURRING_PROP] evolves in each cut:
version A (child) → halfway version → version B (struggle era).
Final frame: adult [CHARACTER_NAME] in their signature outfit,
same room now feeling too small for them.

[NEGATIVE CONSTRAINTS]
```

---

### Act 3: THE STRUGGLE (15s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[NARRATIVE LINK]
This scene follows from Act 2 via [THEREFORE/BUT]:
[Beat sheet link — e.g., "THEREFORE: that obsession with
building things drove them to actually try — and reality hit hard."]
The emotional shift is from [quiet curiosity] to [exhausted determination].
The color palette shifts from [warm amber] to [desaturated grey-blue].
Visual bridge: [e.g., "The same computer from the childhood
bedroom is now the beat-up laptop version B on the struggle desk."]

[00:00-00:05] Shot 1: THE GRIND
[LOCATION FROM LOCATION BOARD 3].
[CHARACTER_NAME] hunched at a desk piled comically high
with papers, sticky notes, and [RECURRING_PROP version B —
e.g., the chipped coffee mug].
Dark circles under eyes (purple Simpsons semicircles).
Clock on wall shows 3:00 AM.
Rule of thirds: character on left third, towering paper pile
on right third creating visual weight of burden.
Foreground: empty ramen cups.
Background: dark window with rain, single streetlight.
Character types frantically, papers sliding off the tower.
[BG CHARACTER — THE MENTOR] appears briefly through the
doorway, placing a hand on the doorframe with concern.

[00:05-00:10] Shot 2: THE SETBACK
Medium shot. [CHARACTER_NAME] stares at a screen showing
[REJECTION — big red "REJECTED" stamp, declined email,
zero balance, etc.].
Classic Simpsons disappointment — shoulders slump,
arms hang limp, single dramatic sweat drop.
Camera slowly zooms in on their deflated face.
Background desaturates further (Simpsons mood-shift technique).
[BG CHARACTER — THE RIVAL] walks past the window outside,
visible through the rain, looking successful and oblivious.

[00:10-00:15] Shot 3: DETERMINATION
Low-angle upward shot of [CHARACTER_NAME] standing up.
Fist clenches. Eyes narrow with resolve.
Classic Simpsons "powering up" heroic composition —
camera angle from below makes them tower over the desk.
Papers scatter dramatically from the sudden movement.
Background brightens back toward Springfield colors.
[CHARACTER_NAME] grabs [tool/laptop/phone] and walks
toward camera with purpose.
Foreground: scattered papers. Background: first hint of
warm light creeping through the window — dawn approaching.

[NEGATIVE CONSTRAINTS]
```

---

### Act 4: THE BREAKTHROUGH (15s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[NARRATIVE LINK]
This scene follows from Act 3 via [THEREFORE/BUT]:
[Beat sheet link — e.g., "BUT: one random encounter at a
coffee shop changed everything overnight."]
The emotional shift is from [exhausted determination]
to [triumphant vindication].
The color palette shifts from [desaturated grey-blue]
to [bright vivid gold].
Visual bridge: [e.g., "The crumpled rejection letter from
Act 3's desk is now pinned on the wall behind them as a trophy."]

[00:00-00:05] Shot 1: THE BIG MOMENT
Wide shot of [LOCATION FROM LOCATION BOARD 4].
[CHARACTER_NAME] stands at center, presenting/revealing
[their achievement].
Simpsons-style crowd reacts: rows of yellow-skinned
audience members leaning forward, mouths forming O shapes.
[BG CHARACTER — THE SUPPORTER] in front row, standing up,
both thumbs raised. [BG CHARACTER — THE SKEPTIC] in the
back row, uncrossing arms for the first time, reluctantly
raising one eyebrow in surprised respect.
Rule of thirds: character on center-left, their creation/
product/work on center-right.
Bright gold lighting floods from above.

[00:05-00:10] Shot 2: THE REACTION
Quick Simpsons-style cuts between:
- [CHARACTER_NAME]'s growing triumphant smile
- [BG CHARACTER — THE RIVAL] in the audience, jaw dropped
- A phone screen showing metrics/headlines going up
- [BG CHARACTER — THE INTERN] nervously snapping photos
- Back to [CHARACTER_NAME] raising both arms in celebration
Classic Simpsons celebration: eyes closed, huge grin,
fists pumping. Confetti begins falling.
Each cut holds 1 second — punchy rhythm.

[00:10-00:15] Shot 3: THE MONTAGE POP
Rapid Simpsons-style newspaper montage:
- Newspaper headline spinning into frame:
  "[CHARACTER_NAME] does [achievement]!"
- Camera flashes popping
- Handshake with an important-looking Simpsons character
- [CHARACTER_NAME] on a magazine cover
- Wide shot of them standing proudly in front of
  [their company/creation] holding [RECURRING_PROP version C]
Confetti and Springfield sunshine.
Each image holds 1-1.5 seconds with clean hard cuts.

[NEGATIVE CONSTRAINTS]
```

---

### Act 5: THE EMPIRE (10s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[NARRATIVE LINK]
This scene follows from Act 4 via [THEREFORE/BUT]:
[Beat sheet link — e.g., "THEREFORE: the momentum snowballed
into a real company with a real team."]
The emotional shift is from [triumphant excitement]
to [calm confident mastery].
The color palette shifts from [bright gold] to [polished teal-gold].
Visual bridge: [e.g., "The newspaper headline from Act 4
is now framed on the office wall behind the desk."]

[00:00-00:05] Shot 1: CURRENT STATE
Wide establishing shot of [LOCATION FROM LOCATION BOARD 5].
[CHARACTER_NAME] walks through the space confidently,
greeting team members with casual waves or finger-guns.
[BG CHARACTER — THE INTERN] follows behind carrying files,
still wide-eyed but now comfortable.
[BG CHARACTER — THE SUPPORTER] at a desk, waves warmly.
[BG CHARACTER — THE SKEPTIC] nods with grudging respect.
Camera tracks from the side. Everything polished and vibrant.
Rule of thirds: character walks along left third line,
office stretches into depth on the right.
[RECURRING_PROP version C] visible on multiple desks.

[00:05-00:10] Shot 2: AT WORK
Medium shot of [CHARACTER_NAME] doing what they do best.
Calm, in the zone, slight satisfied smile.
Behind them through a window: Springfield-style city skyline
with their [logo/brand] visible on a building.
Camera slowly pushes in to a close-up of their focused,
content expression.
Foreground: [RECURRING_PROP version C] on the desk.
Background: the team working collaboratively, out of focus.
Warm professional lighting, stable and composed frame.

[NEGATIVE CONSTRAINTS]
```

---

### Act 6: THE PUNCHLINE (10s)

```
[GLOBAL STYLE BLOCK]

[CHARACTER BLOCK]

[NARRATIVE LINK]
This scene follows from Act 5 via [THEREFORE/BUT]:
[Beat sheet link — e.g., "BUT: at the end of the day,
they're still the same goofy person who can't hold a coffee cup."]
The emotional shift is from [calm mastery] to [warm self-aware humor].
The color palette shifts from [polished teal-gold]
to [cozy Springfield warm tones].
Visual bridge: [e.g., "The sleek branded mug (prop version C)
from the empire desk is in their hand — about to be spilled
again, just like Act 1."]

[00:00-00:05] Shot 1: THE COUCH GAG
Classic Simpsons couch gag format:
[CHARACTER_NAME] runs into a Simpsons-style living room
from the right side of frame and jumps onto an
orange/brown couch. They land, bounce once, settle in.
[RECURRING_PROP version C] in hand.
TV flickers on in front of them.
Camera pulls back to reveal the full room.
On the wall: framed photos showing moments from
earlier acts (childhood tinkering, the breakthrough crowd,
the office).
[BG CHARACTER — THE INTERN] peeks in from a doorway,
gives a small wave, disappears.

[00:05-00:10] Shot 2: THE TAG
[CHARACTER_NAME] on the couch turns to camera.
Breaks the fourth wall with a Simpsons smirk.
[CALLBACK GAG — e.g., takes a sip from the mug,
immediately spills it on themselves. Same chaos as Act 1.
Shrugs at camera.]
Camera zooms out to full wide shot of the living room.
Iris-out effect — shrinking circle closes on their face,
classic cartoon ending transition.
Circle closes to black.

[NEGATIVE CONSTRAINTS]
```

---

## 7. Negative Constraints

Append this block to every prompt (video clips AND asset pre-generation):

```
No live-action elements, no photorealistic rendering,
no anime style, no 3D Pixar/Disney style,
no watermarks, no text overlays in the video frame,
no face morphing between shots, no style changes mid-clip,
no dark/horror elements, no random background elements
(all props must serve the story), no unexplained characters
(every person on screen must be from the character lineup),
consistent 2D cel animation throughout,
The Simpsons Season 20+ animation quality.
```

---

## 8. Voiceover, Music & Captions

Audio is added in the varg pipeline after video generation.

### Voiceover

- **Voice style**: Warm, slightly humorous narrator — think a documentary that doesn't take itself too seriously.
- **Provider**: ElevenLabs
- **Script structure**: Write 6 short paragraphs matching each act. Each paragraph should be speakable within the act's duration minus ~2 seconds (leave room for visual breathing).
- **"Therefore/But" in VO**: The narrator can explicitly use transition words. Example: *"But here's the thing nobody tells you about overnight successes..."*

| Act | VO Duration Target | Tone |
|-----|--------------------|------|
| 1 | 10-12s | Playful, self-aware, sets the hook |
| 2 | 10-12s | Warm, nostalgic, genuine |
| 3 | 10-12s | Honest, slightly heavy, empathetic |
| 4 | 10-12s | Building energy, triumphant |
| 5 | 6-8s | Calm, confident, matter-of-fact |
| 6 | 4-6s | Punchline, callback humor, warm sign-off |

### Music

AI-generated. Use this prompt for the music generation:

```
Upbeat orchestral comedy underscore inspired by
The Simpsons and Danny Elfman, bright brass section,
playful woodwinds, pizzicato strings, light percussion,
120 BPM, fun optimistic energy with moments of
gentle warmth. Loops cleanly. No lyrics, no vocals.
```

- Volume: `0.15-0.25` (sits under voiceover, never competes)
- Auto-duck under speech
- Loop for full video duration

### Captions

- Style: `bounce` (impact font, matches Simpsons energy)
- Position: `bottom`
- Colors: white text, yellow active highlight
- Font weight: bold

---

## 9. Stitching Order

```
Act 1 (15s) ──[dissolve 0.5s]──►
Act 2 (15s) ──[dissolve 0.5s]──►
Act 3 (15s) ──[dissolve 0.5s]──►
Act 4 (15s) ──[dissolve 0.5s]──►
Act 5 (10s) ──[dissolve 0.5s]──►
Act 6 (10s)

Total: 80s video + 2.5s transitions = ~82.5s
```

Use `dissolve` transitions between all acts. The dissolve softens the jump between Seedance-generated clips while maintaining the "episode" feel.

---

## 10. Full Example

Complete prompting workflow for a tech founder named "Alex Varg."

### Step 1: Beat Sheet

*(See example in Section 2)*

### Step 2: Generate Assets (in order)

1. Color script (1 image)
2. Location boards (6 images — one per act)
3. Prop sheet (1 image — 3 props x 3 versions)
4. Background character lineup (1 image — 5 characters)

**Total pre-generation: 9 images**

### Step 3: Generate Video Clips (in order)

1. Act 1: The Cold Open (15s)
2. Act 2: The Origin (15s)
3. Act 3: The Struggle (15s)
4. Act 4: The Breakthrough (15s)
5. Act 5: The Empire (10s)
6. Act 6: The Punchline (10s)

**Total video generation: 6 Seedance calls**

### Step 4: Audio Layer

1. Generate voiceover (6 paragraphs via ElevenLabs)
2. Generate music (1 looping underscore)
3. Add captions from VO transcript

### Step 5: Stitch

Combine all clips with dissolve transitions, layer audio, render final output.

**Total pipeline: 9 images + 6 videos + 1 music + 1 voiceover = 17 generation calls**

---

## Checklist

Before rendering, verify:

- [ ] Beat sheet completed with all 6 acts
- [ ] "Therefore/But" audit passes (minimum 2 "but" transitions)
- [ ] Global Style Block is identical in every prompt (diff check)
- [ ] Character Block is identical in every prompt (diff check)
- [ ] All 6 location boards generated and reviewed
- [ ] Prop sheet shows clear visual evolution across 3 versions
- [ ] Background characters are distinct (silhouette test: recognizable as shadows)
- [ ] Each act prompt has a Narrative Link referencing the beat sheet
- [ ] Visual bridges connect consecutive acts (recurring prop, callback detail)
- [ ] Environmental storytelling props serve the story (no random clutter)
- [ ] Negative constraints appended to every prompt
- [ ] Color palette per act matches the color script
- [ ] VO script uses "therefore/but" transitions in narration
- [ ] Music volume set to 0.15-0.25 range
