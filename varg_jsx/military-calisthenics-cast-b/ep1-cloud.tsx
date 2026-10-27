// Military Calisthenics — Cast B, cloud render variant.
//
// Submit with:
//   cd templates && set -a && . ./.env && set +a
//   curl -s -X POST https://api.varg.ai/v2/render \
//     -H "Authorization: Bearer $VARG_API_KEY" -H "Content-Type: application/json" \
//     -d "{\"code\": $(cat templates/military-calisthenics-cast-b/ep1-cloud.tsx | jq -Rs .)}"
//
// Cloud rules: no imports, no createVarg, no named exports. Globals are injected.
//
// ── Cast B vs the original ──────────────────────────────────────────────────
//   A1 interviewer: olive-skinned brunette, dark ponytail
//                -> Black woman, ~35, voluminous natural curls
//   A2 coach:       white ~50, short greying hair, grey stubble
//                -> bald white man, ~55, full grey beard
// Same brick podcast room, same camera, same 6 lines, same cut timings.
//
// ── The provider_options fix ────────────────────────────────────────────────
// The original wrote `providerOptions: { varg: { mode, audio, resolution } }`.
// That is silently dropped: @vargai/gateway unwraps `.varg` and sends the bag
// unkeyed, but db-adapter.ts:114 looks up providerOptions[provider_options_key]
// where the seedance mapping sets that key to "piapi" (migration 0107, line 199).
// The mapping also puts resolution at input.resolution, not root.
//
// Proven via /v2/estimate on a 10s pro clip:
//   {varg:{resolution:"1080p"}}              -> 231c  (the 720p rate)
//   {piapi:{input:{resolution:"1080p"}}}     -> 578c
// So the reference ad rendered at 720p, not the 1080p its code claimed.
//
// Correct shape, used below:
//   providerOptions: { varg: { piapi: { input: { ... } } } }
//                      ^ stripped by gateway  ^ read by the adapter
//
// Resolution stays 720p deliberately — matching the reference ad's real output
// keeps this a clean cast-only A/B. Flip to "1080p" in OPTS to actually upgrade.
//
// ── Why `prompt` is repeated inside provider_options.piapi.input ────────────
// API bug, not a style choice. providerOverrideSchema (src/lib/jsonSchema.ts:86)
// only makes TOP-LEVEL fields optional; the nested `input` object is built by
// jsonSchemaToZod (:68-78), which honours the nested `required` array. Seedance
// declares input.required = ["prompt"], so the override bag demands a prompt —
// contradicting the comment on :90 ("these are overrides, not the full input").
//
// Without the echo the render dies before generating anything:
//   "provider_options.piapi.input.prompt: Invalid input: expected string,
//    received undefined" (x6)  -> job_6db68dab053a, $0 spent
//
// So the same string is passed twice, from ONE source of truth (`text` below)
// so the two copies can never drift. body.merge() applies the override last,
// merging an identical value — a no-op on content, and it unblocks mode /
// audio / resolution. Remove the echo once the nested-required bug is fixed.
//
// ── v2: why the clips are no longer hand-timed ──────────────────────────────
// v1 copied the reference ad's cut list (4/9/4/8/3/8). Our lines are longer,
// so <Clip duration> silently chopped mid-sentence. Whisper on the six raw
// clips proved the generations were fine — every line was spoken in full:
//
//   clip                        speech ends   v1 cut   lost
//   g3 "So what exactly…"          3.52         4.0    -
//   c2 "…military principles"      9.82         9.0    "men over 50."
//   g5 "Over 50? Does it…"         3.10         3.0    clipped "age?"
//   c4 "Traditional gyms…"         9.72         8.0    "stronger, and moving better."
//   g1 "And what equipment…"       2.48         4.0    -  (1.5s dead air)
//   c6 "None at all…"              9.34         8.0    "younger within weeks."
//
// Two fixes:
//  1. Coach clips 10s -> 13s. All three ran to the 10s ceiling (c4 even starts
//     at 0.00), i.e. the model was compressing speech to fit. 13s gives ~3s of
//     headroom. Seedance caps at 15; 16 is rejected by the provider schema.
//  2. Cuts come from vid.audio.speechRange() instead of hardcoded numbers —
//     hardcoded values would go stale the moment a clip is regenerated.
//     Verified this works in cloud: render runs vargai@0.4.0-alpha118, whose
//     primitives/silence.ts routes silencedetect through the Rendi backend
//     (alpha115 in templates/sdk still throws and degrades silently), and
//     GROQ_API_KEY is a deployed secret on fly app render-fqb8zg.
//
// Caveat: POST /v2/render's preflight MOCKS speechRange() to
// {start: 0, end: segCount * 5} (render/src/api/render/tsx-eval.ts:243-249),
// so a 202 says nothing about the real trims — only the worker knows.
//
// <Captions src={vid.audio}> reuses the SAME memoized transcription as
// speechRange (sdk renderers/captions.ts:217-247), so subtitles and cuts
// always agree on where speech starts and ends.

const A1_FACE  = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_ce7ccbcd12b4.png";
const A1_BODY  = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_570493cda9f9.png";
const A2_SEAT  = "https://s3.varg.ai/files/db4ef430-d0c7-403e-a8e2-722292a92e8c/file_c3b05e0ae1b2.png";
// Location plate reused byte-identical from the original render — $0, and it
// guarantees the room matches the coach's seated frame exactly.
const LOC      = "https://s3.varg.ai/files/667690f1-5d8e-48e0-95ed-4ece08ad7202/file_81b1c457a01f.png";

const RES = "720p";

// `text` is echoed into input.prompt purely to satisfy the nested-required bug
// documented above. Single argument in, two copies out — they cannot diverge.
const opts = (mode: string, text: string) => ({
  varg: { piapi: { input: { prompt: text, mode, audio: true, resolution: RES } } },
});

// Shared staging for the interviewer. Identical across her three clips so the
// cache key only differs by the spoken line.
const GIRL_SET =
  "Static 9:16 medium close-up at eye level. Adult Black woman about 35 with voluminous shoulder-length natural curly hair, in a dark teal T-shirt, sits at a wooden podcast table before a warm brick wall, black boom microphone entering from frame left near her mouth, notebook on the table. Head fully in frame near the top; she is framed mid-torso up, filling most of the height. @image1 is the woman's face identity reference only: retain her exact identity, not its facial expression. @image2 establishes her dark teal T-shirt and mid-torso presentation. @image3 establishes the warm brick podcast room and wooden-table layout. From the first frame she faces slightly left toward the off-camera coach, not the lens.";

const GIRL_TAIL =
  "She then holds relaxed silence with natural breathing. Ambient room tone and soft mic presence. No music. No narration. No subtitles.";

// Shared staging for the coach. The start frame locks identity + wardrobe.
const COACH_SET =
  "Start frame is the coach identity and wardrobe lock: a bald white man about 55 with a full thick grey beard, in a multicam camouflage t-shirt. Static 9:16 medium close-up at eye level, close 40mm feel: the coach's real body is seen directly, framed from upper arms to tabletop with head fully in frame near the top, filling most of the frame height. Seated at a wooden table against a brick wall, black boom microphone entering from frame right. From the first frame he is already speaking, torso angled slightly camera-right, eyes below lens line, serious authoritative face. Hands make small controlled forward gestures on key points, then settle on the table.";

const COACH_TAIL =
  "Contained natural everyday acting, fast confident delivery; then relaxed silent breathing. Clear voice, room tone, mic presence. Anatomically correct hands, stable body and wardrobe. No music. No narration. No subtitles.\n\nThe clip opens exactly on the provided first frame — same camera position, same framing, same room. Hold this exact camera angle for the entire clip: no camera movement, no reframing, no new background elements.";

const girl = (line: string, beat: string) => {
  const text = `${GIRL_SET} ${line} ${beat} ${GIRL_TAIL}`;
  return Video({
    prompt: { text, images: [A1_FACE, A1_BODY, LOC] },
    model: varg.videoModel("piapi:seedance_2_fast_less_restriction"),
    duration: 5,
    aspectRatio: "9:16",
    keepAudio: true,
    providerOptions: opts("omni_reference", text),
  });
};

// 13s, not 10s — see the v2 note in the header. Seedance accepts 4-15.
const COACH_DUR = 13;

const coach = (line: string) => {
  const text = `${COACH_SET} He says exactly once: "${line}" ${COACH_TAIL}`;
  return Video({
    prompt: { text, images: [A2_SEAT] },
    model: varg.videoModel("piapi:seedance_2_less_restriction"),
    duration: COACH_DUR,
    aspectRatio: "9:16",
    keepAudio: true,
    providerOptions: opts("first_last_frames", text),
  });
};

// Clip 1 — Girl: what is the challenge?
const vid1 = girl(
  'She says once, clearly and conversationally: "So what exactly is the Military Calisthenics Fat Burn Challenge?"',
  "She looks genuinely curious and engaged.",
);

// Clip 2 — Coach: what the program is
const vid2 = coach(
  "It is a bodyweight program built on military training principles — push-ups, squats, burpees — engineered to burn fat and rebuild strength specifically for men over 50.",
);

// Clip 3 — Girl: does it work at that age?
const vid3 = girl(
  'She says once, clearly and skeptically: "Over 50? Does it actually work at that age?"',
  "She looks doubtful and curious, eyebrow raised.",
);

// Clip 4 — Coach: gyms were built for 20-year-olds
const vid4 = coach(
  "Traditional gyms were built for 20-year-old bodies, not men in their 50s. This program works with the body you have right now — and men are already losing weight, feeling stronger, and moving better.",
);

// Clip 5 — Girl: what equipment?
const vid5 = girl(
  'She raises her hands in a small open-palmed question gesture and says once, clearly and conversationally: "And what equipment does he need to get started?"',
  "She looks curious and attentive.",
);

// Clip 6 — Coach: none, nine minutes a day
const vid6 = coach(
  "None at all. Just his own body and nine focused minutes a day. That is the entire system — and men are already reporting feeling 10 years younger within weeks.",
);

// TikTok-style burned-in subtitles, same preset the tai-chi templates use.
const CAPTION_STYLE = {
  style: "tiktok",
  position: "center",
  color: "#ffffff",
  activeColor: "#a3e635",
  wordsPerLine: 3,
  fontSize: 64,
} as const;

// Auto-trim. speechRange() transcribes each clip's own audio and returns
// {start,end} in seconds (null when it hears no speech — hence the fallbacks).
// `max` is the generated length, so a clamp can never seek past the file.
// 0.15s lead-in, 0.35s tail: the coach lands hard on his last consonant and
// needs a beat before the cut, which is exactly what v1 got wrong.
const shots = [
  { vid: vid1, max: 5 },
  { vid: vid2, max: COACH_DUR },
  { vid: vid3, max: 5 },
  { vid: vid4, max: COACH_DUR },
  { vid: vid5, max: 5 },
  { vid: vid6, max: COACH_DUR },
];

const timings = await Promise.all(
  shots.map(async ({ vid, max }) => {
    const r = await vid.audio.speechRange({ pad: 0.15 });
    const start = r ? Math.max(0, r.start - 0.15) : 0;
    const end = r ? Math.min(max, r.end + 0.35) : max;
    return { start, end };
  }),
);

export default (
  <Render width={1080} height={1920}>
    {shots.map(({ vid }, i) => {
      const { start, end } = timings[i]!;
      return (
        <Clip
          cutFrom={start}
          cutTo={end}
          duration={end - start}
          {...(i > 0 ? { transition: { name: "fade", duration: 0.15 } } : {})}
        >
          {vid}
          <Captions src={vid.audio} {...CAPTION_STYLE} />
        </Clip>
      );
    })}
  </Render>
);
