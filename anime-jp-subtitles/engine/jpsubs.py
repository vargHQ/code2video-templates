#!/usr/bin/env python3
"""Japanese anime-style subtitles over any video, as a HyperFrames project.

  python3 engine/jpsubs.py subs.json            # → out/hf/ (HyperFrames project); then render with make.command

Styles (one per entry in subs.json "subs"):
  fansub    Japanese line + small English line at the bottom, thick black outline; "karaoke": true sweeps a colour
            across the Japanese line from start to end (anime OP/ED karaoke).
  telop     Japanese TV variety caption: heavy gothic, every character pops in with a bounce, coloured double outline,
            hard drop shadow; "shake": true jitters it on twos while held.
  tategaki  vertical (縦書き) narration column on the side, characters type in one by one, a black ink box.
  sfx       katakana onomatopoeia stamp (ドン!!, ゴゴゴ, キッ): characters slam in from scale 2.4 and shake on twos.

Everything is deterministic: positions/jitter come from random.Random(seed) at build time, every frame is a function
of timeline time (GSAP timeline registered in window.__timelines), so seeking and rendering are exact.
Fonts: Dela Gothic One (display) and Noto Sans JP (text), both SIL OFL, subset to the characters actually used."""
import json, os, random, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
F = 1 / 30
FONTS = {
    "dela": ("DelaGothicOne-Regular.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf"),
    "noto": ("NotoSansJP-wght.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"),
}


def fetch(src, base):
    """Local path (relative to the config) or an http(s) URL, downloaded once into examples/."""
    if not str(src).startswith("http"):
        return (base / src).resolve()
    dst = ROOT / "examples" / src.rsplit("/", 1)[-1]
    if not dst.exists():
        dst.parent.mkdir(exist_ok=True)
        print("downloading", src)
        subprocess.run(["curl", "-sSL", "-o", str(dst), src], check=True)
    return dst


def f3(t):
    return f"{t:.3f}"


def frange(a, b, step):
    out, t = [], a
    while t < b - 1e-6:
        out.append(round(t, 4)); t += step
    return out


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


class Lanes:
    def __init__(self):
        self.n = 2

    def __call__(self):
        self.n += 1
        return self.n


LANE = Lanes()


def clip(id_, t0, t1, inner, style=""):
    st = f' style="{style}"' if style else ""
    return f'<div id="{id_}" class="clip jl" data-start="{f3(t0)}" data-duration="{f3(t1 - t0)}" data-track-index="{LANE()}"{st}>{inner}</div>'


CSS = """
.jl { position: absolute; inset: 0; pointer-events: none; }
.ch { display: inline-block; opacity: 0; }
/* fansub */
.fs { position: absolute; left: 40px; right: 40px; text-align: center; }
.fs-jp { position: relative; display: inline-block; white-space: nowrap; font-family: 'Noto JP', sans-serif; font-weight: 800; line-height: 1.15;
         color: #fff; -webkit-text-stroke: 12px #000; paint-order: stroke fill; text-shadow: 0 6px 14px rgba(0,0,0,.6); }
.fs-kara { position: absolute; left: 0; top: 0; white-space: nowrap; color: var(--k); -webkit-text-stroke: 12px #000; paint-order: stroke fill; }
.fs-en { margin-top: 10px; font-family: 'Noto JP', sans-serif; font-weight: 600; font-style: italic; color: #fff7c2;
         -webkit-text-stroke: 7px #000; paint-order: stroke fill; }
/* telop */
.tp { position: absolute; left: 30px; right: 30px; text-align: center; font-family: 'Dela', sans-serif; line-height: 1.1; }
.tp-w { position: relative; display: inline-block; }
.tp-back, .tp-front { white-space: nowrap; }
.tp-back { position: absolute; left: 0; top: 0; color: var(--o); -webkit-text-stroke: var(--ow) var(--o); paint-order: stroke fill;
           text-shadow: var(--sd) var(--sd) 0 rgba(0,0,0,.9); }
.tp-front { position: relative; color: var(--c); -webkit-text-stroke: var(--iw) #fff; paint-order: stroke fill; }
/* tategaki */
.tg { position: absolute; top: 0; writing-mode: vertical-rl; font-family: 'Noto JP', sans-serif; font-weight: 800;
      line-height: 1.25; letter-spacing: .08em; color: #fff; background: rgba(0,0,0,.86); padding: 28px 18px;
      border: 5px solid #fff; box-shadow: 10px 10px 0 rgba(0,0,0,.55); }
/* sfx */
.sx { position: absolute; font-family: 'Dela', sans-serif; line-height: 1; white-space: nowrap; }
.sx.v { writing-mode: vertical-rl; }
.sx-j { display: inline-block; }
.sx .ch { color: var(--f); -webkit-text-stroke: var(--sw) var(--s); paint-order: stroke fill; text-shadow: var(--sh); }
"""


def fit(size, text, W, margin=100, em=1.0):
    """Largest size ≤ size that keeps `text` on one line: CJK glyphs are ~1 em wide, Latin ~0.6 em."""
    w = sum(em if ord(c) > 0x2E7F else 0.6 for c in text)
    return min(size, int((W - margin) / max(w, 1)))


def chars_html(id_, text):
    """One span per character (ids skip line breaks: "\n" becomes <br>)."""
    out, k = [], 0
    for c in text:
        if c == "\n":
            out.append("<br>"); continue
        out.append(f'<span id="{id_}-c{k}" class="ch">{esc(c) if c != " " else "&nbsp;"}</span>'); k += 1
    return "".join(out)


def nchars(text):
    return len(text.replace("\n", ""))


def fansub(i, s, W, H):
    t0, t1 = s["start"], s["end"]
    size = fit(s.get("size", 76), s["jp"], W, margin=140, em=1.0); y = s.get("y", H - 470)
    jp, en = s["jp"], s.get("en", "")
    kara = s.get("karaoke", False); kc = s.get("karaoke_color", "#ffd23d")
    k_html = f'<span id="fs{i}-k" class="fs-kara" style="--k:{kc};clip-path:inset(0% 100% 0% 0%)">{esc(jp)}</span>' if kara else ""
    en_html = f'<div id="fs{i}-en" class="fs-en" style="font-size:{round(size * .52)}px">{esc(en)}</div>' if en else ""
    inner = f'<div id="fs{i}" class="fs" style="top:{y}px"><span class="fs-jp" style="font-size:{size}px">{esc(jp)}{k_html}</span>{en_html}</div>'
    js = [f'tl.fromTo("#fs{i}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:0.12,ease:"power2.out"}},{f3(t0)});',
          f'tl.fromTo("#fs{i}",{{opacity:1}},{{opacity:0,duration:0.1,immediateRender:false}},{f3(t1 - 0.1)});']
    if kara:
        a, b = s.get("karaoke_from", t0), s.get("karaoke_to", t1 - 0.15)
        js.append(f'tl.fromTo("#fs{i}-k",{{clipPath:"inset(0% 100% 0% 0%)"}},{{clipPath:"inset(0% 0% 0% 0%)",duration:{f3(b - a)},ease:"none"}},{f3(a)});')
    return [clip(f"fs{i}-l", t0, t1, inner)], js


def telop(i, s, W, H, rnd):
    t0, t1 = s["start"], s["end"]
    size = fit(s.get("size", 120), max(s["jp"].split("\n"), key=len), W, margin=170, em=1.08); y = s.get("y", H - 640 if s.get("pos", "bottom") == "bottom" else 260)
    c, o = s.get("color", "#ffd23d"), s.get("outline", "#e3122f")
    style = f"top:{y}px;font-size:{size}px;--c:{c};--o:{o};--ow:{round(size * .34)}px;--iw:{round(size * .14)}px;--sd:{round(size * .07)}px"
    back = chars_html(f"tpb{i}", s["jp"]); front = chars_html(f"tpf{i}", s["jp"])
    inner = (f'<div class="tp" style="{style}"><div id="tp{i}" class="tp-w" style="transform:rotate({s.get("rot", -3)}deg)">'
             f'<div class="tp-back">{back}</div><div class="tp-front">{front}</div></div></div>')
    js = []
    for k in range(nchars(s["jp"])):
        t = t0 + k * s.get("stagger", F)
        js.append(f'tl.fromTo("#tpb{i}-c{k},#tpf{i}-c{k}",{{opacity:0,scale:0,y:-40}},{{opacity:1,scale:1,y:0,duration:0.22,ease:"back.out(3)"}},{f3(t)});')
    js.append(f'tl.fromTo("#tp{i}",{{scale:1}},{{scale:1.25,opacity:0,duration:0.12,ease:"power2.in",immediateRender:false}},{f3(t1 - 0.12)});')
    if s.get("shake"):
        for t in frange(t0 + 0.2, t1 - 0.12, 2 * F):
            js.append(f'tl.set("#tp{i}",{{x:{rnd.uniform(-6, 6):.1f},y:{rnd.uniform(-6, 6):.1f}}},{f3(t)});')
    return [clip(f"tp{i}-l", t0, t1, inner)], js


def tategaki(i, s, W, H):
    t0, t1 = s["start"], s["end"]
    size = s.get("size", 64); side = s.get("side", "right")
    x = s.get("x", W - size * 2 - 90 if side == "right" else 60); y = s.get("y", 300)
    inner = f'<div id="tg{i}" class="tg" style="left:{x}px;top:{y}px;font-size:{size}px">{chars_html(f"tg{i}", s["jp"])}</div>'
    js = [f'tl.fromTo("#tg{i}",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.18,ease:"expo.out"}},{f3(t0)});',
          f'tl.fromTo("#tg{i}",{{opacity:1}},{{opacity:0,duration:0.12,immediateRender:false}},{f3(t1 - 0.12)});']
    step = min(s.get("type_step", 3 * F), max(F, (t1 - t0 - 0.4) / max(1, len(s["jp"]))))
    for k in range(len(s["jp"])):
        js.append(f'tl.set("#tg{i}-c{k}",{{opacity:1}},{f3(t0 + 0.12 + k * step)});')
    return [clip(f"tg{i}-l", t0, t1, inner)], js


def sfx(i, s, rnd):
    t0, t1 = s["start"], s["end"]
    size = s.get("size", 200); sw = round(size * .16)
    sh = s.get("shadow", f"{round(size * .05)}px {round(size * .06)}px 0 {s.get('shadow_color', '#e3122f')}")
    style = (f"left:{s.get('x', 80)}px;top:{s.get('y', 260)}px;font-size:{size}px;transform:rotate({s.get('rot', -8)}deg);"
             f"--f:{s.get('color', '#ffffff')};--s:{s.get('stroke', '#000000')};--sw:{sw}px;--sh:{sh}")
    inner = f'<div class="sx{" v" if s.get("vertical") else ""}" style="{style}"><span id="sx{i}-j" class="sx-j">{chars_html(f"sx{i}", s["jp"])}</span></div>'
    js = []
    for k in range(len(s["jp"])):
        r = rnd.uniform(-9, 9); t = t0 + k * 2 * F
        js.append(f'tl.fromTo("#sx{i}-c{k}",{{opacity:0,scale:2.4,rotation:{r * 2.5:.1f}}},{{opacity:1,scale:1,rotation:{r:.1f},duration:0.13,ease:"expo.out"}},{f3(t)});')
        js.append(f'tl.fromTo("#sx{i}-c{k}",{{opacity:1}},{{opacity:0,scale:1.18,duration:0.09,ease:"power1.in",immediateRender:false}},{f3(t1 - 0.09)});')
    for t in frange(t0 + 0.12, t1 - 0.09, 2 * F):
        js.append(f'tl.set("#sx{i}-j",{{x:{rnd.uniform(-5, 5):.1f},y:{rnd.uniform(-5, 5):.1f}}},{f3(t)});')
    return [clip(f"sx{i}-l", t0, t1, inner)], js


def fonts(out_assets, text):
    """Download the OFL fonts once (engine/fonts/), subset them to `text` as woff2 (needs uv or fonttools+brotli)."""
    src_dir = HERE / "fonts"; src_dir.mkdir(exist_ok=True)
    chars = "".join(sorted(set(text + "".join(chr(c) for c in range(32, 127)) + "、。！？「」…ー・!?")))
    (out_assets / "fonts").mkdir(parents=True, exist_ok=True)
    (src_dir / "chars.txt").write_text(chars, encoding="utf-8")
    for key, (name, url) in FONTS.items():
        f = src_dir / name
        if not f.exists():
            print("downloading", name)
            subprocess.run(["curl", "-sSL", "-o", str(f), url], check=True)
        out = out_assets / "fonts" / f"{key}.woff2"
        args = [str(f), f"--text-file={src_dir / 'chars.txt'}", "--flavor=woff2", f"--output-file={out}", "--layout-features=*"]
        if shutil.which("pyftsubset"):
            subprocess.run(["pyftsubset", *args], check=True)
        else:
            subprocess.run(["uvx", "--from", "fonttools", "--with", "brotli", "pyftsubset", *args], check=True)


def build(cfg_path):
    cfg_path = Path(cfg_path).resolve()
    cfg = json.load(open(cfg_path))
    base = cfg_path.parent
    W, H = cfg.get("width", 1080), cfg.get("height", 1920)
    out = ROOT / cfg.get("out", "out/hf")
    (out / "compositions").mkdir(parents=True, exist_ok=True); (out / "assets").mkdir(exist_ok=True)
    video = fetch(cfg["video"], base)
    dur = cfg.get("duration") or float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                                                      capture_output=True, text=True).stdout)
    # the background, scaled once to the frame
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-t", f3(dur), "-vf",
                    f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30", "-c:v", "libx264", "-crf", "16",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", str(out / "assets" / "bg.mp4")], check=True)
    rnd = random.Random(cfg.get("seed", 7))
    html, js = [], []
    for i, s in enumerate(cfg["subs"]):
        st = s.get("style", "fansub")
        h, j = (fansub(i, s, W, H) if st == "fansub" else telop(i, s, W, H, rnd) if st == "telop" else
                tategaki(i, s, W, H) if st == "tategaki" else sfx(i, s, rnd))
        html += h; js += j
    fonts(out / "assets", "".join(s["jp"] + s.get("en", "") for s in cfg["subs"]))
    font_css = ("@font-face { font-family: 'Dela'; src: url('assets/fonts/dela.woff2') format('woff2'); font-display: block; }\n"
                "@font-face { font-family: 'Noto JP'; src: url('assets/fonts/noto.woff2') format('woff2'); font-weight: 100 900; font-display: block; }")
    comp = f"""<template>
  <style>
{font_css}
    #root {{ position: absolute; inset: 0; overflow: hidden; pointer-events: none; }}
{CSS}
  </style>
  <div id="root" data-composition-id="subs" data-width="{W}" data-height="{H}" data-layout-allow-overlap>
    {chr(10).join('    ' + h for h in html).strip()}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      {chr(10).join('      ' + x for x in js).strip()}
      tl.set({{}}, {{}}, {f3(dur)});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["subs"] = tl;
    }})();
  </script>
</template>
"""
    (out / "compositions" / "subs.html").write_text(comp, encoding="utf-8")
    (out / "index.html").write_text(f"""<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
      #bg {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{f3(dur)}" data-width="{W}" data-height="{H}">
      <video id="bg" class="clip" src="assets/bg.mp4" playsinline data-has-audio="true" data-volume="1" data-start="0" data-duration="{f3(dur)}" data-media-start="0" data-track-index="1" style="z-index:10"></video>
      <div id="subs" data-composition-id="subs" data-composition-src="compositions/subs.html" class="clip" data-start="0" data-duration="{f3(dur)}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index:50"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }}).set({{}}, {{}}, {f3(dur)});
    </script>
  </body>
</html>
""", encoding="utf-8")
    for name, body in {"hyperframes.json": {"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
                                            "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
                                            "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"}},
                       "meta.json": {"id": "anime-jp-subtitles", "name": "anime-jp-subtitles", "createdAt": "2026-10-26T00:00:00.000Z"},
                       "package.json": {"name": "anime-jp-subtitles-render", "private": True, "type": "module"}}.items():
        (out / name).write_text(json.dumps(body, indent=2))
    print(f"{out}: {len(cfg['subs'])} subtitles, {len(js)} tweens, {dur:.2f}s")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else ROOT / "subs.json")
