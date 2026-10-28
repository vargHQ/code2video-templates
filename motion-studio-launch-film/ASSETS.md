# Asset manifest

Inspect the actual files before using them. Keep render assets under `public/` and resolve their paths with the current Remotion asset guidance. Use the appropriate image or video component so loading completes before capture.

Create one row per asset:

| ID | Path | Type / dimensions / duration | Role | Source / permission | Fit / anchor |
| --- | --- | --- | --- | --- | --- |

Populate the table from file metadata and visible content. Add image dimensions; video duration and frame rate; font family and weight; audio duration, sample rate, and audible onset. Confirm permission for the intended use rather than assuming every downloaded asset is reusable.

## Product states

Label each screen by the state it really shows: before action, button response, or after action. Record the relevant control and result bounds in source-image coordinates. Separate measured positions from visual estimates.

For each fitted image, record the display box, scale, translation, and any crop. Convert control anchors into composition coordinates using that transform. Cursor and highlight positions must follow the fitted asset, including a later layout change.

Use contain fitting when a crop would remove meaningful UI. Request a clearer source if a required control remains illegible. Keep screenshot content intact; place presentation overlays on separate layers.

## References and missing inputs

Give each reference one job, such as entrance timing, focal hierarchy, or transition continuity. Record the source timestamps and source frame rate. Source frame numbers are not automatically project frame numbers.

Missing assets remain listed as missing. Use a labeled original illustration only with an appropriate brief. Never invent a product's result screen, usage numbers, logos, or approval.

Keep original source assets alongside the editable project when their usage terms permit. Record any substituted font or missing audio in the delivery notes.

## Replaceable content contract

Centralize product name, opening copy, result copy, closing action, image paths, crop modes, and anchors in a typed configuration. A new launch should change those values without rewriting scene code. Resolve images from `public/` using `staticFile()` when appropriate; consult the installed version's media-loading components for images and recordings.

For a control at source coordinate `(sx,sy)`, a simple uniform fitted image maps it to `(displayX + sx*scale, displayY + sy*scale)` before any recorded crop offset. Use the same transform for cursor and highlight layers. When the image is repositioned, update the transform rather than patching each anchor. Mark whether coordinates are measured or estimated.

If Clawd or another supplied mascot is used, preserve the source artwork and identity. Store its source and permitted usage in the manifest. For a simple sprite pass, animate position, rotation, and restrained squash/stretch around the feet; keep the eyes and silhouette coherent and avoid collisions with text.

## Official implementation resources

- [Static assets](https://www.remotion.dev/docs/staticfile)

## This project

| ID | Path | Type / dimensions | Role | Source / permission | Fit / anchor |
| --- | --- | --- | --- | --- | --- |
| home | public/screens/home.png | PNG 2880x1800 | before action | varg.ai/how-to capture, own product | contain into 1216x760 at (352,220), k=0.4222 |
| palette | public/screens/palette-empty.png | PNG 2880x1800 | button response | capture after clicking Search | same |
| type-1..6 | public/screens/type-N.png | PNG 2880x1800 | typing states "u".."ugc ad" | one capture per character | same |
| guide | public/screens/guide.png | PNG 2880x1800 | after action | /how-to/make-a-ugc-ad-video | same |
| logo | public/logo.png | PNG 300x80 | closing mark | crop of the real sidebar logo | centred, 690x184 |
| sfx/* | public/sfx/*.wav | WAV 48 kHz | click, key, reveal, whoosh, resolve, pad | synthesized with ffmpeg (original) | onsets 0 except whoosh (peak at 15 f) |

Anchors (source px, measured): search field (330,170); palette centre (1440,560); guide row "How to make a UGC ad video with AI" (1150,514), rect x840 y461 w1200 h108; guide focus (1300,900).
Substitution: Aeonik -> Geist (OFL). Captures taken 2026-10-28; result order in the palette is the live ranking at that time.
