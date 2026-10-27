# code2video templates

**Open-source video-as-code templates for AI agents.** Every folder in this repo turns a request into a finished MP4.
An agent (Claude Code, Codex, Cursor, Devin or any MCP client) reads the folder's `SKILL.md`, fills in the inputs and
renders. The code2video templates are HTML, Canvas, WebGL or Python, rendered locally with
[HyperFrames](https://github.com/heygen-com/hyperframes), headless Chrome and ffmpeg: no API key, no credits. For AI
footage there are about 50 more templates in [`varg_jsx/`](varg_jsx/) that generate with Seedance, Kling, Veo,
nano-banana and ElevenLabs through [varg](https://varg.ai).

<table>
<tr>
<td><a href="apple-notes-video/"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_c18871a17715.webp" height="240" alt="apple-notes-video: a note typed live in an iPhone Notes screen"></a></td>
<td><a href="stamp-carousel/"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_dd29b8bcc93a.gif" height="240" alt="stamp-carousel: an iPhone swiping through pictures as postage stamps"></a></td>
<td><a href="liquid-thorn-logo/"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_6c082ea3d212.webp" height="240" alt="liquid-thorn-logo: a black chrome logo smeared by a WebGL fluid"></a></td>
<td><a href="card-catalog-explainer/"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_40bf292107cb.webp" height="240" alt="card-catalog-explainer: a wall of code-made videos"></a></td>
</tr>
<tr>
<td><code>apple-notes-video</code></td><td><code>stamp-carousel</code></td><td><code>liquid-thorn-logo</code></td><td><code>card-catalog-explainer</code></td>
</tr>
</table>

## Use it from an agent

Paste this into Claude Code, Codex or Cursor:

```text
Clone https://github.com/vargHQ/code2video-templates. Pick the template that fits my request from AGENTS.md,
read its SKILL.md, ask me for anything it needs, then render the video in the background.
My request: <what you want to see>
```

- [`AGENTS.md`](AGENTS.md) is the index an agent reads first: every template, what it makes, its render command
  and whether it costs credits.
- Each template's `SKILL.md` is its instruction: inputs to collect, what to edit, how to render, how to check frames.
- In Claude Code the skills in [`.claude/skills/`](.claude/skills/) load as soon as the repo is open.
- [`llms.txt`](llms.txt) lists the same for agents that read the web.

## Templates

| Template | Makes | Runs | Cost |
|----------|-------|------|------|
| [`apple-notes-video/`](apple-notes-video/) | Any text typed live in an iPhone Apple Notes screen, 9:16 | Bun + Chrome + ffmpeg | free, local |
| [`stamp-carousel/`](stamp-carousel/) | An iPhone swiping through your pictures as postage stamps, with or without background | Python + ffmpeg | free, local |
| [`liquid-thorn-logo/`](liquid-thorn-logo/) | Any word as a black-metal chrome logo that a cursor smears with liquid (WebGL) | Bun + Chrome + ffmpeg | free, local |
| [`card-catalog-explainer/`](card-catalog-explainer/) | A 56 s explainer: a wall of code-made videos, then one request through a card catalog to the MP4 | Bun + HyperFrames + ffmpeg | free, local |
| [`anime-jp-subtitles/`](anime-jp-subtitles/) | Japanese anime captions over any video: fansub + karaoke, TV telop, tategaki, katakana SFX | Python + HyperFrames + ffmpeg | free, local |
| [`anime-triple-split/`](anime-triple-split/) | Manga three-panel split screen that slams in on the beat | Python + HyperFrames + ffmpeg | free, local |
| [`varg-music-video/`](varg-music-video/) | An AI music video from a song: beat grid, story, Seedance scenes, frame-exact cut, graphics | Agent skill + Python scripts | credits |
| [`varg-previz/`](varg-previz/) | A three.js grey-box previz of every shot, then Seedance 2.5 video-to-video per scene | Python + browser, local | credits |
| [`varg_jsx/`](varg_jsx/) | AI-footage videos: UGC ads, talking heads, product videos, explainers, episodes | varg API | credits |

### `apple-notes-video/` -- Apple Notes typing video

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_c18871a17715.webp" width="270" alt="Apple Notes video: a lowercase ad note typed line by line, then an end card">

Any text becomes a 9:16 video of the note being typed over the iOS keyboard, with key clicks, optional music and an end card.

```bash
cd apple-notes-video && bun install
bun notes-video.ts --script examples/goose-style.json --out out/note.mp4
```

See [`apple-notes-video/README.md`](apple-notes-video/README.md).

### `stamp-carousel/` -- Stamp Carousel in an iPhone

![Stamp carousel](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_dd29b8bcc93a.gif)

Drop pictures in a folder, get an iPhone mockup that swipes through them as perforated stamps, with a screen colour that follows each stamp. Renders on a page background (MP4) and on a transparent background (ProRes 4444 / WebM / HEVC with alpha). Local Python + ffmpeg, no API calls.

```bash
cd stamp-carousel && bash make.command
```

See [`stamp-carousel/README.md`](stamp-carousel/README.md).

### `anime-jp-subtitles/` -- Japanese anime subtitles

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_998a68490f83.gif" width="270" alt="Japanese subtitles: fansub karaoke, TV telop, tategaki column, katakana SFX">

Japanese captions in four anime styles from one `subs.json`: fansub lines with an English line and a karaoke colour sweep, Japanese TV "telop" with popping letters and double outlines, a vertical tategaki narration column, and katakana SFX stamps (ドン!!, ゴゴゴ). Dela Gothic One and Noto Sans JP (OFL) are downloaded and subset to the characters used. Renders with HyperFrames, no API calls.

```bash
cd anime-jp-subtitles && bash make.command
```

See [`anime-jp-subtitles/README.md`](anime-jp-subtitles/README.md).

### `anime-triple-split/` -- Anime triple split

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_52b6b86d50c2.gif" width="270" alt="Triple split, rows layout"> <img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_f4b14bc28468.gif" width="270" alt="Triple split, columns layout">

Three live video panels slam onto screentone paper one per beat, with ink borders, slanted gutters, an impact flash and a katakana SFX stamp, then the page tears away. Layouts: `rows` (9:16), `columns`, `staircase`. Renders with HyperFrames, no API calls.

```bash
cd anime-triple-split && bash make.command
```

See [`anime-triple-split/README.md`](anime-triple-split/README.md).

### `varg-music-video/` -- AI music video from a song

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_5e78548332d5.gif" width="270" alt="Highlights of a 99 s anime music video made with this workflow">

The workflow behind a 99 s, 36-shot anime music video, as an agent skill with scripts: a song map (beats, downbeats, word timings), a five-move story on the beat grid, character and location anchors, short Seedance scenes with QA, a frame-exact cut on the song, lyrics and graphics in HyperFrames, director rounds, and a small export for Telegram.

```bash
python3 varg-music-video/scripts/songmap.py assets/song.mp3 --lyrics lyrics.txt --out songmap.json
python3 varg-music-video/scripts/rough_cut.py storyboard.json place.json renders/cut.mp4 --clips out/ --audio assets/song.mp3
```

See [`varg-music-video/README.md`](varg-music-video/README.md).

### `varg-previz/` -- three.js previz → Seedance video-to-video

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_3a16e502c737.gif" width="480" alt="three.js grey-box previz next to the Seedance 2.5 result made from it">

Block every shot of a multi-shot video in a schematic 3D previz on the timeline (auto cameras from storyboard words, a posable mannequin, START/END camera editing), approve it, then export clean previz clips as `@video1` references and generate one short Seedance 2.5 video-to-video run per scene. Includes story structure, character sheet and scene grouping guides.

```bash
python3 varg-previz/scripts/new_previz.py ~/videos/my-ad --aspect 9:16
python3 ~/videos/my-ad/previz/serve.py   # http://localhost:8765/previz/
```

See [`varg-previz/README.md`](varg-previz/README.md).

### `liquid-thorn-logo/` -- Liquid thorn logo

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_6c082ea3d212.webp" width="480" alt="Liquid thorn logo: a black chrome word with thorns and barbed wire, smeared blue by a cursor">

Any word becomes a black-metal logo in glossy black chrome with thorns, horns and barbed wire. A cursor drags a WebGL fluid through it, so the letters smear and flood with colour, then settle back. Any size, a loopable clip, optional captions and music.

```bash
cd liquid-thorn-logo && bun install
bun render.ts --text "NOCTURNE" --size 1080x1920 --logo-only
```

See [`liquid-thorn-logo/README.md`](liquid-thorn-logo/README.md).

### `card-catalog-explainer/` -- Card catalog explainer

<a href="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_18fb39ebfaa8.mp4"><img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_40bf292107cb.webp" width="640" alt="Card catalog explainer: a wall of five code-made videos under the line Each one is a template an agent can run"></a>

Opens on five real renders from this repo, then follows one request through a library card catalog. An agent searches the drawer, pulls an index card and follows its call number to the source shelf. It installs from there and renders the mp4. Everything on screen comes from `config.json`, so it can explain any catalog, registry or marketplace. English by default, Russian in `examples/`.

```bash
cd card-catalog-explainer && bash make.command      # out/card-catalog-explainer-en.mp4
```

See [`card-catalog-explainer/README.md`](card-catalog-explainer/README.md).

## What code2video means here

The video is a program. HTML and CSS, a canvas, a WebGL shader, Python or JSX describe every frame, and a renderer
seeks through time and encodes the frames to MP4. The same input gives the same video. A template can be versioned,
diffed, forked and edited by an agent like any other code, and a cheap preview comes before the full render.

How this repo fits with other code2video tools:

| | This repo | Remotion | HyperFrames | Manim |
|---|---|---|---|---|
| You write | HTML/JS, Python or JSX | React | HTML + GSAP | Python |
| A template is | a folder that renders a finished video | a starter project | a block or component inside a composition | a scene |
| Agent instructions | a `SKILL.md` in every template | agent skills ([remotion-dev/skills](https://github.com/remotion-dev/skills)) | agent skills + registry | none built in |
| Generated footage | Seedance, Kling, Veo, ElevenLabs via varg | bring your own | HeyGen media | none |

HTML templates here render with HyperFrames, so its blocks and skills work inside them.

## AI-footage templates (`varg_jsx/`)

About 50 `.tsx` templates for the [varg SDK](https://github.com/vargHQ/sdk): Seedance ad formats, UGC and talking
heads, product videos, character montages and a 15-minute episode. They generate through the varg API with one
`VARG_API_KEY` and cost credits. Quick start, models and components: [`varg_jsx/README.md`](varg_jsx/README.md).

```bash
git clone --recursive https://github.com/vargHQ/code2video-templates.git && cd code2video-templates && bun install
cp .env.example .env   # set VARG_API_KEY
bun run render varg_jsx/hello.tsx
```

## Add a template

One folder at the root, named after the template, on a `template/<name>` branch:

- `SKILL.md` with a `name` and a `description` that says what it makes, **Use when** and what it is not for;
- `README.md` for people, with a preview hosted on `s3.varg.ai` (never commit video, audio or images);
- the code and one command that renders it (`make.command`, `bun render.ts`, …);
- a link in `.claude/skills/<name>` → `../../<name>` and a row in `AGENTS.md`, `llms.txt` and this table.

## License

MIT, see [LICENSE](LICENSE). Third-party code keeps its own license next to it (for example
`apple-notes-video/vendor/LICENSE-gooseworks`).

## Links

- [varg.ai](https://varg.ai), the platform; model specs at [varg.ai/models/llms.txt](https://varg.ai/models/llms.txt)
- [vargHQ/sdk](https://github.com/vargHQ/sdk), the TypeScript SDK and CLI
- [vargHQ/skills](https://github.com/vargHQ/skills), agent skills for varg
