# Apple Notes video

Any text → a 9:16 video of an iPhone Apple Notes screen where the note gets typed live: iOS keyboard with key
pops, caret blink, auto-scroll, key clicks, optional music and an end card.
Renders locally with headless Chrome and ffmpeg: no API calls, no credits.

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_c18871a17715.webp" width="270" alt="Apple Notes video: a lowercase ad note typed line by line, then an end card">

```bash
bun install
bun notes-video.ts --script examples/goose-style.json --out out/en.mp4
bun notes-video.ts --text post.txt --end-title "Now in\nvarg." --end-url varg.ai --out out/post.mp4
```

- `--text` takes a file, `-` (stdin) or the text itself: line 1 is the title, every line is a typed paragraph,
  `- [ ] item` / `- [x] item` are checklist rows, `---` is a divider.
- `--script` takes JSON with per-line pauses, typing speed and the end card. See `SKILL.md` for the format and
  for how an agent should rewrite any text into a note before rendering.

Requires Bun, ffmpeg and Google Chrome (or `bunx playwright install chromium`). About 2× real time on an
M-series Mac.

The phone screen is the Apple Notes skin from
[gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) (`parts/phone-chat`, MIT,
`vendor/LICENSE-gooseworks`), patched for any alphabet and the system SF font.
