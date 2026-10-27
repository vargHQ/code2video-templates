/**
 * varg render template — H01 · GIANT CAN — scale (H3 Max original, = ads/t08)
 * H3 Max i2v · 16:9 (1344×768) · 6 s · 768P · $0.51
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_49db6d24edcc.mp4   ✅ approved by Alex ("он был норм")
 * varg job:         (older than the 50-job log; same prompt re-run as job_a9326ba99193 / job_d726c8f26cb1)
 * FIRST FRAME:      https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_8465696f4fcb.jpg
 * CHARACTER CARDS used to generate the still (not passed to the video):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_5ab7ba96dcbb.jpg  — chars/9 walking sandwich
 * OTHER VERSIONS:   9:16 same prompt → https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_5e7d9fed9438.mp4 (job_d726c8f26cb1, image_url route) · https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_e1aa149b5d0d.mp4 (job_a9326ba99193, came out 16:9 — gateway ignored aspect_ratio when still passed in files[])
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
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const S3 = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/";

const H3MAX = { fal: { resolution: "768P", prompt_expansion_mode: "quality" } };

const STILL = S3 + "file_8465696f4fcb.jpg";

const PROMPT = `Downtown, camera at street level, same framing as the first frame. [0-3s] Slow smooth tilt up the full height of the giant can, sunlight sliding along its curved wall, windows of the towers reflected in it. [3-5s] At the top, a single huge condensation drop lets go and falls. [5-6s] Tilt back down fast to the sandwich character at the base looking up as the drop lands in front of it with a heavy splash, soaking the asphalt. City ambience, wind at height, one big wet impact. No text.`;

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
