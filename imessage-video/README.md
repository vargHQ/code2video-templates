# iMessage video

<img src="https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_1982eaa83e5f.webp" width="720" alt="Three iMessage screens: a one-to-one chat with a sent screenshot, a dark-mode text story with a tapback, and a group chat with sender avatars and a link card">

Videos with sound: [text story, dark](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_0a27f929222b.mp4) ·
[group chat](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_6666b6a53402.mp4) ·
[ad hook, 9:16](https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_dd6d52d084db.mp4).
Rendered from this folder with `bun render.ts examples/<name>.json --sfx`.

Write a conversation as JSON and get a vertical MP4 that looks like an iPhone screen recording of iMessage. Replies
show a typing indicator first, your messages type out in the input bar, bubbles spring in with the right tails and
grouped corners, and reactions, read receipts, photos, videos and link previews appear like on iOS 26. Light or dark
mode, one-to-one or group chats. Reply delays and typing speed come from message length, so one `pace` number sets
the rhythm instead of hand-tuned delays. Use it for text-story videos, chat ads and app promos.

It runs locally: Bun, headless Chrome and ffmpeg. No API key, no credits.

```bash
cd imessage-video && bun install
bun render.ts examples/hook.json                     # out/hook.mp4, 1170x2532, 30 fps
bun render.ts my-chat.json --sfx --size 1080x1920    # with message sounds, fitted into 9:16
```

## The script

```jsonc
{
  "title": "Jess",                 // name in the header (or the group name)
  "theme": "dark",                 // "light" (default) or "dark"
  "pace": 1.8,                     // 1 = real texting speed; 1.5-2.5 suits social video
  "openDay": "Yesterday",          // first divider: "Yesterday 11:48 PM"
  "time": "11:48 PM",              // status bar, dividers and "Read" time (default 9:41 AM)
  "senders": {
    "me":   { "name": "you", "me": true },
    "jess": { "name": "Jess", "initial": "J", "grad": ["#C7A6E0", "#9C7BC4"] }
  },
  "messages": [
    { "from": "jess", "text": "are you awake" },
    { "from": "me",   "text": "what happened", "tapback": { "emoji": "‼️", "by": "jess" } },
    { "timestamp": "Today 12:07 AM", "wait": 30 },
    { "from": "jess", "image": { "src": "screenshot.png", "height": 1100 } },
    { "from": "jess", "video": { "src": "clip.mp4", "height": 900 } },
    { "from": "me",   "linkCard": { "title": "varg: type a prompt, get a video", "domain": "varg.ai", "src": "og.png" }, "text": "varg.ai" }
  ]
}
```

| field | |
|---|---|
| `senders` | one entry must have `"me": true` (blue, right). Two or more other senders make it a group chat: names above bubbles, avatars on the left, the reactor's initial on tapbacks. `grad` is the avatar gradient |
| `text` | the bubble. `\n` breaks the line. Long text wraps by itself |
| `image` | `{ src, height }`: a photo or screenshot, 780 px wide, cropped to `height` (default 1200) |
| `video` | `{ src, height, loop }`: plays inside the bubble from the moment it lands; loops unless `"loop": false` |
| `linkCard` | `{ title, domain, src?, height? }`: a link preview. `text` is what types in the input bar first |
| `tapback` | `{ emoji, by }`: a reaction that lands 1.5 s after the message |
| `timestamp` | a centred divider such as `"Today 12:07 AM"` |
| `wait` | extra frames of silence before this message (30 = 1 s) |
| `avatar` / `avatarEmoji` / `initials` | the header picture; a group shows `avatarEmoji` (default 👥) |
| `readReceipts` | `false` hides Delivered / Read (shown in one-to-one chats only) |
| `intro` / `outro` | frames before the first message (26) and after the last (90) |

`src` can be a file next to the script or an `https://` URL.

## Options

```bash
bun render.ts --help
```

| flag | default | |
|---|---|---|
| `--out FILE` | `out/<script name>.mp4` | |
| `--pace N`, `--theme dark` | from the script | override the script |
| `--size WxH` | `1170x2532` (iPhone screen) | fit into another frame, e.g. `1080x1920`, padded with `--background` (`#000`) |
| `--sfx` | off | send whoosh, receive chime, tapback tick, keyboard clicks. Synthesized, no Apple sounds |
| `--audio FILE` | | music under the chat, cut to length with a 1 s fade-out (`--audio-volume 0.35`) |
| `--still S` or `--still last` | | one PNG at `S` seconds instead of a video |
| `--workers N` | half the CPU cores, max 6 | Chrome tabs rendering at once |
| `--crf N` | `18` | x264 quality |
| `--serve` | | live preview at http://127.0.0.1:4179 |

A 20 s chat renders in about 30 s on an M-series Mac.

## How it works

`page/imessage.html` compiles the script into a timeline (when each typing indicator starts, when each bubble lands,
when tapbacks and receipts appear) and draws any frame from scratch as a function of the frame number, with analytic
springs for every motion. `render.ts` serves the page and your media, measures every bubble's real height in Chrome,
then screenshots all frames across several tabs and joins them with ffmpeg. The same script always gives the same
video. Videos in bubbles are cut into frames once and cached in `out/.cache/`.

The timing model is adapted from [remotion-imessage](https://github.com/nikosmaheras-code/remotion-imessage) (MIT),
see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

iPhone, iMessage and iOS are trademarks of Apple Inc. This template is not made or endorsed by Apple. Make it clear
your videos are fiction or ads, and don't put real people's names or numbers into chats they never wrote.
