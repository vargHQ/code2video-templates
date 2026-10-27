#!/bin/bash
# Double-click (macOS) or run `bash make.command [subs.json]`: builds out/hf, renders out/anime-jp-subtitles.mp4 and a GIF preview.
cd "$(dirname "$0")"
set -e
CFG=${1:-subs.json}
command -v ffmpeg >/dev/null || { echo "ffmpeg is required: brew install ffmpeg"; exit 1; }
command -v uvx >/dev/null || command -v pyftsubset >/dev/null || { echo "font subsetting needs uv (brew install uv) or fonttools+brotli (pip install fonttools brotli)"; exit 1; }
NPX=${NPX:-npx}
python3 engine/jpsubs.py "$CFG"
$NPX --yes hyperframes@0.8.186 check out/hf
$NPX --yes hyperframes@0.8.186 render out/hf -o out/anime-jp-subtitles.mp4 --quality standard
ffmpeg -v error -y -i out/anime-jp-subtitles.mp4 -vf "fps=12,scale=320:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" out/anime-jp-subtitles.gif
echo "Done: out/anime-jp-subtitles.mp4 + .gif"
[ "$(uname)" = "Darwin" ] && open out || true
