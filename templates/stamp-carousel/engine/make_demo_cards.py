#!/usr/bin/env python3
"""Procedural placeholder posters for testing the carousel (original abstract art).

  python3 make_demo_cards.py OUT_DIR [--count 12]
"""
import argparse, os, random
from PIL import Image, ImageDraw, ImageFont

PALETTES = [
    ((214, 32, 38), (245, 236, 220), (20, 20, 20)),
    ((22, 74, 160), (240, 240, 235), (250, 200, 40)),
    ((18, 18, 18), (240, 240, 240), (230, 60, 50)),
    ((245, 214, 60), (25, 25, 25), (210, 40, 40)),
    ((40, 110, 70), (235, 230, 210), (240, 90, 60)),
    ((236, 232, 222), (25, 25, 25), (210, 40, 40)),
    ((230, 150, 170), (255, 245, 245), (120, 30, 50)),
    ((70, 160, 170), (20, 30, 35), (250, 210, 80)),
    ((120, 120, 125), (245, 245, 245), (20, 20, 20)),
    ((240, 110, 40), (250, 240, 225), (30, 30, 60)),
]
WORDS = ["SIGNAL", "ORBIT", "NO.07", "HALFTONE", "MERIDIAN", "PULSE", "ATLAS", "KIOSK", "VOLT", "DRIFT", "NORTH", "ECHO"]
SIZES = [(900, 1200), (1000, 1000), (1000, 800)]


def font(size):
    for p in ["/System/Library/Fonts/Supplemental/Futura.ttc", "/System/Library/Fonts/SFNS.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        if os.path.exists(p):
            f = ImageFont.truetype(p, size)
            try:
                f.set_variation_by_name("Bold")
            except Exception:
                pass
            return f
    return ImageFont.load_default()


def poster(i, rnd):
    bg, fg, acc = PALETTES[i % len(PALETTES)]
    w, h = SIZES[i % len(SIZES)]
    im = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(im)
    style = i % 4
    if style == 0:
        for k in range(6):
            r = rnd.randint(80, 260)
            x, y = rnd.randint(0, w), rnd.randint(int(h * .3), h)
            d.ellipse([x - r, y - r, x + r, y + r], fill=[fg, acc][k % 2])
    elif style == 1:
        n = 8
        for a in range(n):
            for b in range(n):
                if (a + b) % 2:
                    d.rectangle([a * w / n, h * .35 + b * h * .65 / n, (a + 1) * w / n, h * .35 + (b + 1) * h * .65 / n], fill=fg)
    elif style == 2:
        for k in range(14):
            y = h * .3 + k * h * .05
            d.rectangle([0, y, w, y + h * .02], fill=[fg, acc][k % 3 == 0])
        d.ellipse([w * .55, h * .4, w * .95, h * .4 + w * .4], fill=acc)
    else:
        d.polygon([(0, h), (w * .5, h * .35), (w, h)], fill=fg)
        d.polygon([(w * .2, h), (w * .5, h * .55), (w * .8, h)], fill=acc)
    word = WORDS[i % len(WORDS)]
    f = font(int(w * .16))
    d.text((w * .06, h * .06), word, font=f, fill=fg if style != 1 else acc)
    d.text((w * .06, h * .06 + w * .19), f"SERIES {i + 1:02d}", font=font(int(w * .045)), fill=acc if style != 3 else fg)
    return im


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--count", type=int, default=12)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rnd = random.Random(7)
    for i in range(a.count):
        poster(i, rnd).save(os.path.join(a.out, f"card_{i + 1:02d}.png"))
    print(a.out)
