/** @jsxImportSource vargai */
// Formula Care — Episode 1: Gym Intro (7 Scenes, ~33s, Native Audio)
//
// Fast-cut UGC-style vertical video. 7 scenes in 33 seconds.
// Kling-v3 native audio: dialogue embedded in video prompts.
//
// Scene breakdown (matched to reference video):
//   1. (6s) Squat exercise — medium-wide, pillar framing, opening hook
//   2. (4s) Booty pointing — back view, trainer crouches, points at lower body
//   3. (4s) Belly pointing — front view, trainer gestures at midsection
//   4. (4s) Arm close-up — tight shot, trainer points at raised arm
//   5. (6s) Tai Chi pitch — same close-up, trainer speaks to camera
//   6. (4s) Return to squats — deep squat, same pillar framing as scene 1
//   7. (5s) Standing discussion — face to face, "28 days" promise
//
// Characters:
//   Older woman (~60s): silver-grey wavy hair, fat and overweight, big flabby belly
//     with skin folds, large saggy rear, thick thighs, saggy chest, flabby arms,
//     purple workout set, barefoot
//   Trainer: Asian woman, dark ponytail, navy blue activewear, black sneakers
//
// Environment:
//   Loft gym: honey-colored wooden floors, industrial grid windows,
//   exposed red brick walls, wooden beam pillars, green trees outside
//
// Usage: bun run render templates/clients/formula-care-ep1.tsx
// Cost:  ~$5 — 8 images + 8 videos (kling-v3 w/ audio) + music

import { Clip, Image, Music, Render, Video } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_BASE = varg.imageModel("nano-banana-pro");
const IMG_EDIT = varg.imageModel("nano-banana-2");
const AR = "9:16" as const;
const AUDIO_ON = { varg: { generate_audio: true } };

// ═════════════════════════════════════════════════════════════════════════
// IMAGES
// ═════════════════════════════════════════════════════════════════════════

// Base gym reference — establishes both characters + environment
const gymBase = Image({
  prompt: "Loft-style gym with honey-colored polished wooden floors, large industrial grid windows showing green trees outside, exposed red brick walls, wooden beam pillars and ceiling beams. Two women: older overweight fat woman in her 60s with silver-grey shoulder-length wavy hair, big flabby belly with skin folds, large saggy rear, thick heavy thighs with dimpled skin, saggy drooping chest, flabby hanging upper arms, wearing a purple workout set, barefoot. Younger Asian woman trainer with dark hair in ponytail wearing navy blue activewear crop top and full-length leggings with black sneakers. Yoga mat and water bottle on floor in background, dumbbells visible. Natural soft daylight streaming through windows, warm atmosphere, photorealistic, 9:16 portrait",
  model: IMG_BASE,
  aspectRatio: AR,
});

// Scene 1: Squat — medium-wide, wooden pillar partially framing right edge
const squatImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Medium-wide shot partially framed by wooden beam pillar on the right edge of frame creating a candid peeping composition. Overweight older woman in purple workout set performing a squat, big flabby belly folding, thick thighs, barefoot on honey-colored wooden floor, trainer in navy blue activewear standing behind her guiding her arms upward. Both facing the large grid windows with green trees. Natural daylight, warm tones, photorealistic",
    images: [gymBase],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 2: Booty — back view, trainer crouching and pointing
const bootyImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Back view of the overweight older woman standing straight with her back to camera, silver-grey hair visible, wearing purple workout set, large saggy rear visible, thick heavy thighs with dimpled skin. The Asian trainer in navy blue activewear crouches down beside her on the left side, pointing her finger toward the older woman's lower body. Grid windows with green trees in background, honey-colored wooden floor, low angle medium shot, photorealistic",
    images: [gymBase],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 3: Belly — front view, trainer pointing at midsection
const bellyImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Front-facing medium shot, both women visible from head to knees. Overweight older woman in purple workout set standing still facing camera with neutral expression, big flabby belly with skin folds prominently visible, saggy drooping chest, thick heavy arms. Asian trainer in navy blue activewear stands beside her on the left, slightly crouching, gesturing toward the older woman's midsection with an open hand. Grid windows behind them, natural daylight, photorealistic",
    images: [gymBase],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 4+5: Arm close-up — tight shot, trainer pointing at raised arm
const armImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Tight close-up showing both women's upper bodies and faces filling the frame. The overweight older woman with silver-grey hair holds her right arm raised straight up, flabby hanging upper arm skin clearly visible, saggy drooping chest visible. The Asian trainer in navy blue top stands on the left, pointing at the older woman's raised arm while looking directly at camera with a confident concerned expression. Exposed brick wall and grid window slightly blurred in background, intimate close-up framing, photorealistic",
    images: [gymBase],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 6: Return to squats — deep squat, same pillar framing
const deepSquatImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Medium-wide shot partially framed by wooden beam pillar on right edge. Overweight older woman in purple workout set doing a deep squat very low to the ground, barefoot, big belly folding as she squats, thick thighs, trainer in navy blue activewear crouching beside her guiding the movement. Same composition as opening shot but deeper squat position. Grid windows with green trees, honey-colored floor, warm natural daylight, photorealistic",
    images: [squatImg],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

// Scene 7: Standing discussion — face to face
const standingImg = Image({
  prompt: {
    text: "Same loft gym from reference, same two women. Medium shot, both women standing face to face in conversation. Overweight older woman in purple workout set on the left looking at the trainer, big flabby belly, saggy arms, thick body clearly visible. Asian trainer in navy blue activewear on the right, gesturing with her hands while explaining something, confident posture. Large grid windows behind them showing green trees, warm natural light, slightly wider framing showing the full room depth, photorealistic",
    images: [gymBase],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});



// ═════════════════════════════════════════════════════════════════════════
// VIDEOS — Kling-v3 with native audio and dialogue in prompts
// ═════════════════════════════════════════════════════════════════════════

// Scene 1 (6s): Squat exercise + opening hook
const vid1 = Video({
  prompt: {
    text: `Loft gym with honey-colored wooden floors, industrial grid windows showing green trees.
Partially framed by a wooden beam pillar on the right edge of frame.
Overweight older woman in purple workout set performs slow controlled squats, barefoot on wooden floor, soft round body visible.
Asian trainer in navy blue activewear guides her arms up and down smoothly from behind.
Static medium-wide shot, natural daylight, warm candid atmosphere.
The trainer speaks in a clear encouraging voice: "You do not need to spend hours sweating to transform your shape by summer."
Gym ambient sounds, soft footsteps on wooden floor.`,
    images: [squatImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

// Scene 2 (4s): Booty pointing — back view
const vid2 = Video({
  prompt: {
    text: `Same loft gym. Back view of overweight older woman standing with her back to camera in purple workout set, thick thighs and wide hips visible.
Asian trainer in navy crouches on the left, pointing toward the woman's lower body.
Subtle movement, the trainer's hand gestures while speaking.
Static camera, low angle.
The trainer says matter-of-factly: "If your booty looks like this.."
Soft gym ambient sounds.`,
    images: [bootyImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 3 (4s): Belly pointing — front view
const vid3 = Video({
  prompt: {
    text: `Same loft gym. Front-facing medium shot.
Overweight older woman in purple workout set stands facing camera, stoic expression, soft round belly visible.
Asian trainer in navy stands beside her, slightly crouching, gesturing at the woman's midsection.
Static camera, natural daylight.
The trainer says: "Your belly looks like this.."
Soft gym ambient sounds.`,
    images: [bellyImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 4 (4s): Arm close-up — tight shot
const vid4 = Video({
  prompt: {
    text: `Same loft gym. Tight close-up of both women's upper bodies and faces.
Overweight older woman holds her arm raised straight up, soft heavy upper arm visible.
Asian trainer points at the raised arm while looking at camera.
Static intimate close-up framing.
The trainer says: "Your arms look like this,"
Soft gym ambient.`,
    images: [armImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 5 (6s): Tai Chi pitch — same close-up, trainer speaks to camera
const vid5 = Video({
  prompt: {
    text: `Same loft gym, same tight close-up framing. Both women visible from chest up.
Older woman still holds her arm raised. Asian trainer speaks directly to camera with confident energy.
The trainer points at the arm while looking straight into the lens.
The trainer says clearly and confidently: "Then you should simply join our beginner Tai Chi Challenge this Monday, May 18th."
Soft gym ambient, trainer's voice is clear and motivating.`,
    images: [armImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

// Scene 6 (4s): Return to squats — deep squat
const vid6 = Video({
  prompt: {
    text: `Same loft gym, same medium-wide angle with wooden pillar framing right edge.
Both women doing deep squats together, overweight older woman very low in her squat, barefoot, belly folds visible as she squats down.
Trainer crouches beside her guiding the motion.
Static camera, warm natural light from windows.
The trainer says: "Forget the diets and cardio"
Gym ambient sounds, gentle movement.`,
    images: [deepSquatImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

// Scene 7 (5s): Standing discussion — face to face
const vid7 = Video({
  prompt: {
    text: `Same loft gym, medium shot. Both women standing face to face.
Trainer gestures with her hands while explaining, confident posture.
Overweight older woman in purple workout set listens and looks at the trainer, saggy arms and soft round body visible.
Natural light from grid windows, warm atmosphere.
The trainer says with conviction: "to get a beautifully toned body in exactly 28 days."
Soft gym ambient.`,
    images: [standingImg],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 5,
  providerOptions: AUDIO_ON,
});



// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION — fast cuts, no transitions (UGC hard-cut style)
// ═════════════════════════════════════════════════════════════════════════

const TOTAL = 6 + 4 + 4 + 4 + 6 + 4 + 5; // 33s

export default (
  <Render width={1080} height={1920} fps={30}>
    <Music
      prompt="Upbeat gentle background fitness music, soft piano and light percussion, positive uplifting mood, energetic but not overwhelming"
      model={varg.musicModel("music_v1")}
      volume={0.10}
      ducking
      duration={TOTAL}
    />

    {/* Scene 1: Squat + "You do not need to spend hours sweating..." */}
    <Clip duration={6}>{vid1}</Clip>

    {/* Scene 2: Booty back view + "If your booty looks like this.." */}
    <Clip cutFrom={0.3} duration={3.7}>{vid2}</Clip>

    {/* Scene 3: Belly front view + "Your belly looks like this.." */}
    <Clip cutFrom={0.3} duration={3.7}>{vid3}</Clip>

    {/* Scene 4: Arm close-up + "Your arms look like this," */}
    <Clip cutFrom={0.5} duration={4}>{vid4}</Clip>

    {/* Scene 5: Tai Chi pitch + "simply join our beginner Tai Chi Challenge..." */}
    <Clip duration={6}>{vid5}</Clip>

    {/* Scene 6: Deep squat return + "Forget the diets and cardio" */}
    <Clip duration={4}>{vid6}</Clip>

    {/* Scene 7: Standing discussion + "to get a beautifully toned body in exactly 28 days." */}
    <Clip duration={5}>{vid7}</Clip>
  </Render>
);
