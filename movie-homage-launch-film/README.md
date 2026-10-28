# Movie-homage launch film

A 45-60 s cinematic launch film for a product, built as an homage to one iconic movie scene. The example is
**"I know how"**, varg's launch film for [varg.ai/how-to](https://varg.ai/how-to): an homage to the "I know kung fu"
scene in *The Matrix*. An operator searches varg how to and loads the skill into a porcelain android. It says "I know
how to make a music video". "Show me." Then it makes one.

- Film (47 s, 1080p): https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_291d768132f5.mp4
- three.js animatic (styled previz + the edit): https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_dd99b62ca242.mp4

## Re-render the example (no credits)

```bash
bash movie-homage-launch-film/make.command     # -> movie-homage-launch-film/out/i-know-how.mp4
```

Needs ffmpeg, Chrome and `npx` (Node or Bun). It downloads the finished AI clips and renders the HyperFrames edit.

## Make your own

Ask your agent to read `SKILL.md`: it lists the questions to ask, the story pattern, the pipeline step by step
(storyboard → character sheets → three.js previz with a styled look → plates → Seedance 2.5 video-to-video →
on-camera lip-sync → a music video with a real song → the edit in code), the models, the fallbacks and the checks.
`PROMPTS.md` has every prompt of the example verbatim.

| step | models (on varg, one key) |
|---|---|
| stills, sheets, plates | `gpt_image_2_5`, `nano_banana_2_1` |
| shots | `seedance_2_5` video-to-video, `kling_v4` image-to-video for face close-ups |
| voices, lip-sync | `eleven_v4`, `sync_v3` |
| score, song | `eleven_music_v2_5`, `lyria_3_5` |
| edit | HyperFrames (local, no credits) |

About $12 for a first cut, about $24 with two rounds of notes (the example's real bill).

The film's fonts are varg's (Aeonik is licensed to varg and fetched from varg.ai at render time; swap in your
brand's fonts). Fragment Mono is SIL OFL.
