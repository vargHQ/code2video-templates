// Calisthenics gym — generate gym, place guy, blue-screen character + 6 exercise cards.
//
// Pipeline:
//   1. Upload ref.jpg → public URL
//   2. Generate empty calisthenics gym (text-to-image, nano-banana-2)
//   3. Place the guy from ref into the gym (edit: ref + gym)
//   4. Generate blue-screen character plate (edit: ref, solid chroma-blue background)
//   5. Generate 6 exercise poses on blue background (edit: ref + blueCharacter)
//
// Usage: bun "templates/calisthenics gym/generate.ts"
//
// Cost: ~9 images x $0.08-0.12 = ~$1-1.50

const API = "https://api.varg.ai/v2";
const KEY = process.env.VARG_API_KEY;
if (!KEY) throw new Error("VARG_API_KEY is not set");

const DIR = `${import.meta.dir}`;
const OUT = `${DIR}/output`;
const REF_PATH = `${DIR}/ref.jpg`;

const MODEL = "nano-banana-2";
const MODEL_EDIT = "nano-banana-2/edit";

// Solid chroma-key blue (classic blue-screen #0033A0-ish) for masking
const BLUE = "pure solid chroma-key blue background, uniform #0040FF blue screen, no gradient, no shadows on background, flat even blue";

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
  console.log(`[upload] ${localPath} -> ${json.url}`);
  return json.url;
}

async function image(opts: {
  tag: string;
  prompt: string;
  aspectRatio: string;
  files?: string[];
  model?: string;
}): Promise<string> {
  const model = opts.model ?? (opts.files?.length ? MODEL_EDIT : MODEL);
  const body: Record<string, unknown> = {
    model,
    prompt: opts.prompt,
    aspect_ratio: opts.aspectRatio,
  };
  if (opts.files?.length) body.files = opts.files.map((url) => ({ url }));

  console.log(`[${opts.tag}] submitting (${model})...`);
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

// ── Upload reference ──────────────────────────────────────────────────────
const refUrl = await uploadFile(REF_PATH);

// ── 1. Empty calisthenics gym (text-to-image) ─────────────────────────────
const gymPrompt =
  "Photorealistic empty outdoor calisthenics street workout park at golden hour. " +
  "A clean modern calisthenics park with parallel bars, pull-up bars (high and low), " +
  "dip stations, and a horizontal ladder, all made of dark powder-coated steel. " +
  "Softwoodchip ground covering, concrete base. Warm late-afternoon sunlight, " +
  "long shadows, trees softly blurred in the background. No people present. " +
  "Wide establishing shot, cinematic depth of field, shot on Sony A7IV 24mm f/4. " +
  "Natural color grade, sharp, high resolution.";

const gymUrl = await image({
  tag: "01-gym-empty",
  prompt: gymPrompt,
  aspectRatio: "9:16",
});

// ── 2. Blue-screen character plate (edit: ref only) ───────────────────────
// Runs in parallel conceptually with the gym; here sequential for simplicity.
const blueCharPrompt =
  `Full-body standing reference photo of the exact same man shown in the reference image. ` +
  `Retain his exact face, body build, hairstyle, and skin tone — identical identity. ` +
  `He stands straight facing the camera in a neutral relaxed athletic stance, wearing ` +
  `the same outfit as in the reference. Even soft frontal studio lighting on his body. ` +
  `The ENTIRE background is a ${BLUE}. The man is fully isolated on the blue screen, ` +
  `crisp clean edges, no blue spill on his skin. Photorealistic, sharp, full head-to-toe ` +
  `framing with space above the head and below the feet. Chroma-key ready.`;

const blueCharUrl = await image({
  tag: "02-character-blue",
  prompt: blueCharPrompt,
  aspectRatio: "9:16",
  files: [refUrl],
});

// ── 3. Place guy in the gym (edit: ref + gym) ─────────────────────────────
const guyInGymPrompt =
  `Place the exact same man from the first reference image into the calisthenics park ` +
  `shown in the second reference image. Retain his exact face, build, hairstyle, and ` +
  `identity from the first reference. Recreate the calisthenics park environment from ` +
  `the second reference — same pull-up bars, parallel bars, dip station, woodchip ground, ` +
  `warm golden-hour light. He stands confidently in the center of the frame in a relaxed ` +
  `athletic pose, three-quarter angle toward camera. Photorealistic environmental portrait, ` +
  `shot on Sony A7IV 35mm f/2.8, shallow depth of field. Natural cinematic lighting.`;

const guyInGymUrl = await image({
  tag: "03-guy-in-gym",
  prompt: guyInGymPrompt,
  aspectRatio: "9:16",
  files: [refUrl, gymUrl],
});

// ── 4. Six exercise poses on blue background ──────────────────────────────
// Each uses ref + blueCharacter for maximum identity consistency.
const exercises: { tag: string; pose: string }[] = [
  {
    tag: "04-pushups",
    pose:
      "doing push-ups on the ground, full-body side profile view. His body is straight " +
      "in a perfect plank line, arms bent at 90 degrees lowering his chest toward the " +
      "ground, core tight, legs straight together. Athletic gym-wear.",
  },
  {
    tag: "05-pullups",
    pose:
      "hanging from a high pull-up bar mid-pull-up, chin above the bar. Full-body front " +
      "view. Arms fully bent pulling his chest to the bar, back muscles engaged, legs " +
      "straight and slightly forward. The pull-up bar is a simple dark steel bar. " +
      "Athletic gym-wear.",
  },
  {
    tag: "06-squats",
    pose:
      "performing a deep bodyweight squat, full-body front view. Hips dropped below knee " +
      "level, thighs parallel to the ground, arms extended straight forward for balance, " +
      "chest up, back straight, feet shoulder-width apart. Athletic gym-wear.",
  },
  {
    tag: "07-australian-pullups",
    pose:
      "doing Australian pull-ups (horizontal rows) under a low waist-height bar. Full-body " +
      "side view. His body is held straight and horizontal, heels on the ground, arms " +
      "reaching up to grip the low bar, pulling his chest up toward the bar. The low bar " +
      "is a simple dark steel bar. Athletic gym-wear.",
  },
  {
    tag: "08-leg-raises",
    pose:
      "hanging from a high pull-up bar doing hanging leg raises. Full-body front view. " +
      "Arms extended holding the bar overhead, legs raised straight up to hip height " +
      "(L-sit position), core fully engaged, body controlled. The pull-up bar is a simple " +
      "dark steel bar. Athletic gym-wear.",
  },
  {
    tag: "09-dips",
    pose:
      "doing dips on parallel bars, full-body side view. His body is suspended between two " +
      "parallel dark steel bars, arms bent at 90 degrees lowering his body, shoulders over " +
      "his hands, legs hanging straight down with slight forward lean. The parallel bars " +
      "are simple dark steel. Athletic gym-wear.",
  },
];

for (const ex of exercises) {
  const prompt =
    `Full-body photo of the exact same man from the reference images, ${ex.pose} ` +
    `The ENTIRE background is a ${BLUE}. The man and any bar he grips are fully ` +
    `isolated on the blue screen, crisp clean edges, no blue spill on his skin. ` +
    `Even soft frontal studio lighting on his body. Photorealistic, sharp, full ` +
    `head-to-toe framing with space around him. Chroma-key ready.`;

  await image({
    tag: ex.tag,
    prompt,
    aspectRatio: "9:16",
    files: [refUrl, blueCharUrl],
  });
}

console.log("\nAll images written to output/");
console.log("  01-gym-empty.png       — empty calisthenics gym");
console.log("  02-character-blue.png  — guy on blue screen (standing)");
console.log("  03-guy-in-gym.png      — guy placed in the gym");
console.log("  04-pushups.png         — push-ups on blue");
console.log("  05-pullups.png         — pull-ups on blue");
console.log("  06-squats.png          — squats on blue");
console.log("  07-australian-pullups.png — australian pull-ups on blue");
console.log("  08-leg-raises.png      — leg raises on blue");
console.log("  09-dips.png            — dips on blue");
