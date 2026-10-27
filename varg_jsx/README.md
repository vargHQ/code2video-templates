# varg JSX templates

AI-footage templates for the [varg SDK](https://github.com/vargHQ/sdk). Each `.tsx` file is one video.
The SDK generates its images, clips, voice and music through the varg API (Seedance, Kling, Veo, nano-banana,
ElevenLabs and more) and stitches them into an MP4. Generations cost varg credits. Same prompts and params hit the
cache for free.

For templates that render locally from code with no credits, see the [root README](../README.md).

Folders: `ads/` (12 Seedance ad formats, a product-card swap), `HQ/` (production pieces), `characters/`,
`omega3-jesus-devil/` (a 15-minute two-character episode). Prompt guides: `VIDEO-PROMPTS.md`,
`SEEDANCE-BIO-STYLE-GUIDE.md`. Model ids change monthly; the current list is at https://varg.ai/models/llms.txt.

## Quick start

```bash
# Clone with SDK submodule
git clone --recursive https://github.com/vargHQ/templates.git
cd templates

# Install dependencies
bun install

# Copy env template and add your API key
cp .env.example .env
# Edit .env and set VARG_API_KEY

# Render your first video
bun run render varg_jsx/hello.tsx
```

### API key

All templates use the varg API (`api.varg.ai`) -- one key covers all AI providers (fal, elevenlabs, higgsfield, heygen, piapi, and more).

```bash
# .env
VARG_API_KEY=varg_xxx
```

Get it at [varg.ai](https://varg.ai).

## Templates

The original SDK templates: one `.tsx` per video, generated through the varg API with `bun run render varg_jsx/<file>.tsx`. Generations cost credits.

### `varg_jsx/hello.tsx` -- Hello World

The simplest possible template. Generates a character image and animates it waving hello.

```bash
bun run render varg_jsx/hello.tsx
```

---

### `varg_jsx/talking-head.tsx` -- Talking Head with Lipsync

Full production pipeline: character generation, video animation, voiceover, lipsync, and auto-generated TikTok-style captions with background music.

```bash
bun run render varg_jsx/talking-head.tsx
```

**Demonstrates:** Character gen via `soul`, ElevenLabs TTS, lipsync via `sync-v2-pro`, `<Captions>`, `<Music>`

---

### `varg_jsx/slideshow.tsx` -- Data-Driven Slideshow

Array-based scene generation. Define items in a list, generate images for each, animate and stitch into a video with music.

```bash
bun run render varg_jsx/slideshow.tsx
```

**Demonstrates:** `Array.map()` pattern, data-driven clips, `<Music>`

---

### `varg_jsx/layouts.tsx` -- Layout Components

Four layout patterns in one template: split-screen (before/after), 2x2 video grid, comparison slider, and packshot end card.

```bash
bun run render varg_jsx/layouts.tsx
```

**Demonstrates:** `<Split>`, `<Grid>`, `<Slider>`, `<Packshot>`, `<Title>`

---

### `varg_jsx/product-showcase.tsx` -- Product Video

4-scene product advertising video following the classic formula: hero shot, features overlay, lifestyle usage, close-up result, and branded packshot.

```bash
bun run render varg_jsx/product-showcase.tsx
```

**Demonstrates:** Multi-scene composition, `<Title>` for features, `<Packshot>`, voiceover with `<Captions>`, fade transitions, character + product dual-reference prompting

---

### `varg_jsx/adventure-showcase.tsx` -- Multi-Environment Showcase

A single template that renders different environments (skydiving, arctic expedition, desert journey) based on the `SCENE_INDEX` env var. Each environment has 3 shots with image reference chaining, fast cuts, and a packshot.

```bash
# Render skydiving (default)
bun run render varg_jsx/adventure-showcase.tsx

# Render arctic expedition
SCENE_INDEX=1 bun run render varg_jsx/adventure-showcase.tsx

# Render desert journey
SCENE_INDEX=2 bun run render varg_jsx/adventure-showcase.tsx
```

**Demonstrates:** `SCENE_INDEX` env var, reference chaining (A -> B -> C), `cutFrom`/`cutTo` trimming, slow-motion via duration override, `<Packshot>`

---

### `varg_jsx/fashion-photoshoot.tsx` -- Fashion Catalog

Generates studio and editorial photos of a character wearing a product. Uses dual-reference prompting for character + garment consistency. Supports batch generation via env vars.

```bash
# Default (generates character + product inline)
bun run render varg_jsx/fashion-photoshoot.tsx

# Batch mode: override character and product
CHARACTER_URL="https://..." PRODUCT_URL="https://..." bun run render varg_jsx/fashion-photoshoot.tsx
```

**Demonstrates:** Dual-reference prompting (character fidelity + garment fidelity), studio vs editorial photography, env var parameterization for batch runs, 2K resolution, `cutFrom`/`cutTo`

---

### `varg_jsx/cinematic-tribute.tsx` -- Cinematic Montage

Production-level 8-scene character montage with voiceover, music with ducking, captions, and non-sequential clip ordering.

```bash
bun run render varg_jsx/cinematic-tribute.tsx
```

**Demonstrates:** 8-scene reference-based character consistency, `cutFrom`/`cutTo` warm-up trimming, fade transitions, `ducking`, `loop`, non-sequential editorial pacing

---

## Available Models

### Video

| Model | ID | Best for |
|-------|----|----------|
| Kling V3 | `kling-v3` | Highest quality |
| Kling V3 Standard | `kling-v3-standard` | Quality/cost balance |
| Kling V2.5 | `kling-v2.5` | Reliable general purpose |
| Wan 2.5 | `wan-2.5` | Characters, anime |
| MiniMax | `minimax` | Alternative |
| Sync V2 Pro | `sync-v2-pro` | Lipsync |

### Image

| Model | ID | Best for |
|-------|----|----------|
| Nano Banana Pro | `nano-banana-pro` | Versatile generation |
| Nano Banana Edit | `nano-banana-pro/edit` | Image editing, character consistency |
| Flux Pro | `flux-pro` | High quality |
| Flux Schnell | `flux-schnell` | Fast, cheap |
| Soul (Higgsfield) | `soul` | Character consistency |

### Speech

| Model | ID |
|-------|----|
| V3 | `eleven_v3` |
| Multilingual V2 | `eleven_multilingual_v2` |
| Turbo V2 | `eleven_turbo_v2` |

### Music

| Model | ID |
|-------|----|
| Music V1 | `music_v1` |

## Best Practices

### Model duration constraints

| Model | Duration rule |
|-------|--------------|
| `kling-v3`, `kling-v3-standard` | Any integer from 3 to 15 seconds |
| `kling-v2.5` and older | **Only 5 or 10 seconds** -- any other value fails |

### One image per Video prompt

Pass only **one** image in the Video prompt `images` array. Multiple images cause errors with video models.

```tsx
// Correct
Video({ prompt: { text: "cat walks", images: [catImage] }, ... })

// Wrong -- will error
Video({ prompt: { text: "cat walks", images: [catImage, bgImage] }, ... })
```

### Define media with function calls, not JSX

Media elements (`Image`, `Video`, `Speech`, `Music`) must be defined as variables using function calls:

```tsx
// Correct
const img = Image({ prompt: "a cat", model: varg.imageModel("nano-banana-pro") });

// Wrong
const img = <Image prompt="a cat" />;
```

### Trim AI warm-up frames

Generated video clips often have ~0.3s of static "warm-up" at the start. Use `cutFrom` to trim:

```tsx
<Clip duration={2} cutFrom={0.3} cutTo={2.3}>{vid}</Clip>
```

### Audio-first workflow

Always generate audio (speech/music) before video. Audio duration is unpredictable. Use `<Render shortest>` to auto-trim video to match voiceover length:

```tsx
<Render width={1080} height={1920} shortest>
  <Music prompt="ambient" volume={0.2} duration={15} />
  <Clip duration={15}>{vid}</Clip>
  <Captions src={voiceover} style="tiktok" />
</Render>
```

### Character consistency: ref -> edit -> animate

1. **Reference image** -- generate a character hero shot
2. **Scene images via `/edit`** -- use `nano-banana-pro/edit` with `images: [ref]`
3. **Animate** -- pass each scene image to `Video()`

Never generate scene images from scratch -- always edit from the reference.

### Cache-aware iteration

When modifying a render, keep unchanged prompts **exactly** the same (same text, same model, same params). Unchanged assets hit the cache at zero cost.

### Provider options

Pass provider-specific options using the `varg` namespace:

```tsx
// Resolution override (passed to fal)
Image({ ..., providerOptions: { varg: { resolution: "2K" } } });

// Higgsfield style ID
Image({ ..., model: varg.imageModel("soul"), providerOptions: { varg: { style: "1cb4b936-77bf-4f9a-9039-f3d349a4cdbe" } } });
```

## All Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `<Render>` | Root container | `width`, `height`, `fps`, `shortest` |
| `<Clip>` | Time segment | `duration`, `transition`, `cutFrom`, `cutTo` |
| `Image()` | AI or static image | `prompt`, `src`, `model`, `zoom`, `aspectRatio` |
| `Video()` | AI or source video | `prompt`, `src`, `model`, `duration`, `keepAudio` |
| `Speech()` | Text-to-speech | `voice`, `model`, `children` (text) |
| `<Music>` | Background music | `prompt`, `src`, `model`, `volume`, `loop`, `ducking` |
| `<Title>` | Text overlay | `position`, `color` |
| `<Captions>` | Auto-generated subs | `src`, `style`, `color`, `activeColor` |
| `<Packshot>` | End card / CTA | `background`, `logo`, `title`, `cta`, `blinkCta` |
| `<Split>` | Side-by-side layout | `direction` |
| `<Grid>` | NxM grid | `columns`, `rows` |
| `<Slider>` | Before/after reveal | `direction` |
| `<Swipe>` | Card-style animation | `direction`, `interval` |
| `<Overlay>` | Positioned layer | `left`, `top`, `width`, `height` |

### Transitions

```tsx
<Clip transition={{ name: "fade", duration: 0.5 }}>
<Clip transition={{ name: "crossfade", duration: 0.5 }}>
<Clip transition={{ name: "wipeleft", duration: 0.5 }}>
<Clip transition={{ name: "cube", duration: 0.8 }}>
```

### Zoom Effects

```tsx
<Image prompt="landscape" zoom="in" />     // Ken Burns zoom in
<Image prompt="landscape" zoom="out" />    // Zoom out
<Image prompt="landscape" zoom="left" />   // Pan left
<Image prompt="landscape" zoom="right" />  // Pan right
```

### Caption Styles

```tsx
<Captions src={voiceover} style="tiktok" />      // Word-by-word highlight
<Captions src={voiceover} style="karaoke" />     // Fill left-to-right
<Captions src={voiceover} style="bounce" />      // Words bounce in
<Captions src={voiceover} style="typewriter" />  // Typing effect
```

### Aspect Ratios

| Ratio | Resolution | Platform |
|-------|------------|----------|
| `9:16` | 1080x1920 | TikTok, Reels, Shorts |
| `16:9` | 1920x1080 | YouTube, Twitter |
| `1:1` | 1080x1080 | Instagram Feed |
