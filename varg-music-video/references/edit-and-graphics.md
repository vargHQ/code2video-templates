# Edit on the grid and graphics in HyperFrames

## Rough cut (`scripts/rough_cut.py`)

`place.json` maps every storyboard shot to footage; times are seconds in the source clip:

```json
{ "v04": ["01_A1", 3.583],
  "x28": [["12_F2_r5", 3.6, 1.794], ["12_F2_r5", 0.0, 1.794]],
  "x33": [["12_F3", 5.377, 0.897, {"vf": "hue=h=t*600:s=1.7"}],
          ["../clips/o2_v1", 1.5, 0.224, {"freeze": true, "vf": "negate,hue=s=0,lutrgb=r=val*0.2:g=val*0.6:b=val*1.4"}]],
  "p15": [["06_D", 0.0, 1.0, {"vf": "setpts=1.3*PTS,fps=24"}], ["06_D", 1.0, 1.12]] }
```

- A string = one clip from that in-point for the whole shot. A list = segments `[clip, in, dur, opts]`; the last
  segment fills the rest of the shot exactly.
- `opts.vf` = extra ffmpeg filters (tints, slow-mo `setpts=k*PTS,fps=24`, solarise-in blends); `opts.freeze` = hold
  the first frame (2001-style freeze frames, posters).
- Shots missing in `place.json` come from `--fallback` (the animatic), so the cut is always full length.
- The script warns when a segment needs more source than the clip has: that was a real bug twice (a frame of the
  next world flashing in; the cut one frame short, which also trims the song with `-shortest`).
- Re-cuts are cheap: the same generations can be re-ordered into a new sequence (close-up → blast → close-up →
  blast), shots of an old version reused, a missing beat bought by slowing a segment 1.1–1.3×.

## Lip-sync

Only sung close-ups. Slice the vocal stem per phrase, run the lip-sync model on the clip, compare with the original:
in the reference video the generated anime mouth looked better cut per phrase from the original take than after a
lip-sync pass that damped it. Decide per shot.

## Graphics layers (HyperFrames)

Main `index.html`: `#bg` video (the cut upscaled once to 1080×1920, 30 fps) + compositions `fx`, `logos`, `lyrics`
+ the song. Build them from Python lists (html + GSAP calls) so times come from `songmap.json`.

| layer | what worked |
|---|---|
| lyrics | word-timed, a dark rounded box in the top band, active word highlighted; colours by act |
| brand/model tags | logo + **current** model name (`list_models`), flipping on beats; over characters' heads in staggered rows; never in the lyric band; a halo/ring of logos for "100+ models" |
| hits | impact flash or inverted impact frames on hits, camera punches on `#bg` (x/y jitter 6 frames, scale 1.06 → 1) |
| Japanese captions | `anime-jp-subtitles`: fansub + karaoke for sung lines, telop for punchlines, katakana SFX on hits |
| triple split | `anime-triple-split`: three panels on three beats (face / action / threat), hides a weak shot |
| anime inserts | radial focus lines, diagonal cut-in banners, katakana SFX stamps (ドン, ゴゴゴ), manga panel splits, CRT cards that flatline, "NO SIGNAL" cut-ins |
| set pieces | 50 error popups with favicons, provider lanes switching, a shot-plan card, a router ring, end lyrics big over the face |
| 2001 / stargate | slit-scan walls, false-colour eye freeze frames, worlds solarising in, alternating with corridor slices |

HyperFrames gotchas hit in this project:
- animate transforms (`x`, `y`, `scale`), never `left/top`; repeated tweens on one element use `fromTo` with
  `immediateRender:false`; overlays start at `opacity:0` in CSS.
- `mix-blend-mode` elements under a `backdrop-filter` impact frame turn it into a flat colour: keep them apart.
- a state class equal to a component class hides things; prefix state classes.
- under nvm the shell `npx` may be a broken function: call `$HOME/.nvm/versions/node/<v>/bin/npx` with that bin on
  `PATH`. Run `hyperframes check` before every render; a draft render to check, `--quality delivery` for the master.
- after rendering, look at frames at the changed times (contact sheet), not only at the lint result.
