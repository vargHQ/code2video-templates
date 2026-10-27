/**
 * Stitch the model-comparison contact sheet.
 *
 * Reads output/model-grid/<model-slug>/scene{1..5}.png and builds one labelled
 * PNG: rows = models, columns = scenes. Missing cells render as a grey "n/a"
 * tile so a model that could not do the job is visibly absent rather than
 * silently shifting the grid.
 *
 * Usage:  cd templates && bun templates/tai-chi-mai-h3/sheet.ts
 */

export {};

const OUT = "output/model-grid";
const CELL_W = 540; // half of the 1080 source width — 4x5 sheet stays legible
const LABEL_H = 46; // column header strip
const ROW_LABEL_W = 400; // row header strip (wide enough for the longest label)

const ROWS = [
  { slug: "seedream-5-pro", label: "Seedream 5 Pro  8c" },
  { slug: "nano-banana-2", label: "Nano Banana 2  9c" },
  { slug: "nano-banana-pro", label: "Nano Banana Pro  16c" },
  { slug: "nb-pro-mai", label: "NB Pro -> MAI  22c" },
];
const COLS = [
  { n: 1, label: "S1 squat" },
  { n: 2, label: "S2 back" },
  { n: 3, label: "S3 belly" },
  { n: 4, label: "S4 arms" },
  { n: 5, label: "S5 happy" },
];

// Probe a real cell for the source aspect ratio. NOTE: the files carry a
// .png extension but several models actually return JPEG bytes, so the
// container must be probed with ffprobe rather than by parsing a PNG header.
// (ffmpeg itself sniffs content, so the wrong extension is harmless for the
// stitch — it only breaks naive header parsing.)
function probeSize(path: string): { w: number; h: number } | null {
  const p = Bun.spawnSync([
    "ffprobe", "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", path,
  ]);
  if (p.exitCode !== 0) return null;
  const [w, h] = new TextDecoder().decode(p.stdout).trim().split(",").map(Number);
  return w > 0 && h > 0 ? { w, h } : null;
}

let cellH = Math.round((CELL_W * 16) / 9); // fallback
probe: for (const r of ROWS) {
  for (const c of COLS) {
    const p = `${OUT}/${r.slug}/scene${c.n}.png`;
    if (await Bun.file(p).exists()) {
      const size = probeSize(p);
      if (size) {
        cellH = Math.round((CELL_W * size.h) / size.w);
        console.log(`source ${size.w}x${size.h} → cell ${CELL_W}x${cellH}`);
        break probe;
      }
    }
  }
}
if (!Number.isFinite(cellH) || cellH < 1 || cellH > 8000) {
  throw new Error(`bad cell height ${cellH}`);
}

const inputs: string[] = [];
const filters: string[] = [];
let idx = 0;

/** ffmpeg-escape a label for drawtext. */
const esc = (s: string) => s.replace(/[\\':]/g, (m) => "\\" + m);

// Column header strip + each row.
const rowChains: string[] = [];

for (let ri = 0; ri < ROWS.length; ri++) {
  const r = ROWS[ri]!;
  const cellLabels: string[] = [];

  for (const c of COLS) {
    const p = `${OUT}/${r.slug}/scene${c.n}.png`;
    if (await Bun.file(p).exists()) {
      inputs.push("-i", p);
      filters.push(`[${idx}:v]scale=${CELL_W}:${cellH}:force_original_aspect_ratio=decrease,pad=${CELL_W}:${cellH}:(ow-iw)/2:(oh-ih)/2:color=black[c${ri}_${c.n}]`);
      idx++;
    } else {
      // grey placeholder for a cell the model could not produce
      filters.push(`color=c=0x2a2a2a:s=${CELL_W}x${cellH}:d=1,drawtext=text='n/a':fontcolor=0x888888:fontsize=44:x=(w-text_w)/2:y=(h-text_h)/2[c${ri}_${c.n}]`);
    }
    cellLabels.push(`[c${ri}_${c.n}]`);
  }

  // horizontal stack of this row's 5 cells
  filters.push(`${cellLabels.join("")}hstack=inputs=${COLS.length}[rowimg${ri}]`);
  // row label strip on the left
  filters.push(
    `color=c=0x141414:s=${ROW_LABEL_W}x${cellH}:d=1,drawtext=text='${esc(r.label)}':fontcolor=white:fontsize=34:x=18:y=(h-text_h)/2[rowlbl${ri}]`,
  );
  filters.push(`[rowlbl${ri}][rowimg${ri}]hstack=inputs=2[row${ri}]`);
  rowChains.push(`[row${ri}]`);
}

// Column header: an empty corner + one label per scene.
const headerParts: string[] = [];
headerParts.push(`color=c=0x141414:s=${ROW_LABEL_W}x${LABEL_H}:d=1[hcorner]`);
for (const c of COLS) {
  headerParts.push(
    `color=c=0x141414:s=${CELL_W}x${LABEL_H}:d=1,drawtext=text='${esc(c.label)}':fontcolor=0xa3e635:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2[h${c.n}]`,
  );
}
filters.push(...headerParts);
filters.push(
  `[hcorner]${COLS.map((c) => `[h${c.n}]`).join("")}hstack=inputs=${COLS.length + 1}[header]`,
);

filters.push(`[header]${rowChains.join("")}vstack=inputs=${ROWS.length + 1}[out]`);

const args = [
  "-y",
  ...inputs,
  "-filter_complex",
  filters.join(";"),
  "-map",
  "[out]",
  "-frames:v",
  "1",
  `${OUT}/contact-sheet.png`,
];

console.log(`stitching ${idx} images → ${OUT}/contact-sheet.png`);
const proc = Bun.spawnSync(["ffmpeg", ...args], { stderr: "pipe", stdout: "pipe" });
if (proc.exitCode !== 0) {
  console.error(new TextDecoder().decode(proc.stderr).slice(-2500));
  process.exit(1);
}
console.log("ok →", `${OUT}/contact-sheet.png`);
