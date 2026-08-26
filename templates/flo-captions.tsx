// title: Native Audio Captions with Prompt Correction
// Demonstrates vid.audio lazy-derived captions + the prompt prop for Whisper
// transcription accuracy (corrects "Flo" vs "flow").

// ==== LINE ====
const LINE = "Why do my boobs hurt so bad today? Okay... let's check Flo.";

// ==== CHARACTER: use the provided reference image ====
const character = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_982de648096f.png";

// ==== VIDEO ====
const vid = Video({
  prompt: {
    text:
      "UGC style video, the woman from the reference image sits on her bed in a cozy bedroom. " +
      "She wears her oversized lilac hoodie and grey joggers, hair down or loosely styled. " +
      "She winces slightly and presses one hand flat against her upper chest in discomfort, fully clothed, " +
      "casual everyday moment. " +
      'Dialogue: "' + LINE + '" ' +
      "She picks up her phone from the duvet and opens it, her face softly lit by the screen, " +
      "a small relieved smile as she reads. " +
      "Handheld selfie-camera feel, soft warm morning light, vivid saturated colors, no text on screen. " +
      "Maintain exact face, skin tone, and appearance from the reference image.",
    images: [character],
  },
  model: varg.videoModel("seedance-2-less-restriction"),
  aspectRatio: "9:16",
  duration: 8,
  keepAudio,
});

export default (
  <Render width={1080} height={1920}>
    <Clip duration={8}>
      {vid}
      <Captions
        src={vid.audio}
        style="tiktok"
        position="bottom"
        prompt="person named Flo, period tracking app"
      />
    </Clip>
  </Render>
);
