# Every prompt of the example film, verbatim

The film "I know how" (47 s, 16:9), made on varg. Each entry: model, what it made, the prompt. Results are on public
storage (`example/assets.json`). Copy the structure, swap the world, the characters and the product.

All files: `https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/<file>`.

## 1. Anchors: character sheets and mood plates

Made with `nano_banana_pro` in the example. **Use `gpt_image_2_5` (top quality) or `nano_banana_2_1` (default)
today**: `nano_banana_pro` is the previous default (see the varg-ai skill, `references/models.md`).

### Agent sheet (`file_8c23ad8bc796.png`), 16:9
```
Character turnaround sheet on a flat neutral mid-grey seamless background: an elegant porcelain android with adult human proportions (1.8 m). Matte warm-white glazed ceramic head, neck and hands with very fine hairline seam lines like a luxury porcelain doll; a calm androgynous sculpted face, straight nose, closed sculpted lips that never open, porcelain eyelids; eyes of dark smoked glass with a tiny ember-orange glint. Smooth bald porcelain skull; at the base of the skull a small socket with a thin black cable and a glowing amber ring collar. Wears a charcoal fine-knit crew-neck sweater, black tailored trousers, black leather shoes. Five panels left to right: front full body, three-quarter full body, profile full body, back full body showing the cable socket, and a large face close-up with eyes open. Photoreal, soft cinematic studio light, 35mm film still, fine grain. No text, letters, numbers, logos or UI.
```

### Operator sheet (`file_40d3f8227027.png`)
```
Character turnaround sheet on a flat neutral mid-grey seamless background: a woman in her mid-forties, the operator. Cropped silver-grey hair, sharp intelligent face, thin gold wire-rim glasses, a one-ear black headset with a small boom mic. Black roll-neck sweater under a worn long dark charcoal wool coat, black trousers, black boots. Calm, dry expression, a hint of a half smile. Five panels left to right: front full body, three-quarter full body, profile full body, back full body, and a large face close-up. Photoreal, soft cinematic studio light, 35mm film still, natural skin texture, fine grain. No text, letters, numbers, logos or UI.
```

### Singer sheet (`file_2d7d3a466be9.png`)
```
Character turnaround sheet on a flat neutral mid-grey seamless background: a singer, a woman in her mid-twenties. Sleek wet-look black bob haircut, pale skin, bold dark red lips, small silver hoop earrings. Glossy cherry-red vinyl trench coat belted at the waist, black turtleneck, black trousers, black chunky boots. Four panels: front full body, three-quarter full body, profile full body, back full body, plus a large face close-up looking into the lens. Photoreal fashion editorial, soft studio light, 35mm film still, fine grain. No text, letters, numbers, logos or UI.
```

Mood plates (loft, white void, street) were also made from text, then **replaced** by geometry-locked plates (2):
text-only plates drew the android sunk into the floor and a doll-sized figure in the void.

## 2. Master plates from the three.js previz (image edit)

First file = a Styled previz render (`?export=1&look=styled`), then the sheets. This keeps camera and layout.

### Loft (`file_a419a436e456.jpg`); files: previz s01 render, agent sheet, operator sheet, loft mood plate
```
Turn the first image (a 3D previz render) into a photoreal cinematic film still. Keep the camera, the framing and the geometry of the first image EXACTLY: the same high wide angle, the console with three CRT monitors at the left in front of the windows, the woman sitting at it with her back to us, the armchair with the seated figure right of centre, the hanging lamp above it, the tall windows across the back wall. Mapping: the dark seated mannequin in the armchair = the porcelain android from the second image (smooth white ceramic bald head, charcoal knit sweater, black trousers), sitting upright in an oxblood leather wingback armchair, eyes closed, a thin black cable running from the back of its head over the chair back and across the concrete floor to the console. The figure at the console = the woman from the third image (cropped silver hair, dark wool coat, headset). Mood, materials and light from the fourth image: a dark industrial loft at night, rain streaming down tall steel-framed windows, city lights outside, raw concrete, the amber CRT glow as the only warm colour, a pool of warm light under the work lamp, deep crushed blacks. 35mm anamorphic film, fine grain. Full-bleed frame. No text, letters, numbers, logos or UI anywhere; CRT screens show only abstract amber glow.
```

### White void (`file_d8bf48a517fc.jpg`); files: previz s08 grey render, agent sheet
```
Turn the first image (a 3D previz render) into a photoreal cinematic film still. Keep the camera, framing, horizon height and the figure's size and position EXACTLY as in the first image. Mapping: the dark standing mannequin = the porcelain android from the second image, an adult of human height (1.8 m), standing calmly, facing the camera: smooth matte white ceramic bald head, charcoal knit sweater, black trousers, black shoes. Remove the small dark dash on the floor. The world: an infinite pure white void, soft shadowless light, no horizon line visible, a faint soft reflection of the figure on the glossy white floor, slightly warm white. Minimal and clean. 35mm film, fine grain. Full-bleed frame. No text, letters, numbers, logos or UI.
```

### Street (`file_dba5e20d9945.jpg`); files: previz s10 render, singer sheet, street mood plate
```
Turn the first image (a 3D previz render) into a photoreal cinematic music video film still. Keep the camera, the low angle, the framing and the figure's position EXACTLY as in the first image. Mapping: the red figure = the singer from the second image (sleek wet black bob, pale skin, dark red lips, glossy cherry-red vinyl trench coat belted at the waist, black boots), standing in the middle of the street, looking straight into the lens. The street: narrow, wet black asphalt with deep puddle reflections, old brick walls on both sides, glowing red and amber neon tubes on the walls (abstract lines, no lettering), heavy rain, steam rising from a grate, saturated red against deep blacks, as in the third image. 35mm anamorphic film, fine grain, shallow depth of field. Full-bleed frame. No text, letters, numbers, logos or UI, no readable signs.
```

## 3. Seedance 2.5 video-to-video runs (one per location)

`example/seedance/requests.json` holds the exact requests (prompt + files + options); `PROMPTS.md` there the
prompts. Route `byteplus:dreamina-seedance-2-5-260628`, 720p, `omni_reference_task_type: "reference"`, audio off.
Grey previz clip = `@video1`; sheets and the location plate = `@image1…`. Billed ≈ 27.75 credits/s.

When BytePlus is down use `fal:bytedance/seedance-2.5/reference-to-video` (≈ 47 credits/s). fal refuses photoreal
face references ("likeness of real people"): send face close-ups to `kling_v4` image-to-video instead.

### s07 retake (run B drew the android's bald head on the operator)
```
@video1 is a grey-box 3D previz of this shot. Copy from @video1 ONLY the camera (framing, lens, camera position and movement) and the blocking (where she sits and how she turns). Do not copy its look: no flat grey shapes, no 3D render style, none of its colours. The grey mannequin is a real human woman, not a robot.
@image1 is the woman's character sheet: a real human woman in her mid-forties with natural skin, cropped silver-grey hair, thin gold wire-rim glasses, a one-ear black headset, black roll-neck and a worn dark charcoal wool coat. She has hair and a human face in every frame.
@image2 is the master shot of the loft: tall rainy steel-framed windows, the console with three amber CRT monitors, raw concrete, night.
Only the woman is in this shot. There is no android, no mannequin and no porcelain or bald head anywhere in the frame.
Light: amber CRT glow on her face from the monitors beside her, dark rainy windows behind.
Look: photoreal live-action cinema, 35mm anamorphic film, fine grain, shallow depth of field, deep crushed blacks, a restrained late-1990s thriller grade.

One continuous shot, 0.0–4.0 s, medium close-up: the woman with silver hair and glasses, seated at the console, swivels from the monitors toward the camera side of the room as if to look at someone off screen, lifts one side of her headset off her ear with her left hand, and gives a small dry half smile. Her mouth stays closed.

Camera: one move, as in @video1. Full-bleed 16:9 frame, no borders, no letterbox. No text, letters, numbers, logos or UI anywhere in the frame. No dialogue, no lip-sync.
```

### s02 typing retake: `kling_v4` image-to-video from a frame of the old shot (no face, no sheet)
```
Close-up of a woman's hands TYPING FAST on this vintage mechanical keyboard: all ten fingers move continuously, keys visibly press down and spring back, quick confident touch-typing with no pause, warm amber monitor glow flickering on the fingers; near the end her right index finger strikes a key hard. Camera nearly static. One continuous shot, no cut, no morph. No text, the keycaps stay blank.
```

## 4. Voices and on-camera dialogue

`eleven_v3` (today's default is `eleven_v4`). Tags in brackets are performance cues, not spoken.

| line | voice | text |
|---|---|---|
| android (inner voice, no lip-sync: its lips never move) | Adam | `[quietly, calm, certain] I know how to make a music video.` |
| operator, on camera | Lily | `[dry, a small smile in the voice] Show me.` |
| operator, on camera | Lily | `[impressed, half a laugh, quiet] What else?` |
| android | Adam | `[quietly, calm, looking straight at you] Just ask.` |

On-camera lines: cut the shot exactly as it plays in the edit (2.5 s), build a 2.5 s audio track with the line at
the right offset (silence + `adelay`), then `sync_v3` with `files: [video, audio]`. The result keeps its audio.

## 5. Score and song

The music model ignores timestamps inside a long prompt. Make separate cues and cut between them.

- Cue 1, tension, 21 s (`eleven_music_v2_5`, instrumental):
  `Instrumental film score cue, 21 seconds, 90 BPM, D minor, cyber-thriller. Dark sparse analog synth pulse, a low heartbeat kick, a held sub drone, faint metallic ticks, tense and intimate; a filtered arpeggio slowly rises, and the last four seconds build with a reverse swell and riser that cuts to silence exactly at the end. No drums groove, no vocals.`
- Cue 2, ending, 26 s (only its last 14 s are used):
  `Instrumental film score cue, 26 seconds, 90 BPM, D minor, stylish cyber-thriller trailer. It starts instantly at full energy with no intro: a huge sub-bass drop, tight breakbeat drums, distorted analog bass and a bright analog lead hook, cinematic and confident. Energy stays high and driving the whole time. It ends with one big final hit on a low piano note plus a warm synth chord that rings out for the last four seconds. No vocals, no fade-in.`
- Song with vocals (`eleven_music_v2_5`; `lyria_3_5` is the skill's pick for songs), 48 s came back, vocals 23.2–31.6 s:
  `Dark cinematic synth-pop song, exactly 120 BPM, A minor, female lead vocal: breathy, confident, close-mic, intimate, in English. Pulsing analog bass, punchy electronic drums with a big kick on every downbeat, glassy synth arpeggio, a bright hook. The vocal starts after one bar and sings these lyrics clearly, one line per two bars: "I read the how-to, line by line, now every cut lands right on time, you said show me, so I did, lights up, rolling, this one's mine." Then repeat the last two lines with a fuller chorus and backing vocals. Modern, stylish, minimal, no long intro.`
- Word times: `whisper-cli -ml 1 -sow` (whisper.cpp, local) or varg `whisper`. The `data-words` attributes in
  `example/edit/index.html` are those times shifted onto the film timeline.

## 6. The music video inside the film (stills first, `gpt_image_2_5`)

Files for every still: the singer sheet + the street plate (+ the agent sheet for the wide).

1. `Music video film still, medium close-up at 50mm, eye level. The singer from the first image (…identity…) stands on the RIGHT third of the frame singing straight into the lens, mouth open on a note, rain on her face and coat. The LEFT half of the frame is a dark wet brick wall of the alley from the second image, softly out of focus, empty, with a thin red neon tube high on it. Red and amber neon rim light, warm sodium practical light, heavy rain, faint steam. Photoreal 35mm anamorphic film, fine grain, shallow depth of field, deep blacks. Full-bleed frame. No text, letters, numbers, logos or UI.`
2. `Music video film still, extreme close-up insert at ground level: a black leather boot steps down into a deep puddle on wet black asphalt, a crown of water splashing up, the hem of a glossy cherry-red vinyl trench coat swinging into frame above it (the singer from the first image). The puddle reflects red and amber neon from the alley of the second image. Heavy rain drops on the water surface, steam drifting. …`
3. `Music video behind-the-scenes film still, wide shot, low angle, locked camera … In the far background at the end of the alley, under a single warm work light, the porcelain android from the second image … stands behind a professional cinema camera on a tripod with a small monitor, operating it, filming toward us. In the soft-focus foreground on the right, the singer … is seen from behind, three-quarter … Exactly two figures. …`
4. `Music video film still, close-up at 85mm, slightly handheld feel. The singer … on the LEFT third of the frame, three-quarter to camera, singing with intensity, eyes to the lens, rain running over her face. The RIGHT two thirds are deep black night with out-of-focus red and amber neon bokeh … empty space. …`

Animation (4 s each, one shot per 2 s bar at 120 BPM; every prompt ends with "One continuous shot: no cut, no
dissolve, no morph. No text, letters or logos."):

- Insert and wide: `fal:bytedance/seedance-2.5/reference-to-video` with the still as `@image1`
  (`On the first beat the black boot lands in the puddle and water splashes up, then the camera tilts up slowly along the glossy cherry-red vinyl coat as she walks on.` / `Locked wide camera. At the end of the alley the porcelain android operates the cinema camera on the tripod, one hand on the lens, filming the singer; … Exactly two figures; nothing appears, rises or changes shape.`).
- Singing close-ups: `fal:fal-ai/kling-video/v4/image-to-video` (fal Seedance refused the faces), then `sync_v3`
  with the song slice of exactly the seconds the shot plays (`ffmpeg -ss 23.2 -t 2` / `-ss 29.2 -t 3`).

## 7. What was dropped

The first cut grew the street out of the white floor (walls rising, neon switching on) inside one Seedance run.
It read as AI slop. Never morph a world inside a clip; hard-cut on a downbeat instead.
