/** @jsxImportSource vargai */
// Sync Lipsync Comparison — Individual Clips (v3)
//
// Pipeline per clip:
//   1. Hungarian speech (longer) → veed-fabric (image + audio → talking video)
//   2. English speech (shorter)  → sync model relips the veed video
//   For "none": veed video with keepAudio (Hungarian audio stays)
//
// Env vars:
//   SHOT  = extreme-closeup | mid | far   (default: mid)
//   SYNC  = none | sync-v2-pro | sync-v3  (default: none)
//
// Usage:
//   SHOT=mid SYNC=sync-v3 bun run render templates/sync-comparison.tsx \
//     -o output/sync-comparison/sync-v3-mid.mp4 --cache .cache/sync-comparison-v3

import { Clip, Image, Render, Speech, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({
  apiKey: process.env.VARG_API_KEY!,
  baseUrl: process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1",
});

// ── Parameters ──────────────────────────────────────────────────────────
const SHOT = (process.env.SHOT ?? "mid") as "extreme-closeup" | "mid" | "far";
const SYNC = (process.env.SYNC ?? "none") as "none" | "sync-v2-pro" | "sync-v3";
const VOICE_ID = "iDMkgZn4BJ6RWjdzXniN";

console.log(`[sync-comparison] SHOT=${SHOT} SYNC=${SYNC}`);

// ── Pre-generated nano-banana-2 chained images ─────────────────────────
const SHOT_IMAGES: Record<string, string> = {
  far: "https://s3.varg.ai/o/job_868ad906.png",
  mid: "https://s3.varg.ai/o/job_73f9546c.png",
  "extreme-closeup": "https://s3.varg.ai/o/job_05467a68.png",
};

// ── Speech labels ───────────────────────────────────────────────────────
const SHOT_LABELS: Record<string, string> = {
  "extreme-closeup": "extreme close-up",
  mid: "close shot",
  far: "full body",
};

const SYNC_LABELS: Record<string, string> = {
  none: "no lipsync",
  "sync-v2-pro": "sync two pro lipsync",
  "sync-v3": "sync three lipsync",
};

// ── Build ───────────────────────────────────────────────────────────────
const build = async () => {
  const image = Image({ src: SHOT_IMAGES[SHOT]! });

  // Step 1: Hungarian speech (longer — drives veed animation length)
  const hunSpeech = await Speech({
    model: varg.speechModel("eleven_v3"),
    voice: VOICE_ID,
    children: "Jó napot kívánok! Hogy vagy ma? Remélem minden rendben van veled és jól érzed magad.",
  });

  console.log(`[sync-comparison] Hungarian speech: ${hunSpeech.duration.toFixed(1)}s`);

  // Step 2: veed-fabric — image + Hungarian audio → talking video
  const veedVideo = Video({
    model: varg.videoModel("veed-fabric-1.0"),
    keepAudio: true,
    prompt: { images: [image], audio: hunSpeech },
    providerOptions: { varg: { resolution: "720p" } },
  });

  if (SYNC === "none") {
    // No lipsync — veed video with Hungarian audio (keepAudio: true)
    return (
      <Render width={1080} height={1920}>
        <Clip duration={hunSpeech.duration}>
          {veedVideo}
        </Clip>
      </Render>
    );
  }

  // Step 3: English speech (shorter — for relipsync)
  const engSpeech = await Speech({
    model: varg.speechModel("eleven_v3"),
    voice: VOICE_ID,
    children: `${SYNC_LABELS[SYNC]}, ${SHOT_LABELS[SHOT]}`,
  });

  console.log(`[sync-comparison] English speech: "${SYNC_LABELS[SYNC]}, ${SHOT_LABELS[SHOT]}" (${engSpeech.duration.toFixed(1)}s)`);

  // Step 4: sync model — relips veed video with English audio
  const lipsynced = Video({
    prompt: { video: veedVideo, audio: engSpeech },
    model: varg.videoModel(SYNC),
    keepAudio: true,
  });

  return (
    <Render width={1080} height={1920}>
      <Clip duration={engSpeech.duration}>
        {lipsynced}
      </Clip>
    </Render>
  );
};

export default build();
