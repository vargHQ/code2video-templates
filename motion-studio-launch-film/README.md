# Motion Studio launch film

<img src="https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_985cdacca5a1.png" width="600" alt="A dark product card of varg how to: product-ad reels playing in the Ads & UGC grid">

[MP4 with sound](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_eb4a4e5ef4b4.mp4) · [preview](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_0591d2bc3b2c.mp4) · rendered from this folder with `bash make.command`.

A 20-second product launch film (1920×1080, 60 fps) made by Opus 5.5 in Claude Code with
[@beamnxw](https://x.com/beamnxw)'s **Opus 5.5 Motion Studio Harness**: eight Markdown files that walk the agent
from brief to style, storyboard, motion, sound and a checked render. The example is varg's own product: real
captures of [varg.ai/how-to](https://varg.ai/how-to): a search for "dropshipping" (one captured state per typed
character) opens the dropshipping guide reel skill with its reel playing; "Copy prompt" pastes the skill's real prompt into a
Claude Code window; then the breadcrumb opens Ads & UGC and the
page scrolls (24 real captures) down to nine product-ad reels, all playing. The previews are the site's own files, laid back over their boxes; a camera follows the fitted screen, each
click is a cut, and it ends on the mark.

Runs locally: Bun, Remotion, ffmpeg. No API key, no credits.

```bash
cd motion-studio-launch-film && bun install
bun run setup      # fetches the example screens from s3.varg.ai, synthesizes the sound effects
bun run dev        # Remotion Studio preview
bun run render     # out/final.mp4  (about 30 s on an M-series Mac)
bun run cover      # out/cover.png
```

Or double-click `make.command` (macOS).

A second composition, **`Examples`**, is the "lots of examples" cut: the sidebar's **Recent** feed (825 this week, 254
publishers) scrolls with every card's preview playing, then **Make a video** (278 results) does the
same, then the cursor opens four cards in a row (Remotion Create, Higgsfield Video Explainer, GSAP Core, Remotion
Markup), each skill page playing its example. The pages are captured whole and scroll under the fixed sidebar; every
preview plays in its own box.
`bun run render:examples` → `out/examples.mp4`.

**`Showcase`** (16:9, 18 s): five AI dropshipping ads (solar flood light, cut-resistant gloves, LED pet nail clipper,
heated neck massager, car seat gap filler), each made by `varg-dropship-reel` from one product photo, pop in side by
side and play their hooks; "About $8.60 an ad. 100% AI."; then "With varg how to you can scale ads."
`bun run render:showcase` → `out/showcase.mp4`. [MP4](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_c49b92edc3d4.mp4)

A third, **`BeforeAfter`** (9:16), is the proof: *before*, the one line the dropshipping tutorial says to send
("Make a dropshipping guide reel for this product: <photo>") and the skill `varg-dropship-reel` found on varg how to;
an orange wipe; *after*, the original 58 s reel that skill made (solar flood light), untouched, with its own sound;
then "Made with varg how to". `bun run render:before-after` → `out/before-after.mp4`. [MP4](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_b8b1cfab4302.mp4)
[MP4 with sound](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_6ff6349569e6.mp4) ·
[preview](https://s3.varg.ai/files/60c50c05-1e93-46b9-ae75-47be786b4ff0/file_9f52ba5f4ade.mp4)

## Make your own film

1. Capture your product's real states (before → action → after) at 2880×1800 into `public/screens/`.
   `tools/capture-ref.ts` is how the example was captured (headless Chrome, one PNG per state); it also prints the
   DOM boxes of any videos on a page, so `content.ts` can play them in place (`clips`, with `keep` rects for UI drawn
   over a video).
2. Open Claude Code here with Opus 5.5 (`claude --model claude-opus-5-5`) and paste `LAUNCH-PROMPT.txt` plus your
   brief. `CLAUDE.md` makes the agent read each harness file at its stage; the "This project" sections at the
   bottom of `BRIEF.md`, `STYLE.md`, `ASSETS.md`, `STORYBOARD.md` and `SOUND.md` show how the example filled them.
3. Or edit by hand: copy and screens in `src/config/content.ts`, event frames in `src/config/timeline.ts`,
   colours and type in `src/config/tokens.ts`, anchors (source pixels) for the cursor and highlights in
   `content.ts`. The camera, cursor and selection ring follow the fitted screen, so moving the card keeps them on
   target.

## Files

| Path | What it is |
|---|---|
| `CLAUDE.md`, `BRIEF.md`, `STYLE.md`, `ASSETS.md`, `STORYBOARD.md`, `MOTION.md`, `SOUND.md`, `DELIVERY.md` | the harness (by @beamnxw, MIT), with this film's filled sections appended |
| `LAUNCH-PROMPT.txt`, `FULL-PROMPT.txt`, `START.txt`, `SOURCES.txt` | the harness prompts and sources, unchanged |
| `src/config/` | tokens, content, event timeline, camera, easing: one source of truth for each |
| `src/components/`, `src/scenes/` | card, cursor, background, `LiquidPill` (the chrome how-to pill); opening, result, closing, sound |
| `tools/setup.ts`, `tools/assets.json`, `tools/sfx.sh` | fetch screens and preview clips, synthesize sounds (no media in git) |
| `tools/capture-ref.ts` | the capture script for the example screens |
| `src/showcase/` | the `Showcase` composition: five AI ads made with varg-dropship-reel side by side, "With varg how to you can scale ads." |
| `src/before-after/` | the `BeforeAfter` composition (1080x1920, 30 fps): the one-line prompt + the skill from varg how to, then the original reel it made, untouched |
| `src/examples/` | the `Examples` composition: whole-page captures scrolling under the fixed sidebar, previews in page coordinates |

## Credits

Harness: [Opus 5.5 Motion Studio Harness](https://github.com/beamnxw/my_works/blob/main/opus55-motion-studio-harness.zip)
by [@beamnxw](https://x.com/beamnxw), MIT (see `THIRD_PARTY_NOTICES.md`). Listed on varg how to:
[opus-5-5-motion-studio-harness](https://varg.ai/how-to/skills/opus-5-5-motion-studio-harness). Type is Geist
(OFL) in place of the site's licensed Aeonik. Remotion is free for individuals and teams up to 3; larger companies
need a [Remotion license](https://www.remotion.pro/license).
