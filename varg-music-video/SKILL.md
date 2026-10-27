---
name: varg-music-video
description: >-
  Make an AI music video with varg from a song: measure the song (beats, downbeats, word timings), write a story that
  visualises the lyrics, storyboard it on the beat grid, lock character/vehicle/location anchors, generate short
  Seedance scenes, QA every output, cut them frame-exact onto the song, add lyrics and graphics in HyperFrames, run
  director-note rounds and export (incl. a small file for Telegram). Use when the user wants a music video, a clip for
  a track, a lyric-driven AI video, an anime/cinematic video to a song, or asks how such a video is made. Simple path
  first; for heavy camera/geography work hand over to varg-previz.
metadata:
  author: vargHQ
  version: "1.0.0"
compatibility: >-
  python3 with librosa (song map) and optionally faster-whisper (word timings); ffmpeg/ffprobe; HyperFrames CLI for
  the graphics pass; varg MCP (https://mcp.varg.ai/mcp) for generation.
---

# varg music video: song → story → shots → cut → graphics

Built from a 99 s, 36-shot, 9:16 anime music video ("I Don't Wanna Pick", 133.8 BPM, 9 director-note rounds).
The song is the spine: every cut, shot length and graphic sits on its grid. Spend credits only after the story,
storyboard and anchors are agreed.

## Pick the path

| project | do |
|---|---|
| 15–40 s, one or two places, simple camera | **Simple path** below, image-to-video or reference video per scene |
| a full song, many places, scale (ships, monsters), camera matters | Simple path for the song, story and edit + `varg-previz` for a 3D previz and Seedance video-to-video |
| typography/lyric video without AI footage | `music-to-video` (HyperFrames) |

## Simple path (in this order)

1. **Song map** → `songmap.json`: BPM, beats, downbeats, sections, every word with start/end.
   `python3 <skill>/scripts/songmap.py assets/song.mp3 --lyrics lyrics.txt --out songmap.json`
   → `references/song-map.md`
2. **Story**: hook in the first 2 s, one story beat per section, a payoff at the drop, a callback ending. Every lyric
   line gets a picture that shows it *literally* ("provider died" → a server card flatlines). → `references/story.md`
3. **Storyboard** → `storyboard.json`: one shot per 1–2 bars, cuts on downbeats, `id start end line picture action
   camera scene overlay source`. Text, logos, UI go in `overlay` (drawn later), never in `picture`.
4. **Anchors** (cheap stills, before any video): character sheet, vehicle/product sheet with a person for scale,
   antagonist sheet, one master plate per location. → `references/generation.md`
5. **Generate by scene**: group shots by location into 4–11 s runs; one test run, look at it, then the batch. Price
   first, ask before spending. QA every output with a contact sheet. → `references/generation.md`
6. **Rough cut on the grid**: `place.json` maps each shot to clip + in-point (or several segments);
   `python3 <skill>/scripts/rough_cut.py storyboard.json place.json renders/cut.mp4 --clips out/ --audio song.mp3`
   → `references/edit-and-graphics.md`
7. **Lip-sync** only the sung close-ups, from vocal-stem slices.
8. **Graphics in HyperFrames**: word-timed lyrics, brand/model tags, impact flashes, camera punches, anime inserts.
   → `references/edit-and-graphics.md`
9. **Director rounds**: log notes verbatim, fix, re-render as a new version, report. → `references/review-loop.md`
10. **Deliver**: master + `bash <skill>/scripts/tg_export.sh renders/final_vN.mp4` (≈38 MB for 99 s 1080×1920).

## Hard rules (each one cost a retake)

- **Grid first.** Shot boundaries are beat times from `songmap.json`; the cut is frame-exact
  (`round(t*fps)`), and the cut's length must equal the song's. Check with `ffprobe` after every cut.
- **No text from the model.** Every prompt ends with "No text, letters, numbers, logos or UI. Full-bleed 9:16, no
  letterbox." Lyrics, names, prices, logos are HyperFrames layers.
- **One location = one set of refs.** Only refs of what is in frame; an exterior still in an interior shot pulls the
  exterior in. After a rewrite, old stills are stale.
- **Consistency from your own best frames.** For a retake, add a frame from a good shot of the same film as a ref
  ("@image2 is a frame from this same film: copy its design and drawing style"). This fixed an "AI slop" scene.
- **Words that make slop:** "TV static", "noise", "glitch", "grain" in a prompt get drawn as grey mush. Add the
  effect in post; in the prompt write "clean cel animation, crisp ink lines, flat colour, no noise/grain/static".
- **Anatomy and props:** say "exactly two arms", "his hands are empty: no card, no tablet, no glowing object", "one
  person in the cockpit". A prop or pose in the reference video gets copied, so remove it from the reference.
- **Seedance 2.5 reference mode needs a video ref** (`omni_reference_task_type: "reference"` with images only →
  400). For a camera-only ref, hold one previz frame for 4 s; send refs in greyscale so the output is not a
  pass-through.
- **Times in prompts are absolute** from the clip start ("2.4–4.0 s: she puts the helmet on").
- **Credits:** quote `estimate_cost` as the ceiling, report billed cost (~16 credits/s at 480p on byteplus Seedance
  2.5: 4 s ≈ 65, 6 s ≈ 97, 9 s ≈ 145). Ask before every paid batch and before switching the billing team; log job ids
  in `jobs.json` the moment they are submitted.
- **Current model names** for on-screen tags come from varg `list_models`, never from memory (the director caught
  "seedance 2", "sync v2" as stale).
- **Overlays never cover the lyric band** and never sit on faces; text ≥ 40 px on a 1080-wide frame.
- **Never overwrite a delivered version**: `final_v7 → final_v8`; back up `place.json` before re-cutting.

## Files a project ends with

`brief.md` (director notes, dated, verbatim) · `songmap.json` · `storyboard.json` · `refs/` (sheets, plates, frame
grabs) · `requests*.json` + `jobs.json` (job ids, file ids, billed credits) · `out/` (generations) · `place.json` ·
`renders/cut.mp4` · `hf/` (HyperFrames project) · `renders/final_vN.mp4` + `_tg.mp4`.

## Related skills

`anime-jp-subtitles` (fansub/karaoke lines, telop, tategaki, katakana SFX), `anime-triple-split` (manga three-panel
split), `varg-previz` (three.js previz, scene grouping, Seedance v2v pack, character sheets, Hero's Journey), `varg-ai`
(single generations), `hyperframes` (+ `hyperframes-animation`, `music-to-video` for typography).
