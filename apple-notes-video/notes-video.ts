#!/usr/bin/env bun
// Apple Notes typing video from any text.
//
//   bun notes-video.ts --text post.txt --out note.mp4
//   bun notes-video.ts --script note.json --out note.mp4 --music bed.mp3
//
// The phone screen is the gooseworks apple-notes skin (vendor/, MIT): a page whose
// whole picture is a pure function of window.seek(ms). We seek it frame by frame in
// headless Chrome, pipe the screenshots to ffmpeg, and lay a synthesized keyboard
// click track (plus optional music) under it. Free: no API calls, no credits.

import { parseArgs } from "node:util";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname, extname } from "node:path";
import { chromium, type Browser } from "playwright";
import { notesBuild } from "./vendor/apple-notes.mjs";

const HERE = dirname(new URL(import.meta.url).pathname);
const ASSETS = join(HERE, "vendor", "assets");

// ---------- script ----------

type Line =
  | string
  | { text: string; type?: "paragraph" | "check"; checked?: boolean; pause?: number; seconds?: number }
  | { type: "divider"; pause?: number };

type EndCard = {
  kicker?: string;
  title: string;
  subtitle?: string;
  url?: string;
  image?: string; // local path or http(s) URL
  seconds?: number;
  background?: string;
  accent?: string;
};

type Script = {
  title: string;
  lines: Line[];
  clock?: string;
  cps?: number; // typing speed, characters per second
  hold?: number; // seconds the finished note stays on screen
  end_card?: EndCard;
};

// Any text -> a note: first line (or first sentence) is the title, every other
// line is typed as its own paragraph; long paragraphs break at sentence ends.
// "- [ ] x" / "- [x] x" become checklist rows, "---" a divider.
export function textToScript(raw: string): Script {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) throw new Error("The text is empty.");
  let rows = text.split("\n").map((l) => l.trim());
  let title = rows.shift()!;
  if (title.length > 60) {
    const m = /^(.{8,60}?[.!?…])\s+(.*)$/s.exec(title);
    if (m) {
      title = m[1];
      rows.unshift(m[2]);
    } else {
      const words = title.split(/\s+/);
      let t = "";
      while (words.length && (t + " " + words[0]).trim().length <= 48) t = (t + " " + words.shift()).trim();
      title = t;
      rows.unshift(words.join(" "));
    }
  }
  const lines: Line[] = [];
  for (const row of rows) {
    if (!row) continue;
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(row)) {
      lines.push({ type: "divider" });
      continue;
    }
    const check = /^[-*•]?\s*\[( |x|X)\]\s+(.+)$/.exec(row);
    if (check) {
      lines.push({ type: "check", text: check[2], checked: check[1] !== " " });
      continue;
    }
    for (const part of splitLong(row, 140)) lines.push(part);
  }
  if (!lines.length) throw new Error("The text needs at least one line after the title.");
  return { title, lines };
}

function splitLong(s: string, max: number): string[] {
  if (s.length <= max) return [s];
  const sentences = s.match(/[^.!?…]+[.!?…]+["»”)]*\s*|[^.!?…]+$/g) ?? [s];
  const out: string[] = [];
  let cur = "";
  for (const sen of sentences) {
    if (cur && (cur + sen).length > max) {
      out.push(cur.trim());
      cur = "";
    }
    cur += sen;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}



// Our script -> the skin's thread.
function toThread(s: Script) {
  const cps = s.cps ?? 13;
  const typeSeconds = (t: string) => Math.max(0.25, [...t].length / cps);
  const lines = s.lines.map((l) => {
    if (typeof l === "string") return { text: l, type_seconds: typeSeconds(l) };
    if (l.type === "divider") return { type: "divider" as const, ...(l.pause !== undefined && { pre_pause_seconds: l.pause }) };
    const base = {
      text: l.text,
      type_seconds: l.seconds ?? typeSeconds(l.text),
      ...(l.pause !== undefined && { pre_pause_seconds: l.pause }),
    };
    return l.type === "check" ? { ...base, type: "check" as const, checked: !!l.checked } : base;
  });
  return {
    title: s.title,
    lines,
    post_hold_seconds: s.hold ?? 1.6,
    status_bar: { time: s.clock ?? "9:41", battery_pct: 72 },
    keyboard_state: { suggestions: ["I", "The", "My"], shift: "lower" },
  };
}

// ---------- end card ----------

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function imageSrc(p: string) {
  if (/^https?:\/\//.test(p) || p.startsWith("data:")) return p;
  const ext = extname(p).slice(1).toLowerCase().replace("jpg", "jpeg");
  return `data:image/${ext === "svg" ? "svg+xml" : ext};base64,${readFileSync(resolve(p)).toString("base64")}`;
}

// Appended to the notes page: holds the note at its last frame and fades a
// full-screen card over it, all driven by the same seek(ms).
function endCardHtml(card: EndCard, notesEndMs: number) {
  const bg = card.background ?? "#14110f";
  const accent = card.accent ?? "#ff6a2b";
  const url = card.url
    ? esc(card.url).replace(/^([^.]+)\./, `<span style="color:${accent}">$1</span>.`)
    : "";
  return `
<style>
.ec { position: fixed; inset: 0; z-index: 100; background: ${bg}; color: #f5f1ea; opacity: 0;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", KitText, sans-serif; overflow: hidden; }
.ec-in { position: absolute; left: 7.5vw; right: 7.5vw; top: 30vh; }
.ec-kicker { font: 500 2.1vw ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .35em; text-transform: uppercase; opacity: .55; margin-bottom: 2.2vh; }
.ec-title { font-weight: 700; font-size: 10.5vw; line-height: 1.02; letter-spacing: -0.03em; white-space: pre-line; }
.ec-sub { font-size: 4.2vw; line-height: 1.3; opacity: .78; margin-top: 3vh; white-space: pre-line; }
.ec-url { position: absolute; left: 7.5vw; bottom: 17vh; font-weight: 700; font-size: 6vw; letter-spacing: -0.02em; }
.ec-img { position: absolute; right: -2vw; bottom: 0; width: 52vw; height: 52vh; object-fit: contain; object-position: bottom right; }
</style>
<div class="ec" id="ec">
  ${card.image ? `<img class="ec-img" id="ec-img" src="${esc(imageSrc(card.image))}" alt="">` : ""}
  <div class="ec-in" id="ec-in">
    ${card.kicker ? `<div class="ec-kicker">${esc(card.kicker)}</div>` : ""}
    <div class="ec-title">${esc(card.title)}</div>
    ${card.subtitle ? `<div class="ec-sub">${esc(card.subtitle)}</div>` : ""}
  </div>
  ${url ? `<div class="ec-url" id="ec-url">${url}</div>` : ""}
</div>
<script>(() => {
  const END = ${notesEndMs};
  const notesSeek = window.seek;
  const ec = document.getElementById('ec'), inner = document.getElementById('ec-in');
  const img = document.getElementById('ec-img'), urlEl = document.getElementById('ec-url');
  const ease = (p) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);
  window.seek = (ms) => {
    notesSeek(Math.min(ms, END));
    const t = (ms - END) / 1000;
    ec.style.opacity = String(ease(t / 0.35));
    inner.style.transform = 'translateY(' + (1 - ease((t - 0.1) / 0.6)) * 6 + 'vh)';
    inner.style.opacity = String(ease((t - 0.1) / 0.5));
    if (urlEl) urlEl.style.opacity = String(ease((t - 0.45) / 0.5));
    if (img) img.style.transform = 'translateY(' + (1 - ease((t - 0.25) / 0.7)) * 30 + 'vh)';
  };
  window.seek(0);
})();</script>`;
}

// ---------- page ----------

export function buildPage(script: Script, opts: { width: number; height: number; fps: number }) {
  const thread = toThread(script);
  const inter = readFileSync(join(ASSETS, "InterVariable.ttf")).toString("base64");
  const fontCss = `@font-face { font-family: KitText; src: url(data:font/ttf;base64,${inter}) format("truetype"); font-weight: 100 900; }`;
  const built = notesBuild(thread, {
    ...opts,
    assets: {
      "note.css": readFileSync(join(ASSETS, "note.css"), "utf8"),
      "icons.js": readFileSync(join(ASSETS, "icons.js"), "utf8"),
    },
    font_css: fontCss,
  });
  let html: string = built.html;
  const notesEnd = Math.round(built.total_s * 1000);
  let total = notesEnd;
  if (script.end_card) {
    html = html.replace("</body>", endCardHtml(script.end_card, notesEnd) + "\n</body>");
    total += Math.round((script.end_card.seconds ?? 3.5) * 1000);
  }
  const data = JSON.parse(/<script type="application\/json" id="notes-data">([\s\S]*?)<\/script>/.exec(html)![1]);
  const presses: { t: number; key: string }[] = data.presses;
  return { html, totalMs: total, presses };
}

// ---------- audio ----------

// iOS-style key clicks as a mono 48 kHz WAV: a short decaying noise "tick" for
// letters, a deeper and longer "tock" for space and return. Seeded, so renders
// are reproducible.
function clickTrack(presses: { t: number; key: string }[], totalMs: number): Uint8Array {
  const rate = 48000;
  const n = Math.ceil((totalMs / 1000 + 0.2) * rate);
  const buf = new Float32Array(n);
  let seed = 1234567;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (const p of presses) {
    const heavy = p.key === " " || p.key === "\n";
    const len = Math.round((heavy ? 0.05 : 0.028) * rate);
    const amp = (heavy ? 0.38 : 0.28) * (0.85 + 0.15 * Math.abs(rnd()));
    const freq = heavy ? 150 : 1900 + 400 * rnd();
    const start = Math.round(p.t * rate);
    let hp = 0, prev = 0;
    for (let i = 0; i < len && start + i < n; i++) {
      const env = Math.exp(-i / (len / (heavy ? 4 : 6)));
      const noise = rnd();
      hp = 0.6 * (hp + noise - prev); // one-pole high-pass: crisp, not hissy
      prev = noise;
      const tone = Math.sin((2 * Math.PI * freq * i) / rate);
      buf[start + i] += amp * env * (heavy ? 0.55 * tone + 0.45 * hp : 0.35 * tone + 0.65 * hp);
    }
  }
  const out = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); out.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, rate, true); out.setUint32(28, rate * 2, true); out.setUint16(32, 2, true);
  out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, buf[i])) * 32767, true);
  return new Uint8Array(out.buffer);
}

// ---------- render ----------

async function launch(): Promise<Browser> {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

async function render(o: {
  html: string; totalMs: number; presses: { t: number; key: string }[];
  width: number; height: number; fps: number; out: string; music?: string; clicks: boolean;
}) {
  const work = mkdtempSync(join(tmpdir(), "notes-video-"));
  const silent = join(work, "video.mp4");
  const frames = Math.ceil((o.totalMs / 1000) * o.fps);
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: o.width, height: o.height }, deviceScaleFactor: 1 });
  await page.setContent(o.html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const ff = Bun.spawn(
    ["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", String(o.fps), "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent],
    { stdin: "pipe", stderr: "inherit" },
  );
  const t0 = performance.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate((ms) => (window as any).seek(ms), (i * 1000) / o.fps);
    ff.stdin.write(await page.screenshot({ type: "jpeg", quality: 95 }));
    if (i % o.fps === 0) process.stderr.write(`\rframes ${i}/${frames}`);
  }
  ff.stdin.end();
  if ((await ff.exited) !== 0) throw new Error("ffmpeg failed while encoding the frames.");
  await browser.close();
  process.stderr.write(`\rframes ${frames}/${frames} in ${((performance.now() - t0) / 1000).toFixed(1)}s\n`);

  const dur = (frames / o.fps).toFixed(3);
  const inputs = ["-i", silent];
  const chains: string[] = [];
  const mix: string[] = [];
  if (o.clicks) {
    const wav = join(work, "clicks.wav");
    writeFileSync(wav, clickTrack(o.presses, o.totalMs));
    inputs.push("-i", wav);
    mix.push(`[${inputs.length / 2 - 1}:a]`);
  }
  if (o.music) {
    inputs.push("-stream_loop", "-1", "-i", resolve(o.music));
    const idx = (inputs.filter((x) => x === "-i").length) - 1;
    chains.push(`[${idx}:a]volume=0.35,atrim=0:${dur},afade=t=out:st=${Math.max(0, +dur - 1.2)}:d=1.2[m]`);
    mix.push("[m]");
  }
  if (!mix.length) {
    Bun.spawnSync(["cp", silent, o.out]);
  } else {
    const filter = [...chains, `${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=longest,atrim=0:${dur}[a]`].join(";");
    const r = Bun.spawnSync(["ffmpeg", "-v", "error", "-y", ...inputs, "-filter_complex", filter,
      "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", o.out], { stderr: "inherit" });
    if (r.exitCode !== 0) throw new Error("ffmpeg failed while mixing the audio.");
  }
}

// ---------- cli ----------

if (import.meta.main) {
  const { values: v } = parseArgs({
    options: {
      text: { type: "string" },
      script: { type: "string" },
      out: { type: "string", default: "note.mp4" },
      width: { type: "string", default: "1080" },
      height: { type: "string", default: "1920" },
      fps: { type: "string", default: "30" },
      cps: { type: "string" },
      music: { type: "string" },
      "no-clicks": { type: "boolean", default: false },
      "end-title": { type: "string" },
      "end-subtitle": { type: "string" },
      "end-kicker": { type: "string" },
      "end-url": { type: "string" },
      "end-image": { type: "string" },
      "html-only": { type: "boolean", default: false },
      "dump-script": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (v.help || (!v.text && !v.script)) {
    console.log(`Apple Notes typing video from any text.

  bun notes-video.ts --text post.txt [--out note.mp4]
  bun notes-video.ts --script note.json [--out note.mp4]
  echo "title\\nline one\\nline two" | bun notes-video.ts --text -

  --text <file|->     plain text: line 1 = title, each line = a typed paragraph,
                      "- [ ] item" / "- [x] item" = checklist, "---" = divider
  --script <file>     JSON script (see examples/), full control over pauses and end card
  --cps <n>           typing speed, characters per second (default 13)
  --music <file>      background music, looped and faded out
  --no-clicks         no keyboard click sounds
  --end-title <t>     add an end card (also --end-subtitle --end-kicker --end-url --end-image)
  --width/--height/--fps  default 1080x1920 @ 30
  --dump-script       print the script made from --text and exit
  --html-only         write the seekable HTML page next to --out and exit`);
    process.exit(v.help ? 0 : 1);
  }

  let script: Script;
  if (v.script) script = JSON.parse(readFileSync(resolve(v.script), "utf8"));
  else {
    const raw = v.text === "-" ? await Bun.stdin.text() : existsSync(v.text!) ? readFileSync(resolve(v.text!), "utf8") : v.text!;
    script = textToScript(raw);
  }
  if (v.cps) script.cps = Number(v.cps);
  if (v["end-title"]) {
    script.end_card = {
      ...script.end_card,
      title: v["end-title"].replace(/\\n/g, "\n"),
      ...(v["end-subtitle"] && { subtitle: v["end-subtitle"].replace(/\\n/g, "\n") }),
      ...(v["end-kicker"] && { kicker: v["end-kicker"] }),
      ...(v["end-url"] && { url: v["end-url"] }),
      ...(v["end-image"] && { image: v["end-image"] }),
    };
  }
  if (v["dump-script"]) {
    console.log(JSON.stringify(script, null, 2));
    process.exit(0);
  }

  const width = Number(v.width), height = Number(v.height), fps = Number(v.fps);
  const page = buildPage(script, { width, height, fps });
  const out = resolve(v.out!);
  if (v["html-only"]) {
    const htmlPath = out.replace(/\.[^.]+$/, "") + ".html";
    writeFileSync(htmlPath, page.html);
    console.log(htmlPath);
    process.exit(0);
  }
  console.error(`${(page.totalMs / 1000).toFixed(1)}s, ${width}x${height}@${fps}`);
  await render({ ...page, width, height, fps, out, music: v.music, clicks: !v["no-clicks"] });
  console.log(out);
}
