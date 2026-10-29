#!/usr/bin/env bun
// Renders an iMessage conversation (a JSON script) to a vertical MP4 that looks like an iPhone screen recording.
// page/imessage.html draws any frame as a pure function of the frame number; headless Chrome screenshots every
// frame across a few tabs at once and ffmpeg joins them, so the same script always gives the same video.
//
//   bun render.ts examples/hook.json                          # out/hook.mp4, 1170x2532, 30 fps
//   bun render.ts my-chat.json --sfx --out out/chat.mp4       # with send / receive / typing sounds
//   bun render.ts examples/drama.json --size 1080x1920 --sfx --audio bed.mp3
//   bun render.ts examples/hook.json --still last             # one PNG of the last frame, to check the look
//   bun render.ts examples/hook.json --serve                  # live preview in your browser
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { availableParallelism, tmpdir } from "node:os";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

const HERE = import.meta.dir;
const PAGE = join(HERE, "page", "imessage.html");
const W = 1170;
const H = 2532;
const FPS = 30;

const { values: cli, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
  options: {
    out: { type: "string" },
    pace: { type: "string" },
    theme: { type: "string" },
    size: { type: "string" },
    background: { type: "string" },
    sfx: { type: "boolean" },
    audio: { type: "string" },
    "audio-volume": { type: "string" },
    still: { type: "string" },
    workers: { type: "string" },
    crf: { type: "string" },
    serve: { type: "boolean" },
    port: { type: "string" },
    chrome: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});
if (cli.help || positionals.length === 0) {
  console.log(`bun render.ts CHAT.json [flags]
  CHAT.json                the conversation script (see README.md; examples/ has three)
  --out FILE               default out/<chat name>.mp4 (or .png with --still)
  --pace N                 overrides "pace" in the script: 1 = real texting speed, 1.5-2.5 = social-video speed
  --theme light|dark       overrides "theme" in the script
  --size WxH               fit the 1170x2532 screen into another frame, e.g. 1080x1920 (9:16), padded with --background
  --background CSS         colour around the screen with --size (default #000)
  --sfx                    add send / receive / tapback / keyboard sounds, synthesized (no Apple audio)
  --audio FILE             music under the chat (cut to length, 1 s fade-out)   --audio-volume 0.35
  --still SECONDS|last     write one PNG at that time instead of a video
  --workers N              Chrome tabs rendering in parallel (default: half the CPU cores, max 6)
  --crf 18                 x264 quality (lower = bigger file)
  --serve                  live preview at http://127.0.0.1:4179 (--port to change)
  --chrome PATH            Chrome/Chromium binary (or set CHROME_PATH)`);
  process.exit(cli.help ? 0 : 1);
}

// ---------- conversation ----------
const chatPath = resolve(positionals[0]!);
if (!existsSync(chatPath)) throw new Error(`conversation not found: ${chatPath}`);
const chatDir = dirname(chatPath);
const chatName = basename(chatPath).replace(/\.json$/i, "");
const conv = JSON.parse(readFileSync(chatPath, "utf8"));
if (!Array.isArray(conv.messages) || conv.messages.length === 0) throw new Error(`${chatPath}: "messages" must be a non-empty array`);
if (cli.pace) conv.pace = Number(cli.pace);
if (cli.theme) conv.theme = cli.theme;

const still = cli.still;
const crf = String(cli.crf ?? "18");
const workers = Math.max(1, Math.min(Number(cli.workers ?? Math.min(6, Math.max(1, Math.floor(availableParallelism() / 2)))), 12));
const size = cli.size ? cli.size.split("x").map(Number) as [number, number] : null;
if (size && !(size[0]! > 0 && size[1]! > 0 && size[0]! % 2 === 0 && size[1]! % 2 === 0)) throw new Error(`--size must be even WxH, got ${cli.size}`);
const background = cli.background ?? "#000";
const audio = cli.audio ? resolve(cli.audio) : "";
if (audio && !existsSync(audio)) throw new Error(`audio not found: ${audio}`);
const audioVolume = Number(cli["audio-volume"] ?? "0.35");
const defaultOut = join(HERE, "out", chatName + (still !== undefined ? ".png" : ".mp4"));
const out = resolve(cli.out ?? defaultOut);
mkdirSync(dirname(out), { recursive: true });

// ---------- media referenced by the script ----------
// Local paths resolve from the script's folder and are served under /media/; https URLs load as they are.
// A video bubble { "video": { "src": "clip.mp4" } } is cut into 30 fps JPEG frames once (cached in out/.cache).
const files = new Map<string, string>(); // served path -> file on disk
const isRemote = (src: string) => /^(https?:)?\/\//.test(src) || src.startsWith("data:");
function local(src: string) {
  if (isRemote(src)) return src;
  const file = resolve(chatDir, src);
  if (!existsSync(file)) throw new Error(`file not found: ${src} (looked for ${file})`);
  const url = `/media/${createHash("sha1").update(file).digest("hex").slice(0, 12)}${extname(file).toLowerCase()}`;
  files.set(url, file);
  return url;
}
function videoFrames(src: string) {
  let file = src;
  if (!isRemote(src)) {
    file = resolve(chatDir, src);
    if (!existsSync(file)) throw new Error(`video not found: ${src} (looked for ${file})`);
  }
  const key = createHash("sha1").update(file + (isRemote(src) ? "" : String(Bun.file(file).lastModified))).digest("hex").slice(0, 12);
  const dir = join(HERE, "out", ".cache", key);
  if (!existsSync(join(dir, "f_000001.jpg"))) {
    mkdirSync(dir, { recursive: true });
    const r = Bun.spawnSync(["ffmpeg", "-v", "error", "-y", "-i", file, "-vf", `fps=${FPS},scale=780:-2`, "-q:v", "3", join(dir, "f_%06d.jpg")]);
    if (r.exitCode !== 0) throw new Error(`ffmpeg could not read ${src}: ${r.stderr.toString().trim()}`);
  }
  const count = readdirSync(dir).filter((f) => f.startsWith("f_")).length;
  for (let i = 1; i <= count; i++) files.set(`/frames/${key}/f_${String(i).padStart(6, "0")}.jpg`, join(dir, `f_${String(i).padStart(6, "0")}.jpg`));
  return { dir: `/frames/${key}`, count };
}
if (conv.avatar) conv.avatar = local(conv.avatar);
for (const m of conv.messages) {
  if (m.image?.src) m.image.src = local(m.image.src);
  if (m.linkCard?.src) m.linkCard.src = local(m.linkCard.src);
  if (m.video?.src) Object.assign(m.video, videoFrames(m.video.src), { src: undefined });
}

// ---------- server ----------
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif", ".svg": "image/svg+xml",
};
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: cli.serve ? Number(cli.port ?? 4179) : 0,
  fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/" || path === "/index.html") return new Response(Bun.file(PAGE), { headers: { "content-type": MIME[".html"]! } });
    if (path === "/conversation.json") return Response.json(conv);
    const file = files.get(path);
    if (file) return new Response(Bun.file(file), { headers: { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream" } });
    return new Response("not found", { status: 404 });
  },
});
const base = `http://127.0.0.1:${server.port}`;
if (cli.serve) {
  console.log(`preview: ${base}  (reload to replay; edit ${basename(chatPath)} and restart to pick up changes)`);
  await new Promise(() => {});
}

// ---------- browser ----------
function findChrome() {
  const candidates = [
    cli.chrome,
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const hit = candidates.find((p) => p && existsSync(p));
  if (!hit) throw new Error("Chrome not found: install Google Chrome or pass --chrome /path/to/chrome (or set CHROME_PATH)");
  return hit;
}
// GPU raster takes the nav bar's backdrop blur off the CPU, so parallel tabs don't queue behind each other.
const gpuArgs = process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] : [];
const browser: Browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  protocolTimeout: 300_000,
  args: [...gpuArgs, "--hide-scrollbars", "--force-device-scale-factor=1", "--font-render-hinting=none"],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});

async function openTab(): Promise<Page> {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("page error:", (e as Error).message));
  await page.evaluateOnNewDocument(() => { (window as any).__EXTERNAL_CLOCK = true; });
  await page.goto(`${base}/?noplay`, { waitUntil: "load" });
  await page.evaluate((c) => { (window as any).__CONVERSATION = c; }, conv);
  await page.evaluate(() => new Promise<void>((done) => { (window as any).__ready = done; (window as any).__boot(); }));
  return page;
}

const work = mkdtempSync(join(tmpdir(), "imessage-video-"));
try {
  const first = await openTab();
  const duration: number = await first.evaluate(() => (window as any).__DURATION);
  const total = duration + 1;

  if (still !== undefined) {
    const f = still === "last" ? duration : Math.min(duration, Math.max(0, Math.round(Number(still) * FPS)));
    await first.evaluate((n) => (window as any).__renderFrame(n), f);
    const png = join(work, "still.png");
    await first.screenshot({ path: png as `${string}.png`, type: "png" });
    finish(png, out, true);
    console.log(out);
  } else {
    console.log(`${chatName}: ${total} frames (${(total / FPS).toFixed(1)} s), ${workers} tabs`);
    const pages = [first];
    while (pages.length < Math.min(workers, total)) pages.push(await openTab()); // one at a time: parallel boots time out
    const per = Math.ceil(total / pages.length);
    const t0 = Date.now();
    let done = 0;
    await Promise.all(pages.map(async (page, w) => {
      for (let f = w * per; f < Math.min(total, (w + 1) * per); f++) {
        await page.evaluate((n) => (window as any).__renderFrame(n), f);
        writeFileSync(join(work, `f_${String(f).padStart(6, "0")}.jpg`), await page.screenshot({ type: "jpeg", quality: 94 }));
        if (++done % 60 === 0) process.stdout.write(`\r  ${done}/${total} frames`);
      }
    }));
    process.stdout.write(`\r  ${total}/${total} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);

    const tl = await first.evaluate(() => (window as any).__TL.items.map((it: any) => ({
      me: it.me, stamp: !!it.stamp, pop: it.pop, inputStart: it.inputStart, inputDur: it.inputDur,
      chars: it.msg.text ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(it.msg.text)].length : 0,
      tapbackAt: Number.isFinite(it.tapbackAt) ? it.tapbackAt : null,
    })));
    const sfx = cli.sfx ? writeSfx(join(work, "sfx.wav"), tl, total) : "";
    encode(join(work, "f_%06d.jpg"), sfx, total, out);
    console.log(out);
  }
} finally {
  await browser.close();
  server.stop(true);
  rmSync(work, { recursive: true, force: true });
}

// ---------- output ----------
function fitFilter() {
  if (!size) return "format=yuv420p";
  const [w, h] = size;
  // ffmpeg wants 0xRRGGBB or a colour name; accept CSS #rgb / #rrggbb too
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(background)?.[1];
  const pad = hex ? "0x" + (hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex) : background;
  return `scale=${w}:${h}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=${pad},format=yuv420p`;
}

function finish(png: string, dest: string, isStill: boolean) {
  if (!isStill || !size) { writeFileSync(dest, readFileSync(png)); return; }
  run(["ffmpeg", "-v", "error", "-y", "-i", png, "-vf", fitFilter().replace(/,format=yuv420p$/, ""), dest]);
}

function encode(pattern: string, sfx: string, frames: number, dest: string) {
  const seconds = frames / FPS;
  const args = ["ffmpeg", "-v", "error", "-y", "-framerate", String(FPS), "-i", pattern];
  const tracks: string[] = [];
  if (sfx) { args.push("-i", sfx); tracks.push(`[${tracks.length + 1}:a]`); }
  if (audio) { args.push("-stream_loop", "-1", "-i", audio); tracks.push(`[${tracks.length + 1}:a]`); }
  const filters = [`[0:v]${fitFilter()}[v]`];
  if (tracks.length) {
    const music = audio ? tracks.length : 0;
    const chains = tracks.map((t, i) => i + 1 === music
      ? `${t}atrim=0:${seconds.toFixed(3)},volume=${audioVolume},afade=t=out:st=${Math.max(0, seconds - 1).toFixed(3)}:d=1[a${i}]`
      : `${t}atrim=0:${seconds.toFixed(3)}[a${i}]`);
    filters.push(...chains);
    filters.push(tracks.length > 1
      ? `${tracks.map((_, i) => `[a${i}]`).join("")}amix=inputs=${tracks.length}:duration=first:normalize=0[a]`
      : `[a0]anull[a]`);
  }
  args.push("-filter_complex", filters.join(";"), "-map", "[v]");
  if (tracks.length) args.push("-map", "[a]", "-c:a", "aac", "-b:a", "192k");
  args.push("-c:v", "libx264", "-preset", "medium", "-crf", crf, "-r", String(FPS), "-movflags", "+faststart", "-t", seconds.toFixed(3), dest);
  run(args);
}

function run(args: string[]) {
  const r = Bun.spawnSync(args, { stdout: "inherit", stderr: "pipe" });
  if (r.exitCode !== 0) throw new Error(`${args[0]} failed: ${r.stderr.toString().trim()}`);
}

// ---------- sound effects ----------
// Original sounds made from sine waves and noise, timed from the compiled timeline: a rising whoosh when you send,
// a two-note chime when a message arrives, a tick for a tapback and a soft click per character typed in the input bar.
type Item = { me: boolean; stamp: boolean; pop: number; inputStart: number; inputDur: number; chars: number; tapbackAt: number | null };
function writeSfx(path: string, items: Item[], frames: number) {
  const rate = 48000;
  const buf = new Float32Array(Math.ceil((frames / FPS) * rate) + rate);
  let seed = 7;
  const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  const at = (frame: number) => Math.round((frame / FPS) * rate);
  const add = (start: number, seconds: number, fn: (t: number) => number) => {
    const n = Math.round(seconds * rate);
    for (let i = 0; i < n && start + i < buf.length; i++) if (start + i >= 0) buf[start + i]! += fn(i / rate);
  };
  const send = (s: number) => add(s, 0.22, (t) => {
    const f = 520 * Math.pow(2.6, t / 0.22);
    return 0.32 * Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.01) * Math.exp(-t * 14);
  });
  const receive = (s: number) => {
    for (const [off, f] of [[0, 1175], [0.085, 1568]] as const) {
      add(s + Math.round(off * rate), 0.35, (t) =>
        0.22 * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.min(1, t / 0.004) * Math.exp(-t * 11));
    }
  };
  const tick = (s: number) => add(s, 0.06, (t) => 0.25 * Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 70));
  const click = (s: number) => add(s, 0.018, (t) => 0.10 * noise() * Math.exp(-t * 260));
  for (const it of items) {
    if (it.stamp) continue;
    if (it.inputStart >= 0 && it.chars > 0) {
      for (let c = 1; c <= it.chars; c++) click(at(it.inputStart + (c / it.chars) * it.inputDur));
    }
    (it.me ? send : receive)(at(it.pop));
    if (it.tapbackAt != null) tick(at(it.tapbackAt));
  }
  const pcm = Buffer.alloc(44 + buf.length * 2);
  pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + buf.length * 2, 4); pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(rate, 24);
  pcm.writeUInt32LE(rate * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36); pcm.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i]! * 1.6)) * 32767), 44 + i * 2);
  writeFileSync(path, pcm);
  return path;
}
