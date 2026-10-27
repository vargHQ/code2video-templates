/**
 * varg render template — H02 · MICROWAVE POV — camera inside (H3 Max original, = ads/t10)
 * H3 Max i2v · 16:9 (1344×768) · 6 s · 768P · $0.51
 *
 * RENDERED RESULT:  https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_18e6e17802c2.mp4   ✅ approved by Alex ("он был норм")
 * varg job:         job_601aa7e3374f
 * FIRST FRAME:      https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_326f1f7fa7e3.jpg
 * CHARACTER CARDS used to generate the still (not passed to the video):
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_6880287ba6a7.jpg  — chars/17 microwave with hamster
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_f47a48b6d48d.jpg  — chars/4 curly guy in light-blue hoodie
 *   https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_38cbe7b9b96b.jpg  — chars/27 red-haired guy (Claude Code tee)
 * OTHER VERSIONS:   9:16 same prompt → https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_7e0c19911283.mp4
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

const STILL = S3 + "file_326f1f7fa7e3.jpg";

const PROMPT = `Action cam inside the microwave, locked, same framing as the first frame. [0-2s] The hamster looks up at the lens, whiskers twitching, then pats the can beside it with one paw like a proud owner. [2-4s] Outside the glass, the two guys' faces lean in closer, eyes widening; one of them taps the glass, the whole frame shudders slightly. [4-6s] The turntable begins to rotate slowly, carrying the hamster and the can in a gentle circle; the hamster keeps staring into the lens the whole way round. Microwave hum, a soft tap on glass, muffled voices. No text.`;

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
