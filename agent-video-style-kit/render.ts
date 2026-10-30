#!/usr/bin/env bun
// Burns the Agent Video Style Kit's title and captions (kit/kit.json, by Cut30) onto a video.
// Headless Chrome draws the title and every caption chunk as a transparent PNG with the kit's exact values
// (same CSS as kit/style-kit.html), then ffmpeg lays them over the footage at their times.
//
//   bun render.ts                                         # example, both ratios, on the kit's schematic scene
//   bun render.ts --video talk.mp4 --title "3 tips for better hooks" --captions words.json
//   bun render.ts --video talk.mp4 --captions talk.srt --position alternative --out out/talk.mp4
//   bun render.ts --ratio 16:9 --text "any words, spread evenly" --duration 6 --still 2
import puppeteer, { type Page } from "puppeteer-core";
import { parseArgs } from "node:util";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const HERE = import.meta.dir;
const { values: cli } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    kit: { type: "string" },
    ratio: { type: "string" },
    video: { type: "string" },
    title: { type: "string" },
    "title-until": { type: "string" },
    captions: { type: "string" },
    text: { type: "string" },
    duration: { type: "string" },
    position: { type: "string" },
    fps: { type: "string" },
    crf: { type: "string" },
    out: { type: "string" },
    still: { type: "string" },
    chrome: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});
if (cli.help) {
  console.log(`bun render.ts [flags]           (no flags: the example in both ratios -> out/example-*.mp4)
  --kit kit/kit.json      the style kit to apply (any customized copy works)
  --ratio 9:16|16:9       format to use; default: from --video (taller than wide = 9:16), else both
  --video FILE            footage to caption; scaled and cropped to the format's canvas, audio kept
  --title TEXT            title hook ("\\n" for a line break; "" for none). Default: the kit's example
  --title-until SECONDS   hide the title after this time (default: whole video)
  --captions FILE         words.json ([{word,start,end}] or {words:[...]}, e.g. a transcription) or .srt
  --text TEXT             caption text without timings, spread evenly over the video
  --duration SECONDS      length when there is no --video (default 6)
  --position default|alternative   caption box from the kit (alternative = its "when" case)
  --fps 30 --crf 18       --out out/name.mp4     --still SECONDS   one PNG instead of a video
  --chrome PATH           Chrome/Chromium binary (or set CHROME_PATH)`);
  process.exit(0);
}

type Box = { x: number; y: number; width: number };
type Spec = {
  fontSize: number; fontWeight: number; lineHeight: number; color: string; maxLines: number;
  placement: Box; example: string; background?: string; padding?: number; radius?: number;
  outlineColor?: string; outlineWidth?: number; wordsPerChunk?: [number, number]; alternative?: Box & { when: string };
};
type Format = { label: string; canvas: [number, number]; safeZones: Record<string, Box & { height: number }>; titles: Spec; captions: Spec };
type Kit = { kitVersion: string; font: { family: string; fallback: string }; formats: Record<string, Format> };
type Chunk = { text: string; start: number; end: number };

const kitPath = resolve(cli.kit ?? join(HERE, "kit", "kit.json"));
const kit: Kit = JSON.parse(readFileSync(kitPath, "utf8"));

function sh(cmd: string[]) {
  const r = Bun.spawnSync(cmd, { stderr: "pipe", stdout: "pipe" });
  if (r.exitCode !== 0) throw new Error(`${cmd[0]} failed: ${r.stderr.toString().trim().split("\n").slice(-4).join("\n")}`);
  return r.stdout.toString();
}

function probe(file: string) {
  const j = JSON.parse(sh(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration", "-of", "json", file]));
  const v = j.streams.find((s: any) => s.codec_type === "video");
  if (!v) throw new Error(`${file}: no video stream`);
  return { width: v.width as number, height: v.height as number, duration: Number(j.format.duration), audio: j.streams.some((s: any) => s.codec_type === "audio") };
}

// ---------- caption timing ----------
const BREAK_AFTER = /[.,!?;:…]$/;

function chunkWords(words: Chunk[], [min, max]: [number, number]): Chunk[] {
  const out: Chunk[] = [];
  let cur: Chunk[] = [];
  const flush = () => { if (cur.length) out.push({ text: cur.map(w => w.text).join(" "), start: cur[0]!.start, end: cur.at(-1)!.end }); cur = []; };
  words.forEach((w, i) => {
    const next = words[i + 1];
    cur.push(w);
    const gap = next ? next.start - w.end : 0;
    if (cur.length >= max || (BREAK_AFTER.test(w.text) && (cur.length >= min || /[.!?]$/.test(w.text))) || gap > 0.6) flush();
  });
  flush();
  // Hold each chunk until the next one starts (short gaps only), so captions don't flicker between words.
  out.forEach((c, i) => { const n = out[i + 1]; c.end = n && n.start - c.end < 0.6 ? n.start : c.end + 0.25; });
  return out;
}

function spread(text: string, start: number, end: number): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let t = start;
  return words.map(w => { const d = ((w.length + 1) / total) * (end - start); const c = { text: w, start: t, end: t + d }; t += d; return c; });
}

function parseSrt(src: string): { text: string; start: number; end: number }[] {
  const ts = (s: string) => { const [h, m, rest] = s.trim().replace(",", ".").split(":"); return Number(h) * 3600 + Number(m) * 60 + Number(rest); };
  return src.replace(/\r/g, "").split(/\n\n+/).flatMap(block => {
    const lines = block.trim().split("\n");
    const i = lines.findIndex(l => l.includes("-->"));
    if (i < 0) return [];
    const [a, b] = lines[i]!.split("-->");
    return [{ text: lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").trim(), start: ts(a!), end: ts(b!) }];
  });
}

function loadWords(file: string): Chunk[] {
  const src = readFileSync(file, "utf8");
  if (file.toLowerCase().endsWith(".srt")) return parseSrt(src).flatMap(c => spread(c.text, c.start, c.end));
  const j = JSON.parse(src);
  const list: any[] = Array.isArray(j) ? j : j.words ?? (j.segments ?? []).flatMap((s: any) => s.words ?? []);
  if (!list.length) throw new Error(`${file}: expected [{word,start,end}], {words:[...]} or {segments:[{words}]}`);
  return list.map(w => ({ text: String(w.word ?? w.text ?? w.punctuated_word).trim(), start: Number(w.start), end: Number(w.end) })).filter(w => w.text);
}

// ---------- drawing ----------
function findChrome() {
  const hit = [cli.chrome, process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ].find(p => p && existsSync(p));
  if (!hit) throw new Error("Chrome not found: install Google Chrome or pass --chrome /path/to/chrome (or set CHROME_PATH)");
  return hit;
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fontStack = `"${kit.font.family.replace(/["\\]/g, "")}", ${kit.font.fallback}`;

// The kit's schematic subject (from style-kit.html), used when there is no footage.
function sceneSvg(width: number, height: number) {
  const portrait = height > width, cx = width / 2, cy = portrait ? 920 : 480, r = portrait ? 155 : 125;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#486775"/><path d="M0 ${height * .6} L${width} ${height * .25} V${height} H0Z" fill="#3c5965"/><rect x="${width * .07}" y="${height * .1}" width="${width * .24}" height="${height * .5}" rx="20" fill="#aac1c2" opacity=".12"/><ellipse cx="${cx}" cy="${portrait ? 1620 : 1030}" rx="${portrait ? 360 : 350}" ry="${portrait ? 520 : 400}" fill="#1f3545"/><rect x="${cx - r * .4}" y="${cy + r * .55}" width="${r * .8}" height="${r * .9}" rx="35" fill="#bfa08a"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.2}" fill="#d8bba3"/><path d="M${cx - r} ${cy - r * .3} Q${cx - r * 1.1} ${cy - r * 1.6} ${cx} ${cy - r * 1.3} Q${cx + r * 1.1} ${cy - r * 1.4} ${cx + r} ${cy - r * .3} Q${cx} ${cy - r * .9} ${cx - r} ${cy - r * .3}" fill="#2c3036"/></svg>`;
}

async function setupPage(page: Page, [w, h]: [number, number]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const family = kit.font.family.trim().replace(/ /g, "+");
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700;800;900&display=block">
<style>html,body{margin:0;background:transparent;width:${w}px;height:${h}px;overflow:hidden}
.video-text{position:absolute;text-align:center;white-space:pre-line;font-family:${fontStack}}
.video-text span{display:inline-block;max-width:100%;box-sizing:border-box;box-decoration-break:clone}
.caption span{paint-order:stroke fill;filter:drop-shadow(0 2px 2px #0006)}</style></head>
<body><div id="t" class="video-text"><span></span></div></body></html>`, { waitUntil: "networkidle0", timeout: 30000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
}

// Draws one text element and returns its rendered box and line count, so the kit's rules can be checked.
async function draw(page: Page, kind: "title" | "caption", spec: Spec, box: Box, text: string) {
  const span = kind === "title"
    ? `background:${spec.background};padding:${spec.padding}px;border-radius:${spec.radius}px`
    : `-webkit-text-stroke:${spec.outlineWidth}px ${spec.outlineColor}`;
  return page.evaluate((a) => {
    const el = document.getElementById("t")!, sp = el.firstElementChild as HTMLElement;
    el.className = `video-text ${a.kind}`;
    el.setAttribute("style", `left:${a.box.x}px;top:${a.box.y}px;width:${a.box.width}px;font-size:${a.fontSize}px;font-weight:${a.fontWeight};line-height:${a.lineHeight};color:${a.color}`);
    sp.setAttribute("style", a.span);
    sp.textContent = a.text;
    const r = sp.getBoundingClientRect();
    const lines = Math.round((r.height - 2 * a.pad) / (a.fontSize * a.lineHeight));
    return { x: r.x, y: r.y, w: r.width, h: r.height, lines, fontOk: document.fonts.check(`${a.fontWeight} ${a.fontSize}px ${a.stack}`) };
  }, { kind, box, text, span, fontSize: spec.fontSize, fontWeight: spec.fontWeight, lineHeight: spec.lineHeight, color: spec.color, pad: kind === "title" ? spec.padding ?? 0 : 0, stack: fontStack });
}

// ---------- one render ----------
async function render(ratio: string, page: Page, outFile: string) {
  const fmt = kit.formats[ratio];
  if (!fmt) throw new Error(`kit has no format ${ratio}; it has ${Object.keys(kit.formats).join(", ")}`);
  const [W, H] = fmt.canvas;
  const fps = Number(cli.fps ?? 30);
  const src = cli.video ? probe(resolve(cli.video)) : null;
  const duration = src ? src.duration : Number(cli.duration ?? 6);
  const titleText = (cli.title ?? fmt.titles.example).replace(/\\n/g, "\n");
  const titleUntil = cli["title-until"] ? Number(cli["title-until"]) : duration;
  const position = cli.position ?? "default";
  const capBox = position === "alternative" ? fmt.captions.alternative : fmt.captions.placement;
  if (!capBox) throw new Error(`${ratio} captions have no "${position}" position`);
  const words = cli.captions ? loadWords(resolve(cli.captions))
    : spread(cli.text ?? "This is how your captions look with the style kit, two or three words at a time.", 0.3, duration - 0.2);
  const chunks = chunkWords(words, fmt.captions.wordsPerChunk ?? [2, 3]).filter(c => c.start < duration);

  const tmp = mkdtempSync(join(tmpdir(), "style-kit-"));
  const warn: string[] = [];
  const zones = Object.entries(fmt.safeZones);
  const check = (what: string, r: { x: number; y: number; w: number; h: number; lines: number; fontOk: boolean }, spec: Spec) => {
    if (!r.fontOk) warn.push(`font "${kit.font.family}" did not load; rendered with ${kit.font.fallback}`);
    if (r.lines > spec.maxLines) warn.push(`${what} wraps to ${r.lines} lines (kit max ${spec.maxLines}): shorten it`);
    const pad = what.startsWith("caption") ? fmt.captions.outlineWidth ?? 0 : 0;
    for (const [name, z] of zones) {
      if (r.x - pad < z.x + z.width && r.x + r.w + pad > z.x && r.y - pad < z.y + z.height && r.y + r.h + pad > z.y) warn.push(`${what} enters the ${name} safe zone`);
    }
  };

  await setupPage(page, [W, H]);
  const shot = async (file: string) => page.screenshot({ path: file as `${string}.png`, omitBackground: true });
  if (titleText.trim()) {
    check("title", await draw(page, "title", fmt.titles, fmt.titles.placement, titleText), fmt.titles);
    await shot(join(tmp, "title.png"));
  }
  await draw(page, "caption", fmt.captions, capBox, "");
  await shot(join(tmp, "blank.png"));
  for (const [i, c] of chunks.entries()) {
    check(`caption "${c.text}"`, await draw(page, "caption", fmt.captions, capBox, c.text), fmt.captions);
    await shot(join(tmp, `c${String(i).padStart(4, "0")}.png`));
  }

  // Caption track: a timed PNG sequence (blank between chunks) read by ffmpeg's concat demuxer.
  const list = ["ffconcat version 1.0"];
  let t = 0;
  const add = (f: string, d: number) => { if (d > 0.001) list.push(`file '${f}'`, `duration ${d.toFixed(3)}`); };
  chunks.forEach((c, i) => { add("blank.png", c.start - t); const end = Math.min(c.end, duration); add(`c${String(i).padStart(4, "0")}.png`, end - Math.max(c.start, t)); t = end; });
  add("blank.png", Math.max(duration - t, 0.04));
  list.push("file 'blank.png'");
  writeFileSync(join(tmp, "captions.ffconcat"), list.join("\n") + "\n");

  let bg: string[];
  if (src) bg = ["-i", resolve(cli.video!)];
  else {
    await page.setContent(`<html><body style="margin:0">${sceneSvg(W, H)}</body></html>`);
    await page.screenshot({ path: join(tmp, "scene.png") as `${string}.png` });
    bg = ["-loop", "1", "-framerate", String(fps), "-t", String(duration), "-i", join(tmp, "scene.png")];
  }
  const hasTitle = titleText.trim().length > 0;
  const inputs = [...bg, "-f", "concat", "-safe", "0", "-i", join(tmp, "captions.ffconcat"), ...(hasTitle ? ["-loop", "1", "-i", join(tmp, "title.png")] : [])];
  const graph = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${fps}[base]`,
    `[1:v]format=rgba,fps=${fps}[cap]`,
    hasTitle ? `[base][2:v]overlay=0:0:enable='lte(t,${titleUntil})':shortest=1[t]` : `[base]null[t]`,
    `[t][cap]overlay=0:0:eof_action=pass,format=yuv420p[v]`,
  ].join(";");
  mkdirSync(dirname(outFile), { recursive: true });
  const enc = cli.still !== undefined
    ? ["-ss", String(cli.still), "-frames:v", "1", outFile.replace(/\.mp4$/, ".png")]
    : ["-map", "[v]", ...(src?.audio ? ["-map", "0:a", "-c:a", "aac", "-b:a", "192k"] : []), "-t", String(duration),
       "-c:v", "libx264", "-preset", "medium", "-crf", String(cli.crf ?? 18), "-movflags", "+faststart", outFile];
  sh(["ffmpeg", "-y", "-loglevel", "error", ...inputs, "-filter_complex", graph, ...(cli.still !== undefined ? ["-map", "[v]"] : []), ...enc]);
  rmSync(tmp, { recursive: true, force: true });

  const done = cli.still !== undefined ? outFile.replace(/\.mp4$/, ".png") : outFile;
  console.log(`${ratio} ${W}x${H} · kit ${kit.kitVersion} · ${chunks.length} caption chunks · ${duration.toFixed(1)} s -> ${done}`);
  for (const w of [...new Set(warn)]) console.log(`  ! ${w}`);
}

// ---------- main ----------
let ratios: string[];
if (cli.ratio) ratios = [cli.ratio];
else if (cli.video) { const p = probe(resolve(cli.video)); ratios = [p.height > p.width ? "9:16" : "16:9"]; }
else ratios = ["9:16", "16:9"];

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--hide-scrollbars", "--font-render-hinting=none"] });
try {
  const page = await browser.newPage();
  for (const ratio of ratios) {
    const name = cli.video ? basename(cli.video).replace(/\.[^.]+$/, "") : "example";
    const out = cli.out && ratios.length === 1 ? resolve(cli.out) : join(HERE, "out", `${name}-${ratio.replace(":", "x")}.mp4`);
    await render(ratio, page, out);
  }
} finally {
  await browser.close();
}
