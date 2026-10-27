#!/usr/bin/env python3
"""Stamp carousel: a phone mockup that swipes through perforated "stamp" cards.

Rebuilds the reference motion 1:1 (geometry, swipe curve, background colour
morph, per-card tilt, UI chrome) from numbers in preset.json, with your own
images on the stamps.

  python3 render.py IMAGES... -o out.mp4                      # phone on a page background
  python3 render.py IMAGES... -o out.mp4 --variant both       # + out-alpha.mov / out-alpha.webm
  python3 render.py IMAGES... --settings settings.json -o out.mp4
  python3 render.py IMAGES... --still 20 -o frame.png         # one frame for checking
"""
import argparse, json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SS = 3  # supersampling for vector chrome and card sprites
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".bmp", ".tif", ".tiff"}


# ---------------------------------------------------------------- helpers

def load_font(size, weight="Regular"):
    for path in ["/System/Library/Fonts/SFNS.ttf", "/Library/Fonts/SF-Pro.ttf",
                 "/System/Library/Fonts/Helvetica.ttc",
                 "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(path):
            f = ImageFont.truetype(path, size)
            try:
                f.set_variation_by_name(weight)
            except Exception:
                pass
            return f
    return ImageFont.load_default()


def font_for_width(text, width, weight):
    """Font size whose rendered `text` is `width` px wide (at 1x)."""
    lo, hi = 6.0, 80.0
    for _ in range(18):
        mid = (lo + hi) / 2
        f = load_font(round(mid * SS), weight)
        w = f.getlength(text) / SS
        lo, hi = (mid, hi) if w < width else (lo, mid)
    return load_font(round(lo * SS), weight)


def hex_rgb(s):
    s = s.lstrip("#")
    return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], float)


def rgb_to_hsv(c):
    r, g, b = c / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    v = mx
    s = 0 if mx == 0 else (mx - mn) / mx
    if mx == mn:
        h = 0
    elif mx == r:
        h = ((g - b) / (mx - mn)) % 6
    elif mx == g:
        h = (b - r) / (mx - mn) + 2
    else:
        h = (r - g) / (mx - mn) + 4
    return h / 6, s, v


def hsv_to_rgb(h, s, v):
    i = int(h * 6) % 6
    f = h * 6 - int(h * 6)
    p, q, t = v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)
    r, g, b = [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)][i]
    return np.array([r, g, b]) * 255


def perimeter_color(img):
    a = np.asarray(img.convert("RGB").resize((96, 96)), float)
    band = 8
    edge = np.concatenate([a[:band].reshape(-1, 3), a[-band:].reshape(-1, 3),
                           a[band:-band, :band].reshape(-1, 3), a[band:-band, -band:].reshape(-1, 3)])
    return edge.mean(0)


def auto_bg(img):
    """Screen colour at y=200, derived the way the reference does: the image's
    edge colour, darkened more when saturated, never below a dark grey."""
    h, s, v = rgb_to_hsv(perimeter_color(img))
    v2 = max(0.29, v * (0.5 + 0.25 * (1 - s)))
    return hsv_to_rgb(h, s * 0.95, v2)


def tint(bg, k):
    a, bmax, bmin, c = k
    return np.clip(a * bg + bmax * bg.max() + bmin * bg.min() + c, 0, 255)


def rrect_mask(size, box, radius, ss=SS):
    """Anti-aliased rounded-rect mask (float 0..1) at 1x for a 1x box."""
    w, h = size
    m = Image.new("L", (w * ss, h * ss), 0)
    x0, y0, x1, y1 = box
    ImageDraw.Draw(m).rounded_rectangle([x0 * ss, y0 * ss, x1 * ss - 1, y1 * ss - 1], radius * ss, fill=255)
    return np.asarray(m.resize((w, h), Image.LANCZOS), float) / 255.0


def perspective_coeffs(dst, src):
    """PIL PERSPECTIVE data mapping output points `dst` back to input `src`."""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


# ---------------------------------------------------------------- stamp sprites

def stamp_rgba(img, outer, border, hole_r, pitch, border_color, ss):
    ow, oh = outer
    W, Hh = round(ow * ss), round(oh * ss)
    mask = Image.new("L", (W, Hh), 255)
    d = ImageDraw.Draw(mask)
    r = hole_r * ss
    for length, horizontal in ((ow, True), (oh, False)):
        n = max(2, round(length / pitch))
        for i in range(n + 1):
            t = i * length / n * ss
            for edge in (0, (oh if horizontal else ow) * ss):
                cx, cy = (t, edge) if horizontal else (edge, t)
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=0)
    card = Image.new("RGBA", (W, Hh), tuple(int(c) for c in border_color) + (255,))
    iw, ih = W - round(2 * border * ss), Hh - round(2 * border * ss)
    card.paste(img.convert("RGB").resize((iw, ih), Image.LANCZOS), (round(border * ss), round(border * ss)))
    card.putalpha(mask)
    return card


def build_sprite(img, cfg, rot_deg, border_color):
    c = cfg["card"]
    bw, bh = c["box"]
    b = c["border"]
    ar = img.width / img.height
    iw, ih = bw - 2 * b, bh - 2 * b
    if iw / ih > ar:
        iw = ih * ar
    else:
        ih = iw / ar
    ow, oh = iw + 2 * b, ih + 2 * b
    flat = stamp_rgba(img, (ow, oh), b, c["hole_radius"], c["hole_pitch"], border_color, SS)

    gx, gy = c["keystone_gx"], c["keystone_gy"]
    th = math.radians(rot_deg)
    cs, sn = math.cos(th), math.sin(th)

    def project(x, y):  # 1x coords relative to card centre
        k = 1 + gx * x + gy * y
        px, py = x / k, y / k
        return px * cs - py * sn, px * sn + py * cs

    corners = [(-ow / 2, -oh / 2), (ow / 2, -oh / 2), (ow / 2, oh / 2), (-ow / 2, oh / 2)]
    proj = [project(*p) for p in corners]
    sh = c["shadow"]
    pad = sh["blur"] * 2.5 + max(abs(sh["dx"]), abs(sh["dy"])) + 4
    half_w = max(abs(p[0]) for p in proj) + pad
    half_h = max(abs(p[1]) for p in proj) + pad
    cw, ch = int(math.ceil(half_w)) * 2, int(math.ceil(half_h)) * 2
    dst = [((x + cw / 2) * SS, (y + ch / 2) * SS) for x, y in proj]
    src = [(0, 0), (flat.width, 0), (flat.width, flat.height), (0, flat.height)]
    warped = flat.convert("RGBa").transform((cw * SS, ch * SS), Image.PERSPECTIVE,
                                            perspective_coeffs(dst, src), Image.BICUBIC)
    warped = warped.resize((cw, ch), Image.LANCZOS).convert("RGBA")

    alpha = warped.getchannel("A")
    shadow_a = Image.new("L", (cw, ch), 0)
    shadow_a.paste(alpha, (int(sh["dx"]), int(sh["dy"])))
    shadow_a = shadow_a.filter(ImageFilter.GaussianBlur(sh["blur"] / 2))
    shadow_a = shadow_a.point(lambda v: int(v * sh["opacity"]))
    sprite = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    sprite.putalpha(shadow_a)
    sprite = Image.alpha_composite(sprite, warped)
    arr = np.asarray(sprite, float)
    return arr[..., :3], arr[..., 3:] / 255.0


# ---------------------------------------------------------------- static chrome

def draw_phone(cfg):
    """RGBA overlay with the phone body; screen area left transparent."""
    p = cfg["phone"]
    W, H = cfg["canvas"]["w"], cfg["canvas"]["h"]
    im = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = p["outer"]
    R = p["outer_radius"]
    bx0, bx1 = p["buttons_left_x"]
    for a, b in p["buttons_left"]:
        d.rounded_rectangle([bx0 * SS, a * SS, (bx1 + 4) * SS, b * SS], 2 * SS, fill=(70, 70, 70, 255))
        d.rounded_rectangle([(bx0 + 1) * SS, (a + 2) * SS, (bx0 + 2) * SS, (b - 2) * SS], SS, fill=(130, 130, 130, 255))
    rx0, rx1 = p["buttons_right_x"]
    for a, b in p["buttons_right"]:
        d.rounded_rectangle([(rx0 - 4) * SS, a * SS, rx1 * SS, b * SS], 2 * SS, fill=(70, 70, 70, 255))
        d.rounded_rectangle([(rx1 - 2) * SS, (a + 2) * SS, (rx1 - 1) * SS, (b - 2) * SS], SS, fill=(130, 130, 130, 255))
    for inset, col in p["rings"]:
        d.rounded_rectangle([(x0 + inset) * SS, (y0 + inset) * SS, (x1 - inset) * SS - 1, (y1 - inset) * SS - 1],
                            (R - inset) * SS, fill=tuple(col) + (255,))
    i = p["screen_inset"]
    hole = Image.new("L", im.size, 0)
    ImageDraw.Draw(hole).rounded_rectangle([(x0 + i) * SS, (y0 + i) * SS, (x1 - i) * SS - 1, (y1 - i) * SS - 1],
                                           (R - i) * SS, fill=255)
    a = np.asarray(im.getchannel("A"), float) * (1 - np.asarray(hole, float) / 255)
    im.putalpha(Image.fromarray(a.astype(np.uint8)))
    im = im.resize((W, H), Image.LANCZOS)
    arr = np.asarray(im, float)
    return arr[..., :3], arr[..., 3:] / 255.0


def white_layer(cfg, draw_fn):
    """Coverage mask (0..1) of white glyphs drawn by draw_fn at SS scale."""
    W, H = cfg["canvas"]["w"], cfg["canvas"]["h"]
    m = Image.new("L", (W * SS, H * SS), 0)
    draw_fn(ImageDraw.Draw(m))
    return np.asarray(m.resize((W, H), Image.LANCZOS), float)[..., None] / 255.0


def status_and_icons(cfg, title):
    u = cfg["ui"]
    s = SS

    def fn(d):
        t = u["status_time"]
        f = font_for_width(t["text"], t["width"], "Semibold")
        d.text((t["x"] * s, t["cy"] * s), t["text"], font=f, fill=255, anchor="lm")
        # bell with slash
        bx, by = u["bell_x"], t["cy"]
        d.chord([(bx + 3) * s, (by - 8) * s, (bx + 15) * s, (by + 8) * s], 180, 360, fill=255)
        d.polygon([((bx + 3) * s, by * s), ((bx + 15) * s, by * s), ((bx + 17) * s, (by + 5) * s), ((bx + 1) * s, (by + 5) * s)], fill=255)
        d.ellipse([(bx + 7) * s, (by + 6) * s, (bx + 11) * s, (by + 10) * s], fill=255)
        d.line([(bx + 1) * s, (by - 9) * s, (bx + 18) * s, (by + 9) * s], fill=0, width=4 * s)
        d.line([(bx + 1) * s, (by - 9) * s, (bx + 18) * s, (by + 9) * s], fill=255, width=2 * s)
        # signal bars
        x0, y0, x1, y1 = u["signal"]
        bw = (x1 - x0 - 3 * 2.2) / 4
        for i in range(4):
            hh = (y1 - y0) * (0.35 + 0.65 * i / 3)
            xa = x0 + i * (bw + 2.2)
            d.rounded_rectangle([xa * s, (y1 - hh) * s, (xa + bw) * s, y1 * s], 1.2 * s, fill=255)
        # wifi
        x0, y0, x1, y1 = u["wifi"]
        cx, cy = (x0 + x1) / 2, y1
        for k, r in enumerate([20, 13, 6]):
            if k < 2:
                d.pieslice([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], 225, 315, fill=255)
                ri = r - 4
                d.pieslice([(cx - ri) * s, (cy - ri) * s, (cx + ri) * s, (cy + ri) * s], 225, 315, fill=0)
            else:
                d.pieslice([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], 225, 315, fill=255)
        # battery
        x0, y0, x1, y1 = u["battery"]
        d.rounded_rectangle([x0 * s, y0 * s, (x1 - 3) * s, y1 * s], 5 * s, fill=255)
        d.rounded_rectangle([(x1 - 2) * s, (y0 + 6) * s, x1 * s, (y1 - 6) * s], 1 * s, fill=150)
        # chevron down in the left circle
        cx, cy, r = u["circle_left"]
        d.line([(cx - 8) * s, (cy - 4) * s, cx * s, (cy + 4) * s, (cx + 8) * s, (cy - 4) * s], fill=255, width=round(3.2 * s), joint="curve")
        # dots in the right circle
        cx, cy, r = u["circle_right"]
        for dx in (-8, 0, 8):
            d.ellipse([(cx + dx - 2.6) * s, (cy - 2.6) * s, (cx + dx + 2.6) * s, (cy + 2.6) * s], fill=255)
        # title
        x0, y0, x1, y1 = u["pill"]
        f = font_for_width("Cover & Poster", u["pill_text_width"], "Semibold")
        d.text(((x0 + x1) / 2 * s, (y0 + y1) / 2 * s), title, font=f, fill=255, anchor="mm")

    return white_layer(cfg, fn)


def note_layers(cfg, text, placeholder):
    """(coverage, opacity) for the text inside the note field."""
    u = cfg["ui"]
    x0, y0, x1, y1 = u["field"]
    f = font_for_width("Add note...", u["placeholder_width"], "Regular")
    cy = (y0 + y1) / 2
    if not text:
        cov = white_layer(cfg, lambda d: d.text((u["field_text_x"] * SS, cy * SS), placeholder, font=f, fill=255, anchor="lm"))
        return cov, 0.3
    maxw = (u["send"][0] - u["send"][2] - 14 - u["field_text_x"]) * SS
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if f.getlength(t) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w_
    lines.append(cur)

    def fn(d):
        for i, ln in enumerate(lines[:2]):
            d.text((u["field_text_x"] * SS, (cy + i * 28) * SS), ln, font=f, fill=255, anchor="lm")
    cov = white_layer(cfg, fn)
    clip = rrect_mask((cfg["canvas"]["w"], cfg["canvas"]["h"]), u["field"], (y1 - y0) / 2)[..., None]
    return cov * clip, 0.78


# ---------------------------------------------------------------- timeline

def schedule(n_cards, cfg, mode, hold, fps):
    t = cfg["timing"]
    scale = fps / cfg["canvas"]["fps"]
    if mode == "reference":
        starts = [s * scale for s in t["starts"]]
        while len(starts) < n_cards - 1:
            starts.append(starts[-1] + t["late_gap"] * scale)
        starts = starts[:n_cards - 1]
        total = (starts[-1] if starts else 0) + t["tail"] * scale + (0 if starts else 30 * scale)
    else:
        gap = hold * fps
        starts = [round(t["starts"][0] * scale + i * gap) for i in range(n_cards - 1)]
        total = (starts[-1] if starts else 0) + gap
    return [round(s) for s in starts], int(round(total))


def curve_at(table, k, fps, base_fps):
    """Sample a per-frame table recorded at base_fps at local frame k of fps."""
    x = k * base_fps / fps
    if x <= 0:
        return table[0] if k == 0 else 0.0
    if x >= len(table) - 1:
        return table[-1]
    i = int(x)
    return table[i] + (table[i + 1] - table[i]) * (x - i)


# ---------------------------------------------------------------- main

def collect_cards(args):
    cards, meta = [], {}
    if args.settings:
        meta = json.load(open(args.settings))
        base = os.path.dirname(os.path.abspath(args.settings))
        for c in meta.get("cards", []):
            c = dict(c)
            c["image"] = os.path.join(base, c["image"]) if not os.path.isabs(c["image"]) else c["image"]
            cards.append(c)
    for p in args.images:
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                if os.path.splitext(f)[1].lower() in IMG_EXT:
                    cards.append({"image": os.path.join(p, f)})
        else:
            cards.append({"image": p})
    if not cards:
        sys.exit("no images given")
    overrides = meta.get("overrides", {})
    for c in cards:
        c.update({k: v for k, v in overrides.get(os.path.basename(c["image"]), {}).items() if k != "image"})
    return cards, meta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("images", nargs="*", help="image files or folders (sorted by name)")
    ap.add_argument("--settings", "--manifest", dest="settings",
                    help="JSON: title/placeholder/time/timing/hold/border/page_bg/variant, cards[] and overrides{filename: {bg, note, border, rot}}")
    ap.add_argument("-o", "--out", default="stamp-carousel.mp4")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--timing", choices=["reference", "uniform"], default=None,
                    help="reference = exact swipe frames of the original (accelerating 0.7s -> 0.47s); uniform = --hold seconds per card")
    ap.add_argument("--hold", type=float, default=None, help="seconds per card for --timing uniform (default 0.5)")
    ap.add_argument("--variant", choices=["bg", "alpha", "both"], default=None,
                    help="bg = phone on a page colour (MP4); alpha = transparent outside the phone; both (default bg)")
    ap.add_argument("--page-bg", default=None, help="page colour around the phone for the bg variant (default #FDFDFD)")
    ap.add_argument("--alpha-formats", default=None, help="comma list of mov (ProRes 4444), webm (VP9), hevc (Apple HEVC); default mov,webm")
    ap.add_argument("--title", default=None)
    ap.add_argument("--placeholder", default=None)
    ap.add_argument("--time", default=None, help="status bar clock text")
    ap.add_argument("--border", default=None, help="auto | none | #hex  (stamp margin colour)")
    ap.add_argument("--still", type=int, default=None, help="write only this frame as PNG")
    ap.add_argument("--crf", type=int, default=16)
    ap.add_argument("--audio", help="optional audio file muxed under the video (cut to video length)")
    args = ap.parse_args()

    cfg = json.load(open(os.path.join(HERE, "preset.json")))
    cards, meta = collect_cards(args)
    opt = lambda name, default: getattr(args, name) if getattr(args, name) is not None else meta.get(name, default)
    timing, hold = opt("timing", "reference"), float(opt("hold", 0.5))
    variant = opt("variant", "bg")
    alpha_formats = [f.strip() for f in str(opt("alpha_formats", "mov,webm")).split(",") if f.strip()]
    if isinstance(meta.get("alpha_formats"), list) and args.alpha_formats is None:
        alpha_formats = meta["alpha_formats"]
    page_bg = args.page_bg or meta.get("page_bg")
    if page_bg:
        cfg["canvas"]["page_bg"] = hex_rgb(page_bg).tolist()
    title = args.title or meta.get("title", "Cover & Poster")
    placeholder = args.placeholder or meta.get("placeholder", "Add note...")
    if args.time or meta.get("time"):
        cfg["ui"]["status_time"]["text"] = args.time or meta["time"]
        cfg["ui"]["status_time"]["width"] *= len(cfg["ui"]["status_time"]["text"]) / 5

    W, H = cfg["canvas"]["w"], cfg["canvas"]["h"]
    c = cfg["card"]
    rots = c["rotations"]

    print(f"building {len(cards)} stamps...", file=sys.stderr)
    sprites, bgs = [], []
    for i, card in enumerate(cards):
        img = Image.open(card["image"])
        img = img.convert("RGBA")
        flat = Image.new("RGB", img.size, (255, 255, 255))
        flat.paste(img, mask=img.getchannel("A"))
        img = flat
        border = card.get("border", opt("border", "auto"))
        if border == "auto":
            bc = perimeter_color(img)
        elif border == "none":
            bc = None
        else:
            bc = hex_rgb(border)
        cc = json.loads(json.dumps(cfg))
        if bc is None:
            cc["card"]["border"] = 0
            bc = np.array([0, 0, 0])
        rot = card.get("rot", rots[i % len(rots)])
        sprites.append(build_sprite(img, cc, rot, bc))
        bgs.append(hex_rgb(card["bg"]) if card.get("bg") else auto_bg(img))

    # static layers
    phone_rgb, phone_a = draw_phone(cfg)
    p = cfg["phone"]
    i_ = p["screen_inset"]
    sx0, sy0, sx1, sy1 = p["outer"][0] + i_, p["outer"][1] + i_, p["outer"][2] - i_, p["outer"][3] - i_
    screen = rrect_mask((W, H), (sx0, sy0, sx1, sy1), p["outer_radius"] - i_)[..., None]
    g = cfg["gradient"]
    ys = np.arange(H, dtype=float)
    fac = g["top_factor"] + (ys - g["top_y"]) / (g["bottom_y"] - g["top_y"]) * (g["bottom_factor"] - g["top_factor"])
    fac = np.clip(fac, 0, 2)[:, None, None]
    u = cfg["ui"]
    cxl, cyl, rl = u["circle_left"]
    cxr, cyr, rr = u["circle_right"]
    pill_m = np.maximum.reduce([
        rrect_mask((W, H), u["pill"], (u["pill"][3] - u["pill"][1]) / 2),
        rrect_mask((W, H), (cxl - rl, cyl - rl, cxl + rl, cyl + rl), rl),
        rrect_mask((W, H), (cxr - rr, cyr - rr, cxr + rr, cyr + rr), rr)])[..., None]
    field_m = rrect_mask((W, H), u["field"], (u["field"][3] - u["field"][1]) / 2)[..., None]
    # thin lighter rim on the upper edge of controls
    rim = np.clip(pill_m - np.roll(pill_m, 2, axis=0), 0, 1) + np.clip(field_m - np.roll(field_m, 2, axis=0), 0, 1)
    sxc, syc, sr = u["send"]
    send_m = rrect_mask((W, H), (sxc - sr, syc - sr, sxc + sr, syc + sr), sr)[..., None]
    send_glyph = white_layer(cfg, lambda d: d.line([(sxc - 2) * SS, (syc - 5) * SS, (sxc + 3) * SS, syc * SS, (sxc - 2) * SS, (syc + 5) * SS],
                                                  fill=255, width=round(2.2 * SS), joint="curve"))
    icons = status_and_icons(cfg, title)
    notes = {}

    def note_for(idx):
        key = cards[idx].get("note", "")
        if key not in notes:
            notes[key] = note_layers(cfg, key, placeholder)
        return notes[key]

    starts, total = schedule(len(cards), cfg, timing, hold, args.fps)
    base_fps = cfg["canvas"]["fps"]
    prog_t, mix_t = cfg["swipe"]["progress"], cfg["swipe"]["bg_mix"]
    pitch = cfg["swipe"]["pitch"]
    ccx, ccy = c["center"]
    page = np.array(cfg["canvas"]["page_bg"], float)
    y_pill = (u["pill"][1] + u["pill"][3]) / 2
    y_field = (u["field"][1] + u["field"][3]) / 2
    fac_at = lambda y: g["top_factor"] + (y - g["top_y"]) / (g["bottom_y"] - g["top_y"]) * (g["bottom_factor"] - g["top_factor"])

    def state(f):
        j = None
        for n, s in enumerate(starts):
            if s <= f:
                j = n
        if j is None:
            return 0, 0.0, bgs[0]
        k = f - starts[j]
        prog = curve_at(prog_t, k, args.fps, base_fps)
        mix = curve_at(mix_t, k, args.fps, base_fps)
        return j, prog, bgs[j] * (1 - mix) + bgs[j + 1] * mix

    def paste(frame, sprite, x, y):
        rgb, a = sprite
        sh, sw = a.shape[:2]
        x0, y0 = int(round(x - sw / 2)), int(round(y - sh / 2))
        fx0, fy0, fx1, fy1 = max(x0, 0), max(y0, 0), min(x0 + sw, W), min(y0 + sh, H)
        if fx1 <= fx0 or fy1 <= fy0:
            return
        sub_a = a[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0] * screen[fy0:fy1, fx0:fx1]
        sub = rgb[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0]
        region = frame[fy0:fy1, fx0:fx1]
        frame[fy0:fy1, fx0:fx1] = region * (1 - sub_a) + sub * sub_a

    def band(mask):
        rows = np.where(mask.reshape(H, -1).max(1) > 0)[0]
        return slice(int(rows.min()), int(rows.max()) + 1) if len(rows) else slice(0, 0)

    top_band = band(np.maximum(pill_m, icons))
    bot_band = band(field_m)
    phone_rows = np.where(phone_a[:, :, 0].max(1) > 0)[0]
    phone_cols = np.where(phone_a[:, :, 0].max(0) > 0)[0]
    # the phone overlay is opaque only near its edges: composite just those strips
    edge = 30
    px0, px1 = int(phone_cols.min()), int(phone_cols.max()) + 1
    py0, py1 = int(phone_rows.min()), int(phone_rows.max()) + 1
    phone_strips = [(slice(py0, py1), slice(px0, sx0 + edge)), (slice(py0, py1), slice(sx1 - edge, px1)),
                    (slice(py0, sy0 + edge * 4), slice(px0, px1)), (slice(sy1 - edge * 4, py1), slice(px0, px1))]
    outside = 1 - screen

    def render(f):
        j, prog, bg = state(f)
        frame = np.clip(bg[None, None, :] * fac, 0, 255) * screen
        frame = np.broadcast_to(frame, (H, W, 3)).copy()
        if prog <= 0:
            paste(frame, sprites[j], ccx, ccy)
            cur = j
        else:
            if prog < 1:
                paste(frame, sprites[j], ccx - prog * pitch, ccy)
            paste(frame, sprites[j + 1], ccx + (1 - prog) * pitch, ccy)
            cur = j + 1 if prog >= 0.5 else j
        pill_col = tint(bg * fac_at(y_pill), u["pill_tint"])
        field_col = tint(bg * fac_at(y_field), u["field_tint"])
        cov, op = note_for(cur)
        b = top_band
        fr = frame[b]
        fr = fr * (1 - pill_m[b]) + pill_col * pill_m[b] + rim[b] * 10
        fr = fr * (1 - icons[b]) + 255 * icons[b]
        frame[b] = fr
        b = bot_band
        fr = frame[b]
        fr = fr * (1 - field_m[b]) + field_col * field_m[b] + rim[b] * 10
        c_ = cov[b] * op
        fr = fr * (1 - c_) + 255 * c_
        fr = fr * (1 - send_m[b] * 0.94) + 250 * send_m[b] * 0.94
        fr = fr * (1 - send_glyph[b]) + field_col * 0.6 * send_glyph[b]
        frame[b] = fr
        for ys_, xs_ in phone_strips:
            a = phone_a[ys_, xs_]
            frame[ys_, xs_] = frame[ys_, xs_] * (1 - a) + phone_rgb[ys_, xs_] * a
        return frame  # colour premultiplied by `alpha` (nothing drawn outside the phone)

    # The page shows only outside the phone silhouette, so coverage is static.
    alpha = 1 - outside * (1 - phone_a)
    page_term = page * (1 - alpha)
    safe_alpha = np.maximum(alpha, 1e-6)

    def frame_bg(f):
        return np.clip(render(f) + page_term, 0, 255).astype(np.uint8)

    def frame_alpha(f):
        rgb = np.clip(render(f) / safe_alpha, 0, 255)
        return np.concatenate([rgb, alpha * 255], axis=2).round().astype(np.uint8)

    if args.still is not None:
        img = frame_alpha(args.still) if variant == "alpha" else frame_bg(args.still)
        Image.fromarray(img).save(args.out)
        print(args.out)
        return

    stem = os.path.splitext(args.out)[0]
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    audio_in = ["-i", args.audio] if args.audio else []

    def audio_out(codec):
        return ["-map", "0:v", "-map", "1:a", "-c:a", codec, "-shortest"] if args.audio else []

    def pipe(pix_fmt, tail):
        cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", pix_fmt,
               "-s", f"{W}x{H}", "-r", str(args.fps), "-i", "-"] + audio_in + tail
        return subprocess.Popen(cmd, stdin=subprocess.PIPE)

    jobs = []  # (process, frame function, output path)
    if variant in ("bg", "both"):
        out = stem + ".mp4"
        jobs.append((pipe("rgb24", audio_out("aac") + ["-c:v", "libx264", "-preset", "slow", "-crf", str(args.crf),
                                                       "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]), frame_bg, out))
    if variant in ("alpha", "both"):
        enc = {
            "mov": (".mov", "pcm_s16le", ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le",
                                           "-alpha_bits", "16", "-vendor", "apl0"]),
            "webm": (".webm", "libopus", ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24",
                                           "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-auto-alt-ref", "0"]),
            "hevc": ("-hevc.mov", "aac", ["-c:v", "hevc_videotoolbox", "-alpha_quality", "0.9", "-q:v", "70",
                                           "-tag:v", "hvc1", "-pix_fmt", "bgra"]),
        }
        for fmt in alpha_formats:
            ext, acodec, vargs = enc[fmt]
            out = stem + "-alpha" + ext
            jobs.append((pipe("rgba", audio_out(acodec) + vargs + [out]), frame_alpha, out))

    print(f"rendering {total} frames ({total / args.fps:.2f}s) -> {len(jobs)} file(s)...", file=sys.stderr)
    for f in range(total):
        cache = {}
        for proc, fn, _ in jobs:
            if fn not in cache:
                cache[fn] = fn(f).tobytes()
            proc.stdin.write(cache[fn])
    for proc, _, out in jobs:
        proc.stdin.close()
        if proc.wait() != 0:
            sys.exit(f"ffmpeg failed for {out}")
        print(out)


if __name__ == "__main__":
    main()
