// Formula Care — Episode 2 (Cloud Render version)
//
// Same template as formula-care-ep2.tsx but adapted for POST /v2/render:
//   - no imports, no createVarg (globals injected by the render service)
//   - captions via vid.audio — no SRT file needed (cloud has no disk)
//
// Submit:
//   curl -s -X POST https://api.varg.ai/v2/render \
//     -H "Authorization: Bearer $VARG_API_KEY" -H "Content-Type: application/json" \
//     -d "{\"code\": $(cat templates/clients/formula-care-ep2-cloud.tsx | jq -Rs .)}"

const IMG_EDIT = varg.imageModel("nano-banana-pro/edit");
const IMG_BASE = varg.imageModel("nano-banana-pro");
const AR = "9:16";
const AUDIO_ON = { varg: { generate_audio: true } };

const A1_PHOTO = "https://uu.varg.ai/1784576476121_3hb7fv71.jpeg";
const A2_PHOTO = "https://uu.varg.ai/1784576485522_vbgd4amk.jpeg";

const a1Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same grey hair, same body shape. Overweight woman in her late 50s with grey hair. She wears a simple dark sports bra top and snug high-waisted dark athletic shorts (underwear-style workout shorts), barefoot. Her belly is fully exposed and visible, arms bare, legs bare from mid-thigh down. Standing straight facing camera, neutral relaxed pose, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A1_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const a2Card = Image({
  prompt: {
    text: "Full-body character reference card of the exact same woman from the photo: same face, same hair, same slim build. Slim Asian fitness trainer in her 30s. She wears a fitted fitness uniform: sporty crop top and full-length leggings in matching color, clean athletic sneakers. Standing straight facing camera, confident friendly expression, arms at her sides. Plain light grey studio background, even soft lighting, head-to-toe framing, photorealistic",
    images: [A2_PHOTO],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const gymLoc = Image({
  prompt:
    "Empty modern gym interior with huge floor-to-ceiling windows letting in bright natural daylight, green trees visible outside. Light wooden floor, a few yoga mats rolled in a corner, rack of dumbbells along one wall, mirrors on the opposite wall. No people. Clean airy atmosphere, warm daylight, photorealistic, 9:16 portrait framing",
  model: IMG_BASE,
  aspectRatio: AR,
});

const SAME =
  "First reference image is Woman A (overweight late-50s woman with grey hair, dark sports bra and dark athletic shorts, barefoot). Second reference image is Woman B (slim Asian trainer in her 30s in fitted fitness uniform with sneakers). Third reference image is the gym location with huge windows. Keep both women's faces, hair, bodies and outfits exactly as in their reference cards, and the gym exactly as in the location reference.";

const scene1 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows. Woman A is mid-squat, knees bent, arms stretched forward for balance, belly folding, effortful concentrated expression. Woman B stands beside her closer to camera, facing the camera, speaking with an encouraging open-hand gesture. Bright natural daylight from the windows, warm candid atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene2 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing away from the camera, seen from behind head to toe in her dark sports bra and dark athletic shorts, her bare legs visible. Woman B crouches beside her on the left, pointing a finger toward Woman A's hips and thighs while looking at the camera. Huge windows with daylight in the background, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene3 = Image({
  prompt: {
    text: `${SAME} Full-body shot inside the gym. Woman A stands facing the camera head to toe, neutral stoic expression, her bare belly fully visible above the dark athletic shorts, hips and part of her rear visible. Woman B stands beside her on the left, slightly crouched, pointing an open hand at Woman A's belly while looking at the camera. Huge windows with daylight behind them, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene4 = Image({
  prompt: {
    text: `${SAME} Close-up shot inside the gym, framing the upper bodies of both women. Woman A faces the camera holding her right arm raised out to the side, the soft loose skin of her bare upper arm clearly visible, part of her belly visible below. Woman B stands on the left, pointing at Woman A's raised arm while looking directly into the camera with a confident expression. Blurred gym windows in the background, intimate close framing, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const scene5 = Image({
  prompt: {
    text: `${SAME} Medium-wide shot inside the gym in front of the huge windows, same framing as a squat training scene. Woman A has just risen from a squat, standing tall with a big proud happy smile, arms slightly raised in triumph. Woman B stands beside her facing the camera, laughing warmly and giving Woman A an encouraging thumbs-up. Both women look genuinely happy. Bright natural daylight, joyful warm atmosphere, photorealistic`,
    images: [a1Card, a2Card, gymLoc],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
});

const vid1 = Video({
  prompt: {
    text: `Modern gym with huge floor-to-ceiling windows, green trees outside, bright daylight.
The older grey-haired woman performs slow controlled squats, bending her knees and rising, arms stretched forward, concentrated effort on her face.
The slim Asian trainer stands beside her facing the camera, gesturing warmly while speaking.
Static medium-wide shot, natural daylight, candid atmosphere.
The trainer speaks in a clear encouraging voice: "You do not need to spend hours sweating to transform your shape by summer."
Soft gym ambient sounds, quiet footsteps on wooden floor.`,
    images: [scene1],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

const vid2 = Video({
  prompt: {
    text: `Same gym with huge windows. The older grey-haired woman stands still with her back to the camera, full body visible.
The slim Asian trainer crouches beside her on the left, pointing toward the woman's hips, looking at the camera while speaking.
Subtle natural movement, the trainer's hand gestures as she talks.
Static camera, full-body framing.
The trainer says matter-of-factly: "If your booty looks like this."
Soft gym ambient sounds.`,
    images: [scene2],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

const vid3 = Video({
  prompt: {
    text: `Same gym with huge windows. Front-facing full-body shot.
The older grey-haired woman stands facing the camera with a neutral stoic expression, standing still, her bare belly visible.
The slim Asian trainer stands beside her, slightly crouched, gesturing with an open hand toward the woman's midsection while looking at the camera.
Static camera, natural daylight.
The trainer says: "If your belly looks like this."
Soft gym ambient sounds.`,
    images: [scene3],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 4,
  providerOptions: AUDIO_ON,
});

const vid4 = Video({
  prompt: {
    text: `Same gym, tight close-up on both women's upper bodies.
The older grey-haired woman holds her arm raised out to the side, soft upper arm visible, standing still.
The slim Asian trainer points at the raised arm, then looks directly into the camera speaking with confident energy.
Static intimate close-up framing.
The trainer says clearly and confidently: "If your arms look like this. Simply join our beginner Tai Chi Challenge this Monday, July 27th."
Soft gym ambient, the trainer's voice is clear and motivating.`,
    images: [scene4],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 7,
  providerOptions: AUDIO_ON,
});

const vid5 = Video({
  prompt: {
    text: `Same gym with huge windows, medium-wide shot.
The older grey-haired woman rises up from a squat and stands tall, breaking into a big proud smile, raising her arms slightly in triumph.
The slim Asian trainer beside her laughs warmly, gives her a thumbs-up, both women genuinely happy and celebrating.
Static camera, bright natural daylight, joyful energy.
The trainer says with conviction: "Forget the diets and cardio to get a beautifully toned body in exactly 28 days."
Happy laughter, soft gym ambient sounds.`,
    images: [scene5],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: true,
  duration: 6,
  providerOptions: AUDIO_ON,
});

export default (
  <Render width={1080} height={1920} fps={30}>
    <Music
      prompt="Upbeat gentle background fitness music, soft piano and light percussion, positive uplifting mood, energetic but not overwhelming"
      model={varg.musicModel("music_v1")}
      volume={0.1}
      ducking
    />

    <Clip cutFrom={0.2} cutTo={5.6} duration={5.4}>
      {vid1}
      <Captions
        src={vid1.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={64}
      />
    </Clip>

    <Clip cutFrom={0.2} cutTo={2.9} duration={2.7}>
      {vid2}
      <Captions
        src={vid2.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={64}
      />
    </Clip>

    <Clip cutFrom={1.5} cutTo={4.0} duration={2.5}>
      {vid3}
      <Captions
        src={vid3.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={64}
      />
    </Clip>

    <Clip cutFrom={0.9} cutTo={7.0} duration={6.1}>
      {vid4}
      <Captions
        src={vid4.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={64}
      />
    </Clip>

    <Clip cutFrom={0.3} cutTo={6.0} duration={5.7}>
      {vid5}
      <Captions
        src={vid5.audio}
        style="tiktok"
        position="center"
        color="#ffffff"
        activeColor="#a3e635"
        wordsPerLine={3}
        fontSize={64}
      />
    </Clip>
  </Render>
);
