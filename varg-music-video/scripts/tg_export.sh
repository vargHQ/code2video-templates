#!/usr/bin/env bash
# Small H.264 copy for Telegram/chat: tg_export.sh <in.mp4> [720]   → <in>_tg.mp4  (99 s 1080x1920 ≈ 38 MB; 720 ≈ 15–18 MB)
set -euo pipefail
in=$1; out="${in%.*}_tg.mp4"; scale=""
[ "${2:-}" = "720" ] && scale="-vf scale=720:-2:flags=lanczos"
ffmpeg -v error -y -i "$in" $scale -c:v libx264 -preset slow -crf 24 -maxrate 3M -bufsize 6M -pix_fmt yuv420p \
  -profile:v high -level 4.1 -r 30 -c:a aac -b:a 160k -movflags +faststart "$out"
ls -la "$out"
