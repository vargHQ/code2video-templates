# Anime Japanese subtitles

![Japanese subtitles: fansub karaoke, TV telop, tategaki column, katakana SFX](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_998a68490f83.gif)

Japanese captions in anime style on top of any video, rendered with [HyperFrames](https://hyperframes.heygen.com).
You write the lines in `subs.json`, and the engine builds a HyperFrames project, renders an MP4 and makes a GIF preview.

| style | looks like | use for |
|---|---|---|
| `fansub` | Japanese line at the bottom with a thick black outline + a small English line under it; `karaoke: true` sweeps a colour across the Japanese line | lyrics, dialogue |
| `telop` | Japanese TV variety caption: heavy gothic letters pop in one by one with a bounce, double outline (white + colour), hard shadow; `shake: true` | punchlines, reactions, "say it big" moments |
| `tategaki` | vertical 縦書き narration column in a black ink box, characters type in | inner voice, narration, location names |
| `sfx` | katakana onomatopoeia stamp (ドン!!, ゴゴゴ, キッ, ガシャン!!): slams in and shakes on twos | hits, impacts, menace |

No AI calls and no credits: it is HTML/CSS/GSAP rendered locally. Fonts are [Dela Gothic One](https://fonts.google.com/specimen/Dela+Gothic+One)
(display) and [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) (text), both SIL OFL. They are
downloaded on first run and subset to the characters you use (a few dozen KB).

## Usage

1. Set `"video"` in `subs.json`: a path relative to the config or an http(s) URL (downloaded once into `examples/`).
   The example uses an 8 s clip hosted on S3, so `bash make.command` works right after cloning.
2. Edit `subs.json` (times in seconds from the start of the video).
3. Run `bash make.command` (or double-click it on macOS).
4. Collect `out/anime-jp-subtitles.mp4` and `out/anime-jp-subtitles.gif`. The HyperFrames project is in `out/hf/`
   (`npx hyperframes preview out/hf` to scrub it).

```json
{ "video": "https://s3.varg.ai/…/file_325c729754c2.mp4", "width": 1080, "height": 1920, "seed": 7,
  "subs": [
    { "style": "fansub", "start": 0.2, "end": 2.45, "jp": "またプロバイダーが落ちた", "en": "Provider died on me again", "karaoke": true },
    { "style": "telop", "start": 2.5, "end": 4.15, "jp": "シーダンス、\nどう呼ぶ？", "color": "#ffd23d", "outline": "#e3122f", "size": 150, "shake": true },
    { "style": "sfx", "start": 2.77, "end": 3.6, "jp": "ドン!!", "x": 90, "y": 250, "size": 230 },
    { "style": "tategaki", "start": 4.2, "end": 5.95, "jp": "鍵はどこだ、いつなんだ", "side": "right", "size": 66, "y": 260 }
  ] }
```

### Options per line

| key | styles | meaning |
|---|---|---|
| `start`, `end` | all | seconds |
| `jp` | all | Japanese text; `\n` breaks a `telop` into lines |
| `en` | fansub | translation line under the Japanese |
| `size` | all | font size in px (fansub and telop shrink automatically so the line never wraps or leaves the frame) |
| `y` | fansub, telop, tategaki | top of the block in px (fansub default: 470 px above the bottom; telop `pos: "bottom"/"top"`) |
| `karaoke`, `karaoke_color`, `karaoke_from`, `karaoke_to` | fansub | colour sweep across the Japanese line |
| `color`, `outline`, `rot`, `stagger`, `shake` | telop | fill, outer outline, tilt (deg), seconds between letters, jitter while held |
| `side`, `x`, `type_step` | tategaki | left/right column, exact x, seconds per typed character |
| `x`, `y`, `size`, `rot`, `vertical`, `color`, `stroke`, `shadow_color` | sfx | placement and colours of the stamp |

## Tips

- Lyrics timing: take word times from a transcript (`faster-whisper` with word timestamps) and put each sung line
  in a `fansub` with `karaoke_from`/`karaoke_to` = first and last word.
- Translation: write natural Japanese, not word-for-word. Katakana for brand names (シーダンス, ヘイジェン), short
  sentences, end with 。or ？ only in narration.
- Keep a `telop` on screen at least 1.2 s; `sfx` 0.6–1 s on the hit frame.
- On 9:16, keep subtitles out of the bottom ~300 px (platform UI) and off faces.

Requirements: `ffmpeg`, Python 3, `uv` (`brew install uv`) or `pip install fonttools brotli` for font subsetting,
Node with `npx` (HyperFrames is fetched by `npx --yes hyperframes@0.8.186`). Set `NPX=/path/to/npx` if your shell's
`npx` is a broken nvm function. An 8 s 1080×1920 render takes about 15 s on an M-series Mac.
