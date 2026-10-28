# Shared motion system

Derive animated values from `useCurrentFrame()`. A chosen frame must reproduce the same position, visibility, scale, and product state on every render. Use clamped interpolation, a frame-based spring, and seeded variation where needed.

Keep frame timing and layout constants in one shared configuration. For each track, name the object, global start, end-exclusive frame, start value, destination, curve, and hold behavior.

## Frames and endpoints

Inside a Remotion `Sequence`, `useCurrentFrame()` is local to that sequence. Convert it with the recorded sequence start when evaluating a global event. Avoid subtracting the sequence start twice.

For a track that must reach its destination on the last displayed frame of `[start,endExclusive)`, use `last = endExclusive - 1` and clamp:

```ts
const progress = interpolate(
  globalFrame,
  [start, last],
  [0, 1],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);
```

Require `last > start`; implement a one-frame state change directly. Use ordinary state visibility conditions for instant product changes.

## Movement direction

Choose a clear approach and stable landing for the main object. Tune spring damping and duration against the shot. Small overshoot can suit a container; keep body text readable and stable once it lands.

Animate cursor paths through recorded waypoints that avoid headline and result bounds. Bind the visible press, button response, and sound event to the same global frame. Use supplied product states for the actual result.

Give transitions an owner: a card becomes the next composition, a selected region becomes the next focus, or a line resolves into the next diagram. Write the incoming and outgoing transforms so neighboring scenes match.

Keep wall-clock timers, autonomous CSS transitions, `Math.random()`, and mutable carried animation state out of render logic. Express lighting and any noise as functions of the frame with fixed seeds.

Inspect the landing, the brightest effect, a fast-moving frame, and both sides of an edited boundary. Apply blur only to the part of a move that benefits from it; let the settled reading hold remain sharp.

## Reusable track helpers

Keep helpers small and frame-addressable. Example for a deliberate move with an exact landing frame:

```ts
import {Easing, interpolate} from 'remotion';

export const track = (f: number, start: number, last: number,
  from: number, to: number) => interpolate(f,
  [start, last], [from, to], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
```

Use it only when `last > start`; handle instantaneous changes separately. For springs, read the current `spring()` API, choose fps-aware damping/stiffness/mass and a duration suitable for the scene. Clamp or replace the final portion with an explicit settled state when an exact handoff is required. Tune by observing the main object's landing rather than applying the same curve to every layer.

For a seamless decorative cycle of `N` frames, derive phase as `2 * Math.PI * (frame % N) / N`. Evaluate poses from that phase so frame N matches frame 0 by construction. Small sinusoidal sway and a cosine-based hop can suit a pixel mascot. Leave adequate clearance for its transformed bounds. Keep decorative motion subordinate to the main action and pause unnecessary motion during dense reading moments.

Revision recipe: identify the object and global frame, state the visible problem, adjust one responsible track or layout constant, and preserve all other shot decisions. Render the affected interval, inspect both boundaries, then export the full composition.

## Official implementation resources

- [Frame-driven animation](https://www.remotion.dev/docs/animating-properties)
- [Springs](https://www.remotion.dev/docs/spring)
