// Build split-layout comparison video
// Left: 4×3 thumbnail picker grid (active cell highlighted)
// Right: full-size preview of active cell
// 1920×1080, varg branded bg, Aeonik font
//
// Usage: bun scripts/build-grid.ts

const DIR = "output/sync-comparison";
const WORK = `${DIR}/grid-work`;
const OUTPUT = `${DIR}/grid-comparison.mp4`;
const BG_IMAGE = `${WORK}/bg.png`;

const FONT_MEDIUM = "/Users/aleksandrmalysev/Library/Fonts/aeonik-medium.otf";
const FONT_BOLD = "/Users/aleksandrmalysev/Library/Fonts/aeonik-bold.otf";

// Grid config
const ROWS = ["sync-v3", "none", "sync-v2-pro", "veed"];
const COLS = ["far", "mid", "extreme-closeup"];
const ROW_LABELS = ["sync-v3", "no lipsync", "sync-v2-pro", "veed"];
const COL_LABELS = ["far", "mid", "extreme close-up"];

// Canvas
const W = 1920;
const H = 1080;

// ── Left panel: thumbnail grid ──────────────────────────────────────────
const LEFT_W = 540;        // left panel width
const ROW_LABEL_W = 110;   // space for row labels
const COL_LABEL_H = 50;    // space for column headers above grid
const GRID_PAD_TOP = 60;   // top padding before col labels
const GRID_PAD_LEFT = 20;  // left padding before row labels
const GAP = 6;

// Cell dimensions (portrait 9:16)
const gridContentW = LEFT_W - ROW_LABEL_W - GRID_PAD_LEFT;
const cellW = Math.floor((gridContentW - GAP * 2) / 3) & ~1;  // even number
const cellH = Math.floor(cellW * 16 / 9) & ~1;                // even number
const gridStartX = GRID_PAD_LEFT + ROW_LABEL_W;
const gridStartY = GRID_PAD_TOP + COL_LABEL_H;

// Check vertical fit
const totalGridH = cellH * 4 + GAP * 3;
const gridCenterOffsetY = Math.floor((H - gridStartY - totalGridH) / 2);
const gridY0 = gridStartY + Math.max(0, gridCenterOffsetY);

// ── Right panel: full-size preview ──────────────────────────────────────
const RIGHT_X = LEFT_W + 40;  // start of right panel (after small gap)
const RIGHT_W = W - RIGHT_X - 40;  // right panel width with right padding
const PREVIEW_H = H - 120;   // leave space for label below
const PREVIEW_W = Math.floor(PREVIEW_H * 9 / 16);  // 9:16 aspect
const PREVIEW_X = RIGHT_X + Math.floor((RIGHT_W - PREVIEW_W) / 2);
const PREVIEW_Y = 30;
const LABEL_Y = PREVIEW_Y + PREVIEW_H + 15;

function cellX(col: number) { return gridStartX + col * (cellW + GAP); }
function cellY(row: number) { return gridY0 + row * (cellH + GAP); }

function videoPath(row: string, col: string) {
  return `${DIR}/${row}-${col}.mp4`;
}

console.log(`Canvas: ${W}x${H}`);
console.log(`Thumb cell: ${cellW}x${cellH}`);
console.log(`Preview: ${PREVIEW_W}x${PREVIEW_H} at (${PREVIEW_X},${PREVIEW_Y})`);
console.log(`Grid starts: (${gridStartX},${gridY0})`);

async function exec(args: string[], label?: string): Promise<string> {
  if (label) console.log(`  ${label}`);
  const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
  const code = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  if (code !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`[exit ${code}] ${args.slice(0, 5).join(" ")}...\n${stderr.slice(-1200)}`);
  }
  return stdout.trim();
}

async function getDuration(file: string): Promise<number> {
  const out = await exec([
    "ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ]);
  return parseFloat(out);
}

async function main() {
  await exec(["mkdir", "-p", WORK]);

  // ── Step 1: Prepare background ─────────────────────────────────────────
  console.log("[1/5] Preparing background...");
  // BG is already 1920x1080, just darken slightly
  await exec([
    "ffmpeg", "-y", "-i", BG_IMAGE,
    "-vf", `scale=${W}:${H}:flags=lanczos,eq=brightness=-0.2`,
    "-frames:v", "1", "-update", "1",
    `${WORK}/bg-dark.png`,
  ], "Darkening background");

  // ── Step 2: Extract thumbnails ─────────────────────────────────────────
  console.log("[2/5] Extracting thumbnails...");
  await Promise.all(
    ROWS.flatMap((row) =>
      COLS.map(async (col) => {
        const src = videoPath(row, col);
        const thumb = `${WORK}/${row}-${col}-thumb.png`;
        const dimmed = `${WORK}/${row}-${col}-dimmed.png`;

        // Scale to fill cell height, crop width to cell (center crop, no stretch)
        await exec([
          "ffmpeg", "-y", "-ss", "0.5", "-i", src, "-vframes", "1", "-update", "1",
          "-vf", `scale=${cellW}:${cellH}:flags=lanczos`,
          thumb,
        ]);
        await exec([
          "ffmpeg", "-y", "-i", thumb,
          "-vf", "eq=brightness=-0.35:saturation=0.2",
          dimmed,
        ]);
      }),
    ),
  );

  // ── Step 3: Build base frame (bg + all dimmed thumbs + labels) ─────────
  console.log("[3/5] Building base frame...");

  const baseInputs: string[] = ["-i", `${WORK}/bg-dark.png`];
  for (const row of ROWS) {
    for (const col of COLS) {
      baseInputs.push("-i", `${WORK}/${row}-${col}-dimmed.png`);
    }
  }

  const fontMedEsc = FONT_MEDIUM.replace(/:/g, "\\:");
  const fontBoldEsc = FONT_BOLD.replace(/:/g, "\\:");

  const filters: string[] = [];
  let prev = "[0:v]";
  let idx = 1;

  // Overlay dimmed thumbnails
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const tag = `[ov${idx}]`;
      filters.push(`${prev}[${idx}:v]overlay=${cellX(c)}:${cellY(r)}${tag}`);
      prev = tag;
      idx++;
    }
  }

  // Column labels
  for (let c = 0; c < 3; c++) {
    const cx = cellX(c) + cellW / 2;
    const tag = `[ct${c}]`;
    filters.push(
      `${prev}drawtext=fontfile='${fontBoldEsc}':text='${COL_LABELS[c]}':fontcolor=0xffffffCC:fontsize=16:x=${cx}-text_w/2:y=${gridY0 - 28}${tag}`,
    );
    prev = tag;
  }

  // Row labels
  for (let r = 0; r < 4; r++) {
    const cy = cellY(r) + cellH / 2;
    const tag = r === 3 ? "[out]" : `[rt${r}]`;
    filters.push(
      `${prev}drawtext=fontfile='${fontMedEsc}':text='${ROW_LABELS[r]}':fontcolor=0xffffffCC:fontsize=14:x=${gridStartX - 10}-text_w:y=${cy}-text_h/2${tag}`,
    );
    prev = tag;
  }

  await exec([
    "ffmpeg", "-y",
    ...baseInputs,
    "-filter_complex", filters.join(";"),
    "-map", "[out]", "-frames:v", "1", "-update", "1",
    `${WORK}/base-frame.png`,
  ], "Compositing base frame");

  // ── Step 4: Build 12 segments ──────────────────────────────────────────
  console.log("[4/5] Building 12 segments...");

  const segFiles: string[] = [];
  const borderColor = "8b6cff";

  for (let r = 0; r < 4; r++) {
    const batch = COLS.map(async (col, c) => {
      const row = ROWS[r];
      const segIdx = r * 3 + c;
      const src = videoPath(row, col);
      const segFile = `${WORK}/seg-${String(segIdx).padStart(2, "0")}.mp4`;
      const dur = await getDuration(src);

      const tx = cellX(c);
      const ty = cellY(r);

      // Label text for below the preview
      const labelText = `${ROW_LABELS[r]}  ·  ${COL_LABELS[c]}`;

      await exec([
        "ffmpeg", "-y",
        "-loop", "1", "-framerate", "30", "-i", `${WORK}/base-frame.png`,  // [0] base
        "-i", src,                                                           // [1] active video
        "-i", src,                                                           // [2] same video for preview
        "-filter_complex", [
          // Thumbnail: scale to cell size
          `[1:v]scale=${cellW}:${cellH}:flags=lanczos[thumb]`,
          // Preview: scale to preview size
          `[2:v]scale=${PREVIEW_W}:${PREVIEW_H}:flags=lanczos[preview]`,
          // Overlay thumbnail on base at grid position
          `[0:v][thumb]overlay=${tx}:${ty}[with_thumb]`,
          // Draw highlight border on active thumbnail
          `[with_thumb]drawbox=x=${tx - 2}:y=${ty - 2}:w=${cellW + 4}:h=${cellH + 4}:color=0x${borderColor}@0.9:t=3[highlighted]`,
          // Overlay preview on right panel
          `[highlighted][preview]overlay=${PREVIEW_X}:${PREVIEW_Y}[with_preview]`,
          // Draw border around preview
          `[with_preview]drawbox=x=${PREVIEW_X - 2}:y=${PREVIEW_Y - 2}:w=${PREVIEW_W + 4}:h=${PREVIEW_H + 4}:color=0x${borderColor}@0.5:t=2[bordered]`,
          // Label below preview
          `[bordered]drawtext=fontfile='${fontBoldEsc}':text='${labelText}':fontcolor=0xffffffDD:fontsize=26:x=${PREVIEW_X + PREVIEW_W / 2}-text_w/2:y=${LABEL_Y}[final]`,
        ].join(";"),
        "-map", "[final]",
        "-map", "1:a?",
        "-t", String(dur),
        "-c:v", "libx264", "-preset", "fast", "-crf", "21",
        "-c:a", "aac", "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        segFile,
      ], `Seg ${segIdx}: ${row} ${col} (${dur.toFixed(1)}s)`);

      segFiles[segIdx] = segFile;
    });

    await Promise.all(batch);
  }

  // ── Step 5: Concatenate ────────────────────────────────────────────────
  console.log("[5/5] Concatenating...");

  const concatContent = segFiles
    .map((f) => `file '${f.split("/").pop()}'`)
    .join("\n");
  await Bun.write(`${WORK}/concat.txt`, concatContent);

  await exec([
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", `${WORK}/concat.txt`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    OUTPUT,
  ], "Final concat");

  const size = Bun.file(OUTPUT).size;
  console.log(`\nDone: ${OUTPUT} (${(size / 1024 / 1024).toFixed(1)}M)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
