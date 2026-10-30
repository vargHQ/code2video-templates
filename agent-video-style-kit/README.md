# Agent Video Style Kit

Your video's title and caption style as a file an agent reads and applies. The kit is
[Cut30's Agent Video Style Kit](https://cut30.co/guides/agent-video-style-kit) (in `kit/`, unmodified): separate
specs for 9:16 (1080 × 1920) and 16:9 (1920 × 1080) with font, sizes, title bar, caption outline, positions, words
per caption, line limits and safe zones, plus an HTML preview (`kit/style-kit.html`). `render.ts` applies it: it
burns the kit's title and timed captions onto your footage and warns when text breaks the kit's limits.

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_57d2991d9697.webp" width="100%" alt="agent-video-style-kit: the same title bar and outlined captions applied to a 9:16 and a 16:9 frame">

```bash
bun install
bun render.ts                                                     # the example, both ratios -> out/
bun render.ts --video talk.mp4 --captions words.json --title "3 hooks that keep viewers" --title-until 3
bun render.ts --video talk.mp4 --captions talk.srt --position alternative
bun render.ts --help
```

- **Captions** come from word timestamps (`words.json`: `[{word,start,end}]`, `{words}` or `{segments:[{words}]}`)
  or an `.srt`, cut into the kit's 2-3 words per chunk at punctuation and pauses. `--text` spreads words evenly when
  there are no timings.
- **Format** follows the footage (taller than wide = 9:16) or `--ratio`. Footage is scaled and center-cropped to the
  canvas; audio is kept.
- **Checks**: lines over `maxLines`, text inside a safe zone, a font that did not load. Rules that need eyes (faces,
  collisions) are in `kit.json` and `SKILL.md`.
- **Your style**: edit `kit/kit.json`, then `python3 kit/kit.py validate kit && python3 kit/kit.py embed kit` to
  sync the preview page. See `kit/README.md`.

Local Bun, Chrome and ffmpeg, no API key, no credits. Agents: read [`SKILL.md`](SKILL.md).

Credits: the style kit is by [Cut30](https://cut30.co); see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
The renderer is MIT, like the rest of this repo.
