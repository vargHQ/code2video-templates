# Review: first render, 2026-10-26

**Calls I made**
- The page's thesis becomes one worked example. The request "a phone that swipes through my album covers" travels from the terminal to the drawer, then to the card, the shelf and the mp4.
- I used the library card catalog as the metaphor. The card carries a call number (repo, path and sha) that points to a shelf.
- I built no alternative storylines, because the user asked for the file.

**What I measured**
- `hyperframes check`: ok. Lint, runtime and layout all have 0 errors.
- I looked at the snapshot beat and seam sheets and at an 8-frame sheet from the rendered mp4.
- The mp4 is 1920x1080 at 30 fps, h264, 49.0 s and 4.2 MB.

**Warnings I kept**
- `line_unread` on typed text. Every letter is its own span, so the check counts letters as words; the real lines are short.
- `text_below_floor` on the shrunken card, the mini cards and the book spines. These are texture; the large lines carry the reading.
- `film_silent`. There is no music source here: no HeyGen sign-in and no local MusicGen. Add `music.mp3` next to `make.command`.

**Not checked**
- Nobody has heard a version with music.
- The `npx skills add … --skill` syntax on screen is the intended install line. Verify the flag before publishing the film as documentation.

**Weakest shot**
- The drawer reads as a box of paper more than as a card catalog: the cards are drawn front-on with no depth.
- With more time I would add depth to the drawer interior, or show the drawer slightly from above.

## Update: showcase opening (same day)

- I added a 7 s opening wall of five real renders from this repo: anime-triple-split, liquid-thorn-logo ("VARG", logo-only), stamp-carousel (demo cards), anime-jp-subtitles and the varg talking-head promo. The film is now 56 s long.
- `check` passes. I looked at frames 0, 1.5, 4.5 and 6.8 s, and at frames taken from both rendered mp4s.
- I left out clips that show real brands or client work: the CeraVe UGC clip, the iPhone negative-marketing ad, and the Formula Care, tai-chi and Hustle Fund renders.
- The clips were trimmed to 7 s at 600x1066, uploaded to s3.varg.ai and are referenced by URL in both configs. The build downloads them through ffmpeg.
