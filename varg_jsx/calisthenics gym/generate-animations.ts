// Animate 6 blue silhouette images via MiniMax H3 Max (image-to-video).
//
// Pipeline:
//   1. Upload each sil-*.png to varg files API
//   2. Submit H3 Max image-to-video job with motion prompt
//   3. Download resulting mp4 to output/anim-*.mp4
//
// Usage: bun "templates/calisthenics gym/generate-animations.ts"
//
// Cost: 6 videos x 5s x 8c/s = ~$2.40

const API = "https://api.varg.ai/v2";
const KEY = process.env.VARG_API_KEY;
if (!KEY) throw new Error("VARG_API_KEY is not set");

const DIR = `${import.meta.dir}`;
const OUT = `${DIR}/output`;

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
      fal: {
        duration: opts.duration,
        resolution: "768P",
        prompt_expansion_mode: "balanced",
      },
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
      console.log(
        `[${opts.tag}] done  ${s.actual_cost_cents ?? "?"}c  -> output/${opts.tag}.mp4`,
      );
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
    if (i % 4 === 0) console.log(`[${opts.tag}] polling... (${s.status})`);
  }
  throw new Error(`[${opts.tag}] timed out`);
}

// ── 6 silhouette animations ───────────────────────────────────────────────
const animations: { tag: string; file: string; prompt: string }[] = [
  {
    tag: "anim-pushups",
    file: "sil-pushups.png",
    prompt:
      "The blue silhouette performs continuous push-ups in a smooth rhythmic cycle: " +
      "arms bend lowering the body down, then push back up to full plank. " +
      "Smooth fluid motion, the blue figure moves naturally against the static gym background. " +
      "The background stays still, only the silhouette animates.",
  },
  {
    tag: "anim-pullups",
    file: "sil-pullups.png",
    prompt:
      "The blue silhouette performs continuous pull-ups: pulling up until chin reaches the bar, " +
      "then lowering back down with controlled motion. Smooth rhythmic repetition. " +
      "The blue figure moves naturally, the gym background stays static.",
  },
  {
    tag: "anim-squats",
    file: "sil-squats.png",
    prompt:
      "The blue silhouette performs continuous bodyweight squats: hips drop down into a deep squat, " +
      "then push back up to standing. Smooth controlled rhythmic motion, arms extended forward for balance. " +
      "The gym background stays still, only the blue figure animates.",
  },
  {
    tag: "anim-australian-pullups",
    file: "sil-australian-pullups.png",
    prompt:
      "The blue silhouette performs continuous Australian pull-ups under the low bar: body held horizontal, " +
      "arms pull the chest up to the bar then extend back down. Smooth rhythmic rowing motion. " +
      "The gym background stays static, only the blue figure moves.",
  },
  {
    tag: "anim-leg-raises",
    file: "sil-leg-raises.png",
    prompt:
      "The blue silhouette performs continuous hanging leg raises: legs raise up to hip height with " +
      "controlled core tension, then lower back down. Smooth rhythmic motion while hanging from the bar. " +
      "The gym background stays still, only the blue figure animates.",
  },
  {
    tag: "anim-dips",
    file: "sil-dips.png",
    prompt:
      "The blue silhouette performs continuous dips on the parallel bars: body lowers with arms bending " +
      "to 90 degrees, then pushes back up to full extension. Smooth controlled rhythmic motion. " +
      "The gym background stays static, only the blue figure moves.",
  },
];

for (const anim of animations) {
  const localPath = `${OUT}/${anim.file}`;
  const imageUrl = await uploadFile(localPath);
  await video({
    tag: anim.tag,
    prompt: anim.prompt,
    imageUrl,
    duration: 5,
  });
}

console.log("\nAll animations written to output/");
console.log("  anim-pushups.mp4");
console.log("  anim-pullups.mp4");
console.log("  anim-squats.mp4");
console.log("  anim-australian-pullups.mp4");
console.log("  anim-leg-raises.mp4");
console.log("  anim-dips.mp4");
