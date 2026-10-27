// Redo scene 1: silhouette holding a metal bar.
// pose → silhouette → H3 Max animation
//
// Usage: bun "templates/calisthenics gym/generate-scene1.ts"

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
      console.log(`[${opts.tag}] done  ${s.actual_cost_cents ?? "?"}c  -> output/${opts.tag}.png`);
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
  console.log(`[${opts.tag}] submitting H3 Max i2v...`);
  const job = await api("/video", { method: "POST", body: JSON.stringify(body) });
  for (let i = 0; i < 200; i++) {
    await Bun.sleep(5000);
    const s = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`[${opts.tag}] completed with no output`);
      const bytes = await fetch(url).then((r) => r.arrayBuffer());
      await Bun.write(`${OUT}/${opts.tag}.mp4`, bytes);
      console.log(`[${opts.tag}] done  ${s.actual_cost_cents ?? "?"}c  -> output/${opts.tag}.mp4`);
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
    if (i % 4 === 0) console.log(`[${opts.tag}] polling... (${s.status})`);
  }
  throw new Error(`[${opts.tag}] timed out`);
}

// ── Upload references ─────────────────────────────────────────────────────
const refUrl = await uploadFile(REF_PATH);
const gymUrl = await uploadFile(GYM_PATH);

const GYM_DESC =
  "the calisthenics park shown in the second reference image — same pull-up bars, " +
  "parallel bars, dip station, woodchip ground, warm golden-hour light";

// ── 1. Pose: guy holding a metal bar in the gym ───────────────────────────
const posePrompt =
  `Place the exact same man from the first reference image into ${GYM_DESC}. ` +
  `Retain his exact face, build, hairstyle, and identity from the first reference. ` +
  `He stands in the center of the frame holding a straight horizontal metal bar ` +
  `(a smooth dark steel pipe, about shoulder-width, like a calisthenics parallette bar) ` +
  `with both hands, arms extended straight down gripping the bar in front of his body. ` +
  `Full-body front view, confident athletic stance, feet shoulder-width apart. ` +
  `Athletic gym-wear. Photorealistic, shot on Sony A7IV 35mm f/2.8, natural cinematic ` +
  `golden-hour lighting matching the gym environment.`;

const poseUrl = await image({
  tag: "pose-pushups",
  prompt: posePrompt,
  aspectRatio: "9:16",
  files: [refUrl, gymUrl],
});

// ── 2. Silhouette: blue figure holding the metal bar ──────────────────────
const SIL_BLUE =
  "solid flat blue #0040FF, like a blue paper cutout, no facial features, " +
  "no clothing details, no shading inside — just a flat uniform blue fill " +
  "matching his exact body outline and pose";

const silPrompt =
  `Take this image and transform ONLY the person into a ${SIL_BLUE}. The person ` +
  `becomes a flat solid blue silhouette shape — every part of his body is filled ` +
  `with the same uniform blue, no gradients, no details inside, just a blue ` +
  `cutout matching his exact outline and pose. The metal bar he is holding stays ` +
  `as realistic dark steel — NOT blue, NOT silhouetted. The ENTIRE background — the ` +
  `calisthenics park, bars, ground, trees, sky, lighting — must remain EXACTLY as ` +
  `in the original image, completely unchanged. Only the person is replaced with ` +
  `the blue silhouette. Keep the same composition and framing.`;

const silUrl = await image({
  tag: "sil-pushups",
  prompt: silPrompt,
  aspectRatio: "9:16",
  files: [poseUrl],
});

// ── 3. Animate: H3 Max ────────────────────────────────────────────────────
const animPrompt =
  "The blue silhouette holds the metal bar and performs a controlled exercise motion: " +
  "gripping the bar firmly, the figure slowly raises and lowers the bar in a smooth " +
  "rhythmic lifting motion, like a barbell front raise. The metal bar moves naturally " +
  "with the figure's hands. The gym background stays static, only the blue silhouette " +
  "and the bar in his hands animate.";

await video({
  tag: "anim-pushups",
  prompt: animPrompt,
  imageUrl: silUrl,
  duration: 5,
});

console.log("\nScene 1 redone: pose-pushups.png, sil-pushups.png, anim-pushups.mp4");
