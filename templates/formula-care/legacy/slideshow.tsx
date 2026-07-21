/** @jsxImportSource vargai */
// Formula Care — Tai Chi Challenge Slideshow (13 Scenes)
//
// UGC-style vertical slideshow for a Tai Chi wellness product/challenge.
// Images only — no video animation, no speech, no lipsync.
// Each scene is a generated image with Ken Burns motion and caption overlay.
//
// Three character groups with internal consistency:
//   Group A (Scenes 1-4): Older woman + trainer in gym
//   Group B (Scenes 5-6): Trainer + friend mirror selfie / results
//   Group C (Scenes 7-12): Two women outdoors (tai chi deck, forest walk)
//   Scene 13: Static CTA end screen
//
// Models: nano-banana-pro for base refs, nano-banana-2 for edits with references
//
// Usage: bun run render templates/clients/formula-care.tsx
// Cost:  ~95 credits ($0.95) — 13 images + 1 music track

import { Clip, Image, Music, Render, Title } from "vargai/react";
import { createVarg } from "@vargai/gateway";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const IMG_BASE = varg.imageModel("nano-banana-pro");
const IMG_EDIT = varg.imageModel("nano-banana-2");
const AR = "9:16" as const;

// ═════════════════════════════════════════════════════════════════════════
// GROUP A — Gym scenes (Scenes 1-4)
// Older woman in purple workout attire + trainer in dark blue activewear
// ═════════════════════════════════════════════════════════════════════════

const scene1 = Image({
  prompt: "Bright airy gym with light wooden floors and large windows, natural daylight streaming in. An older woman in her 60s wearing purple workout leggings and purple sports top performing squats, guided by a fit female trainer in dark blue activewear standing beside her. Wide shot, warm encouraging atmosphere, iPhone UGC style, photorealistic",
  model: IMG_BASE,
  aspectRatio: AR,
  zoom: "in",
});

const scene2 = Image({
  prompt: {
    text: "Same bright gym from reference, same older woman in purple workout attire and same trainer in dark blue activewear. Trainer is pointing toward the older woman's buttocks and upper arms, demonstrating problem areas like loose skin and cellulite. Concerned but supportive expression on trainer. Close-medium shot, iPhone UGC documentary style, photorealistic",
    images: [scene1],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "out",
});

const scene3 = Image({
  prompt: {
    text: "Same bright gym from reference, same trainer in dark blue activewear speaking directly to camera with confident expression, holding the older woman's raised arm to highlight skin texture on the upper arm. The older woman in purple workout attire stands beside her. Medium shot, trainer as main subject, iPhone UGC style, photorealistic",
    images: [scene1],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "in",
});

const scene4 = Image({
  prompt: {
    text: "Same bright gym from reference, same older woman in purple workout attire and same trainer in dark blue activewear performing squats together side by side, focusing on proper form. Trainer demonstrating correct posture. Medium-wide shot showing full bodies, bright natural light from windows, motivational atmosphere, iPhone UGC style, photorealistic",
    images: [scene1],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "out",
});

// ═════════════════════════════════════════════════════════════════════════
// GROUP B — Mirror selfie / results (Scenes 5-6)
// Trainer + friend in casual setting, then in workout gear after 28 days
// ═════════════════════════════════════════════════════════════════════════

const scene5 = Image({
  prompt: "Two fit women in their early 30s taking a mirror selfie in a casual cozy room with green plants and natural light. One woman has straight hair, the other has wavy hair. Both wearing casual athleisure clothes, smiling confidently at phone camera in mirror. Full-length mirror reflection, warm indoor lighting, Instagram selfie aesthetic, iPhone quality, photorealistic",
  model: IMG_BASE,
  aspectRatio: AR,
  zoom: "right",
});

const scene6 = Image({
  prompt: {
    text: "Same two women from reference, now wearing new matching workout gear, both looking visibly toned and happy. Taking a mirror selfie in the same room, big smiles, celebrating their transformation. One holds phone up for selfie. Bright natural light, plants in background, before-and-after results energy, Instagram aesthetic, iPhone quality, photorealistic",
    images: [scene5],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "left",
});

// ═════════════════════════════════════════════════════════════════════════
// GROUP C — Outdoor tai chi & forest walk (Scenes 7-12)
// Two women practicing tai chi and walking in nature
// ═════════════════════════════════════════════════════════════════════════

const scene7 = Image({
  prompt: "Two women in their 40s standing on a wooden deck surrounded by morning mist and trees, performing slow synchronized tai chi movements with arms extended gracefully. Both wearing comfortable neutral-toned workout clothes. Serene misty forest backdrop, soft golden morning light filtering through trees, peaceful zen atmosphere, wide shot, cinematic wellness photography, photorealistic",
  model: IMG_BASE,
  aspectRatio: AR,
  zoom: "in",
});

const scene8 = Image({
  prompt: {
    text: "Same two women from reference walking together through a beautiful tree-lined forest path, chatting casually and smiling. Dappled sunlight through tall trees, lush green foliage, fallen leaves on path. Relaxed friendly conversation, one woman has curly hair. Medium shot from slightly ahead, natural documentary style, photorealistic",
    images: [scene7],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "right",
});

const scene9 = Image({
  prompt: {
    text: "Same two women from reference on the forest path, one woman (straight hair) gesturing enthusiastically with her hands as she explains something, the other (curly hair) listening attentively. Forest path background with tall trees and dappled light. Medium-close shot focused on the speaking woman, natural documentary style, photorealistic",
    images: [scene8],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "left",
});

const scene10 = Image({
  prompt: {
    text: "Close-up of the curly-haired woman from reference on the forest path, looking curious and slightly skeptical, asking a question with raised eyebrows and open expression. The other woman partially visible listening in background. Soft forest light, shallow depth of field on the curly-haired woman's face, natural documentary style, photorealistic",
    images: [scene8],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "in",
});

const scene11 = Image({
  prompt: {
    text: "Same two women from reference standing together on the forest path, the straight-haired woman speaking passionately with a gentle confident expression, making a calming gesture with her hands. The curly-haired woman nodding along. Tall trees surrounding them, peaceful morning light, wide-medium shot, natural documentary style, photorealistic",
    images: [scene7],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "out",
});

const scene12 = Image({
  prompt: {
    text: "Close-up of the curly-haired woman from reference on the forest path, smiling warmly and nodding in agreement, looking convinced and motivated. Bright eyes, genuine happy expression. Soft bokeh forest background, warm natural light on her face, intimate close-up shot, photorealistic",
    images: [scene10],
  },
  model: IMG_EDIT,
  aspectRatio: AR,
  zoom: "in",
});

// ═════════════════════════════════════════════════════════════════════════
// SCENE 13 — CTA End Screen
// ═════════════════════════════════════════════════════════════════════════

const scene13 = Image({
  prompt: "Bold red solid background with three large white downward-pointing arrows stacked vertically in the center, a small rounded app icon at the bottom showing a person walking silhouette. Clean minimal graphic design, call-to-action screen, flat design, digital UI mockup",
  model: IMG_BASE,
  aspectRatio: AR,
});

// ═════════════════════════════════════════════════════════════════════════
// COMPOSITION — Slideshow with Ken Burns + captions + music
// ═════════════════════════════════════════════════════════════════════════

const FADE = { name: "dissolve" as const, duration: 0.6 };
const TOTAL_DURATION = 4 + 4 + 4 + 3 + 4 + 4 + 5 + 4 + 4 + 4 + 5 + 3 + 3; // 51s

export default (
  <Render width={1080} height={1920}>
    <Music
      prompt="calm peaceful wellness music, gentle tai chi flow, soft ambient piano and bamboo flute, meditative and uplifting, slow tempo"
      model={varg.musicModel("music_v1")}
      volume={0.25}
      duration={TOTAL_DURATION}
    />

    {/* Scene 1: Gym Squat Demonstration */}
    <Clip duration={4}>
      {scene1}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        You do not need to spend hours sweating to get in shape by summer.
      </Title>
    </Clip>

    {/* Scene 2: Highlighting Problem Areas */}
    <Clip duration={4} transition={FADE}>
      {scene2}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        If your booty looks like this.. Your arms look like this,
      </Title>
    </Clip>

    {/* Scene 3: Introducing the Tai Chi Challenge */}
    <Clip duration={4} transition={FADE}>
      {scene3}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        simply join our beginner Tai Chi Challenge this Monday, April 20th.
      </Title>
    </Clip>

    {/* Scene 4: Repeated Squat Sequence */}
    <Clip duration={3} transition={FADE}>
      {scene4}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        Forget the diets to get a beautifully toned body in exactly 28 days.
      </Title>
    </Clip>

    {/* Scene 5: Mirror Selfie with Bet Context */}
    <Clip duration={4} transition={FADE}>
      {scene5}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        SARA AND I JUST MADE A BET. COMPLETELY TONE HER BODY IN 28 DAYS IF SHE DROPS THE ENDLESS 10K STEPS AND SWITCHES TO TAI CHI.
      </Title>
    </Clip>

    {/* Scene 6: 28-Day Results Reveal */}
    <Clip duration={4} transition={FADE}>
      {scene6}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        DAY 28 AND I REALLY THOUGHT I WOULD WIN THE BET. I FEEL INCREDIBLY LIGHT AND MY SISTER ACTUALLY ASKED IF I LOST 20 POUNDS.
      </Title>
    </Clip>

    {/* Scene 7: Outdoor Tai Chi Practice */}
    <Clip duration={5} transition={FADE}>
      {scene7}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        IF YOU WAKE UP FEELING TOO STIFF TO MOVE, STOP FORCING HEAVY WORKOUTS. 7 MINUTES OF TAI CHI HEALS YOUR JOINTS AND MELTS THE FAT.
      </Title>
    </Clip>

    {/* Scene 8: Forest Walk Conversation */}
    <Clip duration={4} transition={FADE}>
      {scene8}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        I REALLY LOVE THESE WALKS, BUT LET'S BE HONEST, I CAN'T GET OUT HERE EVERY SINGLE DAY.
      </Title>
    </Clip>

    {/* Scene 9: Discussing the 7-Minute Routine */}
    <Clip duration={4} transition={FADE}>
      {scene9}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        CREATED THE 7-MINUTE TAI CHI WALKING ROUTINE. YOU DO IT RIGHT IN YOUR LIVING ROOM. NO SHOES, NO EQUIPMENT.
      </Title>
    </Clip>

    {/* Scene 10: Addressing Menopause Belly Concern */}
    <Clip duration={4} transition={FADE}>
      {scene10}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        WAIT... JUST 7 MINUTES IN MY LIVING ROOM? IS THAT REALLY GOING TO HELP ME LOSE THIS STUBBORN MENOPAUSE BELLY?
      </Title>
    </Clip>

    {/* Scene 11: Explaining Cortisol and Stress Relief */}
    <Clip duration={5} transition={FADE}>
      {scene11}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        YES, BECAUSE IT ACTIVELY LOWERS YOUR CORTISOL. YOUR BODY STOPS HOLDING ONTO STRESS AND FINALLY LETS THE WEIGHT GO.
      </Title>
    </Clip>

    {/* Scene 12: Agreeing to Try the Routine */}
    <Clip duration={3} transition={FADE}>
      {scene12}
      <Title position="bottom" color="white" outline={3} outlineColor="black">
        NO GYM, NO BAD WEATHER EXCUSES... I CAN DEFINITELY DO 7 MINUTES IN MY LIVING ROOM.
      </Title>
    </Clip>

    {/* Scene 13: Call to Action End Screen */}
    <Clip duration={3} transition={{ name: "fade", duration: 0.3 }}>
      {scene13}
      <Title position="center" color="white" outline={4} outlineColor="red">
        TAKE THE TEST
      </Title>
    </Clip>
  </Render>
);


