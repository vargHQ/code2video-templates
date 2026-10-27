// Redo 4 ground-based exercises (no equipment): pose → silhouette → animation.
// Push-ups and squats already work, keep them.
//
// Usage: bun "templates/calisthenics gym/generate-ground.ts"

const API = "https://api.varg.ai/v2";
const KEY = process.env.VARG_API_KEY;
if (!KEY) throw new Error("VARG_API_KEY is not set");

const DIR = `${import.meta.dir}`;
const OUT = `${DIR}/output`;
const REF_PATH = `${DIR}/ref.jpg`;
const GYM_PATH = `${OUT}/01-gym-empty.png`;

type Job = {
  id: string;
  status: string;
  output?: { outputs: { url: string }[] };
  error?: unknown;
  actual_cost_cents?: number;
};

async function api(path: string, init?: RequestInit): Promise<Job> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = (await res.json()) as Job & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(`${path} ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`);
  }
  return json;
}

async function uploadFile(localPath: string): Promise<string> {
  const file = Bun.file(localPath);
  const filename = localPath.split("/").pop() ?? "file.png";
  const form = new FormData();
  form.append("file", file, filename);
  const res = await fetch(`${API}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) {
    throw new Error(`upload failed: ${json?.error?.message ?? JSON.stringify(json)}`);
  }
  console.log(`[upload] ${filename} -> ${json.url}`);
  return json.url;
}

async function image(opts: {
  tag: string;
  prompt: string;
  files?: string[];
}): Promise<string> {
  const model = opts.files?.length ? "nano-banana-2/edit" : "nano-banana-2";
  const body: Record<string, unknown> = {
    model,
    prompt: opts.prompt,
    aspect_ratio: "9:16",
  };
  if (opts.files?.length) body.files = opts.files.map((url) => ({ url }));
  console.log(`[${opts.tag}] submitting...`);
  const job = await api("/image", { method: "POST", body: JSON.stringify(body) });
  for (let i = 0; i < 120; i++) {
    await Bun.sleep(3000);
    const s = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`[${opts.tag}] no output`);
      const bytes = await fetch(url).then((r) => r.arrayBuffer());
      await Bun.write(`${OUT}/${opts.tag}.png`, bytes);
      console.log(`[${opts.tag}] done ${s.actual_cost_cents ?? "?"}c -> output/${opts.tag}.png`);
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
    if (i % 5 === 0) console.log(`[${opts.tag}] polling... (${s.status})`);
  }
  throw new Error(`[${opts.tag}] timed out`);
}

async function video(opts: {
  tag: string;
  prompt: string;
  imageUrl: string;
  duration: number;
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: "minimax_h3_max",
    prompt: opts.prompt,
    files: [{ url: opts.imageUrl }],
    provider_options: {
      fal: { duration: opts.duration, resolution: "768P", prompt_expansion_mode: "balanced" },
    },
  };
  console.log(`[${opts.tag}] submitting H3 Max...`);
  const job = await api("/video", { method: "POST", body: JSON.stringify(body) });
  for (let i = 0; i < 200; i++) {
    await Bun.sleep(5000);
    const s = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`[${opts.tag}] no output`);
      const bytes = await fetch(url).then((r) => r.arrayBuffer());
      await Bun.write(`${OUT}/${opts.tag}.mp4`, bytes);
      console.log(`[${opts.tag}] done ${s.actual_cost_cents ?? "?"}c -> output/${opts.tag}.mp4`);
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
    if (i % 4 === 0) console.log(`[${opts.tag}] polling... (${s.status})`);
  }
  throw new Error(`[${opts.tag}] timed out`);
}

const refUrl = await uploadFile(REF_PATH);
const gymUrl = await uploadFile(GYM_PATH);

const GYM_DESC =
  "the calisthenics park shown in the second reference image — same woodchip ground, " +
  "warm golden-hour light, trees in background. The frame is focused on the ground area " +
  "away from the bars — just the woodchip surface and open space.";

const SIL_BLUE =
  "solid flat blue #0040FF, like a blue paper cutout, no facial features, no clothing " +
  "details, no shading inside — just a flat uniform blue fill matching his exact body " +
  "outline and pose. The ENTIRE background remains EXACTLY as in the original image, " +
  "completely unchanged. Only the person is replaced with the blue silhouette.";

const exercises: { tag: string; pose: string; motion: string }[] = [
  {
    tag: "lunges",
    pose:
      "performing a forward lunge on the woodchip ground, full-body side view. Right leg " +
      "stepped forward with knee bent at 90 degrees, left leg extended back with knee " +
      "straight, torso upright, arms at sides. Athletic gym-wear.",
    motion:
      "The blue silhouette performs continuous alternating lunges: steps forward into a deep " +
      "lunge with one leg, then pushes back to standing, then lunges with the other leg. " +
      "Smooth rhythmic motion. The gym background stays static, only the blue figure animates.",
  },
  {
    tag: "plank-taps",
    pose:
      "in a high plank (push-up) position on the woodchip ground, full-body three-quarter " +
      "view. Body straight in a plank line, arms straight, one hand reaching across to " +
      "tap the opposite shoulder. Athletic gym-wear.",
    motion:
      "The blue silhouette holds a high plank and alternates tapping opposite shoulders: " +
      "right hand taps left shoulder, returns to ground, left hand taps right shoulder, " +
      "returns to ground. Smooth controlled motion, core stays stable. The gym background " +
      "stays static, only the blue figure animates.",
  },
  {
    tag: "lying-leg-raises",
    pose:
      "lying flat on his back on the woodchip ground, full-body side view. Legs raised " +
      "straight up to 90 degrees from the ground, arms flat on the ground at his sides, " +
      "core engaged. Athletic gym-wear.",
    motion:
      "The blue silhouette lies on his back and performs continuous leg raises: legs lower " +
      "slowly toward the ground without touching, then raise back up to vertical. Smooth " +
      "controlled motion, core engaged. The gym background stays static, only the blue " +
      "figure animates.",
  },
  {
    tag: "pike-pushups",
    pose:
      "in a pike position on the woodchip ground, full-body side view. Hips raised high " +
      "forming an inverted V shape, arms and legs straight, head between arms pointing " +
      "down toward the ground, mid push-up with arms bent. Athletic gym-wear.",
    motion:
      "The blue silhouette performs continuous pike push-ups: from the inverted V pike " +
      "position, arms bend lowering the head toward the ground, then push back up. Smooth " +
      "rhythmic motion, hips stay high. The gym background stays static, only the blue " +
      "figure animates.",
  },
];

for (const ex of exercises) {
  // 1. Pose in gym
  const posePrompt =
    `Place the exact same man from the first reference image into ${GYM_DESC}. ` +
    `Retain his exact face, build, hairstyle, and identity. He is ${ex.pose} ` +
    `Photorealistic, shot on Sony A7IV 35mm f/2.8, natural golden-hour lighting.`;
  const poseUrl = await image({ tag: `pose-${ex.tag}`, prompt: posePrompt, files: [refUrl, gymUrl] });

  // 2. Silhouette
  const silPrompt =
    `Take this image and transform ONLY the person into a ${SIL_BLUE} ` +
    `Keep the same composition and framing.`;
  const silUrl = await image({ tag: `sil-${ex.tag}`, prompt: silPrompt, files: [poseUrl] });

  // 3. Animation
  await video({ tag: `anim-${ex.tag}`, prompt: ex.motion, imageUrl: silUrl, duration: 5 });
}

console.log("\nDone! 4 new exercises generated (pose + silhouette + animation).");
