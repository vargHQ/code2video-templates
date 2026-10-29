# Global storyboard

Default: `Launch`, 1920 × 1080, 60 fps, 1200 frames. All intervals here are **start inclusive, end exclusive**. `[180,480)` means displayed frames 180 through 479. Render the full film through frame 1199.

| Scene | Global interval | Main event | Incoming and outgoing state |
| --- | --- | --- | --- |
| Opening | [0,180) | Establish outcome and product | Start composed; end with settled card |
| Action | [180,480) | Approach, press, actual response | Carry settled card; end with visible result |
| Result | [480,900) | Let the result be understood | Preserve result; prepare closing object |
| Closing | [900,1200) | Brand and one next action | Carry chosen object; end on readable hold |

## Starting layout

Use a 96-pixel safe margin. Proposed headline box: x160, y82, width1600, maximum two lines, initial font size68. Product card: x240, y230, width1440, height650. Leave room below the card for supporting information. Adjust these starting choices to the real source aspect ratio.

Record the product control and result anchors from ASSETS.md. Set layer order explicitly: background, product container, content, highlights, cursor, text.

## Worked event schedule

- Headline enters during [0,24); product card enters during [20,57). Hold the settled composition through frame 179.
- Preserve that exact card state at frame 180. Cursor approaches during [240,289); press at 300; cursor recovers by 312 and leaves the result area by 342.
- Show the supplied after-action state at 360; finish its reveal by 390. Keep the result readable through 899.
- Closing transformation begins at 900 and settles by 930. Hold closing copy through 1199. If a continuous transformation is unsuitable, choose a deliberate cut and record it.

Use these frames as a first creative pass. Change them to fit the content and record the updated schedule here. Sound cues reference this file.

For every scene, record entrance, landing, reading hold, primary action, exit, and the state handed to its neighbor. A scene-local frame equals global frame minus sequence start. Local frame 60 inside a sequence starting at 180 is global 240.

Sample stills at 96, 300, 540, and 1020. Inspect adjacent frames at 179/180, 479/480, 899/900, and 1199. Keep the exported scene boundary consistent with the written plan.

## Scene record format

```text
SCENE: name / global interval [start,endExclusive)
PURPOSE: the one new thing the viewer understands
LAYOUT: main subject box, headline box, result box, camera
ENTER: object + start state + landing frame
ACTION: actual event + its global frame
HOLD: readable interval + what should remain still
EXIT: owner object + transform handed to next scene
SOUND: reference to the event frame in SOUND.md
```

The four-scene default is an initial structure, not a mandate to stretch weak material. Allocate more time to a result with dense information and reduce setup. At a shared-object transition, compare the object's position, scale, rotation, clipping and layer order on both sides of the boundary. Either make them continuous or design an intentional cut. Keep the final closing state visible through frame 1199.

## Official implementation resources

- [Sequence and local frames](https://www.remotion.dev/docs/sequence)

## This project: recorded schedule (src/config/timeline.ts)

- Opening [0,76): headline [0,14); card rises [4,30); cursor in at 30, to search [36,66), press 72.
- Search [76,194): palette at 76; headline out [64,78); camera 1 -> 1.85 [76,108); keys at 92..158 (6 f each, one
  real capture per character of "dropshipping"); cursor to the first row [162,182), ring, press 186; gone by 194.
- Skill [194,460): **cut at 194**, the reel starts; camera back [188,218) then into the reel 1 -> 1.7 [222,276);
  label 1 [206,232) .. [404,418); pull back [386,420); cursor to the breadcrumb [418,446), press 452.
- Grid [460,900): **cut at 460**; 24 real scroll captures over [460,492); the nine previews start at 492; label 2
  [496,522) .. [640,658); push 1 -> 1.25 on the reels [620,880).
- Closing [900,1200): card shrinks 1 -> 0.18 and fades [900,942); logo [918,960); line [948,978); URL [972,1002);
  hold to 1199.
