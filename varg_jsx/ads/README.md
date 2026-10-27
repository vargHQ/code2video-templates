# ads/ — one varg render template per ad clip

Each `tNN-*.tsx` is self-contained (no imports): shared refs + product card + one still + one Seedance 2.5 clip, 9:16.
Header of every file: RENDERED RESULT link, STATUS, and every earlier version (stills, H3 Max tries).

| # | File | Rendered | Status |
|---|---|---|---|
| T01 | t01-gorilla-vlog-shibuya.tsx | file_6d483797d9c9.mp4 | ✅ identity-lock verified |
| T02 | t02-fridge-cam.tsx | file_b89227f2d679.mp4 | ✅ identity-lock verified |
| T03 | t03-ostrich-one-gulp.tsx | file_0ca920d85a22.mp4 | ◐ Seedance, before product card |
| T04 | t04-impossible-cut.tsx | file_3f01288ac57f.mp4 | ◐ Seedance, before product card |
| T05 | t05-billboard-break.tsx | file_10a0ad5dd2ad.mp4 | ◐ Seedance, before product card |
| T06 | t06-portal-follow.tsx | file_262de6866cc5.mp4 | ◐ Seedance, before product card |
| T07 | t07-balloon-lift-cliff.tsx | file_3abbdfd2da52.mp4 (H3 Max 16:9) | ○ H3 Max only |
| T08 | t08-giant-can.tsx | file_5e7d9fed9438.mp4 (H3 Max 9:16) | ○ H3 Max only |
| T09 | t09-high-speed-splash.tsx | file_f600204d5e7c.mp4 | ◐ Seedance, before product card |
| T10 | t10-microwave-pov.tsx | file_7e0c19911283.mp4 (H3 Max 9:16) | ○ H3 Max only |
| T11 | t11-nature-doc-waterhole.tsx | file_4fafdf69adb2.mp4 (H3 Max 9:16) | ○ H3 Max only |
| T12 | t12-two-headed-argument.tsx | file_d480fdd0ab67.mp4 (H3 Max 9:16) | ○ H3 Max only |

All files under https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/

Rules that made it work: rnd/nano-banana-prompting.md (stills), identity lock = still + character card + PRODUCT_CARD with explicit @imageN roles on Seedance 2.5 omni_reference. H3 Max takes no references → drift; not used for reuse.
Product swap for a client: replace PRODUCT_CARD with their photo URL, keep everything else.

## h3max/ — approved H3 Max originals (16:9)

The five clips Alex approved from the first H3 Max batch, each as its own render TSX with the exact model, route, provider options, first-frame URL, card URLs and prompt taken from the varg job log:

| file | result | job |
|---|---|---|
| h3max/h01-giant-can-16x9.tsx | file_49db6d24edcc.mp4 | (pre-log; same prompt as job_a9326ba99193) |
| h3max/h02-microwave-pov-16x9.tsx | file_18e6e17802c2.mp4 | job_601aa7e3374f |
| h3max/h03-tilt-shift-diorama-16x9.tsx | file_bc8c64ddbaf8.mp4 | job_c65dcd635885 |
| h3max/h04-gorilla-vlog-shibuya-16x9.tsx | file_419be31ec594.mp4 | job_e60f3b04348a |
| h3max/h05-nature-doc-waterhole-16x9.tsx | file_501c6c37a8b0.mp4 | job_d6bc0a73d891 |

Recipe: `minimax_h3_max` (fal:minimax/h3-max/image-to-video), one still as the only input, 6 s, `{ fal: { resolution: "768P", prompt_expansion_mode: "quality" } }`, ≈$0.51. No references → identity holds only because the camera is near-static; for reuse with a real product use the Seedance identity-lock blocks in t01–t12.
