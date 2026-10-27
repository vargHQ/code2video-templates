#!/usr/bin/env bun
// Renders the iPhone Duo fold scene (page/) to video. A local server hands the page its config, the model and the
// screen pictures; headless Chrome draws one video frame per `duo.seek(t)` and the screenshots go into ffmpeg, so
// the result does not depend on machine speed: the same settings give the same video.
//
//   bun render.ts --setup                              # once: fetch Apple's AR model into assets/
//   bun render.ts                                      # everything from settings.json
//   bun render.ts --screen shot.png --title "Meet Fold" --out out/fold.mp4
//   bun render.ts --inner app.html --outer cover.html --preset reveal --size 1080x1920
//   bun render.ts --screen demo.mp4 --background transparent --out out/duo.mov
//   bun render.ts --still 2.5                          # one PNG at 2.5 s, to check the look first
//   bun render.ts --serve                              # live preview in your browser
import puppeteer, { type Browser } from "puppeteer-core";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";

const HERE = import.meta.dir;
const MODEL = {
  file: join(HERE, "assets", "iphone-duo.usdz"),
  url: "https://www.apple.com/105/media/us/iphone-duo/2026/9305e4b9-72d9-4c05-9381-b572adadd5e5/ar/iPhone_Duo_e-sim_Star-White_Variant.usdz",
  sha256: "5cab2ea636da0bc0b06c8abf4809843498f7c1d680042b4f95e383b5c6a718b2",
};
const INNER_CSS = { width: 1200, height: 844 }; // ×2 = the inner screen canvas (2400×1688)
const OUTER_CSS = { width: 581, height: 844 }; // ×2 ≈ the cover screen canvas (1161×1688)

const { values: cli } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    config: { type: "string" },
    preset: { type: "string" },
    duration: { type: "string" },
    screen: { type: "string" },
    inner: { type: "string" },
    outer: { type: "string" },
    fit: { type: "string" },
    finish: { type: "string" },
    "cover-x": { type: "string" },
    "caption-in": { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    "caption-at": { type: "string" },
    ink: { type: "string" },
    background: { type: "string" },
    keys: { type: "string" },
    size: { type: "string" },
    fps: { type: "string" },
    crf: { type: "string" },
    audio: { type: "string" },
    out: { type: "string" },
    still: { type: "string" },
    serve: { type: "boolean" },
    setup: { type: "boolean" },
    chrome: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});
if (cli.help) {
  console.log(`bun render.ts [--config settings.json] [flags that override it]
  --setup                  download Apple's AR model into assets/ (once; also done on first render)
  --preset NAME            unfold | fold | loop | reveal
  --duration SECONDS       preset timing is stretched to fit
  --screen FILE            one picture across the inner screen; the cover shows its right half
                           ("builtin" = the built-in wallpaper and clock; any screen flag replaces settings.json screens)
  --inner FILE --outer FILE   a picture per screen (cover = what you see while folded)
                           FILE: png/jpg/webp/avif, a video (mp4/mov/webm), an .html page, or an https URL
  --cover-x right          with --screen: the part shown on the cover. right (default: the folded view continues
                           into the open one), left, center, or 0..0.5 = where it starts across the picture
  --fit cover|contain      how pictures fill the screens
  --finish NAME            star-white | night-sky (the two colours in Apple's model)
  --title S --subtitle S   caption over the phone     --caption-at top|bottom   --ink #111
  --caption-in SECONDS     when the caption starts its 0.6 s fade-in (default 0.3; 0 = there from the start)
  --background CSS         "#f2f1ed", a CSS gradient, or "transparent" (renders .mov ProRes 4444 or .webm VP9)
  --keys JSON              custom keyframes, e.g. '{"open":[[0,0],[2,180]],"yaw":[[0,-20],[2,0]]}'
  --size 1920x1080 --fps 60 --crf 16
  --audio FILE             music under the clip (cut to length, 1 s fade-out)
  --out FILE               where to write the video (or the PNG with --still)
  --still SECONDS          write one PNG at that time instead of a video
  --serve                  open a live preview server instead of rendering
  --chrome PATH            Chrome/Chromium binary (or set CHROME_PATH)`);
  process.exit(0);
}

// ---------- settings ----------
const cfgPath = resolve(cli.config ?? join(HERE, "settings.json"));
const cfg: Record<string, any> = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};
const base = dirname(cfgPath);
const pick = <T>(flag: T | undefined, key: string, fallback: T): T => (flag !== undefined ? flag : cfg[key] ?? fallback);
// Any screen flag replaces all screens from the settings file. Flag paths are relative to the current directory,
// settings paths to the settings file. "builtin" (or nothing) means the built-in wallpaper and clock.
const screensFromCli = cli.screen !== undefined || cli.inner !== undefined || cli.outer !== undefined;
const screenBase = screensFromCli ? process.cwd() : base;
const screenArg = (key: "screen" | "inner" | "outer") => {
  const value = String((screensFromCli ? cli[key] : cfg[key]) ?? "");
  return value === "builtin" ? "" : value;
};
const s = {
  preset: String(pick(cli.preset, "preset", "unfold")),
  duration: pick(cli.duration, "duration", "") as string | number,
  screen: screenArg("screen"),
  inner: screenArg("inner"),
  outer: screenArg("outer"),
  fit: String(pick(cli.fit, "fit", "cover")),
  finish: String(pick(cli.finish, "finish", "star-white")),
  coverX: String(pick(cli["cover-x"], "cover_x", "right")),
  captionIn: Number(pick(cli["caption-in"], "caption_in", "0.3")),
  title: String(pick(cli.title, "title", "")),
  subtitle: String(pick(cli.subtitle, "subtitle", "")),
  captionAt: String(pick(cli["caption-at"], "caption_at", "top")),
  ink: String(pick(cli.ink, "ink", "#111111")),
  background: String(pick(cli.background, "background", "#f2f1ed")),
  keys: cli.keys ? JSON.parse(cli.keys) : cfg.keys ?? null,
  size: String(pick(cli.size, "size", "1920x1080")),
  fps: Number(pick(cli.fps, "fps", "60")),
  crf: String(pick(cli.crf, "crf", "16")),
  audio: String(pick(cli.audio, "audio", "")),
  out: String(pick(cli.out, "out", "")),
};
if (!["unfold", "fold", "loop", "reveal"].includes(s.preset)) throw new Error(`unknown preset ${s.preset}`);
if (!["star-white", "night-sky"].includes(s.finish)) throw new Error(`unknown finish ${s.finish}`);
if (s.screen && (s.inner || s.outer)) throw new Error("use --screen, or --inner/--outer, not both");
const [W, H] = s.size.split("x").map(Number) as [number, number];
if (!(W > 0 && H > 0 && W % 2 === 0 && H % 2 === 0)) throw new Error(`size must be even WxH, got ${s.size}`);
const transparent = s.background === "transparent";
const still = cli.still !== undefined ? Number(cli.still) : null;

// ---------- model ----------
async function ensureModel() {
  if (existsSync(MODEL.file)) return;
  mkdirSync(dirname(MODEL.file), { recursive: true });
  console.log("Downloading Apple's iPhone Duo AR model (8 MB, once)...");
  const response = await fetch(MODEL.url);
  if (!response.ok) throw new Error(`model download failed: HTTP ${response.status} ${MODEL.url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== MODEL.sha256) {
    console.warn(`warning: the model changed upstream (sha256 ${hash}). If the render fails with "unexpected model layout", Apple re-exported it.`);
  }
  writeFileSync(MODEL.file, bytes);
}
await ensureModel();
if (cli.setup) {
  console.log(MODEL.file);
  process.exit(0);
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
const gpuArgs = process.platform === "darwin"
  ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
  : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
let browser: Browser | null = null;
const launch = async () => (browser ??= await puppeteer.launch({ executablePath: findChrome(), headless: true, args: [...gpuArgs, "--hide-scrollbars"] }));

// ---------- screen inputs ----------
const work = mkdtempSync(join(tmpdir(), "iphone-duo-"));
const files = new Map<string, string>(); // served path → file on disk
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);

async function prepare(kind: "inner" | "outer", input: string) {
  let file = input;
  if (/^https?:\/\//.test(input)) {
    const response = await fetch(input);
    if (!response.ok) throw new Error(`cannot download ${input}: HTTP ${response.status}`);
    const ext = extname(new URL(input).pathname).toLowerCase() || ".png";
    file = join(work, `${kind}-download${ext}`);
    writeFileSync(file, new Uint8Array(await response.arrayBuffer()));
  } else {
    file = resolve(screenBase, input);
    if (!existsSync(file)) throw new Error(`${kind} screen not found: ${file}`);
  }
  const ext = extname(file).toLowerCase();
  if (IMAGE.has(ext)) {
    files.set(`/input/${kind}${ext}`, file);
    return { type: "image", url: `/input/${kind}${ext}` };
  }
  if (ext === ".html" || ext === ".htm") {
    // Screenshot the page at the screen's proportions, 2× for sharpness.
    const css = kind === "inner" ? INNER_CSS : OUTER_CSS;
    const page = await (await launch()).newPage();
    await page.setViewport({ ...css, deviceScaleFactor: 2 });
    await page.goto(`file://${file}`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const png = join(work, `${kind}.png`);
    writeFileSync(png, await page.screenshot({ type: "png" }));
    await page.close();
    files.set(`/input/${kind}.png`, png);
    return { type: "image", url: `/input/${kind}.png` };
  }
  if (VIDEO.has(ext)) {
    // One JPEG per video frame at the output frame rate; the page shows frame floor(t·fps) and holds the last one.
    const dir = join(work, kind);
    mkdirSync(dir);
    const ff = Bun.spawnSync(["ffmpeg", "-loglevel", "error", "-i", file, "-vf", `fps=${s.fps},scale=-2:'min(1688,ih)'`,
      "-q:v", "2", join(dir, "%06d.jpg")]);
    if (ff.exitCode !== 0) throw new Error(`ffmpeg could not read ${file}: ${ff.stderr.toString()}`);
    const count = readdirSync(dir).length;
    for (const name of readdirSync(dir)) files.set(`/frames/${kind}/${name}`, join(dir, name));
    return { type: "frames", url: `/frames/${kind}/%06d.jpg`, count, fps: s.fps };
  }
  throw new Error(`unsupported ${kind} screen type ${ext} (use an image, a video or an .html page)`);
}

const screens: Record<string, unknown> = {};
if (s.screen || s.inner) screens.inner = await prepare("inner", s.screen || s.inner);
if (s.outer) screens.outer = await prepare("outer", s.outer);

const pageConfig = {
  render: !cli.serve,
  preset: s.preset,
  duration: s.duration === "" ? undefined : Number(s.duration),
  keys: s.keys ?? undefined,
  screens,
  fit: s.fit,
  finish: s.finish,
  title: s.title,
  subtitle: s.subtitle,
  caption_at: s.captionAt,
  caption_in: s.captionIn,
  cover_x: s.coverX,
  title_size: cfg.title_size,
  subtitle_size: cfg.subtitle_size,
  ink: s.ink,
  background: s.background,
  blur: cfg.blur,
  fill: cfg.fill,
  follow: cfg.follow,
  clock: cfg.clock,
  pixel_ratio: cli.serve ? undefined : cfg.pixel_ratio ?? (W * H <= 1920 * 1080 ? 2 : 1.5),
};

// ---------- server ----------
const roots: [string, string][] = [["/node_modules/", join(HERE, "node_modules")], ["/assets/", join(HERE, "assets")]];
function handle(request: Request) {
  const path = decodeURIComponent(new URL(request.url).pathname);
  if (path === "/config.json") return Response.json(pageConfig);
  const mapped = files.get(path);
  if (mapped) return new Response(Bun.file(mapped));
  for (const [prefix, dir] of roots) {
    if (path.startsWith(prefix)) {
      const file = normalize(join(dir, path.slice(prefix.length)));
      if (file.startsWith(dir) && existsSync(file)) return new Response(Bun.file(file));
    }
  }
  const file = normalize(join(HERE, "page", path === "/" ? "index.html" : path));
  if (file.startsWith(join(HERE, "page")) && existsSync(file)) return new Response(Bun.file(file));
  return new Response("not found", { status: 404 });
}
function listen(port: number) {
  return Bun.serve({ port, hostname: "127.0.0.1", fetch: handle });
}
let server: ReturnType<typeof listen>;
try {
  server = listen(cli.serve ? 4178 : 0);
} catch {
  server = listen(0); // 4178 is taken (another preview running): use any free port
}
const pageUrl = `http://127.0.0.1:${server.port}/`;

if (cli.serve) {
  await (browser as Browser | null)?.close();
  console.log(`Live preview: ${pageUrl}  (Ctrl+C to stop)`);
  await new Promise(() => {});
}

// ---------- render ----------
const slug = (s.title || `iphone-duo-${s.preset}`).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 48) || "iphone-duo";
const ext = transparent ? ".mov" : ".mp4";
const out = cli.out !== undefined
  ? resolve(cli.out)
  : resolve(HERE, still !== null ? `out/${slug}-${W}x${H}-${still}s.png` : s.out || `out/${slug}-${W}x${H}${ext}`);
mkdirSync(dirname(out), { recursive: true });

try {
  const page = await (await launch()).newPage();
  page.on("pageerror", (e) => console.error("page error:", (e as Error).message));
  page.on("console", (m) => (m.type() === "error" || m.type() === "warn") && console.error("page console:", m.text()));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`${pageUrl}?render`, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => (window as any).duo, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  const duration: number = await page.evaluate(() => (window as any).duo.duration);
  const frames = Math.round(s.fps * duration);
  const seek = (t: number) => page.evaluate((x) => (window as any).duo.seek(x), t);
  const shot = () => page.screenshot({ type: "png", omitBackground: transparent, optimizeForSpeed: true });

  if (still !== null) {
    await seek(Math.min(duration, Math.max(0, still)));
    writeFileSync(out, await shot());
    console.log(out);
  } else {
    const audio = s.audio ? resolve(cli.audio !== undefined ? process.cwd() : base, s.audio) : "";
    if (audio && !existsSync(audio)) throw new Error(`audio not found: ${audio}`);
    const args = ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(s.fps), "-c:v", "png", "-i", "-"];
    if (audio) args.push("-i", audio, "-map", "0:v", "-map", "1:a", "-af", `afade=t=out:st=${Math.max(0, duration - 1)}:d=1`, "-t", String(duration));
    const outExt = extname(out).toLowerCase();
    if (outExt === ".mov") {
      args.push("-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", transparent ? "yuva444p10le" : "yuv444p10le", "-vendor", "apl0");
      if (audio) args.push("-c:a", "pcm_s16le");
    } else if (outExt === ".webm") {
      args.push("-c:v", "libvpx-vp9", "-pix_fmt", transparent ? "yuva420p" : "yuv420p", "-b:v", "0", "-crf", "24", "-row-mt", "1");
      if (audio) args.push("-c:a", "libopus");
    } else {
      if (transparent) throw new Error("MP4 has no alpha: use --out name.mov (ProRes 4444) or name.webm (VP9) with a transparent background");
      args.push("-c:v", "libx264", "-preset", "slow", "-crf", s.crf, "-pix_fmt", "yuv420p", "-movflags", "+faststart");
      if (audio) args.push("-c:a", "aac", "-b:a", "192k");
    }
    args.push(out);
    const ff = Bun.spawn(args, { stdin: "pipe", stdout: "inherit", stderr: "inherit" });
    const started = performance.now();
    for (let f = 0; f < frames; f++) {
      await seek(f / s.fps);
      ff.stdin.write(await shot());
      await ff.stdin.flush();
      if (f % s.fps === s.fps - 1 || f === frames - 1) {
        const sec = (performance.now() - started) / 1000;
        process.stdout.write(`${process.stdout.isTTY ? "\r" : ""}frame ${f + 1}/${frames}  ${((f + 1) / sec).toFixed(1)} fps${process.stdout.isTTY ? "" : "\n"}`);
      }
    }
    ff.stdin.end();
    const code = await ff.exited;
    if (process.stdout.isTTY) process.stdout.write("\n");
    if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
    console.log(out);
  }
} finally {
  await (browser as Browser | null)?.close();
  server.stop(true);
  rmSync(work, { recursive: true, force: true });
}
// puppeteer leaves sockets that keep Bun alive for a while after the video is written; the work is done.
process.exit(0);
