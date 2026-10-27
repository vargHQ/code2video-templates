// Calisthenics gym — blue silhouette version.
//
// Pipeline:
//   1. Reuse existing 01-gym-empty.png (upload it)
//   2. Upload ref.jpg
//   3. For each of 6 exercises: generate guy doing exercise IN the gym (edit: ref + gym)
//   4. For each pose: convert guy to solid blue silhouette, keep gym bg (edit: pose image)
//
// Usage: bun "templates/calisthenics gym/generate-silhouettes.ts"

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
    throw new Error(
      `${path} ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`,
    );
  }
  return json;
}

async function uploadFile(localPath: string): Promise<string> {
  const file = Bun.file(localPath);
  const filename = localPath.split("/").pop() ?? "file.jpg";
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
  console.log(`[upload] ${localPath.split("/").pop()} -> ${json.url}`);
  return json.url;
}

async function image(opts: {
  tag: string;
  prompt: string;
  aspectRatio: string;
  files?: string[];
}): Promise<string> {
  const model = opts.files?.length ? "nano-banana-2/edit" : "nano-banana-2";
  const body: Record<string, unknown> = {
    model,
    prompt: opts.prompt,
    aspect_ratio: opts.aspectRatio,
  };
  if (opts.files?.length) body.files = opts.files.map((url) => ({ url }));

  console.log(`[${opts.tag}] submitting...`);
  const job = await api("/image", { method: "POST", body: JSON.stringify(body) });

  for (let i = 0; i < 120; i++) {
    await Bun.sleep(3000);
    const s = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`[${opts.tag}] completed with no output`);
      const bytes = await fetch(url).then((r) => r.arrayBuffer());
      await Bun.write(`${OUT}/${opts.tag}.png`, bytes);
      console.log(
        `[${opts.tag}] done  ${s.actual_cost_cents ?? "?"}c  -> output/${opts.tag}.png`,
      );
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
    if (i % 5 === 0) console.log(`[${opts.tag}] polling... (${s.status})`);
  }
  throw new Error(`[${opts.tag}] timed out`);
}

// ── Upload references ─────────────────────────────────────────────────────
const refUrl = await uploadFile(REF_PATH);
const gymUrl = await uploadFile(GYM_PATH);

const GYM_DESC =
  "the calisthenics park shown in the second reference image — same pull-up bars, " +
  "parallel bars, dip station, woodchip ground, warm golden-hour light";

const exercises: { tag: string; pose: string }[] = [
  {
    tag: "pose-pushups",
    pose:
      "doing push-ups on the woodchip ground, full-body three-quarter view. Body " +
      "straight in a plank line, arms bent at 90 degrees, chest near the ground, " +
      "core tight, legs straight together.",
  },
  {
    tag: "pose-pullups",
    pose:
      "hanging from a high pull-up bar mid-pull-up, chin above the bar. Full-body " +
      "front view. Arms fully bent, back muscles engaged, legs straight.",
  },
  {
    tag: "pose-squats",
    pose:
      "performing a deep bodyweight squat, full-body front view. Hips below knee " +
      "level, thighs parallel to ground, arms extended forward, chest up, back " +
      "straight, feet shoulder-width apart.",
  },
  {
    tag: "pose-australian-pullups",
    pose:
      "doing Australian pull-ups (horizontal rows) under a low bar. Full-body side " +
      "view. Body held straight and horizontal, heels on ground, arms pulling chest " +
      "to the low bar.",
  },
  {
    tag: "pose-leg-raises",
    pose:
      "hanging from a high pull-up bar doing hanging leg raises. Full-body front " +
      "view. Arms extended overhead holding the bar, legs raised straight to hip " +
      "height, core engaged.",
  },
  {
    tag: "pose-dips",
    pose:
      "doing dips on the parallel bars, full-body side view. Body suspended between " +
      "two parallel bars, arms bent at 90 degrees, legs hanging straight down with " +
      "slight forward lean.",
  },
];

// ── Step 1: Generate 6 poses in the gym ───────────────────────────────────
const poseUrls: { tag: string; url: string }[] = [];

for (const ex of exercises) {
  const prompt =
    `Place the exact same man from the first reference image into ${GYM_DESC}. ` +
    `Retain his exact face, build, hairstyle, and identity from the first reference. ` +
    `He is ${ex.pose} Athletic gym-wear. Photorealistic, shot on Sony A7IV 35mm ` +
    `f/2.8, natural cinematic golden-hour lighting matching the gym environment.`;

  const url = await image({
    tag: ex.tag,
    prompt,
    aspectRatio: "9:16",
    files: [refUrl, gymUrl],
  });
  poseUrls.push({ tag: ex.tag, url });
}

// ── Step 2: Convert each pose to blue silhouette ──────────────────────────
const SIL_BLUE =
  "solid flat blue #0040FF, like a blue paper cutout, no facial features, " +
  "no clothing details, no shading inside — just a flat uniform blue fill " +
  "matching his exact body outline and pose";

for (const pose of poseUrls) {
  const silTag = pose.tag.replace("pose-", "sil-");
  const prompt =
    `Take this image and transform ONLY the person into a ${SIL_BLUE}. The person ` +
    `becomes a flat solid blue silhouette shape — every part of his body is filled ` +
    `with the same uniform blue, no gradients, no details inside, just a blue ` +
    `cutout matching his exact outline and pose. The ENTIRE background — the ` +
    `calisthenics park, bars, ground, trees, sky, lighting — must remain EXACTLY ` +
    `as in the original image, completely unchanged. Only the person is replaced ` +
    `with the blue silhouette. Keep the same composition and framing.`;

  await image({
    tag: silTag,
    prompt,
    aspectRatio: "9:16",
    files: [pose.url],
  });
}

console.log("\nAll silhouettes written to output/");
console.log("  sil-pushups.png");
console.log("  sil-pullups.png");
console.log("  sil-squats.png");
console.log("  sil-australian-pullups.png");
console.log("  sil-leg-raises.png");
console.log("  sil-dips.png");
