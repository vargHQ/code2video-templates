# Varg SDK Templates Repository

Public templates and examples for the varg AI video generation SDK.

## Structure

```
hello.tsx              # Hello world — simplest possible template
templates/             # Reusable video templates
  ├── talking-head.tsx        # Lipsync talking head + captions
  ├── slideshow.tsx           # Data-driven array slideshow
  ├── layouts.tsx             # Split, grid, slider, packshot layouts
  ├── product-showcase.tsx    # 4-scene product video
  ├── adventure-showcase.tsx  # Multi-environment showcase (SCENE_INDEX)
  ├── fashion-photoshoot.tsx  # Clothing brand photoshoot
  ├── cinematic-tribute.tsx   # 8-scene montage
  └── VIDEO-PROMPTS.md        # Prompt engineering guide
sdk/                   # Varg SDK (git submodule)
```

## Commands

```bash
# Render a video
bun run render <path-to-file.tsx>

# Open studio for preview
bun run studio <path-to-file.tsx>

# Render with env var override
SCENE_INDEX=1 bun run render templates/adventure-showcase.tsx
```

## IMPORTANT: Always Render in the Background

**Video generation MUST run as a background process, never on the main thread.**

Render jobs take 3-15+ minutes (image generation, video generation, lipsync, ffmpeg composition). Running them synchronously blocks the entire agent — the user cannot interact, ask questions, or request changes while waiting.

### How to run renders in the background

```bash
# Run render in background, redirect output to log file
nohup bun run render hello.tsx > output/render.log 2>&1 &
echo "Render started (PID: $!). Check output/render.log for progress."

# Check if still running
ps -p <PID> > /dev/null && echo "Still rendering..." || echo "Done!"

# Tail the log to check progress
tail -20 output/render.log
```

### Rules for AI agents

1. **Always** spawn `bun run render` as a background process (`&` or subprocess)
2. **Never** `await` or block on a render command — return control to the user immediately
3. **Log output** to a file so progress can be checked later
4. **Report the PID** so the user can monitor or kill the job
5. **Continue working** on other tasks (editing templates, answering questions) while renders run
6. **Check completion** by polling the PID or checking for the output file

### Why this matters

- A single template render costs $1-10+ in API credits and takes 3-15 minutes
- The SDK already parallelizes internally (3 concurrent clips, all layers within a clip in parallel)
- Blocking the main thread wastes the user's time and prevents iteration on prompts/code while waiting

## API — Gateway Only

All templates use `createVarg` from the SDK — a single `VARG_API_KEY` replaces separate provider keys.

```tsx
/** @jsxImportSource vargai */
import { Render, Clip, Image, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

const img = Image({ prompt: "a sunset", model: varg.imageModel("nano-banana-pro") });

export default (
  <Render width={1080} height={1920}>
    <Clip duration={5}>
      <Video prompt={{ text: "clouds moving", images: [img] }} model={varg.videoModel("kling-v2.5")} />
    </Clip>
  </Render>
);
```

### Gateway model methods

| Method | Example |
|--------|---------|
| `varg.imageModel(id)` | `varg.imageModel("nano-banana-pro")`, `varg.imageModel("soul")` |
| `varg.videoModel(id)` | `varg.videoModel("kling-v2.5")`, `varg.videoModel("sync-v2-pro")` |
| `varg.speechModel(id)` | `varg.speechModel("eleven_v3")` |
| `varg.musicModel(id)` | `varg.musicModel("music_v1")` |

### Provider options

Pass provider-specific options using the `varg` namespace (NOT `fal`):

```tsx
// CORRECT
Image({ ..., providerOptions: { varg: { resolution: "2K" } } });
Image({ ..., providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } } });

// WRONG — fal namespace is ignored by gateway
Image({ ..., providerOptions: { fal: { resolution: "2K" } } });
```

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `<Render>` | Root container | `width`, `height`, `fps`, `shortest` |
| `<Clip>` | Timeline segment | `duration`, `transition`, `cutFrom`, `cutTo` |
| `Image()` | AI or static image | `prompt`, `src`, `model`, `zoom`, `aspectRatio` |
| `Video()` | AI or source video | `prompt`, `src`, `model`, `duration`, `keepAudio` |
| `Speech()` | Text-to-speech | `voice`, `model`, `children` (text) |
| `<Music>` | Background music | `prompt`, `model`, `volume`, `loop`, `ducking`, `duration` |
| `<Captions>` | Auto-generated captions | `src`, `style`, `color`, `activeColor` |
| `<Title>` | Text overlay | `position`, `color` |
| `<Split>` | Split-screen layout | `direction` |
| `<Grid>` | Grid layout (NxM) | `columns`, `rows` |
| `<Slider>` | Comparison slider | `direction` |
| `<Swipe>` | Card-style animation | `direction`, `interval` |
| `<Packshot>` | End card with logo + CTA | `background`, `logo`, `title`, `cta`, `blinkCta` |
| `<Overlay>` | Positioned layer | `left`, `top`, `width`, `height` |

## Critical Gotchas

### Define media with function calls, NOT JSX
```tsx
// CORRECT
const img = Image({ prompt: "a cat", model: varg.imageModel("nano-banana-pro") });

// WRONG -- does not work
const img = <Image prompt="a cat" />;
```

### One image per Video prompt
Pass only ONE image in the Video prompt `images` array. Multiple images cause errors.
```tsx
// CORRECT
Video({ prompt: { text: "cat walks", images: [catImage] }, ... })

// WRONG
Video({ prompt: { text: "cat walks", images: [catImage, bgImage] }, ... })
```

### Model duration constraints
| Model | Duration rule |
|-------|--------------|
| `kling-v3`, `kling-v3-standard` | Any integer from 3 to 15 seconds |
| `kling-v2.5` and older | **Only 5 or 10 seconds** -- any other value fails |

### Clip duration should match video duration
```tsx
const vid = Video({ ..., duration: 5 });
<Clip duration={5}>{vid}</Clip>  // correct
<Clip duration={3}>{vid}</Clip>  // mismatch -- timing issues
```

### Always set duration on Music
Without `duration`, ElevenLabs generates ~60s of audio, extending the video. Set it to match total video length:
```tsx
<Music prompt="ambient" volume={0.2} duration={15} />
```

### Trim AI warm-up frames
Generated clips have ~0.3s of static at the start. Trim with `cutFrom`:
```tsx
<Clip duration={2} cutFrom={0.3} cutTo={2.3}>{vid}</Clip>
```

### Prompt format per image model
| Model | Format |
|-------|--------|
| `nano-banana-pro` | Plain string: `prompt: "a sunset"` |
| `nano-banana-pro/edit` | Object: `prompt: { text: "...", images: [refUrl] }` |
| `flux-schnell/pro/dev` | Plain string |
| `soul` (Higgsfield) | Plain string |

## Common Patterns

### Character consistency: ref -> edit -> animate
```tsx
const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// 1. Generate reference
const ref = Image({ prompt: "character description", model: varg.imageModel("nano-banana-pro") });
// 2. Place in scene via /edit
const scene = Image({ prompt: { text: "scene description", images: [ref] }, model: varg.imageModel("nano-banana-pro/edit") });
// 3. Animate
const vid = Video({ prompt: { text: "motion", images: [scene] }, model: varg.videoModel("kling-v2.5") });
```

### Reference chaining for multi-shot consistency
```tsx
const imgA = Image({ prompt: { text: "...", images: [character] }, ... });
const imgB = Image({ prompt: { text: "...", images: [character, imgA] }, ... });
```

### Fast cuts with trimming
```tsx
<Clip cutFrom={0.3} cutTo={2.0}>{video}</Clip>
```

### Slow motion (duration > source length)
```tsx
<Clip cutFrom={0.5} cutTo={2.0} duration={3.0}>{video}</Clip>
```

### Transitions
```tsx
<Clip transition={{ name: "fade", duration: 0.5 }}>{video}</Clip>
// Also: crossfade, wipeleft, cube
```

### Batch parameterization via env vars
```tsx
const SCENE_INDEX = parseInt(process.env.SCENE_INDEX ?? "0", 10);
const CHARACTER = process.env.CHARACTER_URL ?? defaultCharacter;
```

### Lipsync pipeline
```tsx
const voiceover = Speech({ voice: "rachel", model: varg.speechModel("eleven_v3"), children: "Text" });
const character = Video({ prompt: { text: "speaking", images: [img] }, model: varg.videoModel("kling-v2.5") });
const lipsynced = Video({ prompt: { video: character, audio: voiceover }, model: varg.videoModel("sync-v2-pro") });
```

### Gateway defaults
```tsx
await render(<Render>...</Render>, {
  output: "video.mp4",
  defaults: {
    video: varg.videoModel("kling-v3"),
    image: varg.imageModel("nano-banana-pro"),
    speech: varg.speechModel("eleven_turbo_v2"),
    music: varg.musicModel("music_v1"),
  },
});
```

## Asset Management

- **DO NOT** commit video, audio, or image files to git (all gitignored)
- Upload large assets to S3 and reference by URL
- Use `assets.*` from the SDK for built-in reference assets
- Cache is sacred -- same prompts/params hit cache at zero cost. Never clear cache without asking.

## Git Workflow

```bash
# For new templates
git checkout -b template/<template-name>

# For fixes
git checkout -b fix/<description>
```
