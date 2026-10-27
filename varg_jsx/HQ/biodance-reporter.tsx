/** @jsxImportSource vargai */
// Biodance Reporter — Breaking News UGC with Lipsync + B-Roll
//
// 9-scene fast-cut news report. Reporter breaks character mid-broadcast
// to rave about a sheet mask. Intercut with crowd b-roll (Kling v3,
// ambient audio kept) and product closeups.
//
// 9 speech segments map 1:1 to 9 clips. Every clip uses
// segments[i].duration — no fixed durations, perfect audio/video sync.
// All segments ≥2s. Kling scenes on short phrases (≤4s) to fit 5s limit.
//
// Pipeline:
//   Talking heads: Image → VEED Fabric lipsync (image + segment audio)
//   Reporter + crowd: Image → Kling v3 (no lipsync, crowd audio on)
//   B-roll: Image → Kling v3 (camera motion + ambient audio)
//   Product scenes: nano-banana-pro/edit with mask reference image
//
// Usage: bun run templates/HQ/biodance-reporter.tsx

import { createVarg, elevenlabs } from "vargai/ai";
import { Captions, Clip, Image, Music, Render, render, Speech, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Product reference — Biodance Bio-Collagen Mask ──────────────────────
const MASK_REF = "https://s3.varg.ai/uploads/images/screenshot-2026-04-03-at-75533-pm_af363e41.png";

// ── Segmented voiceover — 9 segments, one per scene, all ≥2s ────────────
const { audio, segments } = await Speech({
  voice: "Gv42yFG3G6CHLsU5y8g6",
  model: elevenlabs.speechModel("eleven_v3"),
  children: [
    // Scene 1: VEED lipsync — reporter wide shot
    "We're live here on Fifth Avenue where residents reported unusual activity earlier this morning.",
    // Scene 2: Kling v3 — reporter among crowd, crowd audio on (~3s)
    "It's not a crime scene. It appears to be a product launch.",
    // Scene 4: Kling v3 b-roll — crowd only (~3s)
    "For a sheet mask. I went inside. I tried it.",
    // Scene 5: VEED lipsync — closeup tired
    "I've been standing here for four hours.",
    // Scene 6: Kling v3 b-roll — mask closeup (~3s)
    "This is the Biodance Bio-Collagen Mask.",
    // Scene 7: VEED lipsync — holding mask up, product visible
    "I have combination skin, I haven't slept properly in six days, and my face looks—",
    // Scene 8: VEED lipsync — intimate, leaning in
    "I need you to understand what I'm about to say is a live broadcast.",
    // Scene 9: VEED lipsync — emotional
    "Genuinely different this morning. The crowd hasn't stopped growing.",
    // Scene 10: Kling v3 b-roll — crowd reaction (~2s)
    "Reporting live. Back to you.",
  ],
});

// ── Scene images ────────────────────────────────────────────────────────

// Base character — reporter at street corner
const scene1 = Image({
  prompt:
    "professional female reporter at street corner, holding microphone, serious expression, earpiece visible, Fifth Avenue police tape in blurred background, handheld camera angle, natural daylight, news broadcast aesthetic",
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "16:9",
});

// Reporter among the crowd — wider shot with people around her
const scene2 = Image({
  prompt: {
    text: "same professional female reporter standing among a crowd of excited women on Fifth Avenue, people pressing in around her, some pointing at storefront, police tape visible, reporter holding microphone looking slightly overwhelmed, wide handheld camera angle, natural daylight, chaotic documentary energy",
    images: [scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Closeup — tired but genuine
const scene3 = Image({
  prompt: {
    text: "close-up of the reporter's face, looking directly at camera with slight fatigue but genuine expression, earpiece visible, street corner background blurred, handheld camera hold",
    images: [scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Crowd b-roll — NO reporter, just the crowd
const crowdScene = Image({
  prompt: {
    text: "crowd of excited women gathered outside a luxury storefront on Fifth Avenue, police tape in foreground, some holding shopping bags, animated conversations, natural daylight, documentary handheld camera angle, no reporter visible",
    images: [scene1],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Mask extreme closeup — product b-roll
const maskCloseup = Image({
  prompt: {
    text: "extreme closeup of the Biodance Bio-Collagen Mask package from reference, held in a woman's hands against blurred Fifth Avenue street background, natural daylight, shallow depth of field, premium beauty product photography, news broadcast style handheld feel",
    images: [MASK_REF],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Reporter holding mask up — product fully visible
const productScene = Image({
  prompt: {
    text: "same reporter from first reference holding up the Biodance Bio-Collagen Mask package from second reference prominently in her right hand directly in front of camera, product packaging fully visible and in focus, reporter's face slightly behind the product, excited conspiratorial expression, street corner background blurred, handheld camera angle, natural daylight",
    images: [scene1, MASK_REF],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Reporter holding mask near face — intimate
const scene5 = Image({
  prompt: {
    text: "same reporter from first reference very close to camera, holding Biodance mask from second reference up prominently in both hands near her face, genuine expression, less formal, the real person bleeding through the news anchor voice, intimate handheld camera angle",
    images: [scene1, MASK_REF],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// Crowd reaction — excited murmuring
const crowdReaction = Image({
  prompt: {
    text: "same crowd from earlier now reacting with excitement, some women pointing, others covering mouths in surprise, Fifth Avenue storefront background, natural daylight, documentary handheld camera, energetic atmosphere, no reporter visible",
    images: [crowdScene],
  },
  model: varg.imageModel("nano-banana-pro/edit"),
  aspectRatio: "16:9",
});

// ── Scene 3: Reporter among crowd — Kling v3 (no lipsync) ────────────────
const vid3 = Video({
  prompt: {
    text: "handheld camera, reporter standing among loud excited crowd, people talking loudly and gesturing, crowd pressing in, chaotic energy, women pointing at storefront, police tape fluttering, reporter trying to speak into microphone, documentary candid style, speaking",
    images: [scene2],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — prompt asks for speech; the full VO owns dialogue
  duration: 5,
});

// ── Talking head videos (VEED Fabric: image + segment audio → lipsync) ──
const lip0 = Video({ model: varg.videoModel("veed-fabric-1.0"), keepAudio: false, prompt: { images: [scene1], audio: segments[0] } });
const lip3 = Video({ model: varg.videoModel("veed-fabric-1.0"), keepAudio: false, prompt: { images: [scene3], audio: segments[3] } });
const lip5 = Video({ model: varg.videoModel("veed-fabric-1.0"), keepAudio: false, prompt: { images: [productScene], audio: segments[5] } });
const lip6 = Video({ model: varg.videoModel("veed-fabric-1.0"), keepAudio: false, prompt: { images: [scene5], audio: segments[6] } });
const lip7 = Video({ model: varg.videoModel("veed-fabric-1.0"), keepAudio: false, prompt: { images: [scene5], audio: segments[7] } });

// ── B-roll videos (Kling v3: image → animated, muted under the VO) ─────
const brollCrowd = Video({
  prompt: {
    text: "handheld camera panning across excited crowd outside storefront, women chatting loudly and pointing, police tape fluttering in wind, natural movement, documentary style",
    images: [crowdScene],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: 5,
});

const brollMask = Video({
  prompt: {
    text: "slow handheld camera drift, extreme closeup of mask package, light catching the foil packaging, subtle hand movement, premium product feel",
    images: [maskCloseup],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: 5,
});

const brollCrowdReaction = Video({
  prompt: {
    text: "handheld camera captures crowd reaction, women turning to each other excited, some laughing, energetic atmosphere on Fifth Avenue, documentary candid style",
    images: [crowdReaction],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — the full VO track owns the audio
  duration: 5,
});

// ── Final Render ────────────────────────────────────────────────────────
const demo = (
  <Render width={1920} height={1080}>
    <Music
      prompt="subtle breaking news broadcast background, minimalist electronic news theme, quiet tension building to subtle warmth"
      model={varg.musicModel("music_v1")}
      volume={0.12}
      duration={audio.duration}
      ducking
    />

    {/* Scene 1: Wide — reporter at corner (VEED lipsync) */}
    <Clip duration={segments[0].duration}>{lip0}</Clip>

    {/* Scene 2: Reporter among crowd — Kling, crowd audio on */}
    <Clip duration={segments[1].duration} cutFrom={0.3} cutTo={segments[1].duration + 0.3} transition={{ name: "fade", duration: 0.15 }}>
      {vid3}
    </Clip>

    {/* Scene 3: Crowd b-roll — "For a sheet mask. I went inside. I tried it." */}
    <Clip duration={segments[2].duration} cutFrom={0.3} cutTo={segments[2].duration + 0.3} transition={{ name: "fade", duration: 0.15 }}>
      {brollCrowd}
    </Clip>

    {/* Scene 4: Closeup tired — "I've been standing here for four hours." */}
    <Clip duration={segments[3].duration} transition={{ name: "fade", duration: 0.15 }}>{lip3}</Clip>

    {/* Scene 5: Mask b-roll — "This is the Biodance Bio-Collagen Mask." */}
    <Clip duration={segments[4].duration} cutFrom={0.3} cutTo={segments[4].duration + 0.3} transition={{ name: "fade", duration: 0.15 }}>
      {brollMask}
    </Clip>

    {/* Scene 6: Product reveal — mask fully visible */}
    <Clip duration={segments[5].duration} transition={{ name: "fade", duration: 0.15 }}>{lip5}</Clip>

    {/* Scene 7: Intimate — "I need you to understand..." */}
    <Clip duration={segments[6].duration} transition={{ name: "fade", duration: 0.15 }}>{lip6}</Clip>

    {/* Scene 8: Emotional — "Genuinely different... crowd hasn't stopped growing." */}
    <Clip duration={segments[7].duration} transition={{ name: "fade", duration: 0.15 }}>{lip7}</Clip>

    {/* Scene 9: Crowd reaction b-roll — "Reporting live. Back to you." */}
    <Clip duration={segments[8].duration} cutFrom={0.3} cutTo={segments[8].duration + 0.3} transition={{ name: "fade", duration: 0.15 }}>
      {brollCrowdReaction}
    </Clip>

    {/* Full continuous voiceover */}
    {audio}

    {/* TikTok-style captions */}
    <Captions src={audio} style="tiktok" position="bottom" />
  </Render>
);

async function main() {
  const result = await render(demo, {
    output: "output/biodance-reporter.mp4",
    cache: ".cache/ai-biodance-reporter-v7",
  });

  console.log(
    `Done: output/biodance-reporter.mp4 (${(result.video.byteLength / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
