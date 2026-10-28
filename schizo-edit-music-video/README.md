# schizo-edit-music-video

<img src="https://s3.varg.ai/files/72c55813-c0fa-4cf2-9f64-ec4f7ed0e7ae/file_377df41542cd.webp" width="270" alt="Halofall: marble statues, a spiral eye and golden halos in violet, cut several times per beat">

A 16-second vertical AI music video cut 3–4 times per beat: AI stills and a few animated clips in one two-colour
look, a random effect on every shot, and the track title building one letter per cut at the end. The example,
**Halofall**, has 69 cuts at 89 BPM: marble statues, portals and sacred geometry in violet and molten gold.
Its music, all 26 stills and all 8 clips were generated on [varg](https://varg.ai) for about $5.30.

[Watch Halofall (MP4)](https://s3.varg.ai/files/72c55813-c0fa-4cf2-9f64-ec4f7ed0e7ae/file_14afb4b8189d.mp4)

## Render the example

Needs python3, [uv](https://docs.astral.sh/uv/), ffmpeg and curl. No API key and no credits: the example's media
is downloaded from s3.varg.ai.

```bash
bash make.command            # -> out/halofall.mp4, about 1 minute
uv run scripts/edit.py examples/halofall.json --project work/halofall --seed 12 --out out/halofall-12.mp4
```

A different `--seed` gives a different cut of the same media.

## Make your own

1. Copy `examples/halofall.json`, delete every `url`, and change the title, the `look` line, the music prompt, the
   still and clip prompts and the section pools. [`SKILL.md`](SKILL.md) explains every field.
2. `python3 scripts/generate.py examples/<name>.json --project work/<name> --only stills` and check the stills.
3. `python3 scripts/generate.py examples/<name>.json --project work/<name>` for the music and the clips.
4. `bash make.command examples/<name>.json`

`generate.py` writes every new url back into the config, so a re-run never pays twice and only retries what failed.
It reads the varg key from `VARG_API_KEY` or `~/.varg/credentials` ([get a key](https://varg.ai/dashboard/api)).

| step | model | cost |
|---|---|---|
| music, 20 s instrumental | `eleven_music_v2_5` | $0.05 |
| 26 stills, 9:16 | `google:nano_banana_2` | $0.07 each |
| 8 clips, 5 s, 9:16 | `piapi:seedance-2-mini` | $0.42 each |
| cut, effects, title, export | ffmpeg + Pillow, local | free |

## How the edit works

- **Beat grid:** librosa measures the tempo and the first beat; every beat is split into 3–4 shots (half or whole
  beats in the title section). No image repeats within four shots.
- **Every shot:** a slow zoom or drift, one effect from its section's list (duotone invert, mirror, kaleidoscope,
  pixelate, RGB split, glitch band, scanlines, flash, double exposure, gold halo rings, light rays), then one grade
  on everything: violet shadows, warm highlights, grain and a vignette.
- **Title:** from `title_from`, each cut adds one letter (Cinzel Bold with a two-layer glow), laid out on the full
  word so the letters never shift.
- Each shot renders to its own file and the shots are joined losslessly, then the music is muxed with a 0.6 s fade.

The format comes from an AI music video posted on X; everything in this template (images, clips, music, title and
code) is new. Remake structures, not footage: never reuse someone's footage, song, face or name.
