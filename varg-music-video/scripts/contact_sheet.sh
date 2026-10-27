#!/usr/bin/env bash
# QA contact sheet with timestamps: contact_sheet.sh <video> <out.jpg> [fps=4] [cols=12] [width=160] [start=0] [dur=all]
set -euo pipefail
in=$1; out=$2; fps=${3:-4}; cols=${4:-12}; w=${5:-160}; ss=${6:-0}; t=${7:-}
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
len=${t:-$(python3 -c "print(max(0.1,$d-$ss))")}
rows=$(python3 -c "import math;print(max(1,math.ceil($len*$fps/$cols)))")
ffmpeg -v error -y -ss "$ss" ${t:+-t "$t"} -i "$in" -vf "fps=$fps,scale=$w:-1,drawtext=text='%{pts\:hms}':x=2:y=2:fontsize=12:fontcolor=yellow:box=1:boxcolor=black,tile=${cols}x${rows}" -frames:v 1 "$out"
echo "$out"
