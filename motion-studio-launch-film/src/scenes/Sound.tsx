import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { ev } from "../config/timeline";

// SOUND.md cue sheet. Every file is synthesized with ffmpeg (original); onsets at 0
// except whoosh, whose peak sits 15 frames in, so it starts 15 frames early.
type Cue = { id: string; file: string; at: number; gain: number };
const cues: Cue[] = [
  { id: "whoosh-in", file: "sfx/whoosh.wav", at: Math.max(0, ev.cardIn[1] - 15), gain: 0.18 },
  { id: "click-search", file: "sfx/click.wav", at: ev.pressSearch, gain: 0.55 },
  ...ev.typing.map((at, i) => ({ id: `key-${i + 1}`, file: "sfx/key.wav", at, gain: 0.4 })),
  { id: "click-row", file: "sfx/click.wav", at: ev.pressRow, gain: 0.55 },
  { id: "reveal-skill", file: "sfx/reveal.wav", at: ev.skillCut, gain: 0.3 },
  { id: "click-copy", file: "sfx/click.wav", at: ev.pressCopy, gain: 0.55 },
  { id: "paste", file: "sfx/key.wav", at: ev.paste[0], gain: 0.5 },
  { id: "enter", file: "sfx/click.wav", at: ev.enter, gain: 0.45 },
  { id: "click-crumb", file: "sfx/click.wav", at: ev.pressCrumb, gain: 0.5 },
  { id: "reveal-grid", file: "sfx/reveal.wav", at: ev.gridCut, gain: 0.35 },
  { id: "whoosh-out", file: "sfx/whoosh.wav", at: ev.cardOut[0] - 15 + 20, gain: 0.25 },
  { id: "resolve", file: "sfx/resolve.wav", at: ev.pillIn[0] + 2, gain: 0.42 },
  { id: "shine", file: "sfx/reveal.wav", at: ev.pillGlare[0] + 4, gain: 0.16 },
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
