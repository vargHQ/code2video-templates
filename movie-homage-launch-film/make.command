#!/usr/bin/env bash
# Re-render the example film "I know how" from code. Downloads the finished AI clips (no credits), makes the film
# grain, renders the HyperFrames edit. Needs: bun or node (npx), ffmpeg, Chrome. Output: out/i-know-how.mp4
set -euo pipefail
cd "$(dirname "$0")"
E=example/edit
python3 - <<'PY'
import json, os, subprocess
m = json.load(open("example/assets.json"))
for path, f in m["files"].items():
    dst = os.path.join("example/edit/assets", path)
    if os.path.exists(dst): continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    print("get", path); subprocess.run(["curl", "-fsSL", "-o", dst, f["url"]], check=True)
PY
[ -f $E/assets/grain.png ] || ffmpeg -v error -y -f lavfi -i "nullsrc=s=512x512,geq=lum='128+60*(random(1)-0.5)*2':cb=128:cr=128" -frames:v 1 $E/assets/grain.png
mkdir -p out
npx -y hyperframes@0.8.210 render $E -o out/i-know-how.mp4 --fps 24 --quality delivery
echo "done: out/i-know-how.mp4"
