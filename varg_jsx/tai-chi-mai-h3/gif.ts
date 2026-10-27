/**
 * Build compare GIFs from the model-grid output.
 *
 * Per-scene GIF (5 files, scene1.gif .. scene5.gif):
 *   Each is one scene cycling through all 4 models, ~1.2s per model, with the
 *   model's name burned in at the top. Because framing/pose/lighting stay
 *   fixed and only the render changes, differences (face drift, wardrobe
 *   shift, skin texture) are easy to spot as they "flip" between frames.
 *
 * Master GIF (scenes-all.gif):
 *   The 5 per-scene GIFs concatenated back-to-back, plus a "SCENE N" title
 *   card between them so it is one shareable file for the whole comparison.
 *
 * ffmpeg palette pipeline: generate a palette once from the concatenated
 * frames, then paletteuse with Bayer dithering — much smaller and cleaner
 * than a single-pass GIF.
 *
 * Usage: cd templates && bun templates/tai-chi-mai-h3/gif.ts
 * Output: output/model-grid/gifs/
 */

export {};

const OUT = "output/model-grid";
const GIF_DIR = `${OUT}/gifs`;
const WIDTH = 720;                 // GIF width (9:16 → 720x1280)
const SECS_PER_MODEL = 1.2;        // dwell time on each model
const FPS = 12;                    // 12fps is plenty for a static-frame flip
const FRAMES_PER_MODEL = Math.round(SECS_PER_MODEL * FPS);
const TITLE_H = 90;                // black strip at top for the model name

const MODELS = [
  { slug: "seedream-5-pro", label: "Seedream 5 Pro" },
  { slug: "nano-banana-2", label: "Nano Banana 2" },
  { slug: "nano-banana-pro", label: "Nano Banana Pro" },
  { slug: "nb-pro-mai", label: "NB Pro -> MAI" },
];

const SCENES = [
  { n: 1, label: "S1 squat" },
  { n: 2, label: "S2 back" },
  { n: 3, label: "S3 belly" },
  { n: 4, label: "S4 arms" },
  { n: 5, label: "S5 happy" },
];

await Bun.$`mkdir -p ${GIF_DIR}`.quiet();

const esc = (s: string) => s.replace(/[\\':]/g, (m) => "\\" + m);

/** Probe source dims via ffprobe (files are labelled .png but some are JPEG). */
function probeSize(path: string): { w: number; h: number } {
  const p = Bun.spawnSync([
    "ffprobe", "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", path,
  ]);
  const [w, h] = new TextDecoder().decode(p.stdout).trim().split(",").map(Number);
  return { w, h };
}

function heightFor(w: number, ref: { w: number; h: number }): number {
  return Math.round((w * ref.h) / ref.w);
}

async function run(cmd: string[], where: string) {
  const p = Bun.spawnSync(cmd, { stderr: "pipe", stdout: "pipe" });
  if (p.exitCode !== 0) {
    console.error(`\n${where} FAILED:`);
    console.error(new TextDecoder().decode(p.stderr).slice(-2500));
    process.exit(1);
  }
}

// Probe one scene once to get the source aspect (all sources are 9:16 but
// dimensions differ per model — 768x1376 vs 1152x2048 — so scale to a common
// canvas driven by the first available file).
let ref = { w: 1152, h: 2048 };
outer: for (const m of MODELS) {
  for (const s of SCENES) {
    const p = `${OUT}/${m.slug}/scene${s.n}.png`;
    if (await Bun.file(p).exists()) {
      ref = probeSize(p);
      break outer;
    }
  }
}
const imgH = heightFor(WIDTH, ref);
const canvasH = imgH + TITLE_H;
console.log(`ref source ${ref.w}x${ref.h}, gif canvas ${WIDTH}x${canvasH}`);

/**
 * Build one scene's compare GIF.
 *
 * Filtergraph shape (one per model, then concatenated):
 *   [i:v] → loop(FRAMES) → scale to WIDTHxIMG_H → pad up by TITLE_H →
 *   drawtext model label → [seg{i}]
 * Then: concat all seg → palettegen → paletteuse → output.gif
 */
async function buildScene(sceneN: number, outPath: string) {
  const inputs: string[] = [];
  const filters: string[] = [];
  const segs: string[] = [];

  for (let i = 0; i < MODELS.length; i++) {
    const m = MODELS[i]!;
    const p = `${OUT}/${m.slug}/scene${sceneN}.png`;
    if (!(await Bun.file(p).exists())) continue;

    // -loop 1 -t <dur> -i <file> creates a still-video input we can filter
    inputs.push("-loop", "1", "-t", String(SECS_PER_MODEL), "-i", p);

    filters.push(
      // scale so the image fits WIDTH horizontally at the right aspect,
      // then pad it into a WIDTH x (imgH+TITLE_H) canvas with the label strip
      `[${i}:v]scale=${WIDTH}:${imgH}:force_original_aspect_ratio=decrease,` +
        `pad=${WIDTH}:${canvasH}:0:${TITLE_H}:color=black,` +
        `drawtext=text='${esc(m.label)}':fontcolor=0xa3e635:fontsize=44:` +
          `x=(w-text_w)/2:y=(${TITLE_H}-text_h)/2,` +
        `fps=${FPS}` +
      `[seg${i}]`,
    );
    segs.push(`[seg${i}]`);
  }

  if (segs.length === 0) throw new Error(`scene ${sceneN}: no source images`);

  // concat + palette pipeline in one graph
  filters.push(`${segs.join("")}concat=n=${segs.length}:v=1:a=0[cat]`);
  filters.push(`[cat]split[a][b]`);
  filters.push(`[a]palettegen=max_colors=192:stats_mode=diff[p]`);
  filters.push(`[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[out]`);

  await run(
    [
      "ffmpeg", "-y",
      ...inputs,
      "-filter_complex", filters.join(";"),
      "-map", "[out]",
      "-loop", "0",           // infinite GIF loop
      outPath,
    ],
    `scene ${sceneN}`,
  );
  console.log(`  ok scene${sceneN}.gif`);
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Per-scene GIFs
// ─────────────────────────────────────────────────────────────────────────
console.log("\n── per-scene GIFs ──");
for (const s of SCENES) {
  await buildScene(s.n, `${GIF_DIR}/scene${s.n}.gif`);
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Master GIF: all 5 scenes back-to-back with a "SCENE N" title card
//    between them. Same palette pipeline over the concatenated segments so
//    the whole thing is a single ≤10 MB file rather than 5 loose GIFs.
// ─────────────────────────────────────────────────────────────────────────
console.log("\n── master GIF ──");
{
  const inputs: string[] = [];
  const filters: string[] = [];
  const segs: string[] = [];
  let idx = 0;

  for (const s of SCENES) {
    // 0.6s title card before each scene
    filters.push(
      `color=c=black:s=${WIDTH}x${canvasH}:d=0.6:r=${FPS},` +
        `drawtext=text='${esc("SCENE " + s.n + " — " + s.label.slice(3))}':` +
          `fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2,` +
        `fps=${FPS}[title${s.n}]`,
    );
    segs.push(`[title${s.n}]`);

    for (const m of MODELS) {
      const p = `${OUT}/${m.slug}/scene${s.n}.png`;
      if (!(await Bun.file(p).exists())) continue;
      inputs.push("-loop", "1", "-t", String(SECS_PER_MODEL), "-i", p);
      filters.push(
        `[${idx}:v]scale=${WIDTH}:${imgH}:force_original_aspect_ratio=decrease,` +
          `pad=${WIDTH}:${canvasH}:0:${TITLE_H}:color=black,` +
          `drawtext=text='${esc(m.label)}':fontcolor=0xa3e635:fontsize=44:` +
            `x=(w-text_w)/2:y=(${TITLE_H}-text_h)/2,` +
          `fps=${FPS}` +
        `[m${s.n}_${idx}]`,
      );
      segs.push(`[m${s.n}_${idx}]`);
      idx++;
    }
  }

  filters.push(`${segs.join("")}concat=n=${segs.length}:v=1:a=0[cat]`);
  filters.push(`[cat]split[a][b]`);
  filters.push(`[a]palettegen=max_colors=192:stats_mode=diff[p]`);
  filters.push(`[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[out]`);

  await run(
    [
      "ffmpeg", "-y",
      ...inputs,
      "-filter_complex", filters.join(";"),
      "-map", "[out]",
      "-loop", "0",
      `${GIF_DIR}/scenes-all.gif`,
    ],
    "master gif",
  );
  console.log(`  ok scenes-all.gif`);
}

// Report sizes
const out = Bun.spawnSync(["ls", "-la", GIF_DIR]);
console.log("\n" + new TextDecoder().decode(out.stdout));
