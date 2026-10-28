# Film brief

Default exercise: a 20-second launch film demonstrating one product action. Use the user's supplied outcome, assets, and delivery requirements when they differ from this example.

## Fill from the request

- Product, target viewer, and where the film will appear.
- One capability to demonstrate and the observable result.
- Opening line, at most eight words; one closing action and destination.
- Product screenshots or recordings, logo, fonts, and any brand rules.
- Whether narration or supplied music is requested.
- Required canvas, duration, and outputs.

Treat missing factual inputs as missing. The agent may propose copy and styling, but product claims need support from the supplied material.

## Default delivery contract

Composition ID: `Launch`. Canvas: 1920 × 1080. Rate: 60 fps. Duration: 1200 frames, exactly 20 seconds. Valid output frames are 0 through 1199. Work in this canvas unless another format is requested.

Structure: opening at 0–3 seconds; action at 3–8 seconds; result at 8–15 seconds; closing at 15–20 seconds. These are editable creative choices, not universal rules. The concrete global event schedule lives in STORYBOARD.md.

## Make the action specific

Example: a real report screen, a cursor reaching Export, a visible button response, and the supplied finished-file screen. Use a different action when the actual assets demonstrate another capability.

A single still supports a presentation of that screen, with lighting and emphasis. Showing a changed state requires a real second state or a clearly labeled illustration.

Select the main message before implementation. Give the result enough time to read at normal playback speed. Keep scope to one product action and one closing action.

Record completion as files delivered and behavior inspected. A storyboard, preview window, or successful source build alone does not fulfill a request for an exported film.

## Fillable production input

```text
PRODUCT = name + one-sentence function
AUDIENCE = specific viewer + what they already understand
OUTCOME = one observable change the film demonstrates
REAL_ACTION = before state -> user action -> supplied after state
ASSETS = paths to screens, recordings, logo, fonts, permitted audio
OPENING = one precise promise, maximum eight words
CLOSING = one action + real destination
CANVAS = 1920x1080 / FPS = 60 / DURATION = 1200 frames
TONE = select a direction for this product
```

Convert vague requests such as "make it premium" into visible decisions: larger type, fewer simultaneous objects, measured timing, light describing a real surface, and a calm reading hold. A useful film shows the product's transformation rather than reciting a feature list. If the source is only one screenshot, build a deliberate presentation of that state; list which additional states would enable a real interaction demo.

## Official implementation resources

- [Remotion compositions](https://www.remotion.dev/docs/composition)

## This project (filled 2026-10-28)

```text
PRODUCT = varg how to (varg.ai/how-to): a catalog of AI-video skills and how-to guides for agents
AUDIENCE = people making AI video with Claude Code / Codex who know what they want, not which skill
OUTCOME = typing what you want returns the exact how-to guide
REAL_ACTION = home -> click "Search skills" -> type "ugc ad" -> click "How to make a UGC ad video with AI" -> guide page
ASSETS = public/screens/*.png (real captures, 2880x1800), public/logo.png (crop of the real sidebar logo)
OPENING = "Every AI video, one search away." (6 words)
CLOSING = "Make any video with AI agents." + varg.ai/how-to
CANVAS = 1920x1080 / FPS = 60 / DURATION = 1200 frames
TONE = product stage (STYLE.md)
```
Silent-claims check: counts on screen (39 guides, 646 skills) are read from the captured sidebar.
