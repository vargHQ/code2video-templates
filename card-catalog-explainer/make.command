#!/bin/bash
# Double-click (macOS) or run `bash make.command [config.json]`: builds out/hf from the config, checks it,
# renders out/<output.name>.mp4. Put music.mp3 / .m4a / .wav next to this file for a music bed.
cd "$(dirname "$0")"
set -e
CFG=${1:-config.json}
command -v ffmpeg >/dev/null || { echo "ffmpeg is required: brew install ffmpeg"; exit 1; }
command -v bun >/dev/null || { echo "bun is required: curl -fsSL https://bun.sh/install | bash"; exit 1; }
NPX=${NPX:-npx}
HF=hyperframes@0.8.186
NAME=$(bun -e "console.log((await Bun.file('$CFG').json()).output.name ?? 'card-catalog-explainer')")
bun engine/build.ts "$CFG"
$NPX --yes $HF check out/hf
$NPX --yes $HF render out/hf -o "out/$NAME.mp4" --quality standard
echo "Done: out/$NAME.mp4"
[ "$(uname)" = "Darwin" ] && open out || true
