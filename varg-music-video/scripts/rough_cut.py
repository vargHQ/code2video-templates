#!/usr/bin/env python3
"""Frame-exact rough cut of generated clips onto the song grid.

  python3 rough_cut.py storyboard.json place.json out.mp4 --clips out/ --audio assets/bgm.mp3 \
      [--fallback renders/animatic.mp4] [--size 480x854] [--fps 24]

place.json: {shot: "clip" | [clip, in] | [[clip, in, dur, opts?], ...]}  (clip = file in --clips, ".mp4" optional)
opts: {"vf": "extra ffmpeg filters", "freeze": true (hold the first frame)}.
Shots missing from place.json come from --fallback at the same timeline time (or black)."""
import argparse, json, subprocess, tempfile
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("storyboard"); ap.add_argument("place"); ap.add_argument("out")
ap.add_argument("--clips", default="out"); ap.add_argument("--audio")
ap.add_argument("--fallback"); ap.add_argument("--size", default="480x854"); ap.add_argument("--fps", type=int, default=24)
a = ap.parse_args()
W, H = a.size.split("x"); FPS = a.fps
sb = json.load(open(a.storyboard)); place = json.load(open(a.place))
tmp = Path(tempfile.mkdtemp()); parts = []; warn = []
_dur = {}

def src(name):
    p = Path(a.clips) / name
    return p if p.suffix else p.with_suffix(".mp4")

def length(p):
    if p not in _dur:
        _dur[p] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                       capture_output=True, text=True).stdout or 0)
    return _dur[p]

def seg(p, ss, n, key, opts=None):
    opts = opts or {}
    vf = f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    if opts.get("freeze"):
        vf += f",trim=end_frame=1,loop=loop={n}:size=1:start=0,setpts=N/{FPS}/TB"
    elif "setpts" not in opts.get("vf", "") and ss + n / FPS > length(p) + 1e-3:
        warn.append(f"{key}: needs {ss:.3f}+{n / FPS:.3f}s but {p.name} is {length(p):.3f}s")
    if opts.get("vf"):
        vf += "," + opts["vf"]
    o = tmp / f"{key}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{ss:.3f}", "-i", str(p), "-frames:v", str(n), "-vf", vf,
                    "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(o)], check=True)
    got = int(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
                              "stream=nb_read_frames", "-of", "csv=p=0", str(o)], capture_output=True, text=True).stdout or 0)
    if got != n:
        warn.append(f"{key}: wanted {n} frames, got {got}")
    parts.append(o)

def black(n, key):
    o = tmp / f"{key}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:r={FPS}", "-frames:v", str(n),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", str(o)], check=True)
    parts.append(o)

for k, s in enumerate(sb["shots"]):
    n = round(s["end"] * FPS) - round(s["start"] * FPS)
    v = place.get(s["id"])
    if isinstance(v, str):
        v = [v, 0.0]
    if v and isinstance(v[0], list):
        done = 0
        for j, (clip, ss, d, *o) in enumerate(v):
            m = n - done if j == len(v) - 1 else round(d * FPS)
            seg(src(clip), ss, m, f"{k:03d}_{j}_{s['id']}", o[0] if o else None); done += m
    elif v:
        seg(src(v[0]), v[1], n, f"{k:03d}_{s['id']}")
    elif a.fallback:
        seg(Path(a.fallback), s["start"], n, f"{k:03d}_{s['id']}")
    else:
        black(n, f"{k:03d}_{s['id']}")

(tmp / "list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
cmd = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt")]
cmd += (["-i", a.audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k"] if a.audio else [])
subprocess.run(cmd + ["-c:v", "copy", "-shortest", a.out], check=True)
total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                             capture_output=True, text=True).stdout)
for w in warn:
    print("WARN", w)
print(f"{a.out}: {total:.3f}s (storyboard {sb['shots'][-1]['end']:.3f}s)")
