# Song map: the grid everything sits on

## What to measure

`songmap.json` (written by `scripts/songmap.py`, hand-edited after):

```json
{ "bpm": 133.8, "duration": 99.02, "master": "assets/bgm.mp3",
  "beats": [0.449, 0.897, ...], "downbeats": [1.794, 3.588, ...],
  "sections": [{"name": "verse", "start": 3.588, "end": 23.318}, {"name": "chorus", "start": 31.708, "end": 50.55}],
  "drops": [32.613],
  "words": [{"w": "Provider", "line": 0, "start": 3.209, "end": 3.748}, ...],
  "lines": [{"i": 0, "text": "Provider died on me again", "start": 3.209, "end": 5.543}, ...] }
```

- **Beats/downbeats**: `songmap.py` fits one tempo (best phase per 8 s window, since AI songs can shift phase between
  sections), then `beat_track` follows it tightly; the 4/4 bar phase is the one with the most onset energy. If the
  generator reports the BPM, pass `--bpm` (librosa alone was 3.5 % off on the reference track). At 133.8 BPM a beat is 0.448 s
  and a bar is 1.794 s; most shots were 1 bar, epic moments 2 bars, inserts half a bar.
- **Sections and drops**: by ear or from the energy curve; write them in by hand. The drop is where the story turns.
- **Words**: transcribe with faster-whisper `word_timestamps=True`, `initial_prompt` = the lyrics (it fixes
  spelling). Whisper often folds an instrumental intro into the first word: check the first word of every line
  against the vocal stem (`demucs` → `vocals.wav`, onset detect) and fix by hand. Keep a short OVERRIDES table in the
  script for director notes like "the word 'into' is long".
- **Trim**: if the video uses a window of a longer track, store `source.window` and shift all times to 0.

## Rules

- Cuts on downbeats; flashes, punches and SFX on beats; lyric words on word starts.
- Shot times in the storyboard are copied from the grid, never typed by feel.
- Frame-exact: a shot of `start..end` gets `round(end*fps) - round(start*fps)` frames, so rounding never drifts.
- If the edit must breathe (a hero beat before a reveal), move a whole beat from one shot to its neighbour and shift
  every graphic that keyed off the old boundary.
