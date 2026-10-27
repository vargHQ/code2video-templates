/** @jsxImportSource vargai */

// ── References (uploaded to s3.varg.ai) ───────────────────────────────────
const CHARACTER_REF =
  "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_0a72e5a2119f.jpg";
const GYM_REF =
  "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_82fe725244a5.png";

// ── Shared style tokens ───────────────────────────────────────────────────
const GYM_DESC =
  "an outdoor calisthenics park with woodchip ground, metal pull-up bars and parallel bars, " +
  "trees and greenery in the background, warm golden-hour light";

const SIL_RULES =
  "Transform ONLY the person into a solid flat blue #0040FF silhouette — like a blue paper " +
  "cutout, no facial features, no clothing details, no shading inside, just a flat uniform " +
  "blue fill matching his exact body outline and pose. The ENTIRE background remains completely " +
  "unchanged. Only the person becomes blue.";

// ── Seven exercises ───────────────────────────────────────────────────────
const exercises = [
  {
    pose: "full-body side view, performing bodyweight squats, hips dropped into a deep squat, " +
      "arms extended forward for balance, athletic gym-wear",
    motion: "continuous bodyweight squats: hips drop into a deep squat, then push back up to " +
      "standing. Smooth controlled rhythmic motion, arms extended forward. The gym background " +
      "stays still, only the blue figure animates.",
  },
  {
    pose: "full-body side view, performing Australian pull-ups under a low horizontal bar, body " +
      "held straight and horizontal, arms pulling chest toward the bar, athletic gym-wear",
    motion: "continuous Australian pull-ups under the low bar: body held horizontal, arms pull " +
      "the chest up to the bar then extend back down. Smooth rhythmic rowing motion. The gym " +
      "background stays static, only the blue figure moves.",
  },
  {
    pose: "full-body side view, performing dips on parallel bars, arms bent at 90 degrees, body " +
      "lowered between the bars, athletic gym-wear",
    motion: "continuous dips on parallel bars: body lowers with arms bending to 90 degrees, " +
      "then pushes back up to full extension. Smooth controlled rhythmic motion. The gym " +
      "background stays static, only the blue figure moves.",
  },
  {
    pose: "full-body side view, mid forward lunge on woodchip ground, right leg stepped forward " +
      "with knee bent at 90 degrees, left leg extended back, torso upright, arms at sides, " +
      "athletic gym-wear",
    motion: "continuous alternating lunges: steps forward into a deep lunge with one leg, then " +
      "pushes back to standing, then lunges with the other leg. Smooth rhythmic motion. The " +
      "gym background stays static, only the blue figure animates.",
  },
  {
    pose: "full-body three-quarter view, in a high plank position on woodchip ground, body " +
      "straight, arms straight, one hand reaching across to tap opposite shoulder, athletic " +
      "gym-wear",
    motion: "holds a high plank and alternates tapping opposite shoulders: right hand taps " +
      "left shoulder, returns to ground, left hand taps right shoulder, returns to ground. " +
      "Smooth controlled motion, core stays stable. The gym background stays static, only " +
      "the blue figure animates.",
  },
  {
    pose: "full-body side view, lying flat on his back on woodchip ground, legs raised straight " +
      "up to 90 degrees, arms flat on the ground at his sides, core engaged, athletic gym-wear",
    motion: "lies on his back and performs continuous leg raises: legs lower slowly toward the " +
      "ground without touching, then raise back up to vertical. Smooth controlled motion, " +
      "core engaged. The gym background stays static, only the blue figure animates.",
  },
  {
    pose: "full-body side view, in a pike position on woodchip ground, hips raised high forming " +
      "an inverted V shape, arms and legs straight, head between arms pointing down, mid " +
      "push-up with arms bent, athletic gym-wear",
    motion: "continuous pike push-ups: from the inverted V pike position, arms bend lowering " +
      "the head toward the ground, then push back up. Smooth rhythmic motion, hips stay high. " +
      "The gym background stays static, only the blue figure animates.",
  },
];

const CLIP_DUR = 5;
const TOTAL = exercises.length * CLIP_DUR;

// ── Pipeline per exercise: pose → silhouette → animate ────────────────────
const videos = exercises.map((ex) => {
  // 1. Generate pose: place the character in the gym
  const pose = Image({
    prompt: {
      text: `Place the exact same man from the first reference into ${GYM_DESC}. ` +
        `Retain his exact face, build, hairstyle, and identity. He is ${ex.pose}. ` +
        `Photorealistic, shot on Sony A7IV 35mm f/2.8, natural golden-hour lighting.`,
      images: [CHARACTER_REF, GYM_REF],
    },
    model: varg.imageModel("nano-banana-2"),
    aspectRatio: "9:16",
  });

  // 2. Edit: replace only the person with a flat blue silhouette
  const silhouette = Image({
    prompt: { text: SIL_RULES, images: [pose] },
    model: varg.imageModel("nano-banana-2"),
    aspectRatio: "9:16",
  });

  // 3. Animate the silhouette with H3 Max
  return Video({
    prompt: { text: `The blue silhouette ${ex.motion}`, images: [silhouette] },
    model: varg.videoModel("minimax_h3_max"),
    duration: CLIP_DUR,
    aspectRatio: "9:16",
  });
});

export default (
  <Render width={1080} height={1920} fps={30}>
    {videos.map((v, i) => (
      <Clip
        key={i}
        duration={CLIP_DUR}
        transition={i < videos.length - 1 ? { name: "fade", duration: 0.4 } : undefined}
      >
        {v}
      </Clip>
    ))}

    <Music
      prompt="Energetic electronic workout beat, driving bass, punchy drums, motivational gym energy, 128 BPM, no vocals, no lyrics, clean loop"
      model={varg.musicModel("music_v1")}
      volume={0.25}
      duration={TOTAL}
      loop
    />
  </Render>
);
