#!/usr/bin/env python3
"""Anime / manga triple split (三分割): three live video panels slam onto screentone paper on the beats, thick ink
borders, slanted gutters, an impact flash per panel, then the page tears away. Builds a HyperFrames project.

  python3 engine/split.py split.json          # → out/hf/ ; make.command renders it to MP4 + GIF

Layouts: rows (three stacked panels, slanted gutters: the classic anime/manga split for 9:16),
         columns (three side-by-side panels: three faces / reaction shots, great for 16:9),
         staircase (rows whose panels are inset left/right like a manga page).
Every frame is a function of timeline time: GSAP timeline only, seeded randomness at build time."""
import json, random, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
F = 1 / 30
DELA = ("DelaGothicOne-Regular.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf")


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


def polygons(layout, W, H, m=40, g=40, s=120):
    """Three panel polygons [(x, y), ...] in frame pixels."""
    P = []
    if layout in ("rows", "staircase"):
        h = (H - 2 * m - 2 * g) / 3
        for k in range(3):
            y0 = m + k * (h + g); y1 = y0 + h
            top = s / 2 if k > 0 else 0; bot = s / 2 if k < 2 else 0
            l, r = m, W - m
            if layout == "staircase":
                l, r = (m, W - m - 90) if k % 2 == 0 else (m + 90, W - m)
            P.append([(l, y0 + top), (r, y0 - top), (r, y1 - bot), (l, y1 + bot)])
    else:  # columns
        w = (W - 2 * m - 2 * g) / 3
        for k in range(3):
            x0 = m + k * (w + g); x1 = x0 + w
            lt = s / 2 if k > 0 else 0; rt = s / 2 if k < 2 else 0
            P.append([(x0 + lt, m), (x1 + rt, m), (x1 - rt, H - m), (x0 - lt, H - m)])
    return P


def centre(poly):
    return sum(p[0] for p in poly) / len(poly), sum(p[1] for p in poly) / len(poly)


FROM = {"left": "x:-{W}", "right": "x:{W}", "top": "y:-{H}", "bottom": "y:{H}"}


def build(cfg_path):
    cfg_path = Path(cfg_path).resolve(); base = cfg_path.parent
    cfg = json.load(open(cfg_path))
    W, H = cfg.get("width", 1080), cfg.get("height", 1920)
    out = ROOT / cfg.get("out", "out/hf")
    for d in ("compositions", "assets/video", "assets/fonts"):
        (out / d).mkdir(parents=True, exist_ok=True)
    layout = cfg.get("layout", "rows")
    t_in, t_out = cfg["t_in"], cfg["t_out"]
    beats = cfg.get("beats") or [t_in, t_in + 0.45, t_in + 0.9]
    paper, ink = cfg.get("paper", "#f4efe4"), cfg.get("ink", "#0b0b0b")
    polys = polygons(layout, W, H, cfg.get("margin", 40), cfg.get("gutter", 40), cfg.get("slant", 120))

    def stage(src, name):
        dst = out / "assets" / "video" / name
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(fetch(src, base)), "-vf",
                        f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30", "-c:v", "libx264", "-crf", "16",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", str(dst)], check=True)
        return f"assets/video/{name}"

    bg = cfg.get("background")
    dur = cfg.get("duration") or (t_out + 0.5)
    bg_html = ""
    if bg:
        src = stage(bg["video"], "bg.mp4")
        bg_html = (f'<video id="bg" class="clip" src="{src}" playsinline data-has-audio="true" data-volume="1" data-start="0" '
                   f'data-duration="{f3(dur)}" data-media-start="{bg.get("media_start", 0)}" data-track-index="1" style="z-index:10"></video>')

    html, js, lane = [], [], [10]

    def L():
        lane[0] += 1
        return lane[0]

    panels_html = []
    for k, (p, poly) in enumerate(zip(cfg["panels"], polys)):
        src = stage(p["video"], f"panel{k}.mp4")
        b = beats[k]
        cx, cy = centre(poly)
        dx, dy = p.get("focus", [0, 0]); z = p.get("zoom", 1.0)
        ox, oy = cx - W / 2 + dx, cy - H / 2 + dy        # video centre on the panel centre (+ manual focus)
        cp = "polygon(" + ",".join(f"{x:.0f}px {y:.0f}px" for x, y in poly) + ")"
        pts = " ".join(f"{x:.0f},{y:.0f}" for x, y in poly)
        vid = (f'<video id="v{k}" class="clip pv" src="{src}" muted playsinline data-start="{f3(b)}" data-duration="{f3(t_out - b)}" '
               f'data-media-start="{p.get("media_start", 0)}" data-track-index="{L()}"></video>')
        panels_html.append(
            f'<div id="p{k}" class="pn"><div class="pc" style="clip-path:{cp}"><div id="f{k}" class="pf">{vid}</div>'
            f'<div id="fl{k}" class="pfl"></div></div>'
            f'<svg class="pb" viewBox="0 0 {W} {H}"><polygon points="{pts}" fill="none" stroke="{ink}" stroke-width="{cfg.get("border", 14)}" stroke-linejoin="miter"/></svg></div>')
        frm = FROM[p.get("from", ["left", "right", "bottom"][k])].format(W=W + 200, H=H + 200)
        js += [f'tl.set("#p{k}",{{opacity:1}},{f3(b)});',
               f'tl.fromTo("#p{k}",{{{frm}}},{{x:0,y:0,duration:0.16,ease:"expo.out"}},{f3(b)});',
               f'tl.fromTo("#f{k}",{{x:{ox:.0f},y:{oy:.0f},scale:{z * 1.08:.3f}}},{{x:{ox:.0f},y:{oy:.0f},scale:{z:.3f},duration:{f3(t_out - b)},ease:"power1.out"}},{f3(b)});',
               f'tl.fromTo("#fl{k}",{{opacity:0.85}},{{opacity:0,duration:0.12,ease:"power2.out",immediateRender:false}},{f3(b + 0.1)});']
        out_dir = cfg.get("exit", "alternate")
        if out_dir != "cut":
            js.append(f'tl.fromTo("#p{k}",{{x:0}},{{x:{(W + 300) if k % 2 else -(W + 300)},duration:0.14,ease:"power3.in",immediateRender:false}},{f3(t_out - 0.15 + k * 0.01)});')
    tone = cfg.get("tone", True)
    paper_css = (f"radial-gradient(circle, rgba(0,0,0,.22) 30%, transparent 33%) 0 0 / 16px 16px, {paper}" if tone else paper)
    html.append(f'<div id="pg" class="clip" data-start="{f3(t_in)}" data-duration="{f3(t_out - t_in)}" data-track-index="{L()}" data-layout-allow-overlap>'
                f'<div id="paper" style="position:absolute;inset:0;opacity:0;background:{paper_css}"></div>{"".join(panels_html)}</div>')
    js += [f'tl.fromTo("#paper",{{opacity:0}},{{opacity:1,duration:0.08}},{f3(t_in)});',
           f'tl.fromTo("#paper",{{opacity:1}},{{opacity:0,duration:0.1,immediateRender:false}},{f3(t_out - 0.1)});']

    font_css = ""
    sx = cfg.get("sfx")
    if sx:
        name, url = DELA
        fsrc = HERE / "fonts" / name; fsrc.parent.mkdir(exist_ok=True)
        if not fsrc.exists():
            subprocess.run(["curl", "-sSL", "-o", str(fsrc), url], check=True)
        txt = HERE / "fonts" / "chars.txt"; txt.write_text(sx["jp"] + "!?", encoding="utf-8")
        args = [str(fsrc), f"--text-file={txt}", "--flavor=woff2", f"--output-file={out / 'assets/fonts/dela.woff2'}"]
        subprocess.run(["uvx", "--from", "fonttools", "--with", "brotli", "pyftsubset", *args], check=True)
        font_css = "@font-face { font-family: 'Dela'; src: url('assets/fonts/dela.woff2') format('woff2'); font-display: block; }"
        rnd = random.Random(cfg.get("seed", 9)); size = sx.get("size", 130); t0 = sx.get("t", beats[-1] + 0.1); t1 = sx.get("end", t_out - 0.12)
        spans = "".join(f'<span id="sx-c{k}" class="ch">{c}</span>' for k, c in enumerate(sx["jp"]))
        html.append(f'<div id="sxl" class="clip" data-start="{f3(t0)}" data-duration="{f3(t1 - t0)}" data-track-index="{L()}" style="position:absolute;inset:0">'
                    f'<div class="sx" style="left:{sx.get("x", 560)}px;top:{sx.get("y", H * 0.58):.0f}px;font-size:{size}px;transform:rotate({sx.get("rot", 10)}deg);'
                    f'--sw:{round(size * .16)}px;--sh:{round(size * .05)}px {round(size * .07)}px 0 {sx.get("shadow_color", "#e3122f")}"><span id="sx-j" style="display:inline-block">{spans}</span></div></div>')
        for k in range(len(sx["jp"])):
            r = rnd.uniform(-9, 9)
            js.append(f'tl.fromTo("#sx-c{k}",{{opacity:0,scale:2.4,rotation:{r * 2.5:.1f}}},{{opacity:1,scale:1,rotation:{r:.1f},duration:0.13,ease:"expo.out"}},{f3(t0 + k * 2 * F)});')
        for t in frange(t0 + 0.12, t1, 2 * F):
            js.append(f'tl.set("#sx-j",{{x:{rnd.uniform(-4, 4):.1f},y:{rnd.uniform(-4, 4):.1f}}},{f3(t)});')

    comp = f"""<template>
  <style>
    {font_css}
    #root {{ position: absolute; inset: 0; overflow: hidden; pointer-events: none; }}
    .pn {{ position: absolute; inset: 0; opacity: 0; }}
    .pc {{ position: absolute; inset: 0; }}
    .pf {{ position: absolute; inset: 0; transform-origin: 50% 50%; }}
    .pv {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; object-fit: cover; }}
    .pfl {{ position: absolute; inset: 0; background: #fff; opacity: 0; }}
    .pb {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; overflow: visible; }}
    .sx {{ position: absolute; font-family: 'Dela', sans-serif; line-height: 1; white-space: nowrap; }}
    .ch {{ display: inline-block; opacity: 0; color: #fff; -webkit-text-stroke: var(--sw) #000; paint-order: stroke fill; text-shadow: var(--sh); }}
  </style>
  <div id="root" data-composition-id="split" data-width="{W}" data-height="{H}" data-layout-allow-overlap>
    {chr(10).join('    ' + h for h in html).strip()}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      {chr(10).join('      ' + x for x in js).strip()}
      tl.set({{}}, {{}}, {f3(dur)});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["split"] = tl;
    }})();
  </script>
</template>
"""
    (out / "compositions" / "split.html").write_text(comp, encoding="utf-8")
    (out / "index.html").write_text(f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: {paper}; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: {paper}; }}
      #bg {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{f3(dur)}" data-width="{W}" data-height="{H}">
      {bg_html}
      <div id="split" data-composition-id="split" data-composition-src="compositions/split.html" class="clip" data-start="0" data-duration="{f3(dur)}" data-track-index="2" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:50"></div>
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
                       "meta.json": {"id": "anime-triple-split", "name": "anime-triple-split", "createdAt": "2026-10-26T00:00:00.000Z"},
                       "package.json": {"name": "anime-triple-split-render", "private": True, "type": "module"}}.items():
        (out / name).write_text(json.dumps(body, indent=2))
    print(f"{out}: layout {layout}, panels at {beats}, {len(js)} tweens, {dur:.2f}s")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else ROOT / "split.json")
