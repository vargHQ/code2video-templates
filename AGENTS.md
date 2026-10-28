# AGENTS.md

vargHQ/code2video-templates is a library of code2video templates. Each top-level folder renders a finished MP4 from code.

## Use a template

1. Pick one from the index below by what the user wants to see.
2. Read `<folder>/SKILL.md` before anything else. It lists the inputs to ask for, what to edit, the render command
   and how to check the result.
3. Change the inputs and config the SKILL.md names. Leave the engine alone unless the SKILL.md says where to edit.
4. Render in the background (30 s to 15 min), look at a few frames, then hand over the MP4.

## Index

| folder | makes | render | credits |
|---|---|---|---|
| `apple-notes-video/` | any text typed live in an iPhone Apple Notes screen, 9:16 | `bun notes-video.ts --text … --out out/x.mp4` | no |
| `stamp-carousel/` | iPhone swiping through pictures as postage stamps; background or alpha | `bash make.command` | no |
| `liquid-thorn-logo/` | any word as a black-metal chrome logo smeared by a WebGL fluid | `bun render.ts --text "WORD"` | no |
| `card-catalog-explainer/` | 56 s explainer: wall of renders, then one request through a card catalog to the MP4; any catalog via `config.json` | `bash make.command` | no |
| `iphone-duo-fold/` | your screens (image, screen recording, HTML, URL) on the foldable iPhone Duo, unfolding in 3D with its progressive blur; MP4 any size or transparent | `bun render.ts --screen app.png` | no |
| `motion-studio-launch-film/` | 20 s product launch film (1920x1080, 60 fps) from real screen captures, built with @beamnxw's Opus 5.5 Motion Studio Harness: brief, style, storyboard, frame-driven camera + cursor, synthesized sound, checked render. Example: varg how to | `bun install && bun run setup && bun run render` | no |
| `anime-jp-subtitles/` | Japanese anime captions over a video: fansub + karaoke, TV telop, tategaki, katakana SFX | `bash make.command` | no |
| `anime-triple-split/` | manga three-panel split screen that slams in on the beat | `bash make.command` | no |
| `varg-music-video/` | AI music video from a song: song map, beat-grid storyboard, Seedance scenes, frame-exact cut | agent skill, see `SKILL.md` | yes |
| `varg-previz/` | three.js grey-box previz of every shot, then Seedance 2.5 video-to-video per scene | `python3 varg-previz/scripts/new_previz.py <dir>` | yes |
| `movie-homage-launch-film/` | 45-60 s cinematic launch film as an homage to one movie scene: three.js styled previz, Seedance v2v, on-camera lip-sync, a music video with a real song, product UI + live site demo + end card in code. Example: varg's "I know how" | `bash movie-homage-launch-film/make.command` (example, no credits); new films via `SKILL.md` | yes (new films) |
| `varg_jsx/*.tsx` | AI-footage videos (Seedance, Kling, Veo, ElevenLabs): UGC ads, talking heads, product videos, explainers | `bun run render varg_jsx/<file>.tsx` | yes |

Skills for Claude Code are linked in `.claude/skills/<name>` → `../../<name>`. `varg_jsx/README.md` documents the JSX
components and models.

## Rules

- `varg_jsx/` spends varg credits. Estimate first, and wait for the user's yes before generating. The cache is
  sacred: never clear it, same prompts re-render for free.
- Never commit media (mp4, mov, webm, mp3, wav, png, jpg, gif). Host previews on s3.varg.ai and link them.
- A new template is a root folder with `SKILL.md`, `README.md` and a one-command render, on a `template/<name>`
  branch. Add it to this index, `llms.txt` and the README table.
