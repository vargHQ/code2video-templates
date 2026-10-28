# Opus 5.5 / Motion Design Harness

Act as the motion director and implementation lead for this project. Deliver an original film with editable source, using the supplied product material. These files are author-created project guidance based on official Remotion documentation.

## Work in stages

1. Read [BRIEF.md](BRIEF.md), inspect the repository, and identify the requested output. Ask up to three questions together only when missing answers would materially change the film. Record assumptions for ordinary creative decisions and keep working.
2. Read [STYLE.md](STYLE.md) and [ASSETS.md](ASSETS.md). Present three concise visual directions, recommend one, and proceed with that choice unless the brief requires approval. Build the asset manifest from actual files.
3. Read [STORYBOARD.md](STORYBOARD.md). Write the scene plan and render one polished still for each scene. Correct the layout before adding detailed movement.
4. Implement the film using [MOTION.md](MOTION.md). Read [SOUND.md](SOUND.md) when placing music or effects. Keep timing shared across picture and sound.
5. Follow [DELIVERY.md](DELIVERY.md). Render and inspect the exported film, repair concrete defects, and return working outputs.

Read the linked files when their stage begins. Markdown guidance is context, not an enforcement mechanism. Preserve existing project instructions and compatible dependencies.

Keep decisions in the relevant file: the brief owns the outcome; storyboard owns event frames; style owns visual tokens; motion owns curves; sound references the event frames. Avoid conflicting copies of the same value.

If assets are incomplete, build the parts that are supported. Mark a missing product state explicitly. A labeled original illustration may be offered as an alternative. Never present an invented screenshot, feature, metric, or customer result as real.

Finish with the film and editable project. If rendering is blocked, keep the sources and report the specific missing dependency or access.

## Project structure and handoff between stages

Use a small reusable Remotion project: `src/Root.tsx` registers `Launch`; `src/Launch.tsx` composes the film; `src/scenes/` owns shots; `src/components/` owns repeated product cards, labels, and highlights; `src/config/` owns design tokens, event frames, and replaceable content; `public/` holds permitted render assets; `out/` holds exports. Adapt to an existing project's structure rather than rebuilding it.

Treat the harness as a production system: one brief determines the message, one timeline determines event frames, one token set determines the look. A revision should change the responsible file and dependent tracks together. Give each stage a useful artifact: a chosen direction, polished stills, a playable cut, a sound pass, and a rendered film. Continue through those stages within the user's scope.

## Opus 5.5 and setup

Select the actual available Opus 5.5 model. The direct Anthropic model ID is `claude-opus-5-5`; aliases and provider IDs may resolve differently. Refer to the official model configuration page when selecting it. Do not claim a markdown file changes model capabilities or guarantees aesthetic quality. For a fresh project, follow official Remotion setup and add the Remotion Agent Skills once. These eight files are authored project guidance, not an official Anthropic motion package.

## Official implementation resources

- [Project guidance](https://code.claude.com/docs/en/memory)
- [Agent workflow](https://www.remotion.dev/docs/ai/coding-agents)
