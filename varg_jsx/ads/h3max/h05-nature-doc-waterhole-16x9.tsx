/**
 * varg render template — H05 · NATURE DOC — waterhole (H3 Max original, = ads/t11)
 * H3 Max i2v · 16:9 (1344×768) · 6 s · 768P · $0.51
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_501c6c37a8b0.mp4   ✅ approved by Alex ("он был норм")
 * varg job:         job_d6bc0a73d891
 * FIRST FRAME:      https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_f0bb8e975a96.jpg
 * CHARACTER CARDS used to generate the still (not passed to the video):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_1eea7ddb50e7.jpg  — chars/20 pink gorilla (Jimmy)
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_aed3e7296be2.jpg  — chars/16 ostrich
 * OTHER VERSIONS:   9:16 same prompt → https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_4fafdf69adb2.mp4
 * Still prompt: rewritten per rnd/nano-banana-prompting.md (600mm f/4 from a hide at dusk, compressed perspective, heat haze, Kodak Vision3 500T, 2 characters) — the full text is the T11_still prompt in ads/t11 minus the CAN_REF clause.
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

const STILL = S3 + "file_f0bb8e975a96.jpg";

const PROMPT = `Wildlife documentary, 600mm telephoto from a hide, locked, heat haze shimmering, same framing as the first frame. [0-3s] The gorilla drinks from the waterhole, ripples spreading, then lifts its head and looks slowly toward the ostrich in the background. [3-5s] It picks up the orange can from the mud, looks at it, and takes a long drink from it instead. [5-6s] It turns and looks straight down the lens. A calm British narrator whispers: \"Only the dominant male drinks first.\" Crickets, wind in dry grass, water drips. No text.`;

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
