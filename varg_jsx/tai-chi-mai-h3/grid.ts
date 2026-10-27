/**
 * Image-model comparison grid for the tai-chi ep2 scene composites.
 *
 * Renders the SAME 5 scenes with the SAME 3 reference images and the SAME
 * prompt text across 4 image models, then stitches a labelled contact sheet.
 * The model is the only variable — prompts are copied byte-for-byte from
 * ep2.tsx so nothing else can explain a difference.
 *
 * Models (all verified live: all resolve to a fal image-to-image route and
 * all accept 3 reference images at flat per-image pricing):
 *
 *   mai_image_2_5        → fal:microsoft/mai-image-2.5/edit          6c
 *   seedream_5_pro       → fal:bytedance/seedream/v5/pro/edit        8c
 *   nano_banana_2/edit   → fal:nano_banana_2/edit                    9c
 *   nano_banana_pro/edit → fal:nano_banana_pro/edit                 16c
 *
 * NOTE on the nano-banana ids: the BARE ids (`nano_banana_2`,
 * `nano_banana_pro`) resolve to the GOOGLE provider, not fal. Using the
 * explicit `/edit` ids keeps all four models on fal image-to-image so this
 * is an apples-to-apples test rather than a fal-vs-google test.
 *
 * GPT Image 2 is NOT in the varg API — there is no gpt_image route in
 * /v2/models and nothing in the API seeds. The only OpenAI models present
 * are Sora (video) and Whisper (transcription). Hence 4 models, not 5.
 *
 * Usage:
 *   cd templates
 *   nohup bun templates/tai-chi-mai-h3/grid.ts > output/model-grid/grid.log 2>&1 &
 *
 * Cost: 20 images = 5 x (6+8+9+16)c = $1.95, plus $0.48 for the 3 refs if
 * they are not already cached on this machine.
 */

export {}; // make this a module so top-level await is allowed

const API = "https://api.varg.ai/v2";
const VARG_KEY = process.env.VARG_API_KEY;
if (!VARG_KEY) throw new Error("VARG_API_KEY is not set");

const OUT = "output/model-grid";
const AR = "9:16";

// ── Reference photos (same as ep2.tsx) ──────────────────────────────────
const A1_PHOTO = "https://uu.varg.ai/1784576476121_3hb7fv71.jpeg";
const A2_PHOTO = "https://uu.varg.ai/1784576485522_vbgd4amk.jpeg";

// ── The models under test ───────────────────────────────────────────────
//
// MEASURED: MAI-Image-2.5 accepts EXACTLY ONE reference image. Submitting 2
// or 3 refs is accepted by varg's validation but the provider rejects it with
// a 422 (verified: 1 ref → completed, 2 refs → 422, 3 refs → 422). Its schema
// line "Provide one http(s) or data: URL" is a hard limit, not a hint.
//
// So MAI cannot do the 3-ref composite job at all. To keep its row honest it
// is run in the only shape it supports — the two-stage pipeline that ep2.tsx
// actually ships: nano-banana builds the 3-ref composite, MAI then does a
// single-ref photoreal finishing pass on top. That row is labelled
// "NB Pro → MAI" so the grid does not imply MAI did the compositing.
const MODELS = [
  { id: "seedream_5_pro", label: "Seedream 5 Pro", cents: 8, mode: "direct" },
  { id: "nano_banana_2/edit", label: "Nano Banana 2", cents: 9, mode: "direct" },
  { id: "nano_banana_pro/edit", label: "Nano Banana Pro", cents: 16, mode: "direct" },
  { id: "mai_image_2_5", label: "NB Pro -> MAI", cents: 22, mode: "finish" },
] as const;

/** Finishing-pass instruction for the two-stage MAI row (from ep2.tsx). */
const FINISH_PROMPT =
  "Photorealistic finishing pass on this image. Keep the composition, framing, poses, faces, body shapes, clothing and background exactly as they are — do not move, add or remove anything. Improve only the photographic realism: natural skin texture with visible pores and fine detail, realistic subsurface light on skin, accurate soft daylight falloff from the windows, true-to-life fabric weave on the sportswear, natural color grading, crisp focus on the subjects with gentle depth of field, shot on a full-frame camera with an 85mm lens. No illustration, no plastic skin, no over-smoothing, no added text or watermarks.";

// ── Prompts: copied verbatim from ep2.tsx ───────────────────────────────

const A1_CARD_PROMPT =
  "Full-body character reference card of the exact same woman from the photo: same face, same grey hair, same body shape. Overweight woman in her late 50s with grey hair. She wears a simple dark sports bra top and snug high-waisted dark athletic shorts (underwear-style workout shorts), barefoot. Her belly is fully exposed and visible, arms bare, legs bare from mid-thigh down. Standing straight facing camera, neutral relaxed pose, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic";

const A2_CARD_PROMPT =
  "Full-body character reference card of the exact same woman from the photo: same face, same hair, same slim build. Slim Asian fitness trainer in her 30s. She wears a fitted fitness uniform: sporty crop top and full-length leggings in matching color, clean athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic";

const GYM_PROMPT =
  "Empty modern gym interior with huge floor-to-ceiling windows letting in bright natural daylight, green trees visible outside. Light wooden floor, a few yoga mats rolled in a corner, rack of dumbbells along one wall, mirrors on the opposite wall. No people. Clean airy atmosphere, warm daylight, photorealistic, 9:16 portrait framing";

const SAME =
  "First reference image is Woman A (overweight late-50s woman with grey hair, dark sports bra and dark athletic shorts, barefoot). Second reference image is Woman B (slim Asian trainer in her 30s in fitted fitness uniform with sneakers). Third reference image is the gym location with huge windows. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the gym exactly as in the location reference.";

const SCENES = [
  {
    n: 1,
    label: "S1 squat",
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Woman A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside her closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
  },
  {
    n: 2,
    label: "S2 back",
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing away from the camera, seen from behind head to toe in her dark sports bra and dark athletic shorts, her bare legs visible. Woman B crouches beside her on the left, pointing a finger toward Woman A's hips and thighs while looking at the camera. Huge windows with daylight in the background, photorealistic`,
  },
  {
    n: 3,
    label: "S3 belly",
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing the camera head to toe, neutral stoic expression, her bare belly fully visible above the dark athletic shorts, hips and part of her rear visible. Woman B stands beside her on the left, slightly crouched, pointing an open hand at Woman A's belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
  },
  {
    n: 4,
    label: "S4 arms",
    text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both women. Woman A faces the camera holding her right arm raised out to the side, the soft loose skin of her bare upper arm clearly visible, part of her belly visible below. Woman B stands on the left, pointing at Woman A's raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
  },
  {
    n: 5,
    label: "S5 happy",
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Woman A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside her facing the camera, laughing warmly and giving Woman A an encouraging thumbs-up. Both women look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
  },
] as const;

// ── API helpers ─────────────────────────────────────────────────────────

type Job = {
  id: string;
  status: string;
  error?: unknown;
  actual_cost_cents?: number | null;
  output?: { outputs: { url: string }[] } | null;
};

async function api(path: string, init?: RequestInit): Promise<any> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VARG_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  // The API occasionally returns raw control chars inside prompt echoes,
  // which trips strict JSON parsing — read as text and sanitize first.
  const txt = await r.text();
  return JSON.parse(txt.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ""));
}

/** Submit an image job and poll it to completion. Returns the output URL. */
async function generate(opts: {
  model: string;
  prompt: string;
  files?: string[];
  tag: string;
}): Promise<{ url: string; cents: number }> {
  const body: Record<string, unknown> = {
    model: opts.model,
    prompt: opts.prompt,
    aspect_ratio: AR,
  };
  if (opts.files?.length) body.files = opts.files.map((url) => ({ url }));

  const job: Job = await api("/image", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!job.id) throw new Error(`${opts.tag}: no job id — ${JSON.stringify(job).slice(0, 300)}`);

  // Poll. Jobs normally finish in 20-60s; the ceiling here is deliberately
  // generous because one observed job sat in `running` for 8+ minutes.
  for (let i = 0; i < 60; i++) {
    await Bun.sleep(4000);
    const s: Job = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`${opts.tag}: completed with no url`);
      console.log(`  ok   ${opts.tag} (${s.actual_cost_cents ?? "?"}c)`);
      return { url, cents: s.actual_cost_cents ?? 0 };
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`${opts.tag}: ${s.status} — ${JSON.stringify(s.error).slice(0, 300)}`);
    }
  }
  throw new Error(`${opts.tag}: timed out after 4 min (job ${job.id})`);
}

/** generate() with one retry — a stuck provider job should not abort the run. */
async function generateRetry(opts: {
  model: string;
  prompt: string;
  files?: string[];
  tag: string;
}): Promise<{ url: string; cents: number }> {
  try {
    return await generate(opts);
  } catch (e) {
    console.log(`  retry ${opts.tag}: ${(e as Error).message.slice(0, 120)}`);
    return await generate(opts);
  }
}

async function download(url: string, dest: string): Promise<void> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${url} → ${r.status}`);
  await Bun.write(dest, await r.arrayBuffer());
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 1 — build the 3 shared reference images (once, on nano-banana-pro,
//          exactly as ep2.tsx does). Every model gets these same 3 refs.
// ═══════════════════════════════════════════════════════════════════════

console.log("── refs ──");

// Refs are reused verbatim by all 4 models, so they are resolved once and
// pinned to disk. On a re-run the saved URLs are used as-is: no re-billing,
// and — more importantly — every model is still compared against the exact
// same three reference images as the first run.
const refsFile = Bun.file(`${OUT}/refs.json`);
let REFS: string[];
let refCents = 0;

if (await refsFile.exists()) {
  REFS = await refsFile.json();
  console.log("  reusing pinned refs from refs.json");
} else {
  const [a1, a2, gym] = await Promise.all([
    generateRetry({
      model: "nano_banana_pro/edit",
      prompt: A1_CARD_PROMPT,
      files: [A1_PHOTO],
      tag: "ref a1Card",
    }),
    generateRetry({
      model: "nano_banana_pro/edit",
      prompt: A2_CARD_PROMPT,
      files: [A2_PHOTO],
      tag: "ref a2Card",
    }),
    generateRetry({ model: "nano_banana_pro", prompt: GYM_PROMPT, tag: "ref gymLoc" }),
  ]);
  REFS = [a1.url, a2.url, gym.url];
  refCents = a1.cents + a2.cents + gym.cents;
  await Bun.write(`${OUT}/refs.json`, JSON.stringify(REFS, null, 2));
}
console.log("refs ready:\n  " + REFS.join("\n  "));

// ═══════════════════════════════════════════════════════════════════════
// STEP 2 — 4 models x 5 scenes. Models run in parallel (one in-flight
//          request each) so a slow model does not block the others; scenes
//          run sequentially within a model to stay polite to the API.
// ═══════════════════════════════════════════════════════════════════════

console.log("\n── grid: 4 models x 5 scenes ──");
type Cell = { model: string; scene: number; path?: string; error?: string; cents: number };

const results: Cell[] = (
  await Promise.all(
    MODELS.map(async (m) => {
      const cells: Cell[] = [];
      for (const sc of SCENES) {
        const tag = `${m.label} ${sc.label}`;
        const dir = m.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        const outPath = `${OUT}/${dir}/scene${sc.n}.png`;

        // Resume: a cell already on disk is kept as-is. Re-running the script
        // after a partial failure therefore only regenerates what is missing,
        // and never re-bills for images already paid for.
        if (await Bun.file(outPath).exists()) {
          console.log(`  skip ${tag} (already on disk)`);
          cells.push({ model: m.label, scene: sc.n, path: outPath, cents: 0 });
          continue;
        }

        try {
          // "direct" = the model composites the 3 refs itself.
          // "finish" = nano-banana composites, then this model does a
          //            single-ref finishing pass (the only shape MAI supports).
          let url: string;
          let cents: number;

          if (m.mode === "finish") {
            const base = await generateRetry({
              model: "nano_banana_pro/edit",
              prompt: sc.text,
              files: REFS,
              tag: `${tag} [1/2 composite]`,
            });
            const fin = await generateRetry({
              model: m.id,
              prompt: FINISH_PROMPT,
              files: [base.url],
              tag: `${tag} [2/2 finish]`,
            });
            url = fin.url;
            cents = base.cents + fin.cents;
          } else {
            const r = await generateRetry({
              model: m.id,
              prompt: sc.text,
              files: REFS,
              tag,
            });
            url = r.url;
            cents = r.cents;
          }

          await download(url, outPath);
          cells.push({ model: m.label, scene: sc.n, path: outPath, cents });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  FAIL ${tag}: ${msg.slice(0, 160)}`);
          cells.push({ model: m.label, scene: sc.n, error: msg, cents: 0 });
        }
      }
      return cells;
    }),
  )
).flat();

const spent = results.reduce((s, r) => s + r.cents, 0) + refCents;
const ok = results.filter((r) => r.path).length;
console.log(`\ndone: ${ok}/${results.length} images, $${(spent / 100).toFixed(2)} spent`);

await Bun.write(
  `${OUT}/results.json`,
  JSON.stringify({ refs: REFS, models: MODELS, results, spent_cents: spent }, null, 2),
);
