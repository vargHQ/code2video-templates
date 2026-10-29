# Third-party notices

## remotion-imessage

The timing model in `page/imessage.html` (reply delay and typing time from message length, the spring settings for
bubbles, typing indicators and tapbacks) is adapted from
[nikosmaheras-code/remotion-imessage](https://github.com/nikosmaheras-code/remotion-imessage) and reimplemented in
plain JavaScript driven by an external frame clock instead of Remotion.

```
MIT License

Copyright (c) 2026 Nikos Maheras

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Apple

The screen is drawn in HTML and CSS. No Apple artwork, fonts, icons or sounds are bundled: the text uses the
system font of the machine that renders, and `--sfx` sounds are synthesized from sine waves and noise in
`render.ts`. iPhone, iMessage and iOS are trademarks of Apple Inc. This template is not made or endorsed by Apple.
