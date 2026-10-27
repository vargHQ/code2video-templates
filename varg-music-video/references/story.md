# Story and storyboard

## Story in five moves (fits 30 s to 3 min)

| move | where in the song | what it did in the reference video |
|---|---|---|
| Hook (≤ 2 s) | first bar | extreme close-up of the hero, an impact on beat 2 |
| Problem | verse | everything breaks: providers die, keys expire, 50 tabs, a giant monster "503" |
| Dream / turn | pre-chorus | he closes his eyes and dreams of "all the models" walking a runway |
| Payoff | drop / chorus | the agent orb ignites, one call, the squadron attacks together |
| Climax + callback | bridge / last chorus | into the monster's mouth, sax solo, 2001-style stargate, new worlds, then a calm cockpit, a wink, a Star Child shot |

For a longer arc use the Hero's Journey (`varg-previz/references/story-structure.md`). Keep recurring markers: the
same crack in the canopy, the orange orb, colour = side (red enemy, brand orange ours).

## Lyrics → pictures

- Every line gets a literal picture plus a graphic: "How do I call Seedance?" → his fist hits a console button
  that reads SEEDANCE and fails with ✕ 503. The model draws the action, HyperFrames draws the words.
- The brand names in the lyrics appear on screen as logos + current model names (pills, tags over characters).
- Name-checked things that are abstract (an API, a router) become objects: a router ring of logos, provider lanes.

## Storyboard (`storyboard.json`)

```json
{ "title": "…", "duration": 99.02, "bpm": 133.8, "aspect": "9:16", "song": "assets/bgm.mp3",
  "shots": [ { "id": "v04", "start": 5.381, "end": 7.175, "scene": "A_cockpit_red",
    "line": "How do I call Seedance?", "picture": "ECU gloved fist hits a console button three times on the beats",
    "action": "text for the video model, one action, absolute times", "camera": "ECU, low, static",
    "overlay": "SEEDANCE plate, ✕ 503 on the third hit", "source": "gen | reuse | code" } ] }
```

- `scene` = location + light state; shots of one scene are generated together even if they are not adjacent.
- `source: reuse` for clips from an earlier version (free), `code` for shots made only in HyperFrames.
- Keep `brief.md` (director's words, dated) and a short `treatment.md` (logline, the five moves with times, colour
  script, references) next to it, and update all three in one pass after every note.
