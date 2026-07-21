/** @jsxImportSource vargai */
// Formula Care — Full Video (ep2 + ep3 + ep4 + ep5 in one render call)
//
// Combines all four episodes into a single <Render> so the whole video
// (~140-150s) is produced in one pass: one editly composition, one captions
// burn-in, one output file.
//
// Prompts stay in the episode files (single source of truth → cache hits).
// Each episode exports:
//   - clips:  array of <Clip> elements (visual timeline + per-clip captions)
//   - musicProps: Music config (prompt + volume + duration) — WITHOUT `start`
//   - duration: total clip duration of the episode (seconds)
//
// This file imports those, computes cumulative Music `start` offsets, and
// wraps everything under one <Render>. Music `start` is supported by the SDK
// (MusicProps.start → AudioTrack.start in render.ts).
//
// Usage:
//   nohup bun run render full.tsx \
//     > output/formula-care/full/render.log 2>&1 &
//
// Cost: ~$30-35 — all images cached ($0) + ~140s kling-v3 native audio +
//   4 music tracks + ep4 speech. One render call, one output mp4.

import { Music, Render } from "vargai/react";

import * as ep2 from "./ep2";
import * as ep3 from "./ep3";
import * as ep4 from "./ep4";
import * as ep5 from "./ep5";

// ── Cumulative Music start offsets ────────────────────────────────────────
// Each episode's music begins at the timeline position where that episode's
// clips start. Durations are known at module load (ep2/ep3 hardcoded from
// measured trims; ep4 from resolved Speech durations; ep5 from resolved
// speechRange timings).
const ep2Start = 0;
const ep3Start = ep2Start + ep2.duration;
const ep4Start = ep3Start + ep3.duration;
const ep5Start = ep4Start + ep4.duration;

const totalDuration = ep5Start + ep5.duration;

console.log(
  `formula-care-full: ep2@${ep2Start.toFixed(2)}s (${ep2.duration.toFixed(2)}s), ` +
    `ep3@${ep3Start.toFixed(2)}s (${ep3.duration.toFixed(2)}s), ` +
    `ep4@${ep4Start.toFixed(2)}s (${ep4.duration.toFixed(2)}s), ` +
    `ep5@${ep5Start.toFixed(2)}s (${ep5.duration.toFixed(2)}s), ` +
    `total ${totalDuration.toFixed(2)}s`,
);

// ── Music tracks with cumulative start offsets ────────────────────────────
const musicTracks = [
  <Music {...ep2.musicProps} start={ep2Start} />,
  <Music {...ep3.musicProps} start={ep3Start} />,
  <Music {...ep4.musicProps} start={ep4Start} />,
  <Music {...ep5.musicProps} start={ep5Start} />,
];

export default (
  <Render width={1080} height={1920} fps={30}>
    {musicTracks}

    {/* Episode 2: Gym Ad — squats + "you do not need to spend hours..." */}
    {ep2.clips}

    {/* Episode 3: "The Bet" — mirror selfie before/after, 28 days */}
    {ep3.clips}

    {/* Episode 4: "Morning Stiffness" — misty porch tai chi + VO */}
    {ep4.clips}

    {/* Episode 5: "No Excuses" — forest walk dialogue, 12 clips */}
    {ep5.clips}
  </Render>
);
