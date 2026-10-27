#!/bin/bash
# Two quick stills (card 2 at rest + mid-swipe) to check colours without a full render
cd "$(dirname "$0")"
PY=python3; $PY -c "import PIL, numpy" 2>/dev/null || PY=engine/.venv/bin/python
$PY engine/render.py images --settings settings.json --variant bg --still 20 -o out/preview-still.png
$PY engine/render.py images --settings settings.json --variant bg --still 31 -o out/preview-swipe.png
[ "$(uname)" = "Darwin" ] && open out/preview-still.png out/preview-swipe.png || true
