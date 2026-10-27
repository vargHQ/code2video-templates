# Director rounds and delivery

## Each round

1. Append the note to `brief.md` verbatim with the date (the director's own words, any language).
2. Split it into: free fixes (re-cut, graphics, text), paid fixes (retakes, new shots) and questions.
3. Paid fixes: say what, why, length and the credit estimate in one question; wait for the yes. A direct order
   ("надо перегенерить") is the yes for that shot only.
4. Do the free fixes while the generations run; QA each output; place it; re-render as a **new** version.
5. Look at the new render at every changed time before reporting.
6. Report: the file, what changed per note (with times), what was not done and why, credits spent this round.

## Notes we got, and the fix that worked

| note | fix |
|---|---|
| "texts at the start are strange" | removed the hook text and render bar; open on the face and the hit |
| "add the icons like in the first version" | logo pills on every brand line, logo+name tags over characters |
| "the scene at 1:02 is cringe" | re-cut existing takes into close-up / blast / close-up / blast, flashes, punches |
| "more like 2001" | tinted eye freeze frames, solarise-in worlds, colour cycling, stargate slices |
| "12–18 s looks like AI slop" | retake without "static" in the prompt, frame grab of a good monster shot as ref |
| "weird object in his hand at 31 s" | retake with "hands empty" and a camera-only reference (the previz had the card) |
| "helmet bug at 29 s" | retake with "exactly two arms, both hands on the helmet" |
| "labels overlap the lyrics" | measured head positions on frames, tags in two rows above heads, below the lyric band |
| "show the hero a bit more before the models" | moved one beat from the next shot, shifted the iris and tags |
| "old model names" | names from `list_models` |
| "make it smaller for Telegram" | `scripts/tg_export.sh` |

## Delivery

- Master: `renders/final_vN.mp4` (1080×1920, 30 fps, H.264, AAC).
- Telegram / chat: `bash scripts/tg_export.sh renders/final_vN.mp4` → `_tg.mp4` (CRF 24, max 3 Mbit/s, faststart;
  ≈38 MB for 99 s). Add `720` as the second argument for ≈15–18 MB.
