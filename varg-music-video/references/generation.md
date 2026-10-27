# Anchors, generation and QA

## Anchors first (stills, a few credits each)

| anchor | content |
|---|---|
| Character sheet | front, ¾, profile, back + a face close-up, grey background, no text |
| Vehicle / product sheet | several views **plus a person next to it** (scale: ship ≈ 5× a person) |
| Antagonist sheet | the creature + its minions in a separate column (so a minions-only crop is possible) |
| Master plate per location | the establishing frame of each place in the film's look |

One art style line in every prompt (e.g. "1980s anime cel animation in the style of Macross and Bubblegum Crisis,
hand-drawn line art, painted backgrounds, magenta, cyan and violet neon on deep navy, chrome, soft VHS bloom").
Every ref image ≥ 300 px on the short side (pad, do not upscale).

## Runs

- Group shots by `scene` into runs of 4–11 s (Seedance takes 4–30 s; short runs obey better and retake cheaply).
  Pad the last shot with a tail so the run is a whole number of seconds; the tail never goes in the edit.
- A retake of one broken shot is a 4 s run of just that shot, not the whole scene.
- Modes on varg Seedance 2.5 (`byteplus:dreamina-seedance-2-5-260628`, 480p for drafts):
  - **reference** (`provider_options.byteplus.omni_reference_task_type: "reference"`): images + a reference video
    (`@video1`) for camera and timing. Needs a video: image-only requests fail with 400.
  - camera-only reference: hold one frame of a previz/rough shot for 4 s (`tpad=stop_mode=clone`).
  - send reference clips **greyscale** and say "the result must not look like @video1", or you get the reference
    back re-encoded (billed less, frame-identical).
  - no previz at all: image-to-video from a master plate or a character still.

## Prompt template

```
@video1 is a black-and-white previz of this shot. Copy ONLY the camera (framing, lens, position, movement), the
hard-cut timing and where everyone stands. Do not copy its look or its props; the result must not look like @video1.
@image1 is a frame from this same film: <what it shows>. Keep <face, suit, set, light> exactly like this.
@image2 is <the character sheet>: same face, hair, outfit.
<constraints: exactly two arms; hands empty; one person in the cockpit; we are inside, no stars>
Every frame is clean cel animation with crisp ink lines and flat colour: no noise, no grain, no static, no smeared blur.
Look: <style line>.

<N> shots, hard cuts exactly as in @video1:
1. 0.0–1.8 s. <shot size + angle>: <one action>.
2. 1.8–4.0 s. …

Full-bleed 9:16 frame, no borders, no letterbox. No text, letters, numbers, logos or UI anywhere in the frame.
No dialogue, no lip-sync.
```

## Money and bookkeeping

- `check_balance`, `get_current_team` (who pays), `estimate_cost` on one request → quote as the ceiling → explicit
  go → submit with `wait:false` → write the job id into `jobs.json` immediately → poll `get_job` → download to
  `out/NN_<run>.mp4` → write `[file_id, cost_credits]` next to the job.
- Uploads: `create_upload` (with `sha256:` for dedup) then
  `curl -X PUT -H "Content-Type: application/octet-stream" --data-binary @file "https://api.varg.ai<proxy_url>"`.
  In zsh, call a small function per file; a `for p in "a b"; set -- $p` loop does not split.
- A failed job is not billed; say so, fix, resubmit once.

## QA every output (before it goes near the edit)

`bash <skill>/scripts/contact_sheet.sh out/NN_run.mp4 qa/NN.jpg 5` → look at every frame:

1. Count people and arms; every hand belongs to a body in frame.
2. Props that should not exist (a glowing card read as a blade through the fist; a helmet with a third arm).
3. Pass-through (looks like the grey previz) and text drawn by the model.
4. Style drift against the anchors (grey "static" mush = slop: retake with a frame grab of a good shot as ref).
5. Timing: where the actual cut / action lands (models ignore "cut at 3.6 s" sometimes); write the real in-points
   into `place.json`, not the requested ones.

Artifacts of up to ~6 frames are cut out in the edit (jump-cut + slight slow-mo of the part before); anything
longer or anything the director sees twice is a retake.
