# Third-party notices

## jadon7/iphone-duo (MIT)

The fold deformation, the projected screen UI, the progressive blur and darkening shaders, the lighting and the
mesh mapping in `page/duo.js` are ported from [jadon7/iphone-duo](https://github.com/jadon7/iphone-duo)
(mirrored at [chuspeeism/iphone-duo](https://github.com/chuspeeism/iphone-duo)), an independent animation study.

```
MIT License

Copyright (c) 2026 jadon7

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

## Three.js (MIT)

`three@0.186.0` is installed from npm by `bun install` (not vendored). Its USD parsers are used as-is;
`page/usd-crate-listops.js` adds reading of reference and payload list-ops, following the crate layout in
OpenUSD's `crateFile.cpp`.

## Apple assets (not included)

The iPhone Duo 3D model and its textures belong to Apple Inc. They are **not** in this repository and not covered
by any license here. `bun render.ts --setup` downloads Apple's public AR Quick Look file from
[apple.com/iphone-duo](https://www.apple.com/iphone-duo/) into the ignored `assets/` folder for local use, and
checks its SHA-256. Its use is subject to [Apple's website terms](https://www.apple.com/legal/internet-services/terms/site.html).
Do not commit, upload or redistribute `assets/iphone-duo.usdz`.

iPhone and Apple are trademarks of Apple Inc. This template is not made, endorsed or sponsored by Apple.

The built-in screens (`page/screens.js`) and the example screens (`examples/*.html`) are drawn in code for this
template and contain no third-party images.
