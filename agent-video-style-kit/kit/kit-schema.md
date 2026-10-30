# Agent Video Style Kit schema (v1)

This standalone Cut30 kit is separate from the editor plugin's schema. `kit.json` is the source of truth; `style-kit.html` embeds the same JSON for use as a local file.

## Top level

- `schemaVersion`: `1`.
- `kitVersion`: semantic version, bumped when settings change.
- `name`, `edition`, `creator`: kit identity and creator name. Edition is `lead-mag`.
- `publisher`: Cut30 attribution and website. Attribution is page chrome, not video artwork.
- `font`: family, fallback CSS stack, font source, license, and installation note. Font sizes are format-specific.
- `units`: interpretation of dimensions and line height.
- `customization`: guidance and synchronization workflow.
- `formats`: separate `9:16` and `16:9` objects, described below.
- `review`: final render checks.
- `changelog`: dated version/change records.

## Per format

- `label`: Vertical or Landscape.
- `canvas`: `[width, height]`, respectively `[1080, 1920]` and `[1920, 1080]`.
- `safeZones`: named exclusion rectangles with `x`, `y`, `width`, `height`. These are conservative design defaults, not universal platform requirements.
- `safeZoneNote`: the reasoning and limitations of those defaults.
- `titles`, `captions`: the corresponding element specification.

## Title and caption specifications

All coordinates and sizes are pixels on that format's canvas. Scale coordinates, font sizes, padding, radii, and outline widths together if your export resolution changes. Do not stretch the portrait settings to make landscape.

- `fontSize`, `fontWeight`, `lineHeight`, `color`: typography; line height is a multiplier.
- `anchor`: `top`. `placement.y` is the outer text box's top, including title-bar padding. It is not the baseline or the top of visible letter shapes.
- `placement`: `x`, `y`, `width` for the text container. Text is horizontally centered and grows downward.
- `maxLines`: shorten text that exceeds this limit. The preview inputs do not automatically rewrite or truncate your copy; inspect wrapping yourself.
- `example`: placeholder text for the default preview.
- `rules`: human- and agent-readable layout requirements.
- Titles additionally define `background`, `padding` (all sides), and `radius`. The preview bar wraps the text inside the container, with border-box sizing.
- Captions additionally define `outlineColor`, `outlineWidth`, `wordsPerChunk: [minimum, maximum]`, and an `alternative` box with a `when` explanation. Default placement is pictured; alternative values and use are listed in the details.

## Extend the kit

Users should edit or add preferences. Every addition belongs in both JSON and the visible HTML. Add a field here and render it on the page; updating only the embedded JSON is insufficient for a new field. Run `kit.py validate` and `kit.py embed`, verify the embedded JSON matches the file, then inspect both formats. The validator checks required canvases and text-box bounds; it cannot check real fonts, subjects, or every platform overlay. Review the actual video before exporting.

`agentContext` identifies the adjacent agent instructions, supported trigger phrases, synchronization requirements, and project discovery guidance. Read that context when applying the kit.
