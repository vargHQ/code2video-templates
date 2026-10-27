/** @jsxImportSource vargai */
import { Render, Clip, Image, Video, Music } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const OUT = "/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/templates/templates/calisthenics gym/output";

const scenes = [
  {
    tag: "squats",
    sil: `${OUT}/sil-squats.png`,
    motion:
      "The blue silhouette performs continuous bodyweight squats: hips drop down into a deep squat, " +
      "then push back up to standing. Smooth controlled rhythmic motion, arms extended forward for balance. " +
      "The gym background stays still, only the blue figure animates.",
  },
  {
    tag: "australian-pullups",
    sil: `${OUT}/sil-australian-pullups.png`,
    motion:
      "The blue silhouette performs continuous Australian pull-ups under the low bar: body held horizontal, " +
      "arms pull the chest up to the bar then extend back down. Smooth rhythmic rowing motion. " +
      "The gym background stays static, only the blue figure moves.",
  },
  {
    tag: "dips",
    sil: `${OUT}/sil-dips.png`,
    motion:
      "The blue silhouette performs continuous dips on the parallel bars: body lowers with arms bending " +
      "to 90 degrees, then pushes back up to full extension. Smooth controlled rhythmic motion. " +
      "The gym background stays static, only the blue figure moves.",
  },
  {
    tag: "lunges",
    sil: `${OUT}/sil-lunges.png`,
    motion:
      "The blue silhouette performs continuous alternating lunges: steps forward into a deep " +
      "lunge with one leg, then pushes back to standing, then lunges with the other leg. " +
      "Smooth rhythmic motion. The gym background stays static, only the blue figure animates.",
  },
  {
    tag: "plank-taps",
    sil: `${OUT}/sil-plank-taps.png`,
    motion:
      "The blue silhouette holds a high plank and alternates tapping opposite shoulders: " +
      "right hand taps left shoulder, returns to ground, left hand taps right shoulder, " +
      "returns to ground. Smooth controlled motion, core stays stable. The gym background " +
      "stays static, only the blue figure animates.",
  },
  {
    tag: "lying-leg-raises",
    sil: `${OUT}/sil-lying-leg-raises.png`,
    motion:
      "The blue silhouette lies on his back and performs continuous leg raises: legs lower " +
      "slowly toward the ground without touching, then raise back up to vertical. Smooth " +
      "controlled motion, core engaged. The gym background stays static, only the blue " +
      "figure animates.",
  },
  {
    tag: "pike-pushups",
    sil: `${OUT}/sil-pike-pushups.png`,
    motion:
      "The blue silhouette performs continuous pike push-ups: from the inverted V pike " +
      "position, arms bend lowering the head toward the ground, then push back up. Smooth " +
      "rhythmic motion, hips stay high. The gym background stays static, only the blue " +
      "figure animates.",
  },
];

const CLIP_DUR = 5;
const TOTAL = scenes.length * CLIP_DUR;

const videos = scenes.map((s) =>
  Video({
    prompt: {
      text: s.motion,
      images: [Image({ src: s.sil })],
    },
    model: varg.videoModel("minimax_h3_max"),
    duration: CLIP_DUR,
    aspectRatio: "9:16",
  }),
);

export default (
  <Render width={1080} height={1920} fps={30}>
    {videos.map((v, i) => (
      <Clip
        key={scenes[i].tag}
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
