# Agent Video Style Kit

A free, standalone style kit from [Cut30](https://cut30.co). Separate title and caption settings for **9:16 (1080 × 1920)** and **16:9 (1920 × 1080)**.

Open `style-kit.html` in your browser. Your editing agent reads `kit.json`; the page is its visual preview. It works as a local file, using the embedded JSON. A network connection loads the optional TikTok Sans browser font; otherwise the preview uses a system fallback. Install or package your chosen font in the editing engine for matching renders.

## Get started

Copy [the setup prompt](setup-prompt.txt) into your agent, or download and extract the ZIP yourself. No account, personal token, or paid software is required. The kit does not install an editor, plugin, or MCP server.

## Make it yours

Edit or add to the kit to match your preferences. Every change must be in both the agent-readable JSON and the visible HTML preview.

1. Edit `kit.json` first. Its values are pixels on the named canvas, not CSS pixels on this page.
2. New fields or sections also need HTML rendering and documentation in `kit-schema.md`.
3. Run `python3 kit.py validate .` and `python3 kit.py embed .` from this folder. Python 3 is only needed for these helper commands, not for viewing the kit.
4. Reopen the page and check both aspect ratios. Log the change and bump `kitVersion`.

Typing in the page's sample inputs previews wording only; it does not save the kit. Prefer editing through your agent. `kit.py` synchronizes the JSON embedded in the HTML; it cannot invent a renderer for a new section.

These are editable design starting points, not platform guarantees or measured editing-format rules. Check each video's actual destination and rendered text. A different editor may measure fonts and line boxes differently.

## Files

- `style-kit.html`: visual preview, sample text inputs, and setup-prompt copy button.
- `kit.json`: title, caption, safe-area, and review settings for both aspect ratios.
- `kit-schema.md`: field definitions and extension guidance.
- `kit.py`: dependency-free JSON validation and HTML synchronization helper.
- `setup-prompt.txt`: the shareable download/setup prompt.

Use and customize this kit for your own personal or commercial videos. Keep Cut30 / Cut30.co attribution on the kit page when sharing the kit. There is no Cut30 watermark requirement for your videos. The linked font has its own SIL Open Font License; no font binary is bundled. Preview artwork is a schematic layout illustration.

## Using the kit with your agent

After setup in your project, say “use this styleguide” or “use my video style guide”. The setup prompt records the kit path in project context. In another project or a fresh conversation, provide the kit folder or page URL. `AGENT-CONTEXT.md` contains the application and synchronization instructions.
