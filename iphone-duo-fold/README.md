# iPhone Duo fold

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_78fc62c86c30.webp" width="600" alt="iPhone Duo fold: a folded phone shows a lock screen with an aurora over a desert cabin, then opens to the whole horizon, the moving half blurring as it turns">

[GIF](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_a8fdfb18c0b9.gif) · [MP4 16:9](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_d308f2e74e3b.mp4) · [MP4 9:16](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_30c23042acea.mp4). Rendered from this folder:
`bun render.ts --config examples/aurora.json` (add `--size 1080x1920` for the vertical cut).

Put your app on Apple's foldable iPhone and render the fold as a video. The phone opens in 3D and the moving half
blurs and darkens toward its edge as it turns, the effect from Apple's iPhone Duo launch. Your screens stay locked in
place while the panel moves. Pick a picture for the cover (what you see folded) and one for the inner screen, or
use one picture for both. Each can be an image, a screen recording, an HTML page or a URL. Add a title and choose a
size. You get an MP4, or a transparent ProRes/WebM to drop into an edit.

It runs locally: Bun, headless Chrome and ffmpeg. No API key, no credits.

```bash
cd iphone-duo-fold && bun install
bun render.ts --screen my-app.png --title "Meet Foldy"         # out/meet-foldy-1920x1080.mp4
```

Or double-click `make.command` (macOS) to render whatever is in `settings.json`.

## Screens

| screen | flag | shown when | best size | HTML viewport |
|---|---|---|---|---|
| inner | `--inner FILE` | open | 2400×1688 (1.42 : 1) | 1200×844 |
| cover | `--outer FILE` | folded | 1161×1688 (0.69 : 1) | 581×844 |
| one picture for both | `--screen FILE` | the cover shows its right half | 2400×1688 | 1200×844 |

`FILE` is a `.png/.jpg/.webp/.avif`, a video (`.mp4/.mov/.webm`, which holds its last frame), an `.html` page
(screenshotted at 2×) or an `https://` URL. `--screen builtin` gives a gradient wallpaper with a lock-screen clock.
The defaults in `settings.json` use `examples/trips-inner.html` and `examples/trips-cover.html`, a made-up travel
app drawn in CSS. Copy them to build your own screens.

## Options

```bash
bun render.ts --help
```

| flag | default | |
|---|---|---|
| `--preset` | `unfold` | `unfold`, `fold`, `loop` (open-close-open, loops cleanly) or `reveal` (spins in from the back, then unfolds) |
| `--duration` | preset length | the preset timing stretches to fit |
| `--keys JSON` | | your own keyframes: `{"open":[[0,0],[2,180]],"yaw":[[0,-20],[2,0]],"pitch":[[0,6],[2,0]],"zoom":[[0,1],[4,1.05]]}` |
| `--finish` | `star-white` | or `night-sky`, the two colours in Apple's model |
| `--cover-x` | `right` | with `--screen`: which half the cover shows. `right` continues into the open view; also `left`, `center` or 0–0.5 |
| `--title`, `--subtitle` | | caption hugging the phone (`--caption-at bottom` to move it, `--ink` for its colour, `--caption-in` for when it fades in) |
| `--background` | `#f2f1ed` | any CSS colour or gradient, or `transparent` |
| `--size` | `1920x1080` | `1080x1920`, `1080x1350`, `1080x1080`, … |
| `--fps`, `--crf` | `60`, `16` | `--fps 30` renders twice as fast |
| `--audio FILE` | | music, cut to the clip with a 1 s fade-out |
| `--out FILE` | `out/<title>-<size>.mp4` | `.mov` = ProRes 4444, `.webm` = VP9 (both keep alpha) |
| `--still SECONDS` | | write one PNG instead of a video |
| `--serve` | | live preview with a scrubber at http://127.0.0.1:4178 |

`settings.json` takes the same keys (`caption_at` instead of `--caption-at`), plus:
- `blur`: blur radius in source pixels, 72 like upstream.
- `fill`: how much of the frame the phone fills, 0.78.
- `follow`: 1 keeps the folded phone centred.
- `caption_in`: when the caption's 0.6 s fade-in starts, in seconds (0.3).
- `clock`: the time and date on the built-in screen.

Keyframes are `[seconds, value]` and ease between each other. `open` is the hinge angle (0 closed, 180 flat),
`yaw` and `pitch` turn the camera in degrees, and `zoom` scales the framing.

## How it works

`page/duo.js` is a port of [jadon7/iphone-duo](https://github.com/jadon7/iphone-duo) (MIT). It keeps:
- the hinge rotation and the Hermite bend of the flexible screen strip;
- screen pictures projected from a fixed front view;
- the progressive blur and darkening.

On top of that it adds:
- a keyframed timeline;
- a camera that orbits and keeps the folded phone framed;
- captions;
- image, video and HTML screens;
- a frame-exact `window.duo.seek(t)`, which `render.ts` drives in headless Chrome, piping the frames into ffmpeg.

Upstream flattens Apple's USDZ with Python before loading it. Here `page/duo-model.js` does that in the browser:
it picks the open pose and the colour variant and merges the layers. `page/usd-crate-listops.js` adds the two
USD crate types that three.js can't read yet.

## Apple's model

The phone is Apple's own AR Quick Look model of the iPhone Duo. It is **not** in this repo. The first render
downloads it from apple.com into `assets/` (8 MB) and checks its SHA-256. You can also fetch it ahead of time with
`bun render.ts --setup`. Don't commit or redistribute that file.

iPhone and Apple are trademarks of Apple Inc. This template is not made or endorsed by Apple. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
