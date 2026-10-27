# Omega-3: Jesus vs The Devil

AI-generated educational podcast about Omega-3 fatty acids. Jesus asks questions, The Devil gives misleading answers using real studies out of context, then the deception is exposed with actual evidence.

## Structure

```
script/
  omega3-script-v2-engaging.md   Final engaging script (56 scenes)
  original-script.md             First draft script
  omega3-v3-scenes.json          Scene definitions (prompts, durations, refs)
  omega3-regen-smart.json        Regen/split plan (which scenes needed rework)
  scene-urls.json                All 88 final video URLs (v4)
  scene-urls-v3.json             Original 56 video URLs (v3)
  gen_v4.py                      Video generation script (H3 Max)
  poll_v4.py                     Job polling script
  build_html_v4.py               HTML storyboard builder
  calc_regen_smart.py            Duration calculator + split heuristic

clips/                           (empty — clips are on S3, see scene-urls.json)

output/
  omega3-episode-15min-captioned.mp4   FINAL: 14:58, captions burned in
  full-17min.mp4                       Full 17:26 version with captions
  15min-no-captions.mp4                15min without captions
  omega3-15min.srt                     SRT for 15min version
  full-17min.srt                       SRT for 17min version
  storyboard-88-scenes.html            Interactive HTML preview (all 88 scenes)
  storyboard-56-scenes.html            Original 56-scene preview

thumbnail/
  thumbnail-nanobanana.jpg      MrBeast-style thumbnail (nano_banana_2)

omega3-youtube-description.txt   YouTube description with chapters + sources
README.md                        This file
```

## Production Summary

| Metric | Value |
|--------|-------|
| Script | 56 original scenes → 88 after splitting long phrases |
| Video model | MiniMax H3 Max (image-to-video, native audio) |
| Duration strategy | 1.8 words/sec + 2s buffer, max 24 words per 15s clip |
| Total video cost | ~$80 (88 H3 Max generations) |
| Transcription | Whisper Large v3 via varg API |
| Captions | ffmpeg libass (Arial 24px, white on black outline) |
| Final length | 14:58 (79 clips, 9 removed for pacing) |
| Thumbnail | nano_banana_2 with character references |

## Workflow

1. **Script** — Written from Brogevity dataset (116 Omega-3 research cards from 30+ YouTube sources)
2. **Character stills** — varg image generation with character + clothing + studio references
3. **Video generation** — H3 Max image-to-video, dialogue embedded in prompt, `generate_audio: true`
4. **Duration matching** — Calculated per-phrase duration, split phrases >24 words into 2 clips
5. **Stitching** — ffmpeg concat (stream copy)
6. **Transcription** — varg Whisper Large v3
7. **Captions** — ffmpeg subtitles filter (libass)
8. **Thumbnail** — nano_banana_2 with both character references

## Key Lessons

- H3 Max native audio: dialogue MUST be in the video prompt, not separate TTS
- `generate_audio: true` is required for native speech
- Phrases >24 words don't fit in 15s — split into separate clips
- H3 Max may repeat short phrases in long clips (15s with <20 words) — keep clips tight
- OTS camera angles are unreliable — use close-ups instead
- Include physical actions (gestures, water drinking, mic interaction) to avoid static shots
