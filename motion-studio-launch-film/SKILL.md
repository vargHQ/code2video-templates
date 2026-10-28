---
name: motion-studio-launch-film
description: >
  Builds a 20-second product launch film (1920x1080, 60 fps, Remotion) from real product screen captures with
  @beamnxw's Opus 5.5 Motion Studio Harness: eight stage files (brief, style, assets, storyboard, motion, sound,
  delivery) that the agent follows to a checked render. Ships a finished example (varg how to: search "ugc ad",
  open the guide) with frame-driven camera, cursor, selection ring, synthesized sound and a closing mark. Local
  Bun + Remotion + ffmpeg, no credits. Use when the user wants a product launch film, a UI demo video, an app
  walkthrough or a feature reveal made from their own screenshots, or asks for the Opus 5.5 motion harness. NOT
  for AI-generated footage or people on camera (use varg-ai) or vertical shorts out of the box (16:9 by default).
  Russian triggers include "лаунч-ролик", "ролик о запуске продукта", "видео из скриншотов", "демо интерфейса",
  "моушн по харнессу".
license: MIT
metadata:
  version: "1.0.0"
  varg.cost.typical: "0 credits (local render)"
  varg.runtime.typical: "about 30 s for the 20 s film at 1080p60 after setup; the agent build is one session"
  varg.models: "none"
  varg.outputs: "mp4 1920x1080 60 fps h264 + aac, png cover, png contact sheet"
  varg.engine: "Remotion 4 + ffmpeg"
  varg.legal: "Harness text by @beamnxw (MIT, THIRD_PARTY_NOTICES.md); Remotion license applies to companies over 3 people"
  varg.source: "github.com/beamnxw/my_works opus55-motion-studio-harness.zip"
  varg.preview: "https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_4f8e7b8ac193.mp4"
---

# Motion Studio launch film

Everything is in `motion-studio-launch-film/` in [vargHQ/code2video-templates](https://github.com/vargHQ/code2video-templates).
If the folder is missing: `git clone --depth 1 https://github.com/vargHQ/code2video-templates && cd code2video-templates/motion-studio-launch-film`.
`CLAUDE.md` in the folder is the harness's own entry point; this file is how to use the template around it.

## Gates (read first)

- **Real states only.** Every screen must be a real capture of the user's product. Never invent a result screen,
  metric, feature or customer. If a state is missing, say which capture is needed or label an illustration.
- **Rights.** Only the user's own product, logo and fonts. Fonts must be licensed for video; otherwise use Geist.
- **Cost.** Local and free. If the user wants AI shots added, use varg-ai and `estimate_cost` first.

## Fast path (the example)

```bash
cd motion-studio-launch-film && bun install && bun run setup
bun run render && bun run cover        # out/final.mp4, out/cover.png
```

## New film

1. Collect: product, viewer, the one action to show, the closing destination, real captures of before → action →
   after (2880x1800 PNG, one per state; `tools/capture-ref.ts` is a puppeteer example), logo, fonts.
2. Fill the "This project" sections in `BRIEF.md`, `STYLE.md`, `ASSETS.md`, `STORYBOARD.md`, `SOUND.md` (the
   example's are there to copy). Propose three directions, pick one, record tokens.
3. Edit `src/config/content.ts` (copy, screens, source-pixel anchors), `timeline.ts` (event frames), `tokens.ts`.
   Render stills first: `bunx remotion still Launch out/s.png --frame=<f>` at every scene and both sides of each
   boundary (179/180, 479/480, 899/900, 1199).
4. Sound: keep `tools/sfx.sh` or supplied, licensed audio; cues live in `src/scenes/Sound.tsx` keyed to the same
   event frames.
5. Render, then inspect the encoded file (`ffprobe`, a contact sheet of boundary frames, `volumedetect` for
   clipping) and fix one responsible track per defect. Report `out/final.mp4`, `out/cover.png`, the contact sheet
   and any missing input.

## Known pitfalls

- A crossfade between two screens while the camera moves double-exposes both. A link click is a cut.
- Overlays (ring, cursor, ripple) must be gone by the cut frame, or they float over the next screen.
- `useCurrentFrame()` inside a `Sequence` is local; the layers here are global on purpose.
