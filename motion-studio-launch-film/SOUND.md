# Sound cue sheet

Use supplied or appropriately licensed music and effects. Original synthesized sounds are another option when the brief allows them. If no permitted audio is available, deliver an intentional silent pass and identify the missing input.

For new Remotion work, consult the current `Audio` component from `@remotion/media`. Keep music, voice, and effects on separate adjustable tracks. Read the current API before choosing component properties.

## Align the audible hit

Record path, source trim, global event frame, audible onset within the source, gain, and fade. A file can begin with silence, so the file's start is not necessarily the perceptual hit.

For the worked storyboard:

| Visual event | Global frame | Intended sound |
| --- | --- | --- |
| Button press | 300 | Short restrained click |
| Product result | 360 | Clear but quiet reveal accent |
| Closing settles | 930 | Music or tonal accent resolves |

These cues follow STORYBOARD.md. Move the sound when its visual event changes. Offset or trim the source so its audible hit lands on that event.

If narration is requested, write the final spoken copy before timing the voice track. Give the product result enough time to be seen after its explanation. Keep essential narration intelligible over music.

## Mix in context

Watch and listen to the encoded export. Check the loudest transient, voice intelligibility, the quietest useful cue, and the ending. Leave headroom and remove clipping or abrupt tails. Use a phone speaker as well as headphones when available.

Record source permissions and substitutions in ASSETS.md. Do not silently buy audio, activate a paid voice service, or claim a silent file contains a completed sound pass.

## Practical cue record

```text
ID / source path / permission
visual event frame / source audible-onset frame
trim / gain / fade-in / fade-out / intended role
```

An audible onset 6 frames into the source needs an adjusted start or trim to land on a visual press at frame 300. Avoid solving sync by guessing against the file's start. Keep music below important UI cues and narration. Give clicks a short tail, allow a result accent to resolve, and fade sustained sound before the last displayed frame. An intentional silent pass is valid when the brief requests silence.

## Official implementation resources

- [Current audio component guidance](https://www.remotion.dev/docs/html5-audio)

## This project: cues (src/scenes/Sound.tsx)

| ID | Event frame | File | Gain |
| --- | --- | --- | --- |
| pad | 0-1199 | sfx/pad.wav (fade in 1.5 s, out 1.4 s) | 0.32 |
| whoosh-in | 15 (peak ~30, card landing) | sfx/whoosh.wav | 0.18 |
| click-search | 72 | sfx/click.wav | 0.55 |
| key-1..12 | 92..158 | sfx/key.wav | 0.4 |
| click-row | 186 | sfx/click.wav | 0.55 |
| reveal-skill | 194 | sfx/reveal.wav | 0.3 |
| click-copy | 386 | sfx/click.wav | 0.55 |
| paste | 404 | sfx/key.wav | 0.5 |
| enter | 462 | sfx/click.wav | 0.45 |
| click-crumb | 550 | sfx/click.wav | 0.5 |
| reveal-grid | 558 | sfx/reveal.wav | 0.35 |
| whoosh-out | 905 (peak ~920) | sfx/whoosh.wav | 0.25 |
| resolve | 936 (the pill pops) | sfx/resolve.wav | 0.42 |
| shine | 972 (glare over the pill) | sfx/reveal.wav | 0.16 |

The previews are muted. Measured on the export: mean -23.1 dB, max -4.3 dB, no clipping.
