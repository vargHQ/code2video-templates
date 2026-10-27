/**
 * varg render template — H04 · GORILLA VLOG — Shibuya fisheye (H3 Max original, = ads/t01 early version)
 * H3 Max i2v · 16:9 (1344×768) · 6 s · 768P · $0.51
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_419be31ec594.mp4   ✅ approved by Alex ("он был норм")
 * varg job:         job_e60f3b04348a
 * FIRST FRAME:      https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_7e8e6da3cb0c.jpg
 * CHARACTER CARDS used to generate the still (not passed to the video):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_1eea7ddb50e7.jpg  — chars/20 pink gorilla (Jimmy)
 * OTHER VERSIONS:   9:16 same prompt → https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_a89a14dcc62d.mp4 (identity drifts) · Seedance identity-lock version → https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_6d483797d9c9.mp4 (ads/t01, ✅)
 * Still prompt: exact text not preserved (varg job log only keeps the last 50 jobs); the still itself is live at the URL above and is all the video needs. The scene description in the matching ads/tNN file is the same scene, later extended with the product card.
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
// ─────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";

const H3MAX = { fal: { resolution: "768P", prompt_expansion_mode: "quality" } };

const STILL = S3 + "file_7e8e6da3cb0c.jpg";

const PROMPT = `Handheld fisheye vlog at Shibuya crossing, same framing as the first frame, natural handheld sway. [0-3s] The gorilla talks straight into the lens in a low bored voice: \"Everyone keeps asking what I drink. This.\" and lifts the can closer to the fisheye so it distorts. [3-5s] It takes a sip, tiny nod, the crowd behind keeps crossing with umbrellas, screens flicker. [5-6s] It lowers the can and keeps walking, the camera bobbing. Dense crowd ambience, crossing chime, rain on umbrellas. No text.`;

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
