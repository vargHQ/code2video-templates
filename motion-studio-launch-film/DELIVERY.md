# Render and handoff

Use the installed project's compatible Remotion version and current official guidance. Create an `out/` directory. For the default `Launch` composition:

```bash
npx remotion still Launch out/opening.png --frame=96
npx remotion still Launch out/action.png --frame=300
npx remotion still Launch out/result.png --frame=540
npx remotion still Launch out/closing.png --frame=1020
npx remotion render Launch out/final.mp4 --codec=h264
npx remotion still Launch out/cover.png --frame=540
```

Choose a different cover frame if the strongest approved moment lands elsewhere. Use a PNG contact sheet of the scene stills to communicate the visual sequence.

## Review the exported file

Confirm dimensions 1920×1080, frame rate 60, and duration 20 seconds for the default brief. Decode the exported video, inspect the scene boundaries, then watch it at normal speed. Check that the headline, real product action, visible result, and closing action read in that order.

Verify loaded fonts, meaningful crop bounds, cursor clearance, sharp reading holds, and picture/sound alignment. A source preview is insufficient evidence that the exported file is correct.

For a scoped correction, write: global frame, observed defect, requested change, and preserved properties. Render only the affected interval first. CLI frame ranges are inclusive: `--frames=270-389` exports 120 frames, or 2 seconds at 60 fps. After the correction passes visual review, render the full film.

Deliver one requested main canvas first. Additional 16:9, 1:1, or 9:16 versions need layouts that preserve the focal point and readable text in their own canvas. Render them when the brief requests them.

## Return useful files

- `out/final.mp4`, the approved main film.
- `out/cover.png`, selected from an actual frame.
- `out/contact-sheet.png`, a compact view of the scenes.
- Editable source, dependency lockfile, the updated brief and storyboard, and permitted assets.
- Exact preview and render commands, plus any remaining missing assets or untested steps.

Separate an observed successful render from proposed behavior. If the environment blocks rendering, preserve the project and state the specific blocker; do not claim an MP4 exists.

## Make the next film cheaper to create

Return a compact runbook containing prerequisites, dependency installation command, preview command, composition ID, final render command, and a list of replaceable config fields. Keep the lockfile so the next user can reproduce the compatible package set. Include a manifest of required fonts and any external assets that cannot be redistributed.

Reframe a requested portrait version by changing layout rules: resize the product panel, move the headline, and preserve the demonstrated control and result. Do not simply crop the landscape master. Keep the event timeline shared where possible while allowing different reading holds when the canvas needs them.

Name a scoped revision concretely, for example: "At global frame 360 the result label collides with the panel edge; move it 24px inward, retain its font, timing, and color." Deliver observed output metadata and any actual limitation. Keep proposed capabilities separate from what was rendered in this session.

## Official implementation resources

- [Render CLI](https://www.remotion.dev/docs/cli/render)
- [Still CLI](https://www.remotion.dev/docs/cli/still)
