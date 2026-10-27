#!/bin/bash
# Double-click (macOS) or run `bash make.command [split.json]`: builds the HyperFrames project, renders MP4 + GIF into out/.
cd "$(dirname "$0")"
set -e
CFG=${1:-split.json}
command -v ffmpeg >/dev/null || { echo "ffmpeg is required: brew install ffmpeg"; exit 1; }
NPX=${NPX:-npx}
OUTDIR=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('out','out/hf'))" "$CFG")
NAME=$(basename "$CFG" .json)
python3 engine/split.py "$CFG"
$NPX --yes hyperframes@0.8.186 check "$OUTDIR"
$NPX --yes hyperframes@0.8.186 render "$OUTDIR" -o "out/$NAME.mp4" --quality standard
ffmpeg -v error -y -i "out/$NAME.mp4" -vf "fps=15,scale=320:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "out/$NAME.gif"
echo "Done: out/$NAME.mp4 + out/$NAME.gif"
[ "$(uname)" = "Darwin" ] && open out || true
