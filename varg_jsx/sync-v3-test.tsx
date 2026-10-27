/** @jsxImportSource vargai */
// Sync v3 Test — Single full-body shot
//
// Pipeline:
//   1. Hungarian speech (longer) → veed-fabric (image + audio → talking video)
//   2. English speech (shorter)  → sync-v3 (relips the veed video)
//
// Usage:
//   bun run render templates/sync-v3-test.tsx -o output/sync-comparison/sync-v3-test.mp4 --cache .cache/sync-v3-test

import { Clip, Image, Render, Speech, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({
  apiKey: process.env.VARG_API_KEY!,
  baseUrl: process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1",
});

const VOICE_ID = "iDMkgZn4BJ6RWjdzXniN";
const FAR_IMAGE = "https://s3.varg.ai/o/job_868ad906.png";

const build = async () => {
  // Step 1: Hungarian speech (longer — drives veed animation length)
  const hunSpeech = await Speech({
    model: varg.speechModel("eleven_v3"),
    voice: VOICE_ID,
    children: "Jó napot kívánok! Hogy vagy ma? Remélem minden rendben van veled és jól érzed magad.",
  });

  console.log(`[sync-v3-test] Hungarian speech: ${hunSpeech.duration.toFixed(1)}s`);

  // Step 2: English speech (shorter — for relipsync)
  const engSpeech = await Speech({
    model: varg.speechModel("eleven_v3"),
    voice: VOICE_ID,
    children: "sync three lipsync, full body",
  });

  console.log(`[sync-v3-test] English speech: ${engSpeech.duration.toFixed(1)}s`);

  // Step 3: Load full body image
  const image = Image({ src: FAR_IMAGE });

  // Step 4: veed-fabric — image + Hungarian audio → talking video
  const veedVideo = Video({
    model: varg.videoModel("veed-fabric-1.0"),
    keepAudio: true,
    prompt: { images: [image], audio: hunSpeech },
    providerOptions: { varg: { resolution: "720p" } },
  });

  // Step 5: sync-v3 — relips veed video with English audio
  const lipsynced = Video({
    prompt: { video: veedVideo, audio: engSpeech },
    model: varg.videoModel("sync-v3"),
    keepAudio: true,
  });

  // sync-v3 output has English audio baked in — use keepAudio to hear it
  return (
    <Render width={1080} height={1920}>
      <Clip duration={engSpeech.duration}>
        {lipsynced}
      </Clip>
    </Render>
  );
};

export default build();
