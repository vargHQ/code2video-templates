#!/usr/bin/env bash
# Original sound effects for the film, synthesized with ffmpeg (no licensed audio).
set -euo pipefail
out="${1:-public/sfx}"; mkdir -p "$out"
f() { ffmpeg -v error -y -f lavfi -i "$1" ${3:-} "$out/$2"; }
f "aevalsrc='0.9*sin(2*PI*1800*t)*exp(-t*90)+0.5*(random(0)*2-1)*exp(-t*160)':s=48000:d=0.12" click.wav
f "aevalsrc='0.35*(random(0)*2-1)*exp(-t*220)+0.25*sin(2*PI*3200*t)*exp(-t*140)':s=48000:d=0.07" key.wav
f "aevalsrc='0.35*(sin(2*PI*880*t)+0.6*sin(2*PI*1318.5*t)+0.4*sin(2*PI*1760*t))*exp(-t*3.2)*(1-exp(-t*400))':s=48000:d=1.6" reveal.wav
f "aevalsrc='0.25*(sin(2*PI*55*t)+0.6*sin(2*PI*110*t)+0.3*sin(2*PI*164.8*t)+0.2*sin(2*PI*220*t)*sin(2*PI*0.25*t))':s=48000:d=20" pad.wav "-af afade=t=in:d=1.5,afade=t=out:st=18.6:d=1.4,lowpass=f=900"
f "aevalsrc='0.4*(sin(2*PI*440*t)+0.7*sin(2*PI*659.3*t)+0.5*sin(2*PI*880*t)+0.3*sin(2*PI*1318.5*t))*exp(-t*1.4)*(1-exp(-t*300))':s=48000:d=3.5" resolve.wav
f "anoisesrc=d=0.5:c=pink:a=0.5" whoosh.wav "-af highpass=f=600,lowpass=f=5000,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.25"
echo "sfx -> $out"
