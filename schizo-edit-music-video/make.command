#!/bin/bash
# Render the Halofall example: downloads its music, 26 stills and 8 clips from s3.varg.ai (no credits),
# then cuts them on the beat. Needs python3, uv, ffmpeg and curl.
set -euo pipefail
cd "$(dirname "$0")"
CONFIG="${1:-examples/halofall.json}"
NAME="$(basename "$CONFIG" .json)"
mkdir -p out
python3 scripts/generate.py "$CONFIG" --project "work/$NAME"
uv run scripts/edit.py "$CONFIG" --project "work/$NAME" --out "out/$NAME.mp4"
