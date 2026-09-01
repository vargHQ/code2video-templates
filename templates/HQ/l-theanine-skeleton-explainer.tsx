/** @jsxImportSource vargai */
// ═══════════════════════════════════════════════════════════════════════
// 01 skeleton_explainer → L-theanine — audio-driven, 3 takes
// ═══════════════════════════════════════════════════════════════════════
//
// v4 — three fixes over the rendered version:
//
// 1. MUSIC. Was silent. volume 0.07 with ducking on top of a near-continuous
//    voice track leaves nothing audible. Raised to 0.18, and duration is now
//    the real timeline length instead of a hardcoded 30.
//
// 2. CLIP LENGTH = SPEECH LENGTH. Was pinned at 10s per clip regardless of
//    how long the read actually was.
//
// 3. BEAT TIMESTAMPS ARE COMPUTED, NOT AUTHORED. This is the real fix for
//    the audio-overruns-picture problem. Previously the script said
//    [00:00-00:02], [00:02-00:04] ... on the assumption the read would fit
//    10s. When it did not, picture and voice desynced and the last beat got
//    cut off. Now each take's beat boundaries are derived from its actual
//    segment durations, so the picture cuts where the sentence lands. The
//    video length rounds up to the next valid seedance step and the clip
//    trims it back to the speech.
//
// ── RENDER RUNTIME NOTES ──────────────────────────────────────────────
//   - Video model: bare string. resolve.ts has
//     `typeof model === "string" ? model : model.modelId`. Do NOT wrap in
//     varg.videoModel() — it normalises "-" and "." to "_" and mangles it.
//   - Music model: OBJECT, from elevenlabs — elevenlabs.musicModel("music_v1").
//     renderMusic passes model straight to generateMusic which calls
//     model.doGenerate; there is no string branch. This asymmetry with Video
//     is the most confusing thing in the API.
//   - `varg` is injected — never declare it.
//   - Only vargai/* imports. @vargai/gateway is rejected; vargai/ai is fine.
//   - Speech returns the TRACK itself: { duration, file, segments, words }.
//     No { audio, segments } wrapper.
//   - No <Overlay>. Speech and Captions sit directly in the Clip.
//   - One <Video> per <Clip> — reusing one across Clips bills it per Clip.
//   - Seedance prompt caps at 2000 chars. Measure before sending.
//   - Seedance duration must be 5, 10 or 15.

import { Captions, Clip, Music, Render, Speech, Video } from "vargai/react";
import { elevenlabs } from "vargai/ai";

const VOICE = "6FiCmD8eY5VyjOdG5Zjk"; // Adam
const MODEL = "seedance_2_5";
const B = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";
const img = (f) => B + f + ".png";

const CAPS = {
  style: "tiktok", position: "bottom", color: "#ffffff",
  activeColor: "#F0A030", wordsPerLine: 5, fontSize: 52,
};

const say = (lines) =>
  Speech({ model: elevenlabs.speechModel("eleven_v3"), voice: VOICE, children: lines });

// Seedance accepts 5 / 10 / 15 only. Round the take up past the read.
const takeLen = (s) => (s <= 5 ? 5 : s <= 10 ? 10 : 15);

// Timestamp formatter for the script: 7.4 -> "00:07.4"
const ts = (s) => `00:${String(Math.floor(s)).padStart(2, "0")}.${Math.round((s % 1) * 10)}`;

// ═══════════════════════════════════════════════════════════════════════
// SPEECH
// ═══════════════════════════════════════════════════════════════════════

const voA = await say([
  "What do 3 coffees a day actually do to you?",
  "In your brain, caffeine blocks adenosine - hiding the \"I'm tired\" signal.",
]);
const voB = await say([
  "And it stays in your body for hours.",
  "More caffeine, more stimulation. Higher alertness - but worse sleep, jitters, anxiety.",
]);
const voC = await say([
  "But 200 mg of L-theanine changes the equation. It promotes relaxed attention.",
  "Studies show: better attention, faster reaction. Same energy. Less edge. Cleaner focus.",
]);

const TOTAL = voA.duration + voB.duration + voC.duration;

[["A", voA], ["B", voB], ["C", voC]].forEach(([n, v]) => {
  console.log(
    `${n}: read ${v.duration.toFixed(2)}s -> take ${takeLen(v.duration)}s ` +
      `(segments ${v.segments.map((s) => s.duration.toFixed(2)).join(" + ")})`,
  );
});
console.log(`TOTAL ${TOTAL.toFixed(2)}s`);

// ═══════════════════════════════════════════════════════════════════════
// TAKES — beat boundaries derived from the read
// ═══════════════════════════════════════════════════════════════════════
// Take A: 4 beats over 2 sentences — each sentence is split across two
// shots, so the picture cuts twice per line. Sentence 1 covers the kitchen
// and the stomach macro; sentence 2 covers the brain and the particle macro.

const a1 = voA.segments[0].duration;
const a2 = voA.segments[1].duration;
const aEnd = takeLen(voA.duration);
const A = [0, a1 * 0.55, a1, a1 + a2 * 0.55, aEnd];

const TAKE_A = `Four-beat clinical 3D medical-visualisation film, 9:16, one continuous take with prompted cuts. No hard cuts, nothing appearing out of nowhere.
@image1 semi-transparent skeleton at a kitchen table with a paper cup, stomach glowing amber inside the ribcage, dark charcoal backdrop.
@image2 interior of the skull, brain glowing cold blue-white, dim particles halted at its surface.

[${ts(A[0])}-${ts(A[1])}] @image1 medium. The skeleton raises the cup to its skull and tips it; the amber stomach glow flares on the swallow. Everything else dim and unlit. Static.
Subtext: open on the swallow, not the setup.

[${ts(A[1])}] "Zoom-through" transition. The camera drives straight into the amber stomach glow until it fills the screen, then opens inside it on a macro of the same stomach and ribs. Natural switch, medium to macro.

[${ts(A[1])}-${ts(A[2])}] @image1 macro. The amber pulses once, hard, spill racing along the inside of the ribs. Slight push-in.
Subtext: this beat hits, it does not explain.

[${ts(A[2])}] "Zoom-through" transition. The camera pulls back to the eye socket, drives into its darkness until black fills the screen, and unfolds within it onto the glowing brain. Natural switch, macro to extreme close-up.

[${ts(A[2])}-${ts(A[3])}] @image2. Dim particles drift toward the brain and stop dead at its surface in a halo, unable to land; the blue-white glow steps up as each one fails. Skull still. Slow push-in.
Subtext: the particles must read as stopped, not absorbed.

[${ts(A[3])}] "Natural cut", keeping camera breathing and pacing, wide brain view handing over to a macro of the same halted particles.

[${ts(A[3])}-${ts(A[4])}] @image2 macro. Particles press on the glowing surface and slide off into an unmoving crust; the light behind is flat. Almost static. Hold to the end.

Global: locked-off lighting, neutral grade, dark charcoal backdrop. One organ lit per frame, never two. Weighty restrained motion, no shake. Jaw never moves. No teal or green. No subtitles, no text, no BGM, no dialogue, no people.`;

// Take B: 3 beats over 2 sentences. Sentence 1 is the held night shot;
// sentence 2 splits across the heart close-up and the wider tremor shot.
const b1 = voB.segments[0].duration;
const b2 = voB.segments[1].duration;
const bEnd = takeLen(voB.duration);
const Bt = [0, b1, b1 + b2 * 0.55, bEnd];

const TAKE_B = `Three-beat clinical 3D medical-visualisation film, 9:16, one continuous take with prompted cuts. No hard cuts, nothing appearing out of nowhere.
@image3 the same semi-transparent skeleton lying on its back in a dark bedroom at night, brain still glowing cold blue-white.
@image4 close-up of the same ribcage, heart glowing hot red-orange.

[${ts(Bt[0])}-${ts(Bt[1])}] @image3. The skeleton lies completely still, sockets to the ceiling. The cold blue-white brain glow holds absolutely steady, no pulse, no flicker. The only motion is a faint drift of cool window light across the bedding. Static.
Subtext: stillness is the subject — nothing has changed, hours later.

[${ts(Bt[1])}] "Match cut" transition. Shape and position similarity: the round blue-white brain glow ending picture A sits in exactly the same screen position as the round red-orange heart glow opening picture B, colour shifting cold to hot. Natural switch, medium wide to close-up.

[${ts(Bt[1])}-${ts(Bt[2])}] @image4 close on the ribcage. The heart pulses and the rate visibly climbs across the beat, beats arriving faster and harder, light radiating in waves onto the ribs. Slow push-in.
Subtext: acceleration you can count — visibly faster at the end than the start.

[${ts(Bt[2])}] "Whip pan" transition. The camera whips sideways out of the close-up into heavy motion blur; a wider view of the same ribcage rides in on the same force and locks. Close-up to medium.

[${ts(Bt[2])}-${ts(Bt[3])}] @image4 wider on ribcage and spine. Still pounding, and now a faint high-frequency tremor runs through the bones, barely perceptible but present. Locked. Hold to the end.
Subtext: the only unstable beat in the film.

Global: locked-off lighting, neutral grade, dark charcoal backdrop. One organ lit per frame, never two. Weighty restrained motion apart from the noted tremor, no shake. Jaw never moves. No teal or green. No subtitles, no text, no BGM, no dialogue, no people.`;

// Take C: 2 beats, one per sentence. The film stops cutting here on purpose.
const c1 = voC.segments[0].duration;
const cEnd = takeLen(voC.duration);
const C = [0, c1, cEnd];

const TAKE_C = `Two-beat clinical 3D medical-visualisation film, 9:16, one continuous take with a prompted cut. No hard cuts, nothing appearing out of nowhere.
@image5 a single translucent capsule resting on the open palm of the same semi-transparent skeleton, brain glowing calm teal-green inside the skull.
@image6 the same skeleton standing upright, full body, heart glowing steady teal-green inside the ribcage.

[${ts(C[0])}-${ts(C[1])}] @image5. The capsule rests on the open skeletal palm, catching a soft travelling highlight as the hand holds perfectly still. Inside the skull the brain glow shifts across the beat from harsh white toward calm even teal-green, spreading smooth and losing its flicker, then settling. Nothing else moves. Very slow push-in.
Subtext: the film stops cutting here on purpose — the product arrives without a flourish.

[${ts(C[1])}] "Match cut" transition. Shape and colour similarity: the calm teal-green brain glow ending picture A resolves into the identically coloured teal-green heart glow opening picture B, colour and steadiness unchanged across the cut. Natural switch, close-up to full body.

[${ts(C[1])}-${ts(C[2])}] @image6. Full body, standing upright and settled, arms relaxed. The teal-green heart pulses slowly and evenly, the same rhythm throughout, no acceleration, no change in intensity. Nothing else in frame moves. Camera completely static. Hold to the end.
Subtext: closes the arc the film opened — same body, different light.

Global: locked-off lighting, neutral grade, dark charcoal backdrop. One organ lit per frame, never two. Weighty restrained motion, no shake, no tremor anywhere in this take. Jaw never moves. No subtitles, no text, no BGM, no dialogue, no people.`;

[["A", TAKE_A], ["B", TAKE_B], ["C", TAKE_C]].forEach(([n, t]) =>
  console.log(`prompt ${n}: ${t.length} chars${t.length > 2000 ? "  <-- OVER CAP" : ""}`),
);

// ═══════════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════════
// Each clip runs exactly as long as its read; the take is generated at the
// next valid step above that and trimmed back with cutTo.

const scene = (text, frames, vo) => (
  <Clip cutFrom={0} cutTo={vo.duration} duration={vo.duration}>
    <Video
      prompt={{ text, images: frames }}
      model={MODEL}
      keepAudio={false}
      duration={takeLen(vo.duration)}
      aspectRatio="9:16"
    />
    {vo}
    <Captions src={vo} {...CAPS} />
  </Clip>
);

export default (
  <Render width={1080} height={1920} fps={30}>
    <Music
      model={elevenlabs.musicModel("music_v1")}
      prompt="Sparse clinical ambient drone with a low pulsing sub that quickens through the middle and drops away to one warm sustained pad at the end. No melody, no percussion, cold and neutral"
      volume={0.18}
      ducking
      duration={TOTAL}
    />
    {scene(TAKE_A, [img("file_2f98c167d642"), img("file_99dce9f47e55")], voA)}
    {scene(TAKE_B, [img("file_d027381717d4"), img("file_86c0dc354d59")], voB)}
    {scene(TAKE_C, [img("file_02cb07733353"), img("file_89532e8a64e4")], voC)}
  </Render>
);
