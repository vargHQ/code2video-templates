// Claymation UGC Ad — Plasticine Stop-Motion Product Testimonial
//
// Fast cuts synced to voiceover duration, 8 scenes, character-consistent clay figure.
// ref → edit → chain pattern for identity lock across all scenes.
// Top-level await Speech for audio.duration — clips + music sync to voiceover.
//
// Cloud render compatible (top-level await + export default).

const PRODUCT = "SUPER FOCUS";
const STYLE = "plasticine stop-motion animation, matte clay texture with fingerprint impressions, handmade imperfect wobble, soft warm studio lighting like children's book, cozy tactile aesthetic";
const CHAR_CONSISTENCY = `Use the provided clay character reference. Maximum consistency with the character's head shape, eye size and placement, facial proportions, clay skin color, hair sculpt, body proportions and identity. Exact reproduction of the same plasticine figure. No reinterpretation of the face or body.`;

// ── Base clay character reference ───────────────────────────────────────
const CHARACTER = Image({
  prompt: `${STYLE}. Character design: a clay office worker figurine, male, round head, small droopy tired eyes, brown sculpted hair, white clay button-up shirt, grey clay pants, seated at a small clay desk. Fingerprint texture visible on clay skin. Neutral matte grey background. Full figure visible. Character reference sheet style, front-facing.`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "16:9",
});

// ── Scene images (edit model + character ref + chaining) ────────────────

const scene1 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Medium shot. The clay worker slumped at his desk, head drooping, grey matte colors dominate the room. Cold cup of clay coffee on desk, computer screen showing '47 unread emails', small clay clock on wall. The entire room is desaturated grey-blue. Melted defeated energy. Warm studio lighting from above.`,
    images: [CHARACTER],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene2 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Close-up of the clay worker's face. Droopy tired eyes with tiny clay bags underneath, mouth slightly open in a yawn, grey-blue desaturated clay skin. Blurred grey office background. Intimate exhausted portrait.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene3 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Medium shot. The clay worker pouring from a clay coffee pot into a small clay mug, three empty mugs already on desk. Same grey desaturated office. Desperate energy. Steam rising from mug as tiny clay wisps.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene4 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Medium shot. Same clay worker at desk, pulling out a bright glowing orange clay bottle labeled '${PRODUCT}' from desk drawer. His eyes clicking open wide in surprise. Color bleeding back into the grey room — walls turning warm yellow, desk getting warmer tones. Dramatic lighting shift. The bottle glows orange against the grey.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene5 = Image({
  prompt: {
    text: `${STYLE}. Extreme close-up of a bright orange clay bottle labeled '${PRODUCT}' held in clay fingers with fingerprint texture. The label shows small clay icons of a lion's mane mushroom and a leaf. Warm golden glow radiating from the bottle. Shallow depth of field, blurred warm office background.`,
    images: [CHARACTER, scene4],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene6 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Medium shot. Same clay worker at desk, clay fingers flying across a small clay keyboard, clay papers swirling off desk marked 'DONE', clay clock hands pointing to noon. Room fully warm yellow-orange. Bright saturated colors. Small satisfied smile on clay face, eyes bright and alive. Energetic accomplished mood.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene7 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Medium shot. Same clay worker pushing back from desk and standing up, arms stretching overhead in triumph. Empty desk — all papers gone. Warm golden room. Big clay smile. Clock shows 12:00. Victory pose, accomplished energy.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

const scene8 = Image({
  prompt: {
    text: `${CHAR_CONSISTENCY}. ${STYLE}. Wide shot. Same clay worker jogging through a bright clay park. Warm orange clay sun in sky, small clay birds flying around him, clay trees and flowers in vibrant greens and yellows. Happy clay face, running motion with arms pumping. The orange '${PRODUCT}' bottle visible in clay pocket. Bright joyful maximum saturation.`,
    images: [CHARACTER, scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
  providerOptions: { varg: { resolution: "2K" } },
});

// ── Animate each scene ──────────────────────────────────────────────────

const vid1 = Video({ prompt: { text: "static wide shot, slight stop-motion camera wobble, head droops slightly, blinks slowly, tired defeated atmosphere", images: [scene1] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid2 = Video({ prompt: { text: "extreme close-up, slight wobble, tired eyes blink heavily, small yawn, exhausted subtle movement", images: [scene2] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid3 = Video({ prompt: { text: "static shot, slight wobble, hand pours coffee into mug, steam wisps rise, desperate tired pouring motion", images: [scene3] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid4 = Video({ prompt: { text: "static wide shot with slight wobble, hand pulls glowing orange bottle from drawer, eyes snap open wide, color shift spreading across room from grey to warm yellow", images: [scene4] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid5 = Video({ prompt: { text: "extreme close-up, slight wobble, clay hand rotates the glowing bottle slowly, golden light pulses from label, warm glow intensifies", images: [scene5] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid6 = Video({ prompt: { text: "static wide shot, slight wobble, clay fingers typing fast on keyboard, papers swirling and flying off desk, clock spinning, energetic bright warm colors", images: [scene6] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid7 = Video({ prompt: { text: "static shot, slight wobble, clay figure pushes back from desk and stands up stretching arms overhead, triumphant victorious energy", images: [scene7] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 3 });
const vid8 = Video({ prompt: { text: "wide shot, gentle wobble, clay figure jogging with joyful bouncy energy, small birds flying alongside, bright warm sunshine, playful stop-motion running", images: [scene8] }, model: varg.videoModel("kling-v3"), keepAudio: false, duration: 5 });

// ── Voiceover (top-level await for duration) ────────────────────────────

const audio = await Speech({
  voice: "josh",
  model: varg.speechModel("eleven_v3"),
  children: "Monday morning. Third coffee. Still nothing. I started taking Super Focus — lion's mane, rhodiola, the real stuff — and honestly I don't know if it's placebo but I finished everything by noon and went for a run. First time in months.",
});

// ── Clip timing — compensate for fade overlap so total = audio.duration ──
// With N clips and (N-1) fades: total = N*CUT - (N-1)*FADE
// So CUT = (audio.duration + (N-1)*FADE) / N
const CLIPS = [vid1, vid2, vid3, vid4, vid5, vid6, vid7, vid8];
const FADE = 0.15;
const CUT = (audio.duration + (CLIPS.length - 1) * FADE) / CLIPS.length;

export default (
  <Render width={1920} height={1080}>
    {CLIPS.map((vid, i) => (
      <Clip
        duration={CUT}
        transition={i > 0 ? { name: "fade", duration: FADE } : undefined}
      >
        {vid}
      </Clip>
    ))}
    {audio}
    <Captions src={audio} style="tiktok" position="bottom" color="#DCC8A0" />
    <Music prompt="soft playful whimsical music box, gentle clay animation vibes, subtle progression from melancholic to uplifting, warm cozy handmade feeling" model={varg.musicModel("music_v1")} volume={0.25} duration={audio.duration} ducking />
  </Render>
);
