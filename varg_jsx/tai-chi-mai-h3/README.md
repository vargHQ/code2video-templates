# tai-chi — MAI + H3 variant

Episode 2 of the Formula Care Tai Chi ad, re-cut with different models.
Original lives in [`../tai-chi/ep2.tsx`](../tai-chi/ep2.tsx) and is untouched.

| | original | this variant |
|---|---|---|
| composite images | `nano-banana-pro/edit` | `nano-banana-pro/edit` (unchanged) |
| final images | — | **`mai_image_2_5`** photoreal pass |
| video | `kling-v3` | **`minimax_h3`** |
| audio | kling native (`generate_audio: true`) | h3 native stereo (always on) |

## Why images go through two models

`mai_image_2_5/edit` takes **one** input image — its fal schema says "Provide
one http(s) or data: URL". The ep2 scenes need **three** refs (actor A1 card +
actor A2 card + gym location) to keep characters and location consistent.

So the multi-ref composite stays on nano-banana, and MAI runs afterwards as a
single-image finishing pass:

```
A1 photo ─┐
          ├─ nano-banana-pro/edit ─→ composite ─→ mai_image_2_5 ─→ scene
A2 photo ─┤       (3 refs)                          (1 ref)
gym loc  ─┘
```

The MAI prompt is deliberately a *finishing* instruction (don't move anything,
only improve realism), not a re-composition — otherwise it re-imagines the
frame and the character consistency built in stage one is lost.

## Verified against the live API

Every claim below was checked against `api.varg.ai` before the template was
written, not assumed from docs:

| check | result |
|---|---|
| `mai_image_2_5` + `files` | routes to `fal:microsoft/mai-image-2.5/edit`, 6¢ |
| MAI aspect handling | 768×1376 in → **768×1376 out** — 9:16 preserved |
| `nano-banana-pro/edit` + 3 refs | routes to `fal:nano_banana_pro/edit`, 16¢ |
| `minimax_h3` + `files` | routes to `fal:minimax/h3/image-to-video` |
| h3 output | 1440×2560 h264 + 32 kHz **stereo** aac, 5.17 s |
| h3 native speech | whisper read back the exact scripted line |

That last one matters: the whole edit relies on `vid.audio.speechRange()` to
auto-trim each clip, which only works if h3 actually speaks the dialogue
embedded in the prompt. It does.

## Two gotchas worth knowing

**1. `duration` has a floor of 5.** H3 accepts integers 5–15. Scenes 2 and 3
were 4 s under kling-v3, so they are now 5 s. The final cut length is
unchanged because `speechRange()` trims to spoken-word boundaries anyway.

**2. `provider_options` must be keyed by provider.** `@vargai/gateway` unwraps
`providerOptions.varg` *straight* into the request's `provider_options`, but
the API validates that object per provider. An unkeyed bag is **silently
dropped** — verified: `{resolution:"BOGUS"}` unkeyed returns `valid:true`,
while `{fal:{resolution:"BOGUS"}}` correctly fails. Hence:

```tsx
providerOptions: { varg: { fal: { resolution: "2K" } } }
//                  ^outer, stripped by SDK
//                          ^inner, what the API actually reads
```

The `templates/CLAUDE.md` rule "use the `varg` namespace, NOT `fal`" refers to
the **outer** key only. The provider key still belongs on the inside.

## Usage

```bash
mkdir -p output/tai-chi-mai-h3/ep2
nohup bun run render templates/tai-chi-mai-h3/ep2.tsx \
  -o output/tai-chi-mai-h3/ep2.mp4 \
  > output/tai-chi-mai-h3/ep2/render.log 2>&1 &
```

## Cost

| item | cost |
|---|---|
| 29 s minimax_h3 @ 26¢/s | $7.54 |
| 5 nano-banana composites @ 16¢ | $0.80 |
| 5 MAI finishing passes @ 6¢ | $0.30 |
| 2 cards + 1 location @ 16¢ | $0.48 (→ $0 if `../tai-chi` ran first) |
| music + whisper | ~$0.10 |
| **total** | **~$9.20** |

Roughly 2× the kling-v3 original (~$4.60) — h3 is 26¢/s against kling's 14¢/s.

The character card and location prompts are byte-identical to `../tai-chi/ep2.tsx`,
and the SDK cache key embeds the literal model id string, so those three images
hit the existing cache at $0 if the original was rendered on this machine.
