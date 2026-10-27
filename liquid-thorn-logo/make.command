#!/bin/bash
# Double-click (macOS) or run `bash make.command`: renders settings.json into out/
cd "$(dirname "$0")"
set -e

need() { command -v "$1" >/dev/null || { echo "$1 is required: $2"; read -n1 -p "Press any key..."; exit 1; }; }
need bun "curl -fsSL https://bun.sh/install | bash"
need ffmpeg "brew install ffmpeg"

[ -d node_modules ] || bun install

bun render.ts "$@"
open out 2>/dev/null || true
