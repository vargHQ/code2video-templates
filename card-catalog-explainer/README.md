# Card catalog explainer

<a href="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_18fb39ebfaa8.mp4"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_40bf292107cb.webp" width="640" alt="Card catalog explainer: a wall of five code-made videos under the line Each one is a template an agent can run"></a>

A 56-second explainer, 1920×1080, rendered locally with HyperFrames. No credits.

It opens on a wall of five real videos made by other templates in this repo (anime triple split, liquid thorn logo, stamp carousel, anime subtitles, a varg talking head). Then one request travels through a library card catalog. An agent searches the drawer and pulls an index card. It follows the card's call number to the source shelf, installs from there and renders the result. The film ends on one line: the catalog keeps cards, the skills live with their authors.

The bundled `config.json` tells how the varg skills catalog works (`vargHQ/skills-marketplace`, 294 cards), in English. The example request is "make a video where a phone swipes through my album covers", and the card it finds is `stamp-carousel`. The Russian version is `examples/varg-catalog.ru.json`.

## Make it

```bash
bash make.command                                  # out/card-catalog-explainer-en.mp4
bash make.command examples/varg-catalog.ru.json    # out/card-catalog-explainer-ru.mp4
```

Needs `bun`, `ffmpeg` and Node with `npx`. HyperFrames 0.8.186 is fetched by `npx` on first run.

To add music, put `music.mp3` (or `.m4a` / `.wav`) next to `make.command`. Without it the film is silent.

## Change it

Everything is in `config.json`:

| key | what |
|---|---|
| `showcase` | the opening wall: clips (`src` as an https URL or a local path, `label`, `start`) and two lines. The bundled clips are on s3.varg.ai |
| `request` | the user's request typed in the terminal, and the question line |
| `catalog` | drawer label, card count, category tabs, line |
| `search` | search command, three result cards, which one is picked |
| `card` | title, call number (`repo`, `path`, `sha`), fields, install command |
| `shelves` | three shelves of source repos and the items on them |
| `install`, `sync` | the two shelf beats: install from the source; the source changes and the card follows |
| `result` | terminal lines, stamp colours on the phone |
| `end` | the closing line |
| `timing` | seconds per scene |
| `output` | `name` of the mp4, `lang` of the page |
| `colors` | ground, accent, paper |

Words in `*stars*` inside a `line` are drawn in the accent colour. Length limits per field are in `SKILL.md`.

## Files

```
config.json        the video
engine/build.ts    config → out/hf (HyperFrames project: index.html + 7 scene files)
make.command       build, check, render
SKILL.md           instructions for agents
SPEC.md            the film's spec: look, motion and shots in numbers
```
