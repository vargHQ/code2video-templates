#!/bin/bash
# Double-click (macOS) or run `bash make.command`: renders every picture in images/ into out/
cd "$(dirname "$0")"
set -e

if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg is required:  brew install ffmpeg"; read -n1 -p "Press any key..."; exit 1
fi

PY=python3
if ! $PY -c "import PIL, numpy" 2>/dev/null; then
  if [ ! -x engine/.venv/bin/python ]; then
    echo "First run: installing Pillow + numpy into engine/.venv ..."
    python3 -m venv engine/.venv
    engine/.venv/bin/pip install -q pillow numpy
  fi
  PY=engine/.venv/bin/python
fi

shopt -s nullglob nocaseglob
imgs=(images/*.{png,jpg,jpeg,webp,avif,bmp,tif,tiff})
if [ ${#imgs[@]} -eq 0 ]; then
  echo "images/ is empty: add pictures (they play in filename order) and run again."
  echo "No pictures yet? Try:  $PY engine/make_demo_cards.py images --count 12"
  read -n1 -p "Press any key..."; exit 1
fi

AUDIO=()
for a in audio.mp3 audio.m4a audio.wav audio.aac; do [ -f "$a" ] && AUDIO=(--audio "$a") && break; done

echo "${#imgs[@]} pictures. Rendering..."
$PY engine/render.py images --settings settings.json -o out/stamp-carousel.mp4 "${AUDIO[@]}"
echo "Done."
[ "$(uname)" = "Darwin" ] && open out || true
