import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { ev } from "../config/timeline";

// SOUND.md cue sheet. Every file is synthesized with ffmpeg (original); onsets at 0
// except whoosh, whose peak sits 15 frames in, so it starts 15 frames early.
type Cue = { id: string; file: string; at: number; gain: number };
const cues: Cue[] = [
  { id: "whoosh-in", file: "sfx/whoosh.wav", at: ev.cardIn[0] - 15 + 18, gain: 0.18 },
  { id: "click-search", file: "sfx/click.wav", at: ev.pressSearch, gain: 0.55 },
  ...ev.typing.map((at, i) => ({ id: `key-${i + 1}`, file: "sfx/key.wav", at, gain: 0.4 })),
  { id: "click-row", file: "sfx/click.wav", at: ev.pressRow, gain: 0.55 },
  { id: "reveal-guide", file: "sfx/reveal.wav", at: ev.guideCut, gain: 0.35 },
  { id: "whoosh-out", file: "sfx/whoosh.wav", at: ev.cardOut[0] - 15 + 20, gain: 0.25 },
  { id: "resolve", file: "sfx/resolve.wav", at: ev.logoIn[0] + 12, gain: 0.4 },
];

export const Sound: React.FC = () => (
  <>
    <Audio src={staticFile("sfx/pad.wav")} volume={0.32} />
    {cues.map((c) => (
      <Sequence key={c.id} from={c.at} durationInFrames={210} layout="none">
        <Audio src={staticFile(c.file)} volume={c.gain} />
      </Sequence>
    ))}
  </>
);
