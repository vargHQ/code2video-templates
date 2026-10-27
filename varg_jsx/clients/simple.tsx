/** @jsxImportSource vargai */
// Simple Motion-Control Pipeline
//
// Takes a long source video, splits it into <=25s chunks via the gateway,
// and generates a motion-controlled version of each chunk using
// kling-v3-pro-motion-control. The model transfers motion from each
// reference fragment onto a character image. All generated fragments
// are stitched into a single output video.
//
// Pipeline:
//   1. Probe source video duration via gateway
//   2. Slice into <=25s segments via gateway (Rendi ffmpeg)
//   3. For each segment, generate motion-controlled video
//   4. Stitch all generated clips into the final video
//
// Usage: bun run render templates/clients/simple.tsx

import { createVarg } from "vargai/ai";
import { Clip, Probe, Render, Slice, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ──────────────────────────────────────────────────────────────
const SOURCE_VIDEO = "https://uu.varg.ai/1777336060036_p5694tmj.mp4";
const CHARACTER_IMAGE = "https://uu.varg.ai/1777010398902_g2zr0kbp.png";
const CHARACTER_PROMPT =
  "elegant woman in purple tai chi linen outfit performing graceful movement, smooth and fluid motion, studio setting";

// ── Step 1: Probe source video ──────────────────────────────────────────
const info = await Probe({ src: SOURCE_VIDEO });
console.log(`[simple] source video: ${info.duration}s`);

// ── Step 2: Slice into <=15s segments via gateway/Rendi ─────────────────
const sliced = await Slice({ src: SOURCE_VIDEO, every: 15, codec: "reencode" });
const segments = (sliced as any).segments ?? [];
console.log(`[simple] ${segments.length} segments`);

// ── Step 3: Generate motion-controlled video per segment ────────────────
const videos = segments.map((seg: any) =>
  Video({
    prompt: {
      text: CHARACTER_PROMPT,
      images: [CHARACTER_IMAGE],
      video: seg.url as string,
    },
    model: varg.videoModel("kling-v3-pro-motion-control"),
    aspectRatio: "9:16",
  }),
);

// ── Step 4: Stitch all fragments ────────────────────────────────────────
export default (
  <Render width={1080} height={1920}>
    {videos.map((vid: any, i: number) => (
      <Clip key={i} duration="auto">
        {vid}
      </Clip>
    ))}
  </Render>
);
