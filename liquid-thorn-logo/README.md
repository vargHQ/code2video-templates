# Liquid thorn logo

Any word becomes a black-metal logo: glossy black chrome letters with thorns, side horns and a ring of barbed
wire. A cursor drags liquid through it, the letters smear and flood with colour, then settle back.
The fluid is a real WebGL simulation. It renders locally with headless Chrome and ffmpeg: no API calls, no credits.

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_6c082ea3d212.webp" width="640" alt="Liquid thorn logo: the word NOCTURNE in black chrome with thorns and barbed wire, smeared blue by a cursor">

```bash
bun install
bun render.ts --text "NOCTURNE"                                   # 1920x1080, 60 fps, 10 s
bun render.ts --text "ТЬМА" --font amatic --size 1080x1920 --logo-only
bun render.ts --text "VARG" --still 3                             # one PNG to check the look
bash make.command                                                 # renders settings.json, opens out/
```

- `settings.json` holds every option. Flags override it for one run.
- The logo is built from the text on every run: same text + `--seed` = same thorns, `--path-seed` = another
  cursor path. The clip starts and ends at rest, so it loops.
- Open `liquid-thorn-logo.html` in a browser for the live version: move the mouse over the logo, "edit the text"
  changes the word, font and colour.

| flag | default | what |
|------|---------|------|
| `--text` | `VARG` | the word (Latin or Cyrillic, up to ~12 letters reads best) |
| `--font` | `grenze` | `grenze`, `grenzeBold`, `pirata`, `unifraktur`, `metal`, `amatic`, `ruslan` |
| `--color` | `#2a14e0` | liquid colour, also the rim light on the chrome |
| `--seed` / `--path-seed` | `7` / `1` | thorn layout / cursor choreography |
| `--cap1` `--cap2` `--link` | | the two "aka" lines and the underlined link under the logo (`--link ""` hides it) |
| `--logo-only` | off | only the logo, scaled to fill the frame |
| `--no-cursor` | off | hide the drawn arrow cursor |
| `--size` `--fps` `--duration` `--crf` | `1920x1080` `60` `10` `16` | any even size: 1080x1920, 1080x1350 and 1080x1080 work |
| `--audio` | | music under the clip, cut to length with a 1 s fade-out |
| `--out` | `out/<text>-<size>.mp4` | output path |

Requires Bun, ffmpeg and Google Chrome (or Chromium via `--chrome` / `CHROME_PATH`). About 15 frames per second
on an M-series Mac: 10 s at 60 fps takes about 40 s.

How it works: `liquid-thorn-logo.html` draws the word in a gothic web font, grows thorns from its outline, adds
symmetric horns and the wire, then turns the mask into a height field (distance transform + blur) and bakes the
chrome shading on the GPU. A Navier–Stokes fluid (advection, pressure projection, vorticity) displaces the logo
by its velocity and tints it by its dye. With `?render` the page stops its own clock. `render.ts` advances it
one frame at a time with a scripted cursor and pipes screenshots into ffmpeg (x264, yuv420p).
