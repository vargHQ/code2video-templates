# AGENTS.md

vargHQ/templates is a library of code2video templates. Each top-level folder renders a finished MP4 from code.

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
| `anime-jp-subtitles/` | Japanese anime captions over a video: fansub + karaoke, TV telop, tategaki, katakana SFX | `bash make.command` | no |
| `anime-triple-split/` | manga three-panel split screen that slams in on the beat | `bash make.command` | no |
| `varg-music-video/` | AI music video from a song: song map, beat-grid storyboard, Seedance scenes, frame-exact cut | agent skill, see `SKILL.md` | yes |
| `varg-previz/` | three.js grey-box previz of every shot, then Seedance 2.5 video-to-video per scene | `python3 varg-previz/scripts/new_previz.py <dir>` | yes |
| `varg_jsx/*.tsx` | AI-footage videos (Seedance, Kling, Veo, ElevenLabs): UGC ads, talking heads, product videos, explainers | `bun run render varg_jsx/<file>.tsx` | yes |

Skills for Claude Code are linked in `.claude/skills/<name>` → `../../<name>`. `varg_jsx/README.md` documents the JSX
components and models.

## Rules

- `varg_jsx/` spends varg credits. Estimate first, and wait for the user's yes before generating. The cache is
  sacred: never clear it, same prompts re-render for free.
- Never commit media (mp4, mov, webm, mp3, wav, png, jpg, gif). Host previews on s3.varg.ai and link them.
- A new template is a root folder with `SKILL.md`, `README.md` and a one-command render, on a `template/<name>`
  branch. Add it to this index, `llms.txt` and the README table.
