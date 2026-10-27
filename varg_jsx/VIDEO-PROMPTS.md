# Video Prompt Guide

Ready-to-use prompting tips for AI video generation with the varg SDK.

## Model Comparison

| Model | Best For | Cost | Max Duration |
|-------|----------|------|--------------|
| **Kling 2.5 / 3.0** | Multi-shot, dialogue, character consistency | $$$ | 10-15s |
| **MiniMax/Hailuo** | Rack focus, expressions, stylized | $$ | 6s |
| **Wan 2.5** | Camera movements, transformations | $ | 5s |
| **Hunyuan** | Realistic scenes, long videos | Free | 16s |

## Prompt Structure

### 6 Essential Components

1. **Subject** (who/what) -- never skip
2. **Action** (what they're doing) -- makes it dynamic
3. **Camera** (how we see it) -- defines the shot
4. **Lighting** (photorealistic keywords) -- prevents cartoon look
5. **Scene** (where) -- can be simplified
6. **Style** (the feel) -- can be minimal

### Priority Order (when short on space)

Put the most important information first. Models pay more attention to the beginning of your prompt.

## Camera Movement Vocabulary

```
dolly push in     -- camera moves toward subject
dolly pull back   -- camera moves away from subject
orbit / arc       -- camera circles around subject
crane up / down   -- camera rises or lowers vertically
whip-pan          -- fast horizontal camera move
rack focus        -- shift focus between foreground and background
handheld          -- subtle natural camera shake
static shot       -- locked-off camera, no movement
tracking shot     -- camera follows subject movement
crash zoom        -- fast dramatic zoom in
tilt up / down    -- camera tilts on vertical axis
pan left / right  -- camera rotates on horizontal axis
```

## Photorealism Keywords

Add these to avoid cartoonish output:

```
photorealistic, hyper-detailed, shot on Arri Alexa,
8k resolution, cinematic movie style, natural lighting
```

## Best Practices

- One action per generation -- don't ask for multiple complex movements
- Describe motion explicitly (both subject AND camera)
- Use specific camera terminology (not "cool camera angle")
- Name real light sources ("soft key light from left" not "dramatic lighting")
- Generate 3-5 variations and pick the best
- Copy-paste character descriptions exactly across shots for consistency

## Common Pitfalls

- Essay-length prompts (keep it focused)
- Multiple conflicting actions in one generation
- No camera direction at all
- Generic adjectives ("nice", "lovely", "beautiful")
- Expecting perfection from a single generation

## Aspect Ratios

| Format | Ratio | Resolution | Use Case |
|--------|-------|------------|----------|
| Vertical | 9:16 | 1080x1920 | TikTok, Reels, Shorts |
| Horizontal | 16:9 | 1920x1080 | YouTube, presentations |
| Square | 1:1 | 1080x1080 | Instagram feed |

## Character Consistency

For consistent characters across multiple shots:

1. Generate a base character image first
2. Pass it as a reference image to subsequent generations
3. Use explicit consistency instructions in your prompt:
   ```
   Use the provided character reference. Maximum consistency
   with facial features, body proportions, skin tone, and identity.
   ```
4. Chain references: pass the previous shot as additional reference
   to maintain outfit/environment consistency
