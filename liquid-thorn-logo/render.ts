#!/usr/bin/env bun
// Renders liquid-thorn-logo.html to MP4. Headless Chrome steps the fluid one video frame at a time and pipes
// PNGs into ffmpeg, so the clip does not depend on machine speed: the same settings give the same video.
//
//   bun render.ts                                  # everything from settings.json
//   bun render.ts --text "NOCTURNE" --out out/nocturne.mp4
//   bun render.ts --text "ТЬМА" --font amatic --size 1080x1920 --logo-only
//   bun render.ts --still 3.5                      # one PNG at 3.5 s, to check the look before a full render
import puppeteer from "puppeteer-core";
import { parseArgs } from "node:util";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const HERE = import.meta.dir;
const { values: cli } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    config: { type: "string" },
    text: { type: "string" },
    font: { type: "string" },
    color: { type: "string" },
    seed: { type: "string" },
    "path-seed": { type: "string" },
    cap1: { type: "string" },
    cap2: { type: "string" },
    link: { type: "string" },
    "logo-only": { type: "boolean" },
    "no-cursor": { type: "boolean" },
    size: { type: "string" },
    fps: { type: "string" },
    duration: { type: "string" },
    crf: { type: "string" },
    audio: { type: "string" },
    out: { type: "string" },
    still: { type: "string" },
    chrome: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});
if (cli.help) {
  console.log(`bun render.ts [--config settings.json] [flags that override it]
  --text TEXT            the logo word (Latin or Cyrillic, up to ~12 letters reads best)
  --font NAME            grenze | grenzeBold | pirata | unifraktur | metal | amatic | ruslan
  --color #2a14e0        liquid colour, also the rim light on the chrome
  --seed N               another thorn layout     --path-seed N   another cursor path
  --cap1 S --cap2 S      the two "aka" lines      --link S        the underlined link ("" hides it)
  --logo-only            no captions or link      --no-cursor     hide the drawn cursor
  --size 1920x1080 --fps 60 --duration 10 --crf 16
  --audio FILE           music under the clip (cut to length, 1 s fade-out)
  --out out/name.mp4     --still SECONDS   write one PNG instead of a video
  --chrome PATH          Chrome/Chromium binary (or set CHROME_PATH)`);
  process.exit(0);
}

const cfgPath = resolve(cli.config ?? join(HERE, "settings.json"));
const cfg: Record<string, any> = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};
const pick = <T>(flag: T | undefined, key: string, fallback: T): T => (flag !== undefined ? flag : cfg[key] ?? fallback);
const s = {
  text: pick(cli.text, "text", "VARG"),
  font: pick(cli.font, "font", "grenze"),
  color: pick(cli.color, "color", "#2a14e0"),
  seed: String(pick(cli.seed, "seed", "7")),
  pathSeed: Number(pick(cli["path-seed"], "path_seed", "1")),
  cap1: pick(cli.cap1, "cap1", undefined as string | undefined),
  cap2: pick(cli.cap2, "cap2", undefined as string | undefined),
  link: pick(cli.link, "link", "varg.ai"),
  logoOnly: pick(cli["logo-only"], "logo_only", false),
  cursor: cli["no-cursor"] ? false : pick(undefined, "cursor", true),
  size: String(pick(cli.size, "size", "1920x1080")),
  fps: Number(pick(cli.fps, "fps", "60")),
  duration: Number(pick(cli.duration, "duration", "10")),
  crf: String(pick(cli.crf, "crf", "16")),
  audio: pick(cli.audio, "audio", ""),
  out: pick(cli.out, "out", ""),
};

const [W, H] = s.size.split("x").map(Number);
if (!(W > 0 && H > 0 && W % 2 === 0 && H % 2 === 0)) throw new Error(`size must be even WxH, got ${s.size}`);
const frames = Math.round(s.fps * s.duration);
const slug = s.text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "logo";
const still = cli.still !== undefined ? Number(cli.still) : null;
const out = resolve(
  HERE,
  still !== null
    ? (cli.out ?? `out/${slug}-${W}x${H}-${still}s.png`)
    : s.out || `out/${slug}-${W}x${H}.mp4`,
);
mkdirSync(dirname(out), { recursive: true });

// ---------- cursor choreography (coords relative to the logo box: 0..1, y down) ----------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Pt = [number, number];
function choreography(seed: number, aspect: number): Pt[] {
  const r = rng(seed);
  const home: Pt = [0.64, 1.02]; // just under the logo; the clip starts and ends here, so it loops
  const segs: { dur: number; at: (t: number) => Pt }[] = [];
  const rest = (p: Pt, dur: number) => segs.push({ dur, at: () => p });
  const move = (p0: Pt, p1: Pt, dur: number, bend: number) => {
    const dx = (p1[0] - p0[0]) * aspect, dy = p1[1] - p0[1];
    const c: Pt = [(p0[0] + p1[0]) / 2 - (dy * bend) / aspect, (p0[1] + p1[1]) / 2 + dx * bend];
    segs.push({
      dur,
      at: (t) => {
        const e = 0.5 - 0.5 * Math.cos(Math.PI * t), u = 1 - e; // ease in-out, like a hand
        return [u * u * p0[0] + 2 * u * e * c[0] + e * e * p1[0], u * u * p0[1] + 2 * u * e * c[1] + e * e * p1[1]];
      },
    });
  };
  const settle = Math.min(1.8, s.duration * 0.2);
  let pos = home, time = 0.5;
  rest(home, 0.5);
  while (time < s.duration - settle - 0.9) {
    const to: Pt = [0.1 + r() * 0.8, 0.18 + r() * 0.64];
    const dist = Math.hypot((to[0] - pos[0]) * aspect, to[1] - pos[1]);
    const dur = Math.min(1.5, Math.max(0.3, dist / (0.6 + r() * 1.1)));
    move(pos, to, dur, (r() - 0.5) * 0.6);
    pos = to;
    time += dur;
    if (r() < 0.55) { const d = 0.15 + r() * 0.5; rest(pos, d); time += d; }
  }
  move(pos, home, 0.7, 0.25);
  rest(home, Math.max(0, s.duration - time - 0.7));

  const path: Pt[] = [];
  let i = 0, t0 = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / s.fps;
    while (i < segs.length - 1 && t >= t0 + segs[i].dur) { t0 += segs[i].dur; i++; }
    path.push(segs[i].at(Math.min(1, (t - t0) / Math.max(segs[i].dur, 1e-6))));
  }
  return path;
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

const q = new URLSearchParams({ render: "1", text: s.text, font: s.font, color: s.color, seed: s.seed, link: s.link });
if (s.cap1 != null) q.set("cap1", s.cap1);
if (s.cap2 != null) q.set("cap2", s.cap2);
if (s.logoOnly) q.set("captions", "0");
if (!s.cursor) q.set("cursor", "0");

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: [...gpuArgs, "--hide-scrollbars"] });
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message));
  page.on("console", (m) => m.type() === "error" && console.error("page console:", m.text()));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`file://${join(HERE, "liquid-thorn-logo.html")}?${q}`, { waitUntil: "networkidle0", timeout: 60000 });
  const ok = await page.evaluate(async () => {
    await document.fonts.ready;
    // @ts-ignore
    if (!window.liquidLogo) return false;
    // @ts-ignore
    await window.liquidLogo.ready;
    return true;
  });
  if (!ok) throw new Error("WebGL2 with float render targets is not available in this Chrome");
  // @ts-ignore
  const rect = await page.evaluate(() => window.liquidLogo.rect());
  const path = choreography(s.pathSeed, rect.w / rect.h).map(([x, y]) => [rect.x + x * rect.w, rect.y + y * rect.h]);
  // @ts-ignore
  const step = (f: number) => page.evaluate((x, y, r) => window.liquidLogo.frame(x, y, r), path[f][0], path[f][1], s.fps);

  if (still !== null) {
    const last = Math.min(frames - 1, Math.max(0, Math.round(still * s.fps)));
    for (let f = 0; f <= last; f++) await step(f);
    writeFileSync(out, await page.screenshot({ type: "png" }));
    console.log(out);
  } else {
    const audio = s.audio ? resolve(HERE, s.audio) : "";
    if (audio && !existsSync(audio)) throw new Error(`audio not found: ${audio}`);
    const args = ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(s.fps), "-c:v", "png", "-i", "-"];
    if (audio) args.push("-i", audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k",
      "-af", `afade=t=out:st=${Math.max(0, s.duration - 1)}:d=1`, "-t", String(s.duration));
    args.push("-c:v", "libx264", "-preset", "slow", "-crf", s.crf, "-pix_fmt", "yuv420p", "-movflags", "+faststart", out);
    const ff = Bun.spawn(args, { stdin: "pipe", stdout: "inherit", stderr: "inherit" });
    const started = performance.now();
    for (let f = 0; f < frames; f++) {
      await step(f);
      ff.stdin.write(await page.screenshot({ type: "png", optimizeForSpeed: true }));
      await ff.stdin.flush();
      if (f % s.fps === s.fps - 1 || f === frames - 1) {
        const sec = (performance.now() - started) / 1000;
        process.stdout.write(`\rframe ${f + 1}/${frames}  ${((f + 1) / sec).toFixed(1)} fps`);
      }
    }
    ff.stdin.end();
    const code = await ff.exited;
    process.stdout.write("\n");
    if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
    console.log(out);
  }
} finally {
  await browser.close();
}
