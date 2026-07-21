# Formula Care — Tai Chi Challenge Video

Multi-episode UGC-style vertical video (1080×1920, 30fps) for a Tai Chi
wellness product. Built with the varg SDK using consistent characters from
real photo references, kling-v3 native audio dialogue, and auto-trimmed clips
via whisper speech detection.

## Episodes

| File | Episode | Duration | Description |
|------|---------|----------|-------------|
| `full.tsx` | **Full video** | ~160s | All 4 episodes in one render call |
| `ep2.tsx` | Gym Ad | ~20s | Squats + "you don't need to spend hours sweating" |
| `ep3.tsx` | "The Bet" | ~35s | Mirror selfie before/after, 28-day transformation |
| `ep4.tsx` | "Morning Stiffness" | ~17s | Misty porch tai chi + voiceover |
| `ep5.tsx` | "No Excuses" | ~88s | Forest walk dialogue, 12 clips |

### Legacy / variants (`legacy/`)

| File | Description |
|------|-------------|
| `legacy/ep1.tsx` | Early gym intro (7 scenes, older prompt style) |
| `legacy/slideshow.tsx` | Original image-only slideshow (13 scenes, Ken Burns) |
| `legacy/ep2-cloud.tsx` | ep2 adapted for `POST /v2/render` (no imports, globals) |
| `legacy/ep3-cloud.tsx` | ep3 cloud variant |
| `legacy/ep3-lite.tsx` | ep3 lightweight variant |
| `legacy/ref-images.ts` | Generate all scene images for ep3/ep4/ep5 (cache pre-warm) |
| `legacy/ep2-images.ts` | Generate all scene images for ep2 (cache pre-warm) |
| `legacy/assets/` | Legacy SRT files (pre-auto-caption era) |

## Usage

### Render the full video (all 4 episodes, one output)

```bash
nohup bun run render templates/formula-care/full.tsx \
  -o output/formula-care/full.mp4 \
  > output/formula-care/full/render.log 2>&1 &
```

### Render a single episode

```bash
bun run render templates/formula-care/ep2.tsx -o output/formula-care/ep2.mp4
bun run render templates/formula-care/ep3.tsx -o output/formula-care/ep3.mp4
bun run render templates/formula-care/ep4.tsx -o output/formula-care/ep4.mp4
bun run render templates/formula-care/ep5.tsx -o output/formula-care/ep5.mp4
```

### Pre-warm the image cache (optional, saves time on first render)

```bash
bun run templates/formula-care/legacy/ep2-images.ts
bun run templates/formula-care/legacy/ref-images.ts
```

## Architecture

```
full.tsx
  ├── imports ep2.tsx  (clips, musicProps, duration)
  ├── imports ep3.tsx  (clips, musicProps, duration)
  ├── imports ep4.tsx  (clips, musicProps, duration)
  └── imports ep5.tsx  (clips, musicProps, duration)
```

Each episode exports:
- `clips` — array of `<Clip>` elements (visual timeline + per-clip captions)
- `musicProps` — Music config (prompt + volume + duration, without `start`)
- `duration` — total clip duration of the episode (seconds)

`full.tsx` computes cumulative Music `start` offsets and wraps everything
under one `<Render>` — one editly composition, one captions burn-in, one
output file.

### Pipeline per episode

1. **Character profile cards** — full-body reference from photo refs
2. **Location card** — empty scene (no people)
3. **Scene composites** — characters + location via `/edit` image model
4. **kling-v3 videos** — native audio, dialogue embedded in prompts
5. **Auto-trim** — `vid.audio.speechRange()` trims each clip to spoken-word
   boundaries (whisper word timings, 0.15s lead-in, 0.1s tail)
6. **Captions** — `vid.audio` transcribed automatically by Whisper

### Consistent characters

- **ep2**: A1 (overweight woman, late 50s, grey hair) + A2 (slim Asian trainer,
  30s) — from client photo refs
- **ep3**: T (slim Asian trainer, 40s, navy activewear) + S (plus-size Asian
  woman, 50s, before: grey tank → after: emerald green set)
- **ep4/ep5**: T2 (fit Asian woman, 60s, silver-grey ponytail, olive tank) +
  S2 (plus-size woman, 50s, curly auburn hair, grey t-shirt)

## Cost

| | Cost | Per second |
|---|---|---|
| **With cache** (episodes already rendered) | ~$0.27 | 0.17¢/s |
| **From scratch** (no cache) | ~$28.67 | 17.8¢/s |

Cache gives a 100x difference. The main driver is kling-v3: 14¢/s to generate
vs $0 from cache.

### Cost breakdown (from scratch)

| Resource | Volume | Price | Cost |
|----------|-------|------|------|
| kling-v3 video | 166s w/ audio + 12s w/o | 14¢/s + 11.2¢/s | $24.58 |
| nano-banana-pro/edit | 24 images | 15¢/img | $3.60 |
| elevenlabs music_v1 | ~161s (4 tracks) | 0.25¢/s | $0.41 |
| eleven_v3 speech | ~182 chars | 0.01¢/char | $0.02 |
| groq-whisper | 2 transcriptions | 3¢ flat | $0.06 |
| **Total** | | | **~$28.67** |

## Tech notes

- **Bun everywhere** — `bun run render`, never npm/node
- **Cache is sacred** — same prompts hit cache at $0; never clear without asking
- **speechRange auto-trim** — no manual ffmpeg silencedetect, no two-pass workflow
- **Music `start` offset** — each episode's music begins at its timeline position
- **Captions via `vid.audio`** — Whisper transcribes native audio automatically
