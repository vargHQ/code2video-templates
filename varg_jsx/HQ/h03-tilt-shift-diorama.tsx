/**
 * varg render template — H03 · TILT-SHIFT DIORAMA — miniature (H3 Max original, S7 — not in ads/t01–t12)
 * H3 Max i2v · 16:9 (1344×768) · 6 s · 768P · $0.51
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_bc8c64ddbaf8.mp4   ✅ approved by Alex ("он был норм")
 * varg job:         job_c65dcd635885
 * FIRST FRAME:      https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_2dc8d5bae75c.jpg
 * CHARACTER CARDS used to generate the still (not passed to the video):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_1eea7ddb50e7.jpg  — chars/20 pink gorilla (Jimmy)
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_9321e2951b65.png  — chars/10 ghost in a bedsheet
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_2e62c399bd16.png  — chars/11 smiling donut
 * OTHER VERSIONS:   none (no 9:16 run yet)
 * Still prompt: exact text not preserved (varg job log only keeps the last 50 jobs); the still itself is live at the URL above and is all the video needs. The scene description in the matching ads/tNN file is the same scene, later extended with the product card. Scene: tilt-shift miniature city from above, giant can in a plaza, the three characters as tiny tourists.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — H3 Max recipe (first batch, 2026-09-03 ~07:02 UTC). No imports allowed in varg render.
// Model in varg:        minimax_h3_max      → provider route  fal:minimax/h3-max/image-to-video
// varg tool id:         tool_2001a2b3c4d5   (call_tool "video")
// Inputs:               ONE file = the still, used as first frame. No character cards, no product card —
//                       H3 Max i2v takes no references; the can existed only as text in the still prompt.
// Output:               1344×768 (16:9), 6 s, 768P, native audio; ~$0.51 per clip (actual_cost_cents: 51).
// For 9:16 with this model: move the still to providerOptions.fal.image_url and add aspect_ratio "9:16"
//                       (→ 768×1344). See the 9:16 file ids in each header.
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";

const H3MAX = { fal: { resolution: "768P", prompt_expansion_mode: "quality" } };

const STILL = S3 + "file_2dc8d5bae75c.jpg";

const PROMPT = `Tilt-shift miniature city from above, camera locked, same framing as the first frame; everything moves with a slightly sped-up, stop-motion-like toy cadence. [0-3s] Tiny cars crawl along the streets, the gorilla, ghost and donut shuffle closer to the giant can and crane their heads up. [3-6s] The donut takes a tiny photo with a phone (small flash), the gorilla gives a thumbs up to camera, the ghost floats a little off the ground. Warm golden light slowly shifts as the sun lowers. Miniature ambient sound, tiny car horns, a phone camera click. No text.`;

export default (
  <Render width={1344} height={768} fps={24}>
    <Clip duration={6}>
      <Video
        model={varg.videoModel("minimax_h3_max")}
        prompt={{ text: PROMPT, images: [STILL] }}
        aspectRatio="16:9"
        duration={6}
        keepAudio
        providerOptions={H3MAX}
      />
    </Clip>
  </Render>
);
