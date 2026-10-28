# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10", "librosa>=0.10", "numpy"]
# ///
"""Beat-synced schizo edit of the stills and clips in a project folder.

  uv run scripts/edit.py examples/halofall.json --project work/halofall [--seed 7] [--out out.mp4]

Reads <project>/img/<id>.jpg, <project>/vid/<id>.mp4 and <project>/music.mp3 (made by generate.py),
measures the tempo, cuts every beat into 3-4 shots, gives each shot a zoom and one effect, builds the title
one letter per cut and muxes the music. A new --seed gives a new cut of the same media for free.
"""
import argparse, json, math, os, random, subprocess, sys

import librosa
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_URL = "https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf"  # OFL
GOLD = (255, 200, 90)

ap = argparse.ArgumentParser()
ap.add_argument("config")
ap.add_argument("--project", required=True)
ap.add_argument("--seed", type=int)
ap.add_argument("--out")
a = ap.parse_args()

cfg = json.load(open(a.config))
P = a.project
IMG, VID, SEG, OVL = (os.path.join(P, d) for d in ("img", "vid", "seg", "ovl"))
for d in (SEG, OVL):
    os.makedirs(d, exist_ok=True)
W, H, FPS = cfg["width"], cfg["height"], cfg["fps"]
TOTAL = int(cfg["duration"] * FPS)
TITLE = cfg["title"].upper()
TITLE_FROM = int(cfg["title_from"] * FPS)
OUT = a.out or os.path.join(P, f"{cfg['title'].lower()}.mp4")
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
rnd = random.Random(a.seed if a.seed is not None else cfg.get("seed", 7))
SX, SY = W / 720, H / 1280  # the effect constants were tuned at 720x1280

STILLS = sorted(f[:-4] for f in os.listdir(IMG) if f.endswith(".jpg"))
CLIPS = sorted(f[:-4] for f in os.listdir(VID) if f.endswith(".mp4")) if os.path.isdir(VID) else []
MUSIC = os.path.join(P, "music.mp3")
for need in [MUSIC] + [os.path.join(IMG, s + ".jpg") for sec in cfg["sections"] for s in sec["shots"]]:
    if not os.path.exists(need):
        sys.exit(f"missing {need}: run generate.py first")


# ---------- beat grid ----------
def beat_grid():
    y, sr = librosa.load(MUSIC, sr=22050, mono=True, duration=cfg["duration"] + 4)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(np.atleast_1d(tempo)[0])
    times = librosa.frames_to_time(frames, sr=sr)
    period = 60 / tempo
    phase = float(np.median(times % period)) if len(times) else 0.0  # robust first-beat offset
    print(f"tempo {tempo:.1f} BPM, first beat {phase:.3f} s")
    return period * FPS, phase * FPS


# ---------- overlays ----------
def font(size):
    path = os.path.join(P, "Cinzel.ttf")
    if not os.path.exists(path):
        subprocess.run(["curl", "-sSfL", "-o", path, FONT_URL], check=True)
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_name("Bold")
    except Exception:
        pass
    return f


def rings_png():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy, step = W // 2, H // 2, int(55 * SX)
    for i, r in enumerate(range(int(60 * SX), int(900 * SY), step)):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD + (max(200 - i * 9, 40),), width=2)
        if i % 3 == 1:  # dotted ring
            for k in range(0, 360, 6):
                x, y = cx + r * 1.03 * math.cos(math.radians(k)), cy + r * 1.03 * math.sin(math.radians(k))
                d.ellipse([x - 1.5, y - 1.5, x + 1.5, y + 1.5], fill=GOLD + (150,))
    Image.alpha_composite(im.filter(ImageFilter.GaussianBlur(3)), im).save(os.path.join(OVL, "rings.png"))


def rays_png():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r2 = random.Random(3)
    for _ in range(26):
        x0, x1 = W / 2 + r2.uniform(-60, 60) * SX, r2.uniform(-0.4 * W, 1.4 * W)
        d.line([(x0, -20), (x1, H + 20)], fill=(255, 235, 200, r2.randint(60, 170)), width=r2.choice([1, 1, 2]))
    Image.alpha_composite(im.filter(ImageFilter.GaussianBlur(2)), im).save(os.path.join(OVL, "rays.png"))


def title_png(text, name):
    f, spacing = font(int(76 * SX * (8 / max(8, len(TITLE))))), 10 * SX  # long titles shrink to fit
    full_w = sum(f.getlength(c) + spacing for c in TITLE) - spacing
    x, y = (W - full_w) / 2, H * 0.67
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for c in text:  # laid out on the full word, so every new letter lands in its final place
        d.text((x, y), c, font=f, fill=(255, 244, 222, 255))
        x += f.getlength(c) + spacing
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for g in (layer.filter(ImageFilter.GaussianBlur(14)),) * 2 + (layer.filter(ImageFilter.GaussianBlur(4)),):
        im = Image.alpha_composite(im, g)
    Image.alpha_composite(im, layer).save(os.path.join(OVL, name))


# ---------- cut list ----------
def section(frame):
    return max(i for i, s in enumerate(cfg["sections"]) if s["from"] * FPS <= frame)


def cut_points(beat, phase):
    beats, t = [0], phase
    while t < TOTAL:
        if round(t) > 0:
            beats.append(round(t))
        t += beat
    beats.append(TOTAL)
    cuts = [0]
    for a_, b_ in zip(beats, beats[1:]):
        n = b_ - a_
        if n <= 0:
            continue
        acc = a_
        for p in rnd.choice(cfg["sections"][section(a_)]["split"])[:-1]:
            acc += max(3, round(n * p))
            if acc < b_:
                cuts.append(acc)
        cuts.append(b_)
    return sorted(set(cuts))


# ---------- one shot ----------
def src_args(key, n):
    dur = n / FPS
    if key in CLIPS and rnd.random() < 0.85:  # a random 0.2 s from the clip
        ss = rnd.uniform(0.3, max(0.31, 4.6 - dur))
        return ["-ss", f"{ss:.2f}", "-t", f"{dur + 0.1:.2f}", "-i", os.path.join(VID, key + ".mp4")], True
    return ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur + 0.1:.2f}", "-i", os.path.join(IMG, key + ".jpg")], False


def zoom_chain(moving):
    z0 = rnd.uniform(1.0, 1.12)
    k = rnd.choice([0.1, 0.2]) if moving else rnd.choice([0.25, 0.4, 0.6, -0.2])
    z, dx = f"({z0:.3f}+{k:.3f}*t)", rnd.uniform(-0.04, 0.04)
    cw, ch = round(W * 1.056), round(H * 1.056)
    return (f"scale=w='trunc({cw}*{z}/2)*2':h='trunc({ch}*{z}/2)*2':eval=frame,"
            f"crop={W}:{H}:x='(iw-{W})/2+iw*{dx:.3f}*t':y='(ih-{H})/2'")


def fx_chain(fx):
    if fx == "scan":
        return "drawgrid=w=iw:h=5:t=1:c=black@0.45"
    if fx == "neg":  # invert, then map dark->violet and light->pale gold (a plain negate goes green/blue)
        return "negate,hue=s=0,eq=contrast=1.25,curves=r='0/0.22 1/1':g='0/0.04 1/0.9':b='0/0.42 1/0.58'"
    if fx == "mirror":
        return "crop=iw/2:ih:0:0,split[l][r];[r]hflip[rf];[l][rf]hstack"
    if fx == "kaleido":
        return "crop=iw:ih/2:0:0,split[t][b];[b]vflip[bf];[t][bf]vstack"
    if fx == "pix":
        return (f"scale={round(96 * SX)}:{round(170 * SY)},eq=contrast=1.6:brightness=-0.05,"
                f"scale={W}:{H}:flags=neighbor,drawgrid=w={7.5 * SX}:h={7.5 * SY}:t=2:c=black@0.8")
    if fx == "rgb":
        return f"rgbashift=rh={rnd.choice([-14, 10, 16])}:bh={rnd.choice([-12, 12])}:gv={rnd.choice([-6, 6])}"
    if fx == "glitch":  # two horizontal slices of the frame pushed sideways
        y, h, s = rnd.randint(int(.15 * H), int(.7 * H)), rnd.randint(int(.05 * H), int(.2 * H)), rnd.choice([-80, -40, 50, 90])
        y2, s2 = rnd.randint(int(.08 * H), int(.86 * H)), rnd.choice([-30, 30])
        return (f"split=3[a][b][c];[b]crop=iw:{h}:0:{y}[g];[c]crop=iw:40:0:{y2}[g2];"
                f"[a][g]overlay={s}:{y}[ag];[ag][g2]overlay={s2}:{y2},rgbashift=rh=12:bh=-10")
    if fx == "flash":
        return "eq=brightness='if(lt(n,2),0.45,0)':eval=frame:contrast=1.1"
    return "null"


def render_shot(i, a_, b_, key, fx, title):
    n = b_ - a_
    out = os.path.join(SEG, f"{i:03d}.mp4")
    inputs, moving = src_args(key, n)
    chain = f"[0:v]fps={FPS},{zoom_chain(moving)},setsar=1,format=rgb24"
    idx = 1
    if fx == "double":  # screen-blend a second still on top
        other = rnd.choice(STILLS)
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{n / FPS + 0.1:.2f}", "-i", os.path.join(IMG, other + ".jpg")]
        chain += (f"[base];[{idx}:v]fps={FPS},scale={W}:{H},setsar=1,format=rgb24[o];"
                  f"[base][o]blend=all_mode=screen:all_opacity=0.65")
        idx += 1
    else:
        chain += "," + fx_chain(fx)
    for ov in (["rings.png"] if fx == "rings" else ["rays.png"] if fx == "rays" else []) + ([title] if title else []):
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", os.path.join(OVL, ov)]
        chain += f"[v{idx}];[v{idx}][{idx}:v]overlay=0:0:format=auto"
        idx += 1
    # house look on every shot: violet shadows, warm highlights, grain, vignette
    chain += (",format=yuv420p,colorbalance=bs=0.10:rs=0.04:rh=0.06:bh=-0.04,eq=contrast=1.08:saturation=1.15,"
              "noise=alls=10:allf=t,vignette=PI/5[vout]")
    cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", chain, "-map", "[vout]",
           "-frames:v", str(n), "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "14",
           "-pix_fmt", "yuv420p", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"shot {i} ({key}, {fx}) failed:\n{r.stderr[-800:]}")


def main():
    beat, phase = beat_grid()
    rings_png(); rays_png()
    titles = {k: f"title_{k}.png" for k in range(1, len(TITLE) + 1)}
    for k, name in titles.items():
        title_png(TITLE[:k], name)

    cuts = cut_points(beat, phase)
    shots = list(zip(cuts, cuts[1:]))
    tshots = [s for s in shots if s[0] >= TITLE_FROM]
    plan, recent = [], []
    for i, (a_, b_) in enumerate(shots):
        sec = cfg["sections"][section(a_)]
        pool = sec["shots"]
        key = rnd.choice([k for k in pool if k not in recent[-3:]] or pool)  # no image twice within 4 shots
        fx = rnd.choice(sec["fx"])
        if i == 0:
            key, fx = sec["shots"][0], "flash"
        title = titles[min(len(TITLE), tshots.index((a_, b_)) + 1)] if a_ >= TITLE_FROM else None
        plan.append((i, a_, b_, key, fx, title))
        recent.append(key)
    for p in plan:
        print(f"{p[0]:03d} {p[1] / FPS:5.2f}-{p[2] / FPS:5.2f}  {p[3]}  {p[4]:8s} {p[5] or ''}")

    for f in os.listdir(SEG):
        os.remove(os.path.join(SEG, f))
    for p in plan:
        render_shot(*p)
    concat = os.path.join(P, "concat.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{os.path.abspath(SEG)}/{p[0]:03d}.mp4'\n" for p in plan)
    dur = cfg["duration"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-i", MUSIC,
                    "-filter_complex", f"[1:a]atrim=0:{dur},afade=t=out:st={dur - 0.6}:d=0.6[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "21",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                    "-t", str(dur), OUT], check=True)
    print(f"done: {OUT} ({len(plan)} shots)")


main()
