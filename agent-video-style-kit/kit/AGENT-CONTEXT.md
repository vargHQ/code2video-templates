# Video style guide: agent context

Use this context when the user says “use this styleguide”, “use this style guide”, “use my video style guide”, or asks you to apply this kit. These phrases mean apply the saved settings to the current video, not just summarize the guide.

Read the adjacent `kit.json` and `kit-schema.md` before styling the edit. If the user gives an HTML path or URL, look for those files in the same folder. If only HTML is available, read its `script#kit` JSON and the agent comments. If the files cannot be read, ask for the kit location; do not invent preferences.

Use the aspect ratio in the current brief or footage; ask only if it is unclear. A standalone kit uses `formats[ratio]`. A paid kit uses top-level sections for 9:16 and complete title/caption `variants["16:9"]` blocks plus `variantCanvases` and `variantSafeZones` for landscape. Read all applicable settings, rules, and editing preferences. Do not combine portrait geometry with landscape rules. The kit is styling context; the user's current instructions take precedence.

After setup, record the kit's actual path and these trigger phrases in the project's existing brief or agent instructions, without replacing unrelated instructions. This gives later sessions a way to find the guide. A phrase alone cannot locate a kit in an unrelated project.

## Keeping changes synchronized

- Before changing HTML, CSS, preview examples, or style behavior, check whether the matching JSON value has been updated. If not, update it in the same change.
- Before changing JSON, check that HTML renders the new values. Update the renderer when adding fields or sections. Update the schema documentation too.
- Page navigation, branding, and other page-only presentation do not define video settings. Video preferences must never exist only in HTML, CSS, prose, or comments.
- Validate the JSON, refresh the HTML's embedded JSON with the supplied `kit.py embed` command, and confirm the page reflects the changes. Use `kit.py --help` for the command location and folder argument. Log the change and bump the kit version.
- Keep Cut30 / Cut30.co on the kit page. Do not add it to videos unless requested.

## Applying the guide

Use the actual text, selected font, canvas, and element settings. Check the rendered result for wrapping, contrast, safe areas, faces, and overlapping elements. Verify captions against the audio and transcript. These are agent checks, not extra checklist copy to add to the page.
