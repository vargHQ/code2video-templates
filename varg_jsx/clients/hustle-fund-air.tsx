/** @jsxImportSource vargai */
// ─────────────────────────────────────────────────────────────────────────────
// Hustle Fund Air Safety — V2 (Photoreal Upgrade)
//
// Upgrade pass over the original single-line Seedance prompts.
// Restructured into the "labeled-block prestige format" used by top-tier
// Seedance 2.0 prompts in awesome-seedance-2-prompts:
//
//   Characters: / Scene: / Style: / Lighting: / Audio: / [t-ts] — Beat /
//   Avoid: / Lock phrases:
//
// Key upgrades vs V1:
//   1. Shared CHARACTER_BIBLE + image reference (face locked across all 12)
//   2. Per-beat Camera / Action / Lighting / SFX micro-blocks
//   3. Camera body + lens specifics (ARRI Alexa Mini LF, Atlas Orion 50mm)
//   4. Film stock (Kodak Vision3 250D), halation, photochemical look
//   5. Skin micro-detail (pores, SSS, T-zone, vellus hair, no smooth AI skin)
//   6. Ambient-only audio (no dialogue, no music — VO + Music layer separately)
//   7. Avoid: block + Lock phrases: trailer (top-prompt signature)
//   8. Performance direction (blink rate, micro-expressions, breath cadence)
//
// Aesthetic anchor: Philippine Airlines safety video (dry, sincere, real).
// Deadpan comedy lives in the WRITING, not the visuals.
//
// Usage:
//   bun run render templates/clients/hustle-fund-air.tsx
//
// NOTE: Reference image is generated first via nano-banana-pro and reused
// across all 12 segments to lock identity. One image per Video() prompt
// (gateway constraint).
// ─────────────────────────────────────────────────────────────────────────────

import {
  Captions,
  Clip,
  Image,
  Music,
  Overlay,
  Render,
  Speech,
  Video,
} from "vargai/react";
import { createVarg, elevenlabs } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Overlay assets (unchanged from V1) ───────────────────────────────────────
const HIPPO_URL = "https://uu.varg.ai/1780095678011_bnqccw44.webp";
const LOGO_URL = "https://uu.varg.ai/1780095693757_0qmx2d8j.png";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Canonical flight-attendant reference
//   One nano-banana-pro generation, reused as `images: [ATTENDANT_REF]` in
//   every Video() call below. This is the single biggest lever against
//   identity drift across 12 separate Seedance generations.
// ─────────────────────────────────────────────────────────────────────────────

const ATTENDANT_REF = Image({
  prompt: `
Photoreal portrait, mid-30s commercial airline flight attendant, warm light-brown
eyes, naturally textured skin with visible pores and faint laugh lines, subtle
matte makeup, brunette hair pulled into a neat low chignon with a small gold
flight-attendant pin, crisp navy double-breasted uniform jacket with gold buttons,
white blouse, small red silk neck scarf. Standing in an airplane cabin aisle,
direct eye contact with camera, faint warm Mona-Lisa half-smile, calm professional
demeanor. Soft motivated cabin overhead practical lighting, warm 3000K wash,
shallow depth of field, 50mm portrait, Kodak Vision3 250D film stock,
photochemical halation, real human skin texture, subtle subsurface scattering,
natural pore detail, no plastic skin, no smooth AI rendering.
Style: Philippine Airlines safety video reference, prestige corporate-
instructional realism. 9:16 vertical portrait composition.
`.trim(),
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Voiceover (unchanged narrative from V1)
// ─────────────────────────────────────────────────────────────────────────────

const { audio, segments } = await Speech({
  voice: "EXAVITQu4vr4xnSDxMaL",
  model: elevenlabs.speechModel("eleven_v3"),
  children: [
    "Welcome aboard Hustle Fund Air. Before we begin today's flight to Product-Market Fit, please direct your attention to the following safety instructions.",
    "In the event of an audit, compliance materials are located in the overhead compartment. Please ensure your documentation is properly stowed and accessible at all times.",
    "Please ensure your cap table is fastened securely and in the upright position. A messy cap table is a turbulence risk for everyone.",
    "Should cabin pressure drop, quarterly update forms will deploy automatically from the overhead bin. Please complete yours before assisting other passengers — or tweeting about your growth metrics.",
    "Founders who announce on LinkedIn that they are crushing it before filing their quarterly update will be moved to the middle seat. Indefinitely.",
    "Hustle Fund Air operates a strict no-ghosting policy. Founders who go dark for more than 90 days will be subject to a strongly-worded Slack message… and then another one… and then Dunky will just call you. Just send the update!",
    "Please locate your nearest exit. Sometimes you give it your all and the plane just needs to land. Maybe not at the original destination. Maybe at a completely different airport in a different country. We get it. An unexpected offramp is not a failure — it is just a reroute. Talk to us. We have seen every kind of landing and we respect the honest ones most.",
    "Thank you for flying Hustle Fund Air. We believe in your hustle, your vision, and your ability to send one email per quarter without being asked seventeen times. We believe in you. Please send the update.",
    "Hustle Fund Air is not responsible for lost runway, premature pivots, or founders who restructure their entire company between updates. Updates should include revenue, headcount, burn rate, and anything that would make your lead investor say: wait, WHEN did that happen? Hustle Fund reserves the right to text, Slack, email, and LinkedIn DM you simultaneously if you go quiet. Tailwinds not guaranteed. Valuations subject to market conditions and vibes.",
  ],
});

// Seedance 2: duration ONLY 5, 10, or 15
const sd = (d: number) => (d <= 5 ? 5 : d <= 10 ? 10 : 15);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Shared prompt blocks
//   These constants are concatenated into every Video() prompt to enforce
//   continuity of character, scene, style, lighting, audio, and negatives.
// ─────────────────────────────────────────────────────────────────────────────

const CHARACTER_BIBLE = `
Characters: Mid-30s flight attendant, identity locked to attached reference
@image1. Warm light-brown eyes, real skin texture with pores and faint laugh
lines, brunette low chignon with gold pin, crisp navy double-breasted uniform
with gold buttons, white blouse, small red silk neck scarf. Calm warm
professional. Same face, hair, outfit, body proportions every shot, no drift.
`.trim();

const SCENE_BLOCK = `
Scene: Modern narrow-body airline cabin, beige overhead bins, navy seats
with cream headrest covers, blurred passenger silhouettes, small oval
windows with daylight. 9:16 vertical, generous headroom.
`.trim();

const STYLE_BLOCK = `
Style: Authentic Philippine Airlines safety-video realism, dry instructional
sincerity (comedy in writing not visuals), muted teal-cream palette, subtle
film grain, ARRI Alexa Mini LF + Atlas Orion 50mm anamorphic + Kodak Vision3
250D, photochemical halation, shallow DOF.
`.trim();

const LIGHTING_BLOCK = `
Lighting: 3000K warm overhead practical key from camera-left, gentle ceiling
fill, window-light rim where visible. No studio strobes, no harsh shadows.
`.trim();

const AUDIO_BLOCK = `
Audio: Ambient cabin only (hum, engine drone, distant PA chime, fabric
rustle). NO dialogue, NO music, NO speech. VO added in post.
`.trim();

const AVOID_BLOCK = `
Avoid: identity drift, jitter, plastic skin, smooth AI skin, morph between
cuts, warping props, text overlays, watermarks, subtitles, CGI look,
artificial face distortion, extra fingers, deformed hands, character
speaking, dialogue, music.
`.trim();

const LOCK_PHRASES = `
Lock: ARRI Alexa Mini LF, 50mm anamorphic, Kodak Vision3 250D, real human
skin, identity locked to @image1, no drift, no speech, Philippine Airlines
safety video reference, 9:16 vertical, Seedance 2.0.
`.trim();

// Helper: assemble final prompt from per-segment beats
const buildPrompt = (beats: string) =>
  [
    CHARACTER_BIBLE,
    "",
    SCENE_BLOCK,
    "",
    STYLE_BLOCK,
    "",
    LIGHTING_BLOCK,
    "",
    AUDIO_BLOCK,
    "",
    beats.trim(),
    "",
    AVOID_BLOCK,
    "",
    LOCK_PHRASES,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 1 — Welcome / intro
// ─────────────────────────────────────────────────────────────────────────────

const SEG1_BEATS = `
Duration: 10s. New micro-action every ~2s.

[0-2s] — Aircraft Hero CU
  Camera: Exterior tight close-up of white airplane fuselage on tarmac,
          85mm, slow lateral track right. Sunrise side-light.
  Action: Reveal large painted livery: "HUSTLE FUND AIR" in bold modern
          sans-serif black letters with small hippo silhouette beside it.
          Heat shimmer rising from tarmac, ground crew blurred behind.
  SFX: Ground APU whine, distant tarmac chatter.

[2-4s] — Departures Board Insert
  Camera: Hard cut to terminal departure board, 35mm, locked.
  Action: Yellow LED departures board pixel-flips: "HUSTLE FUND AIR —
          DEST: PRODUCT-MARKET FIT — ON TIME" in clean monospace yellow
          letters. Other rows blur out of focus.
  SFX: Mechanical split-flap clatter.

[4-6s] — Cabin Aisle Push-in
  Camera: Hard cut. Interior wide push-in down cabin aisle, 24mm gimbal,
          jogging pace.
  Action: Camera glides past two rows of navy seats with cream headrests.
          A small overhead LED placard glows "PRODUCT-MARKET FIT" for a
          beat. Founder passenger types on laptop in aisle seat.
  SFX: Cabin hum builds, soft keytap.

[6-8s] — Attendant Reveal
  Camera: Hard cut to medium close-up, 50mm, locked.
  Action: Flight attendant centered in aisle, hands folded at waist,
          faint warm half-smile, gives single slow professional nod to
          camera. Mouth closed, NOT speaking. Bulkhead behind her shows
          small embroidered patch: "PMF".
  SFX: Soft PA chime, cabin hum.

[8-10s] — Subtle Gesture
  Camera: Hold. Very slight push-in 2%.
  Action: She tilts head 5° to her left, lifts one open palm toward the
          camera in a polite "please attend" gesture, one natural blink.
          Mouth stays closed.
  SFX: Fabric rustle, ambient bed continues.
`;

const vid1 = Video({
  prompt: { text: buildPrompt(SEG1_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[0].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 2 — Audit / overhead filing cabinet
// ─────────────────────────────────────────────────────────────────────────────

const SEG2_BEATS = `
Duration: 10s. New micro-action every ~2s. The same flight attendant
from the reference @image1 throughout — never another character.

[0-2s] — Panic Run Start
  Camera: Handheld tracking shot from behind her shoulder, 35mm, jogging
          pace down cabin aisle, slight realistic bob.
  Action: Flight attendant breaks into a controlled run down the cabin
          aisle clutching a chaotic stack of manila audit folders and
          loose spreadsheets, eyes wide and focused, jaw set, real
          urgency (NOT comic panic).
  SFX: Quick footfalls on carpet, paper flutter, sharp breath.

[2-4s] — Papers Spill
  Camera: Whip pan up to her face level, 35mm, handheld bob continues.
  Action: A few loose spreadsheet pages slip from her stack and flutter
          backward through the air behind her like leaves. She glances
          back once mid-stride, mouth tight, then forward again.
  SFX: Paper rustle, single huff of breath.

[4-6s] — Skid Stop at Bin
  Camera: Quick truck-in to medium, 35mm, settles.
  Action: She skids to a stop beside an overhead bin row, throws the bin
          open one-handed; more loose papers cascade out around her face
          and shoulders; she shields her eyes from the paper rain with
          her free forearm.
  SFX: Bin latch SNAP, paper avalanche rustle.

[6-8s] — Second Attendant Meets Her
  Camera: Hard cut to medium two-shot, 50mm, slight handheld.
  Action: A second attendant in identical navy uniform (different face,
          different hair) appears blocking the aisle. Both meet eyes
          quickly. First attendant shoves the entire chaotic pile of
          papers into the second one's arms with a single firm push.
  SFX: Paper thump, two quick breaths.

[8-10s] — Handoff Complete
  Camera: Hold on the two-shot.
  Action: Second attendant accepts the papers, gives one sharp
          professional nod. First attendant gives matching nod back,
          then turns sharply and jogs out of frame in the opposite
          direction. Mouth closed throughout.
  SFX: Footfalls fade, ambient bed.
`;

const vid2 = Video({
  prompt: { text: buildPrompt(SEG2_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[1].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 3 — Cap table seatbelt close-up
// ─────────────────────────────────────────────────────────────────────────────

const SEG3_BEATS = `
Duration: 10s. New micro-action every ~2s. Two passenger laps shown,
NO faces — only hands. Hands perfectly anatomical, 5 fingers each.

[0-2s] — Clean Buckle CU
  Camera: Extreme tight static lock-off on lap, 50mm macro T2.8, tripod.
          Subject: belt buckle dead-center.
  Action: Two clean adult hands click a standard airplane seatbelt buckle
          closed with one crisp click. Belt webbing has faint spreadsheet
          grid lines woven in; metal buckle face engraved "CAP TABLE" in
          neat all-caps. Hands rest still.
  SFX: Crisp seatbelt click, webbing slide.

[2-4s] — Snug Tug
  Camera: Hold.
  Action: One hand pulls the belt tail tight in one smooth motion; belt
          snaps snug across the lap. The other hand gives the buckle face
          a satisfied single tap. Engraved "CAP TABLE" text catches a
          highlight.
  SFX: Webbing zip, soft finger tap on metal.

[4-6s] — Cut to MESSY Lap
  Camera: HARD CUT to a different lap, same framing. 50mm macro, locked.
  Action: A second passenger's lap: seatbelt is tangled, twisted three
          times, half-buckled with the tongue not fully clicked in,
          buckle face reads "CAP TABLE" but the engraving is scratched
          and uneven. Crumpled receipts and napkin scraps litter the
          lap. Webbing visibly frayed.
  SFX: Buckle rattle, paper crinkle.

[6-8s] — Attendant Hand Intervenes
  Camera: Hold. A gloved attendant hand enters frame from the right.
  Action: White-gloved attendant hand reaches in, taps the messy buckle
          once with index finger, gives one slow disapproving shake of
          the finger (no-no gesture), then exits frame.
  SFX: Glove tap on metal, soft tsk-tsk fabric movement.

[8-10s] — Back to Clean
  Camera: HARD CUT back to the first clean lap.
  Action: The clean belt sits perfectly fastened, "CAP TABLE" engraving
          shining. A single approving thumbs-up from another anonymous
          hand enters frame from the left, holds for a beat, exits.
  SFX: Single approving exhale, ambient bed.
`;

const vid3 = Video({
  prompt: { text: buildPrompt(SEG3_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[2].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 4 — Quarterly update oxygen masks
// ─────────────────────────────────────────────────────────────────────────────

const SEG4_BEATS = `
Duration: 10s. New micro-action every ~2s.

[0-2s] — Sudden Turbulence
  Camera: Medium wide cabin shot, 35mm, locked, then sharp realistic
          shake for 0.5s as cabin jolts.
  Action: Cabin lights flicker once. A coffee cup on a tray table tips
          and rolls. Passengers grip armrests. A single passenger gasps
          quietly. Flight attendant braces one hand on the overhead bin.
  SFX: Low cabin shudder, single ding of fasten-seatbelt sign.

[2-4s] — Overhead Panel CU
  Camera: HARD CUT to extreme close-up of the overhead oxygen-mask panel
          directly above a seat, 50mm macro, locked.
  Action: A small rectangular panel pops open with a clean mechanical
          click; a faint puff of cool air escapes. Stenciled on the
          panel interior: "EMERGENCY UPDATE COMPARTMENT".
  SFX: Sharp panel click, brief air hiss.

[4-6s] — Mask Drops
  Camera: Hold. Slight tilt down 5° to follow the mask.
  Action: A yellow oxygen mask drops on its clear plastic tube and swings
          gently. The mask cup has "QUARTERLY UPDATE" stenciled in neat
          black sans-serif across the front (in-scene printed text, NOT
          overlay). It rotates slowly to face camera.
  SFX: Hiss of compressed air, plastic sway.

[6-8s] — Founder Grabs Mask
  Camera: Pull back to medium shot, 35mm.
  Action: A founder passenger reaches up, grabs the QUARTERLY UPDATE
          mask, places it firmly over his own nose and mouth FIRST. His
          eyes show relief. Elastic strap snaps gently around his head.
  SFX: Elastic snap, single breath through mask.

[8-10s] — Attendant Nod
  Camera: HARD CUT to medium of flight attendant.
  Action: Flight attendant tilts head 5° with a faint approving deadpan
          half-smile, one natural blink, gives one slow professional nod
          of approval. Hands remain folded at waist. Mouth closed.
  SFX: Ambient cabin bed, soft hum.
`;

const vid4 = Video({
  prompt: { text: buildPrompt(SEG4_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[3].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 5 — LinkedIn → middle seat
// ─────────────────────────────────────────────────────────────────────────────

const SEG5_BEATS = `
Duration: 10s. New micro-action every ~2s.

[0-2s] — Triumphant Founder
  Camera: Medium shot, 35mm, locked. Aisle-seat passenger framed center.
  Action: A young founder in a black blazer over a white tee sits in an
          aisle seat, BOTH ARMS RAISED HIGH overhead in triumphant
          self-celebration pose, beaming wide cocky grin, eyes closed in
          self-satisfaction. A blue-and-white badge clipped to his lapel
          reads "LINKEDIN INFLUENCER" in bold sans-serif.
  SFX: Faint passenger sigh nearby.

[2-4s] — Badge CU
  Camera: Quick truck-in to extreme close-up on the badge, 85mm macro.
  Action: Badge fills frame. Logo: stylized blue "in" square. Text below:
          "LINKEDIN INFLUENCER — CRUSHING IT". Tiny gold star sticker
          beside it. Badge bobs slightly with his celebration.
  SFX: Soft fabric movement.

[4-6s] — Attendant Approaches
  Camera: Pull back fast to medium two-shot, 35mm.
  Action: Flight attendant strides into frame from the right, calm
          unbothered Mona-Lisa half-smile. She places one firm hand on
          the founder's raised forearm, lowering it. His grin falters.
          Mouth closed.
  SFX: Footstep, soft fabric grab.

[6-8s] — Lifted and Moved
  Camera: Quick whip pan following motion to middle of three-seat row.
  Action: She guides him by the elbow with calm authority out of the
          aisle seat and toward the middle seat of the same row. He
          stumbles forward awkwardly, grin gone, eyes wide. Two existing
          passengers in window and aisle seats keep staring straight
          ahead expressionless.
  SFX: Shoe shuffle on carpet, single startled exhale from founder.

[8-10s] — Plopped in Middle
  Camera: Hard cut to medium of the middle seat, 35mm, locked.
  Action: Founder sits squished in middle seat, both armrests taken by
          neighbors, posture rigid, mortified. A small placard in the
          seat-back pocket in front reads "RESERVED: LINKEDIN HUMBLE
          BRAGGERS". Attendant points to placard with one polite finger
          then exits frame. Mouth closed.
  SFX: Soft paper crinkle.
`;

const vid5 = Video({
  prompt: { text: buildPrompt(SEG5_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[4].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 6 — No ghosting sign
// ─────────────────────────────────────────────────────────────────────────────

const SEG6_BEATS = `
Duration: 15s. New micro-action every ~2s. The ghost is a realistic
semi-transparent pale translucent humanoid figure (NOT cartoon sheet),
soft glowing edges, slightly blurred.

[0-2s] — Plane Exterior CU
  Camera: Exterior tight CU of airplane in flight, 85mm, track right
          past oval cabin windows.
  Action: A faint pale translucent ghostly figure is barely visible
          pressed against a window from inside, drifting along.
  SFX: Distant jet drone.

[2-4s] — NO GHOSTING Sign
  Camera: HARD CUT to interior CU of overhead cabin sign, 50mm.
  Action: Illuminated airline sign fades on: "NO GHOSTING" in white
          stencil letters next to small line-icon of a ghost. Reads as
          practical in-scene fixture.
  SFX: Soft electronic ding.

[4-6s] — Attendant Spots It
  Camera: HARD CUT to medium of flight attendant in aisle.
  Action: She slowly turns her head right, half-smile flattens to calm
          focused expression, eyes narrow with intent. Mouth closed.
  SFX: Cabin hum, faint ethereal whoosh.

[6-9s] — Ghost in Aisle
  Camera: Cut to wide aisle, 24mm, locked.
  Action: Semi-transparent pale glowing ghost (humanoid, soft blurry
          edges, faint hoodie outline visible through it, softly
          glowing eyes) floats two feet above carpet, drifting slowly.
          Other passengers unaware.
  SFX: Low ethereal hum, cold whisper.

[9-12s] — Confrontation
  Camera: Medium tracking, 35mm, slight handheld.
  Action: Flight attendant strides toward ghost, rolls up one sleeve
          mid-stride, calm and determined. Reaches ghost, grabs its
          translucent arm firmly.
  SFX: Footfalls, decisive exhale.

[12-15s] — Ejection
  Camera: Wide of opened cabin door against bright sky, 24mm.
  Action: Cabin door open mid-flight (stylized safety-video, NOT
          realistic decompression). She throws the translucent ghost
          out the door in one firm motion; ghost streaks into the sky
          and dissipates into glowing wisps. She dusts hands once.
  SFX: Wind whoosh, glowing-dissolve shimmer.
`;

const vid6 = Video({
  prompt: { text: buildPrompt(SEG6_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[5].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 7 — Emergency exit map (split into 2 sub-clips)
// ─────────────────────────────────────────────────────────────────────────────

const seg7half = segments[6].duration / 2;

// 7a — EXIT sign + passengers moving toward exit
const SEG7A_BEATS = `
Duration: 10s. New micro-action every ~2s.

[0-2s] — EXIT Sign Illuminates
  Camera: Tight close-up of the green illuminated airline "EXIT" sign
          above a cabin doorway, 50mm, locked.
  Action: Standard green-on-white airline EXIT sign with running-man
          icon flickers on with a single bright pulse. Below it, a
          smaller laminated placard reads "PIVOT • ACQUI-HIRE •
          LIFESTYLE BUSINESS • DELUSION" in neat black sans-serif.
  SFX: Single electronic ding-pulse.

[2-4s] — Attendant Points Out Exits
  Camera: Pull back to medium shot. Flight attendant standing beside an
          exit door, 50mm.
  Action: She raises both arms with palms flat in the classic airline
          exit-demonstration pose, points firmly to two cabin exits in
          sequence (left then right). Calm sympathetic professional
          expression. Mouth closed.
  SFX: Soft fabric movement of sleeves.

[4-6s] — Passengers Rise
  Camera: HARD CUT to wide cabin aisle shot, 24mm, locked.
  Action: Six passengers (founders in startup hoodies and casual
          blazers) stand up from their seats with controlled urgency,
          gathering small laptop bags. No screaming, no chaos — calm
          serious moving with intent. One glances back at his row.
  SFX: Seatbelt unclicks ×3, soft footsteps.

[6-8s] — Move Toward Exit
  Camera: Tracking shot down aisle following the passengers from behind,
          35mm handheld, jogging pace.
  Action: Passengers walk briskly down the aisle toward the lit EXIT
          sign, one carrying a laptop under his arm, another adjusting
          his bag strap mid-stride. The green EXIT sign glows ahead.
  SFX: Multiple footsteps on carpet, soft murmur.

[8-10s] — At The Door
  Camera: Medium of the front exit door with attendant beside it, 35mm.
  Action: Flight attendant stands beside the open exit, one hand
          gesturing the passengers through with calm authority. First
          passenger steps through the doorway. Sympathetic eyes, mouth
          closed.
  SFX: Wind beyond door, soft footsteps.
`;

const vid7a = Video({
  prompt: { text: buildPrompt(SEG7A_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(seg7half),
  aspectRatio: "9:16",
});

// 7b — Reroute: passenger lost in unexpected airport
const SEG7B_BEATS = `
Duration: 10s. New micro-action every ~2s. Different character
(passenger founder, NOT the attendant). Setting: small unfamiliar
regional airport terminal in a different country.

[0-2s] — Wheels Touch Tarmac
  Camera: Exterior wide shot, 50mm, slight handheld bob.
  Action: Small regional turboprop airplane touches down on a short
          rural airstrip surrounded by green farmland and distant
          mountains. Dust kicks up from wheels. Golden hour light.
  SFX: Tire screech on tarmac, prop engine wind-down.

[2-4s] — Confused Disembark
  Camera: HARD CUT to medium shot of metal airstairs.
  Action: A male founder in a wrinkled grey hoodie carrying a single
          laptop bag steps off the airstairs onto the tarmac, squinting
          in the bright afternoon sun, looking around with a puzzled
          tilt of his head. He pulls out his phone, checks the screen.
  SFX: Footsteps on metal stairs, distant prop wind-down.

[4-6s] — Foreign Terminal Reveal
  Camera: POV pan across the terminal exterior with him in frame, 35mm.
  Action: Small rustic regional terminal building with a sign in a
          foreign script (no readable English). A few locals walk by
          carrying farm produce. He scratches his head, mouths "where
          am I?" silently with closed lips, looking lost.
  SFX: Distant village ambience, single bird call.

[6-8s] — Lost in Terminal
  Camera: Tracking shot following him from behind through the small
          terminal interior, 35mm handheld.
  Action: He wanders through a near-empty terminal hall past unfamiliar
          signage, stops at a departures board showing destinations he
          doesn't recognize, looks at it with growing concern. Sets bag
          down beside him.
  SFX: Echo of footsteps, faint terminal PA in foreign language.

[8-10s] — Philosophical Shrug
  Camera: Medium shot from front, 50mm. Golden hour through windows.
  Action: He stops, looks up, takes a long breath, then shrugs both
          shoulders with calm acceptance, a faint resigned half-smile.
          He picks up his bag and walks out of frame.
  SFX: Single long exhale, soft footsteps.
`;

const vid7b = Video({
  prompt: { text: buildPrompt(SEG7B_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(seg7half),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 8 — Takeoff / closing
// ─────────────────────────────────────────────────────────────────────────────

const SEG8_BEATS = `
Duration: 15s. New micro-action every ~2s.

[0-2s] — Runway Roll
  Camera: Exterior tracking beside airplane on runway, 24mm, fast
          lateral track right at takeoff speed.
  Action: Hustle Fund Air airplane accelerates down runway, white
          fuselage gleaming in golden hour sun, "HUSTLE FUND AIR" livery
          flashes past. Heat shimmer.
  SFX: Building jet roar, runway rumble.

[2-4s] — Wheels Lift
  Camera: HARD CUT to extreme CU of landing gear, 85mm.
  Action: Wheels spin at full speed, then leave tarmac. Slow retraction
          toward fuselage as runway drops away.
  SFX: Mechanical wheel-retract whir.

[4-6s] — Cabin Tilt
  Camera: Interior medium-wide, 24mm, smooth tilt up 10° as plane climbs.
  Action: Cabin floor tilts. Founder passengers grin quietly, two
          holding small white coffee cups. A coffee cup slides slightly
          on a tray table.
  SFX: Smooth jet rumble, cabin creak.

[6-9s] — Sky Fills Windows
  Camera: Slow push toward oval window, 35mm.
  Action: Window fills with bright blue sky as ground falls away. Wing
          visible cutting through air. Window-seat founder leans in to
          look out, exhales with quiet relief.
  SFX: Engine settles to cruise, soft wind hiss.

[9-12s] — Attendant Walks Aisle
  Camera: Medium tracking facing her, 50mm, slow pull-back.
  Action: Flight attendant walks calmly forward up aisle toward camera,
          hands free, warm hopeful soft smile. Backlit by golden window
          light.
  SFX: Soft footsteps, jet bed.

[12-15s] — Closing Wave
  Camera: Settle into medium CU at cabin front, 50mm.
  Action: She raises one hand in a small understated wave, warm sincere
          half-smile direct to camera, one slow blink. Soft golden
          backlight, mild lens flare upper third. Mouth closed.
  SFX: Ambient cabin, engine bed.
`;

const vid8 = Video({
  prompt: { text: buildPrompt(SEG8_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(segments[7].duration),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT 9 — Rapid disclaimer (split into 3 sub-clips)
// ─────────────────────────────────────────────────────────────────────────────

const seg9third = segments[8].duration / 3;

// 9a — Tired disclaimer reader
const SEG9A_BEATS = `
Duration: 10s. New micro-action every ~2s. Character is a DIFFERENT
person, NOT the flight attendant — a tired young guy in a wrinkled
hoodie. Identity here is NOT locked to @image1.

[0-2s] — Reluctant Setup
  Camera: Medium static shot, 50mm, locked, no movement.
  Action: Tired deadpan young man in wrinkled grey hoodie shuffles into
          frame leaning against the back cabin wall, sighs heavily,
          pulls a small crumpled cue card from his pocket.
  SFX: Single tired exhale, paper unfold.

[2-4s] — Speed Reading
  Camera: Hold. Slight push-in 3%.
  Action: He holds up the card and reads off it RAPIDLY at end-of-ad
          legal-disclaimer pace, lips moving fast and naturally (no
          audible speech — VO is added in post). Eyes scan card.
  SFX: Pure ambient cabin only.

[4-6s] — Fine Print Tilt
  Camera: Quick tilt down to his hands, 85mm macro.
  Action: Close-up of the cue card in his hands. Dense tiny illegible
          paragraphs of small black text fill it like real legal fine
          print. His thumb traces down a line.
  SFX: Paper crinkle.

[6-8s] — Card Flip
  Camera: Pull back to medium.
  Action: He flips the card to its BACK, which is ALSO covered in
          dense tiny text. His shoulders sag visibly. Continues reading
          rapidly, blink once.
  SFX: Paper flip, single weary breath.

[8-10s] — Resigned Shrug
  Camera: Hold.
  Action: He stops mid-sentence, lowers the card halfway, looks
          directly at camera with a flat resigned expression, gives
          one small shrug. Mouth closes.
  SFX: Single sigh, ambient bed.
`;

const vid9a = Video({
  prompt: { text: buildPrompt(SEG9A_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(seg9third),
  aspectRatio: "9:16",
});

// 9b — Phone notification cascade
const SEG9B_BEATS = `
Duration: 10s. New micro-action every ~2s. Character NOT visible —
only an anonymous hand and the phone screen. Hand perfectly
anatomical, 5 fingers.

[0-2s] — Phone on Tray
  Camera: Tight overhead static lock-off on smartphone lying flat on
          airplane tray table, 50mm macro T2.8, locked.
  Action: Phone screen shows a calm home screen. Single first
          notification banner slides down from top: "Messages — Hey?".
  SFX: Single soft notification chime.

[2-4s] — Cascade Begins
  Camera: Hold.
  Action: Notification banners begin stacking rapidly: "Mail",
          "Chat", "Network", "Calendar", "Reminder" (generic labels,
          NO real brand logos). Each pushes the previous one down. The
          stack grows to fill upper half of screen.
  SFX: Rapid notification ding-ding-ding cascade building.

[4-6s] — Hand Tries to Swipe
  Camera: Hold.
  Action: A stressed adult hand enters frame from the right, thumb
          swipes downward on the screen trying to dismiss the stack.
          Two banners clear momentarily, then five more appear
          instantly to replace them.
  SFX: Glass tap, fingertip swipe, more chimes.

[6-8s] — Screen Overflows
  Camera: Very slight push-in 3% to emphasize chaos.
  Action: Banners now fill the entire phone screen edge to edge,
          stacking faster than physics should allow. The phone visibly
          vibrates against the plastic tray table from constant
          notifications. Thumb keeps swiping uselessly.
  SFX: Cacophony of notification chimes overlapping, tray buzz.

[8-10s] — Hand Surrenders
  Camera: Slight pull back to medium overhead.
  Action: The hand slowly retracts from the screen, fingers spreading
          in defeat. Phone continues to vibrate and chime as more
          banners cascade. Hand drops out of frame entirely.
  SFX: Continuous chime cascade fading, single defeated exhale.
`;

const vid9b = Video({
  prompt: { text: buildPrompt(SEG9B_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(seg9third),
  aspectRatio: "9:16",
});

// 9c — Tailwinds / market vibes
const SEG9C_BEATS = `
Duration: 10s. New micro-action every ~2s. Character is a DIFFERENT
person (window-seat founder), NOT the flight attendant.

[0-2s] — Clear Sky
  Camera: Medium shot of window-seat passenger, 50mm, slight push-in.
  Action: Founder in dark hoodie sits beside oval cabin window,
          staring out. Outside: bright clear blue sky, perfect cruise.
          He gives a faint hopeful half-smile.
  SFX: Soft engine cruise drone.

[2-4s] — Sudden Storm
  Camera: Hold.
  Action: Outside the window, weather cuts abruptly to dark grey storm
          clouds with visible rain streaks against the glass. Cabin
          dims. His smile drops; eyes widen slightly.
  SFX: Sudden wind howl, rain pat on window.

[4-6s] — Sticky Note Insert
  Camera: Quick truck-in to extreme close-up of seat-back beside him.
  Action: A small handwritten yellow sticky note stuck to the seat-back
          reads "TAILWINDS NOT GUARANTEED" in neat black marker
          handwriting (in-scene prop, NOT overlay). His hand enters
          frame, taps the note once with one finger.
  SFX: Finger tap on paper.

[6-8s] — Sun Returns
  Camera: Pull back to medium. Light shifts.
  Action: Outside the window, sky abruptly returns to bright blue and
          sunshine streams in. His expression goes from worry to mild
          surprise to a small reluctant chuckle.
  SFX: Wind dies, single bird-call-like ping of light.

[8-10s] — Philosophical Shrug
  Camera: Hold.
  Action: He turns from the window toward camera, exhales long, lifts
          both shoulders in a single calm shrug of philosophical
          acceptance, faint resigned half-smile, one slow blink. Mouth
          closes.
  SFX: Long exhale, ambient bed.
`;

const vid9c = Video({
  prompt: { text: buildPrompt(SEG9C_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: sd(seg9third),
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// END CARD — 5s branded outro
// ─────────────────────────────────────────────────────────────────────────────

const SEG_END_BEATS = `
Duration: 5s. New micro-action every ~1.5s — fast punchy outro.
Character: a male founder passenger (NOT the flight attendant) who has
just exited the plane.

[0-1.5s] — Off The Plane
  Camera: Medium shot, 35mm, slight handheld.
  Action: Male founder in dark hoodie with laptop bag jogs down metal
          airstairs onto sunlit tarmac, opens his laptop mid-stride.
  SFX: Footsteps on metal stairs, laptop click-open.

[1.5-3.5s] — Hits Send
  Camera: Quick truck-in to close-up of laptop screen, 50mm macro.
  Action: He stops on the tarmac, laptop balanced on one forearm. On
          screen: a plain email draft with subject "Q3 UPDATE" and a
          large blue SEND button. His finger hovers, then taps SEND.
          Screen shows "Sent ✓" briefly.
  SFX: Single confident keyboard tap, email whoosh.

[3.5-5s] — Attendant Approves
  Camera: HARD CUT to medium close-up of flight attendant in the open
          plane doorway behind him, 50mm.
  Action: Flight attendant stands at top of airstairs, gives a slow
          warm approving nod direct to camera, raises one small white
          handwritten card chest-high reading "THANK YOU" in neat
          black marker. Soft half-smile. Mouth closed.
  SFX: Soft single PA chime, ambient tarmac wind.
`;

const vidEnd = Video({
  prompt: { text: buildPrompt(SEG_END_BEATS), images: [ATTENDANT_REF] },
  model: varg.videoModel("seedance-2-preview"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: 5,
  aspectRatio: "9:16",
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITION (unchanged from V1 — visual structure, overlays, transitions,
// captions, music are all identical to preserve the established edit)
// ─────────────────────────────────────────────────────────────────────────────

const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0);

export default (
  <Render width={1080} height={1920}>
    <Clip duration={segments[0].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid1}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[1].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid2}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[2].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid3}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[3].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid4}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[4].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid5}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
      <Overlay left={30} top={1600} width={140}>
        <Image src={HIPPO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[5].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid6}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    {/* Segment 7: exit map + unexpected landing */}
    <Clip duration={seg7half} transition={{ name: "fade", duration: 0.3 }}>
      {vid7a}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>
    <Clip duration={seg7half} transition={{ name: "fade", duration: 0.3 }}>
      {vid7b}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    <Clip duration={segments[7].duration} transition={{ name: "fade", duration: 0.3 }}>
      {vid8}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
      <Overlay left={30} top={1600} width={140}>
        <Image src={HIPPO_URL} />
      </Overlay>
    </Clip>

    {/* Segment 9: fine print / notification flood / tailwinds vibes */}
    <Clip duration={seg9third} transition={{ name: "fade", duration: 0.3 }}>
      {vid9a}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>
    <Clip duration={seg9third} transition={{ name: "fade", duration: 0.3 }}>
      {vid9b}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>
    <Clip duration={seg9third} transition={{ name: "fade", duration: 0.3 }}>
      {vid9c}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
    </Clip>

    {/* End card: branded outro */}
    <Clip duration={5} transition={{ name: "fade", duration: 0.3 }}>
      {vidEnd}
      <Overlay left={400} top={60} width={280}>
        <Image src={LOGO_URL} />
      </Overlay>
      <Overlay left={30} top={1600} width={140}>
        <Image src={HIPPO_URL} />
      </Overlay>
    </Clip>

    {audio}
    <Captions src={audio} style="tiktok" position="bottom" />
    <Music
      prompt="gentle corporate lo-fi jazz, warm piano, soft brushed percussion, understated professional airline vibe"
      model={elevenlabs.musicModel()}
      volume={0.1}
      duration={totalDuration}
      ducking
    />
  </Render>
);
