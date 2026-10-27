#!/usr/bin/env bun
// Builds the HyperFrames project for the card-catalog explainer from config.json.
//
//   bun engine/build.ts [config.json]      -> out/hf/index.html + out/hf/compositions/*.html
//
// Seven scenes, one per sub-composition: ask -> drawer -> search -> card -> shelf -> result -> end.
// Every string, colour and scene length comes from the config; the geometry below is tuned for 1920x1080.
// Words wrapped in *stars* in a `line` are drawn in the accent colour.

import { mkdirSync, writeFileSync, existsSync, copyFileSync, rmSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = resolve(dirname(import.meta.path), "..");
const cfgPath = resolve(process.argv[2] ?? join(ROOT, "config.json"));
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const OUT = join(ROOT, "out", "hf");
const W = cfg.output.width ?? 1920;
const H = cfg.output.height ?? 1080;
const C = cfg.colors;
const T = cfg.timing;

// ---------- helpers ----------
const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f3 = (n: number) => Number(n.toFixed(3));

/** A display line: one div per row, one span per word, *stars* toggle the accent. */
function line(id: string, rows: string[], style: string) {
  let acc = false;
  const htmlRows = rows.map((row) => {
    const words = row.split(" ").filter(Boolean);
    return `<div class="ln">${words
      .map((w) => {
        let out = "";
        let cur = "";
        let curAcc = acc;
        const flush = () => {
          if (cur) out += curAcc ? `<span class="acc">${esc(cur)}</span>` : esc(cur);
          cur = "";
        };
        for (const ch of w) {
          if (ch === "*") {
            flush();
            acc = !acc;
            curAcc = acc;
          } else cur += ch;
        }
        flush();
        return `<span class="w">${out}</span>`;
      })
      .join(" ")}</div>`;
  });
  return `<div id="${id}" class="line" style="${style}">${htmlRows.join("")}</div>`;
}

/** Text typed letter by letter: words stay unbroken, every letter is a .ch span. */
function typed(text: string, cls = "") {
  return String(text)
    .split(" ")
    .map((w) => `<span class="wd">${[...w].map((c) => `<span class="ch${cls ? " " + cls : ""}">${esc(c)}</span>`).join("")}</span>`)
    .join(" ");
}

/** GSAP for a line: per-word blur-in, then a blur-out exit. */
function lineIn(sel: string, at: number) {
  return `tl.fromTo("${sel} .w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power2.out", stagger: 0.067 }, ${f3(at)});`;
}
function lineOut(sel: string, at: number) {
  return `tl.to("${sel}", { opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power2.in" }, ${f3(at)});`;
}
function typeIn(sel: string, at: number, perChar: number) {
  return `tl.fromTo("${sel} .ch", { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none", stagger: ${perChar} }, ${f3(at)});`;
}

const baseCss = `
  #root { position: absolute; inset: 0; overflow: hidden; }
  .line { position: absolute; font-family: 'Montserrat', sans-serif; font-weight: 600; color: ${C.ink}; letter-spacing: -0.02em; line-height: 1.14; }
  .line .w { display: inline-block; }
  .line .acc { color: ${C.accent}; }
  .wd { display: inline-block; white-space: nowrap; }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .term { position: absolute; background: #121214; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; box-shadow: 0 30px 70px rgba(0,0,0,0.5); overflow: hidden; }
  .term .bar { height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 22px; background: #18181b; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .term .dot { width: 13px; height: 13px; border-radius: 50%; background: #2c2c31; }
  .term .name { margin-left: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 28px; color: ${C.muted}; }
  .term .body { padding: 34px 44px; font-family: 'IBM Plex Mono', monospace; color: ${C.ink}; }
  .prompt { color: ${C.accent}; margin-right: 18px; }
  .paper { background: ${C.paper}; color: ${C.paperInk}; border-radius: 10px; box-shadow: 0 26px 60px rgba(0,0,0,0.5); }
`;

function scene(id: string, dur: number, css: string, body: string, js: string) {
  return `<template>
  <style>${baseCss}${css}</style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${body}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${js}
    tl.set({}, {}, ${f3(dur)});
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------- shared objects ----------

/** The catalog drawer, front view: back wall, card edges with category tabs, front panel with label and pull. */
function drawer(p: string, withRise = false) {
  const edges = Array.from({ length: 10 }, (_, i) => {
    const shade = 0.78 + i * 0.022; // back cards darker
    const tab = cfg.catalog.tabs[i % cfg.catalog.tabs.length];
    const tabX = [60, 690, 300, 900, 160, 520, 820, 380, 980, 240][i];
    const hasTab = i < cfg.catalog.tabs.length;
    return `<div class="edge" style="top:${30 + i * 20}px; height:${250 - (30 + i * 20)}px; filter: brightness(${shade.toFixed(3)});">${
      hasTab ? `<div id="${p}-tab${i}" class="tab" style="left:${tabX}px">${esc(tab)}</div>` : ""
    }</div>`;
  }).join("");
  const rise = withRise
    ? `<div class="rise">${cfg.search.results
        .map(
          (r: any, i: number) => `<div id="${p}-mini${i}" class="mini paper" style="left:${40 + i * 370}px; top:320px;">
            <div class="m-v"></div><div class="m-h"></div>
            <div class="m-pub mono">${esc(r.publisher)}</div>
            <div class="m-name mono">${esc(r.name)}</div>
            <div class="m-r" style="top:120px"></div><div class="m-r" style="top:150px"></div><div class="m-r" style="top:180px"></div>
            <div class="m-hole"></div>
          </div>`,
        )
        .join("")}</div>`
    : "";
  return `<div id="${p}-drawer" class="drawer">
    <div class="d-back"></div>
    ${edges}
    <div class="d-side" style="left:0"></div><div class="d-side" style="right:0"></div>
    ${rise}
    <div class="d-front">
      <div class="d-holder"><div class="d-label mono"><b>${esc(cfg.catalog.label)}</b><span>${esc(cfg.catalog.count)}</span></div></div>
      <div class="d-pull"></div>
    </div>
  </div>`;
}
const drawerCss = `
  .drawer { position: absolute; left: 360px; top: 500px; width: 1200px; height: 400px; }
  .d-back { position: absolute; left: 0; right: 0; top: 18px; height: 240px; background: #161618; border-radius: 14px 14px 0 0; }
  .edge { position: absolute; left: 40px; width: 1120px; background: ${C.paper}; border-radius: 6px 6px 0 0; border-top: 1px solid rgba(0,0,0,0.18); }
  .tab { position: absolute; top: -42px; height: 44px; padding: 0 18px; background: ${C.paper}; border-radius: 8px 8px 0 0; font-family: 'IBM Plex Mono', monospace; font-size: 28px; line-height: 44px; color: ${C.paperInk}; }
  .d-side { position: absolute; top: 18px; width: 30px; height: 240px; background: #1d1d20; }
  .d-front { position: absolute; left: 0; right: 0; top: 236px; height: 164px; background: #1f1f23; border-top: 1px solid rgba(255,255,255,0.10); border-radius: 0 0 12px 12px; box-shadow: 0 24px 40px rgba(0,0,0,0.55); }
  .d-holder { position: absolute; left: 445px; top: 28px; width: 310px; height: 78px; border: 4px solid #3a3a40; border-radius: 6px; background: #2a2a2f; padding: 6px; }
  .d-label { width: 100%; height: 100%; background: ${C.paper}; color: ${C.paperInk}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 18px; line-height: 1.2; }
  .d-label b { font-weight: 600; font-size: 20px; }
  .d-pull { position: absolute; left: 540px; top: 122px; width: 120px; height: 18px; border-radius: 9px; background: #3a3a40; }
  .rise { position: absolute; left: 0; top: -600px; width: 1200px; height: 840px; overflow: hidden; }
  .mini { position: absolute; width: 380px; height: 220px; overflow: hidden; }
  .mini .m-v { position: absolute; left: 89px; top: 0; bottom: 0; width: 2px; background: ${C.accent}; }
  .mini .m-h { position: absolute; left: 0; right: 0; top: 38px; height: 2px; background: ${C.accent}; }
  .mini .m-pub { position: absolute; left: 10px; top: 50px; width: 74px; font-size: 13px; color: ${C.accentInk}; overflow-wrap: anywhere; line-height: 1.2; }
  .mini .m-name { position: absolute; left: 100px; top: 4px; font-size: 24px; font-weight: 600; white-space: nowrap; }
  .mini .m-r { position: absolute; left: 100px; right: 16px; height: 2px; background: ${C.rule}; }
  .mini .m-hole { position: absolute; left: 179px; bottom: 14px; width: 22px; height: 22px; border-radius: 50%; background: ${C.ground}; }
`;

/** The index card, full size: call number column on the left, title and typed fields on the right. */
function bigCard(p: string, opts: { fields: boolean; shaSwap?: boolean }) {
  const c = cfg.card;
  const rows = c.fields
    .map(
      ([label, value]: [string, string], i: number) => `<div class="f-row" style="top:${150 + i * 104}px">
        <div id="${p}-fl${i}" class="f-label">${esc(label)}</div>
        <div id="${p}-fv${i}" class="f-value">${opts.fields ? typed(value) : ""}</div>
      </div>`,
    )
    .join("");
  const install = `<div class="f-row" style="top:${150 + c.fields.length * 104}px">
      <div id="${p}-fli" class="f-label">${esc(c.installLabel ?? "установка")}</div>
      <div id="${p}-fvi" class="f-value f-cmd">${opts.fields ? typed(c.install) : ""}</div>
    </div>`;
  const sha = opts.shaSwap
    ? `<span class="sha-box"><span id="${p}-sha-old" class="sha">@${esc(c.sha)}</span><span id="${p}-sha-new" class="sha sha-new">@${esc(cfg.sync.to)}</span></span>`
    : `<span class="sha">@${esc(c.sha)}</span>`;
  return `<div id="${p}-card" class="big paper">
    <div class="b-v"></div><div class="b-h"></div>
    <div class="b-rules"></div>
    <div id="${p}-call" class="b-call mono"><div>${esc(c.repo.split("/")[0])}/</div><div>${esc(c.repo.split("/")[1] ?? "")}</div><div>${esc(c.path)}</div><div>${sha}</div>
      <div id="${p}-callu" class="b-callu"></div></div>
    <div class="b-title mono">${esc(c.title)}</div>
    ${opts.fields ? rows + install : ""}
    <div class="b-hole"></div>
  </div>`;
}
const bigCss = `
  .big { position: absolute; left: 320px; top: 170px; width: 1280px; height: 740px; overflow: hidden; font-family: 'IBM Plex Mono', monospace; }
  .big .b-v { position: absolute; left: 300px; top: 0; bottom: 0; width: 4px; background: ${C.accent}; }
  .big .b-h { position: absolute; left: 0; right: 0; top: 128px; height: 4px; background: ${C.accent}; }
  .big .b-rules { position: absolute; left: 304px; right: 0; top: 132px; bottom: 0; background: repeating-linear-gradient(to bottom, transparent 0, transparent 102px, ${C.rule} 102px, ${C.rule} 104px); opacity: 0.75; }
  .big .b-call { position: absolute; left: 30px; top: 156px; width: 262px; font-size: 28px; line-height: 1.45; color: ${C.accentInk}; font-weight: 600; }
  .big .b-callu { position: absolute; left: 0; right: 0; bottom: -10px; height: 4px; background: ${C.accent}; }
  .big .sha-box { position: relative; display: inline-block; width: 100%; height: 41px; }
  .big .sha-box .sha { position: absolute; left: 0; top: 0; }
  .big .b-title { position: absolute; left: 336px; top: 40px; font-size: 50px; font-weight: 600; letter-spacing: 0.02em; color: ${C.paperInk}; }
  .big .f-row { position: absolute; left: 330px; right: 26px; height: 104px; }
  .big .f-label { position: absolute; left: 0; top: 10px; font-size: 26px; color: ${C.paperMuted}; }
  .big .f-value { position: absolute; left: 0; top: 46px; font-size: 30px; color: ${C.paperInk}; white-space: nowrap; }
  .big .f-cmd { font-size: 28px; color: ${C.paperInk}; }
  .big .b-hole { position: absolute; left: 622px; bottom: 30px; width: 36px; height: 36px; border-radius: 50%; background: ${C.ground}; }
`;

// ---------- scenes ----------

/** Opening wall: real renders from other templates, playing side by side, so the film starts on results. */
type Clip = { file: string; label: string };
function prepareShowcase(dur: number): Clip[] {
  const sc = cfg.showcase;
  if (!sc?.clips?.length) return [];
  mkdirSync(join(OUT, "assets", "showcase"), { recursive: true });
  const out: Clip[] = [];
  sc.clips.forEach((c: any, i: number) => {
    const src = /^https?:/.test(c.src) ? c.src : resolve(dirname(cfgPath), c.src);
    if (!/^https?:/.test(src) && !existsSync(src)) {
      console.warn(`showcase: skipping ${c.label}, missing ${src}`);
      return;
    }
    const file = `assets/showcase/${i}.mp4`;
    const r = Bun.spawnSync([
      "ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-ss", String(c.start ?? 0), "-i", src, "-t", String(dur),
      "-vf", "scale=600:1066:force_original_aspect_ratio=increase,crop=600:1066,fps=30",
      "-an", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", join(OUT, file),
    ]);
    if (r.exitCode !== 0) {
      console.warn(`showcase: ffmpeg failed for ${c.label}: ${r.stderr.toString().slice(0, 200)}`);
      return;
    }
    out.push({ file, label: c.label });
  });
  return out;
}

function sceneShowcase(dur: number, clips: Clip[]) {
  const sc = cfg.showcase;
  const n = clips.length;
  const w = 300, h = 533, gap = 30;
  const left = Math.round((W - (n * w + (n - 1) * gap)) / 2);
  const slots = clips
    .map(
      (c, i) => `<div id="s0-slot${i}" class="slot" style="left:${left + i * (w + gap)}px;">
        <video id="s0-v${i}" class="clip" src="${c.file}" muted playsinline data-start="0" data-duration="${f3(dur)}" data-track-index="${i + 2}"></video>
      </div>
      <div id="s0-lab${i}" class="lab mono" style="left:${left + i * (w + gap)}px;">${typed(c.label)}</div>`,
    )
    .join("");
  const body = `${line("s0-l1", sc.line1, `left:${left}px; top:110px; font-size:64px;`)}
    ${line("s0-l2", sc.line2, `left:${left}px; top:110px; font-size:64px;`)}
    ${slots}`;
  const css = `
    .slot { position: absolute; top: 240px; width: ${w}px; height: ${h}px; border-radius: 18px; overflow: hidden; background: #000; box-shadow: 0 24px 50px rgba(0,0,0,0.5); }
    .slot video { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }
    .lab { position: absolute; top: ${240 + h + 22}px; width: ${w}px; font-size: 26px; color: ${C.muted}; white-space: nowrap; }
  `;
  const labs = clips.map((_, i) => `"#s0-lab${i}"`).join(",");
  const js = [
    `tl.fromTo([${labs}].map(s => s + " .ch"), { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none", stagger: 0.012 }, 0.3);`,
    lineIn("#s0-l1", 0.45),
    lineOut("#s0-l1", 3.3),
    lineIn("#s0-l2", 3.5),
    lineOut("#s0-l2", dur - 0.3),
    `tl.to([${clips.map((_, i) => `"#s0-slot${i}"`).join(",")}, ${labs}], { opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power2.in", stagger: 0.03 }, ${f3(dur - 0.3)});`,
  ].join("\n    ");
  return scene("showcase", dur, css, body, js);
}

function sceneAsk(dur: number) {
  const r = cfg.request;
  const body = `
    <div id="s1-term" class="term" style="left:300px; top:210px; width:1320px; height:420px;">
      <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="name">${esc(r.agent)}</span></div>
      <div class="body" style="font-size:44px; line-height:1.45;"><span class="prompt">›</span>${typed(r.text)}</div>
    </div>
    ${line("s1-line", r.line, "left:300px; top:720px; font-size:68px;")}`;
  const chars = [...r.text.replace(/ /g, "")].length;
  const per = 0.034;
  const typeEnd = 0.35 + chars * per;
  const js = [
    typeIn("#s1-term", 0.35, per),
    lineIn("#s1-line", typeEnd + 0.35),
    `tl.to(["#s1-term", "#s1-line"], { opacity: 0, y: -18, filter: "blur(8px)", duration: 0.2, ease: "power3.in" }, ${f3(dur - 0.25)});`,
  ].join("\n    ");
  return scene("ask", dur, "", body, js);
}

function sceneDrawer(dur: number) {
  const body = `${line("s2-line", cfg.catalog.line, "left:360px; top:170px; font-size:64px;")}
    ${drawer("s2")}`;
  const tabs = cfg.catalog.tabs.map((_: string, i: number) => `"#s2-tab${i}"`).join(",");
  const js = [
    `tl.fromTo("#s2-drawer", { opacity: 0, y: 110, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }, 0.05);`,
    `tl.fromTo([${tabs}], { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.4, ease: "expo.out", stagger: 0.3 }, 1.9);`,
    lineIn("#s2-line", 1.35),
    lineOut("#s2-line", dur - 0.3),
  ].join("\n    ");
  return scene("drawer", dur, drawerCss, body, js);
}

function sceneSearch(dur: number) {
  const s = cfg.search;
  const pick = s.pick ?? 1;
  const body = `
    <div id="s3-bar" class="term" style="left:360px; top:110px; width:1200px; height:96px; border-radius:16px;">
      <div class="body" style="padding:22px 34px; font-size:36px; line-height:52px; white-space:nowrap;"><span class="prompt">›</span>${typed(s.command)}</div>
    </div>
    ${line("s3-line", s.line, "left:360px; top:100px; font-size:60px;")}
    ${drawer("s3", true)}
    ${bigCard("s3", { fields: false })}`;
  const chars = [...s.command.replace(/ /g, "")].length;
  const per = 0.028;
  const typeEnd = 0.45 + chars * per;
  const riseAt = typeEnd + 0.15;
  const grow = dur - 1.05;
  const others = s.results.map((_: any, i: number) => i).filter((i: number) => i !== pick).map((i: number) => `"#s3-mini${i}"`).join(",");
  const rot = [-5, 0, 5];
  const js = [
    `tl.set("#s3-callu", { scaleX: 0, transformOrigin: "0% 50%" }, 0);`,
    `tl.fromTo("#s3-bar", { opacity: 0, y: 12, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "expo.out" }, 0.05);`,
    typeIn("#s3-bar", 0.45, per),
    ...s.results.map(
      (_: any, i: number) =>
        `tl.fromTo("#s3-mini${i}", { y: 540, rotation: 0 }, { y: 0, rotation: ${rot[i] ?? 0}, duration: 0.75, ease: "expo.out" }, ${f3(riseAt + i * 0.12)});`,
    ),
    `tl.to("#s3-bar", { opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power2.in" }, ${f3(riseAt + 0.7)});`,
    lineIn("#s3-line", riseAt + 0.85),
    `tl.to("#s3-mini${pick}", { y: -18, scale: 1.04, duration: 0.45, ease: "power3.out" }, ${f3(riseAt + 1.6)});`,
    `tl.to([${others}], { opacity: 0.32, duration: 0.45, ease: "power2.out" }, ${f3(riseAt + 1.6)});`,
    lineOut("#s3-line", grow - 0.3),
    // object becomes the world: the picked card grows into the full index card
    `tl.fromTo("#s3-card", { opacity: 0, scale: 0.309, y: -228 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power2.inOut" }, ${f3(grow)});`,
    `tl.to("#s3-mini${pick}", { opacity: 0, duration: 0.25, ease: "power2.in" }, ${f3(grow + 0.05)});`,
    `tl.to(["#s3-drawer", ${others}], { opacity: 0, filter: "blur(15px)", duration: 0.35, ease: "power2.in" }, ${f3(grow)});`,
  ].join("\n    ");
  return scene("search", dur, drawerCss + bigCss, body, js);
}

function sceneCard(dur: number) {
  const c = cfg.card;
  const body = `${bigCard("s4", { fields: true })}
    ${line("s4-line", c.line, "left:930px; top:430px; font-size:68px;")}`;
  const js: string[] = [];
  let t = 0.3;
  c.fields.forEach((f: [string, string], i: number) => {
    js.push(`tl.fromTo("#s4-fl${i}", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, ${f3(t)});`);
    js.push(typeIn(`#s4-fv${i}`, t + 0.12, 0.014));
    t += 0.18 + [...f[1].replace(/ /g, "")].length * 0.014 + 0.25;
  });
  js.push(`tl.fromTo("#s4-fli", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, ${f3(t)});`);
  js.push(typeIn("#s4-fvi", t + 0.12, 0.014));
  t += 0.18 + [...c.install.replace(/ /g, "")].length * 0.014 + 0.35;
  js.push(`tl.fromTo("#s4-callu", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.45, ease: "expo.out" }, ${f3(t)});`);
  const move = Math.max(t + 1.6, dur - 3.9);
  js.push(`tl.to("#s4-card", { scale: 0.56, x: -492, duration: 0.85, ease: "power2.inOut" }, ${f3(move)});`);
  js.push(lineIn("#s4-line", move + 0.75));
  js.push(lineOut("#s4-line", dur - 0.3));
  return scene("card", dur, bigCss, body, js.join("\n    "));
}

function sceneShelf(dur: number) {
  const shelves = cfg.shelves;
  const top0 = 150;
  const comp = 250;
  const target = cfg.card.path;
  let targetBox = { x: 946, top: 230 };
  const spineHtml = (names: string[], own: boolean, x0: number, row: number, idp: string) => {
    let x = x0;
    return names
      .map((n, i) => {
        const isT = own && n === target;
        const w = isT ? 70 : 54 + ((i * 7) % 3) * 6;
        const h = isT ? Math.min(182, Math.max(130, n.length * 9 + 24)) : Math.min(182, Math.max(130, n.length * 7.9 + 20));
        const bottom = top0 + (row + 1) * comp - 22;
        const pal = own ? ["#ebe4d4", "#ddd3bf", "#f1ead9", "#d4c9b2"] : ["#3b4250", "#4a5262", "#323845", "#565e70"];
        const bg = pal[i % pal.length];
        const fg = own ? C.paperInk : "#dfe5ef";
        const isTarget = isT;
        const id = `${idp}${i}`;
        if (isTarget) targetBox = { x: x + w / 2, top: bottom - h };
        const html = `<div id="${isTarget ? "s5-target" : id}" class="spine" style="left:${x}px; top:${bottom - h}px; width:${w}px; height:${h}px; background:${bg}; color:${fg};">${
          isTarget ? `<div class="sp-band"></div>` : ""
        }<span${isTarget ? ' style="font-size:15px;font-weight:600"' : ""}>${esc(n)}</span></div>`;
        x += w + 6;
        return html;
      })
      .join("");
  };
  const bx = 960;
  const bw = 820;
  let spines = "";
  let boards = "";
  let plates = "";
  shelves.forEach((s: any, r: number) => {
    const boardTop = top0 + (r + 1) * comp - 22;
    boards += `<div id="s5-board${r}" class="board" style="left:${bx}px; top:${boardTop}px; width:${bw}px;"></div>`;
    const compTop = top0 + r * comp;
    plates += r === 0
      ? `<div id="s5-plate${r}" class="plate mono" style="right:${W - (bx + bw) + 18}px; top:${compTop + 6}px; text-align:right;">${esc(s.repo)}</div>`
      : `<div id="s5-plate${r}" class="plate mono" style="left:${bx + 18}px; top:${compTop + 6}px;">${esc(s.repo)}</div>`;
    spines += spineHtml(s.spines, s.own, bx + 18, r, `s5-sp${r}-`);
    if (s.repo2) {
      const x2 = bx + 18 + Math.max(s.spines.length * 66, s.repo.length * 15.6) + 40;
      boards += `<div class="divider board-div" style="left:${x2 - 20}px; top:${compTop + 10}px; height:${comp - 32}px;"></div>`;
      plates += `<div id="s5-plate${r}b" class="plate mono" style="left:${x2}px; top:${compTop + 6}px;">${esc(s.repo2)}</div>`;
      spines += spineHtml(s.spines2, false, x2, r, `s5-sq${r}-`);
    }
  });
  // where the call number sits once the card is scaled 0.56 and moved left (see sceneCard)
  // call-number column of the scaled card: x 126-268, y 420-508; the card's top edge is at y 333
  const call = { x: 197, y: 414 };
  const tgt = { x: targetBox.x, y: targetBox.top - 8 };
  const dInstall = `M${call.x},${call.y} L${call.x},318 C${call.x},170 ${tgt.x - 260},120 ${tgt.x},${tgt.y}`;
  const dSync = `M${tgt.x + 14},${tgt.y} C${tgt.x - 230},140 ${call.x + 34},190 ${call.x + 34},318 L${call.x + 34},${call.y}`;
  const body = `${bigCard("s5", { fields: true, shaSwap: true })}
    <div id="s5-case" class="case">${boards}${spines}${plates}</div>
    <div id="s5-tag" class="tag mono" style="left:${tgt.x + 40}px; top:108px;">${esc(cfg.install.tag)}</div>
    <div id="s5-ver" class="ver mono" style="left:${tgt.x - 70}px; top:${tgt.y - 84}px;"><span id="s5-ver-old">@${esc(cfg.card.sha)}</span><span id="s5-ver-new">@${esc(cfg.sync.to)}</span></div>
    <svg class="wires" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <mask id="s5-m1" maskUnits="userSpaceOnUse"><path id="s5-m1p" d="${dInstall}" pathLength="1" stroke="#fff" stroke-width="14" fill="none" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>
        <mask id="s5-m2" maskUnits="userSpaceOnUse"><path id="s5-m2p" d="${dSync}" pathLength="1" stroke="#fff" stroke-width="14" fill="none" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>
      </defs>
      <path id="s5-install" d="${dInstall}" pathLength="1" stroke="${C.accent}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="0.018 0.014" mask="url(#s5-m1)"/>
      <path id="s5-sync" d="${dSync}" pathLength="1" stroke="${C.muted}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="0.014 0.012" mask="url(#s5-m2)"/>
    </svg>
    ${line("s5-l1", cfg.install.line, "left:110px; top:800px; font-size:48px;")}
    ${line("s5-l2", cfg.sync.line, "left:110px; top:800px; font-size:48px;")}`;
  const css = `${bigCss}
    .case { position: absolute; inset: 0; }
    .board { position: absolute; height: 22px; background: #2b2b30; border-top: 1px solid rgba(255,255,255,0.12); box-shadow: 0 14px 22px rgba(0,0,0,0.5); }
    .divider { position: absolute; width: 4px; height: 200px; background: #26262b; }
    .spine { position: absolute; border-radius: 4px 4px 2px 2px; display: flex; align-items: center; justify-content: center; box-shadow: inset -6px 0 0 rgba(0,0,0,0.12); }
    .spine span { writing-mode: vertical-rl; font-family: 'IBM Plex Mono', monospace; font-size: 13px; white-space: nowrap; letter-spacing: 0.02em; }
    .spine .sp-band { position: absolute; left: 0; right: 0; top: 14px; height: 10px; background: ${C.accent}; }
    .plate { position: absolute; font-size: 26px; color: ${C.muted}; }
    .tag { position: absolute; font-size: 28px; color: ${C.accent}; white-space: nowrap; }
    .ver { position: absolute; width: 170px; height: 44px; font-size: 26px; }
    .ver span { position: absolute; left: 0; top: 0; padding: 4px 10px; background: ${C.paper}; color: ${C.paperInk}; border-radius: 6px; white-space: nowrap; }
    .wires { position: absolute; left: 0; top: 0; }
    .big .sha-new { color: ${C.accentInk}; }
  `;
  const allSpines = `#s5-case .spine`;
  const L = dur;
  const js = [
    `tl.set("#s5-card", { scale: 0.56, x: -492 }, 0);`,
    `tl.fromTo("#s5-case .board", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.6, ease: "expo.out", stagger: 0.12 }, 0.1);`,
    `tl.fromTo("${allSpines}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out", stagger: 0.02 }, 0.35);`,
    `tl.fromTo("#s5-case .board-div", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.5);`,
    `tl.fromTo("#s5-case .plate", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.08 }, 0.9);`,
    `tl.set(["#s5-tag", "#s5-ver", "#s5-sha-new", "#s5-ver-new"], { opacity: 0 }, 0);`,
    // install: the dashed path runs from the card's call number straight to the shelf, and the skill comes off it
    `tl.to("#s5-m1p", { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power2.inOut" }, 1.6);`,
    `tl.fromTo("#s5-target", { y: 0, rotation: 0, transformOrigin: "50% 100%" }, { y: -46, rotation: -7, duration: 0.5, ease: "power3.out" }, 2.5);`,
    `tl.fromTo("#s5-tag", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }, 2.75);`,
    lineIn("#s5-l1", 2.9),
    lineOut("#s5-l1", 5.5),
    `tl.to(["#s5-install", "#s5-tag"], { opacity: 0, duration: 0.25, ease: "power2.in" }, 5.4);`,
    `tl.to("#s5-target", { y: 0, rotation: 0, duration: 0.4, ease: "power3.inOut" }, 5.5);`,
    // sync: the source changes, and the card follows it
    `tl.fromTo("#s5-ver", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 5.95);`,
    `tl.to("#s5-ver-old", { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" }, 6.4);`,
    `tl.fromTo("#s5-ver-new", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" }, 6.5);`,
    `tl.to("#s5-m2p", { attr: { "stroke-dashoffset": 0 }, duration: 0.85, ease: "power2.inOut" }, 6.7);`,
    `tl.to("#s5-sha-old", { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" }, 7.5);`,
    `tl.fromTo("#s5-sha-new", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" }, 7.6);`,
    lineIn("#s5-l2", 7.45),
    // whip out to the left
    `tl.to(["#s5-card", "#s5-case", "#s5-ver", ".wires", "#s5-l2"], { x: "-=220", opacity: 0, filter: "blur(12px)", duration: 0.3, ease: "power3.in" }, ${f3(L - 0.32)});`,
  ].join("\n    ");
  return scene("shelf", dur, css, body, js);
}

function sceneResult(dur: number) {
  const r = cfg.result;
  const rows = r.lines
    .map((l: any, i: number) => {
      if (l.kind === "cmd") return `<div id="s6-r${i}" class="r-row"><span class="prompt">›</span>${typed(l.text)}</div>`;
      if (l.kind === "ok") return `<div id="s6-r${i}" class="r-row r-ok"><span class="okm">✓</span> ${esc(l.text)}</div>`;
      return `<div id="s6-r${i}" class="r-row r-prog"><span class="p-lab">${esc(l.text)}</span><span class="p-track"><span id="s6-fill" class="p-fill"></span></span></div>`;
    })
    .join("");
  const covers = r.covers
    .map(
      (c: [string, string], i: number) => `<div id="s6-st${i}" class="stamp"><div class="cover" style="background:
        radial-gradient(circle at ${30 + ((i * 23) % 40)}% ${35 + ((i * 17) % 30)}%, ${c[1]} 0 21%, transparent 22%),
        linear-gradient(${120 + i * 35}deg, ${c[0]} 0 58%, ${c[1]}33 58% 100%), ${c[0]};"></div></div>`,
    )
    .join("");
  const body = `
    <div id="s6-term" class="term" style="left:150px; top:200px; width:1060px; height:520px;">
      <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="name">${esc(cfg.request.agent)}</span></div>
      <div class="body" style="font-size:28px; line-height:64px; padding:30px 36px;">${rows}</div>
    </div>
    <div id="s6-phone" class="phone"><div id="s6-screen" class="screen" style="background:${r.covers[0][0]};">${covers}</div><div class="notch"></div></div>
    ${line("s6-line", r.line, "left:150px; top:780px; font-size:56px;")}`;
  const css = `
    .r-row { white-space: nowrap; }
    .r-ok { color: #9be3bf; }
    .okm { color: #3ecf8e; }
    .r-prog { display: flex; align-items: center; gap: 22px; color: ${C.muted}; }
    .p-track { display: inline-block; width: 560px; height: 14px; border-radius: 7px; background: #26262b; overflow: hidden; }
    .p-fill { display: block; width: 100%; height: 100%; background: ${C.accent}; }
    .phone { position: absolute; left: 1270px; top: 130px; width: 420px; height: 820px; border-radius: 64px; background: #0f0f11; border: 12px solid #2a2a2f; box-shadow: 0 30px 70px rgba(0,0,0,0.55); overflow: hidden; }
    .notch { position: absolute; left: 140px; top: 14px; width: 116px; height: 32px; border-radius: 16px; background: #0b0b0c; }
    .screen { position: absolute; inset: 0; perspective: 1200px; }
    .stamp { position: absolute; left: 63px; top: 220px; width: 270px; height: 340px; padding: 12px; background: #fbfaf6;
      -webkit-mask: radial-gradient(circle 7px, #0000 97%, #000) -9px -9px / 18px 18px, linear-gradient(#000 0 0) content-box;
      -webkit-mask-composite: source-over; }
    .stamp .cover { width: 100%; height: 100%; }
  `;
  const n = r.lines.length;
  const js: string[] = [
    `tl.fromTo("#s6-term", { opacity: 0, x: 220, filter: "blur(12px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, 0);`,
    `tl.set([${Array.from({ length: n }, (_, i) => `"#s6-r${i}"`).join(",")}], { opacity: 0 }, 0);`,
  ];
  let t = 0.45;
  r.lines.forEach((l: any, i: number) => {
    js.push(`tl.set("#s6-r${i}", { opacity: 1 }, ${f3(t)});`);
    if (l.kind === "cmd") {
      js.push(typeIn(`#s6-r${i}`, t, 0.018));
      t += [...l.text.replace(/ /g, "")].length * 0.018 + 0.25;
    } else if (l.kind === "progress") {
      js.push(`tl.fromTo("#s6-fill", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1.1, ease: "none" }, ${f3(t + 0.05)});`);
      t += 1.3;
    } else {
      js.push(`tl.fromTo("#s6-r${i}", { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25, ease: "expo.out" }, ${f3(t)});`);
      t += 0.3;
    }
  });
  const phoneAt = t - 0.1;
  const stamps = r.covers.length;
  js.push(`tl.fromTo("#s6-phone", { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "expo.out" }, ${f3(phoneAt)});`);
  for (let i = 0; i < stamps; i++) {
    js.push(`tl.set("#s6-st${i}", { x: ${i === 0 ? 0 : 360}, rotationY: -14, rotation: -3, zIndex: ${stamps - i} }, 0);`);
  }
  const swipeGap = 0.9;
  for (let i = 0; i < Math.min(stamps - 1, Math.floor((dur - phoneAt - 0.9) / swipeGap)); i++) {
    const at = phoneAt + 0.75 + i * swipeGap;
    js.push(`tl.to("#s6-st${i}", { x: -470, rotation: -9, duration: 0.5, ease: "power3.inOut" }, ${f3(at)});`);
    js.push(`tl.to("#s6-st${i + 1}", { x: 0, rotation: -3, duration: 0.5, ease: "power3.inOut" }, ${f3(at)});`);
    js.push(`tl.to("#s6-screen", { backgroundColor: "${r.covers[i + 1][0]}", duration: 0.45, ease: "power2.inOut" }, ${f3(at + 0.05)});`);
  }
  js.push(lineIn("#s6-line", phoneAt + 0.35));
  js.push(`tl.to(["#s6-term", "#s6-phone", "#s6-line"], { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${f3(dur - 0.25)});`);
  return scene("result", dur, css, body, js.join("\n    "));
}

function sceneEnd(dur: number) {
  const body = line("s7-line", cfg.end.line, "left:192px; top:390px; font-size:96px; line-height:1.12;");
  const js = [
    `tl.fromTo("#s7-line .w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power2.out", stagger: 0.09 }, 0.25);`,
  ].join("\n    ");
  return scene("end", dur, "", body, js);
}

// ---------- assemble ----------
const order: Array<[string, number, (d: number) => string]> = [
  ["ask", T.ask, sceneAsk],
  ["drawer", T.drawer, sceneDrawer],
  ["search", T.search, sceneSearch],
  ["card", T.card, sceneCard],
  ["shelf", T.shelf, sceneShelf],
  ["result", T.result, sceneResult],
  ["end", T.end, sceneEnd],
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "compositions"), { recursive: true });
mkdirSync(join(OUT, "assets"), { recursive: true });

const showDur = T.showcase ?? 7;
const showClips = prepareShowcase(showDur);
if (showClips.length) order.unshift(["showcase", showDur, (d: number) => sceneShowcase(d, showClips)]);

let at = 0;
const hosts: string[] = [];
for (const [id, dur, build] of order) {
  writeFileSync(join(OUT, "compositions", `${id}.html`), build(dur));
  hosts.push(
    `<div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${f3(at)}" data-duration="${f3(dur)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:10"></div>`,
  );
  at += dur;
}
const total = f3(at);

// optional music bed: music.mp3 / .m4a / .wav next to make.command
let audio = "";
for (const ext of ["mp3", "m4a", "wav"]) {
  const src = join(ROOT, `music.${ext}`);
  if (existsSync(src)) {
    copyFileSync(src, join(OUT, "assets", `music.${ext}`));
    audio = `<audio id="music" class="clip" src="assets/music.${ext}" data-start="0" data-duration="${total}" data-volume="0.55" data-fade-out="1.5" data-track-index="5"></audio>`;
    break;
  }
}

const noise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`;

const index = `<!doctype html>
<html lang="${esc(cfg.output.lang ?? "en")}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.ground}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #ground { position: absolute; inset: 0; background: ${C.ground}; }
      #desk { position: absolute; left: 0; right: 0; top: 900px; bottom: 0; background: ${C.desk}; border-top: 1px solid rgba(255,255,255,0.05); }
      #grain { position: absolute; inset: 0; background-image: ${noise}; opacity: 0.05; mix-blend-mode: screen; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
      <div id="ground"></div><div id="desk"></div><div id="grain"></div>
      ${hosts.join("\n      ")}
      ${audio}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true }).set({}, {}, ${total});
    </script>
  </body>
</html>
`;
writeFileSync(join(OUT, "index.html"), index);
writeFileSync(
  join(OUT, "hyperframes.json"),
  JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", assets: "assets" } }, null, 2),
);
console.log(`built ${OUT} · ${order.length} scenes · ${total}s${audio ? " · with music" : " · silent"}`);
