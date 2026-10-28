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

- Opening [0,180): headline [0,24); card rises [20,57); hold.
- Action [180,480): cursor in 220, to search [240,289), press 300 -> palette 304; headline out [288,306); camera 1 -> 1.85 on the palette [304,346); keys at 330/345/360/375/390/405 (one real capture each); cursor to row [416,445), ring [436,450), press 450; ring + cursor gone by 462; **cut to the guide at 462** (a link click navigates; the earlier crossfade double-exposed both screens at 463, fixed); camera back to 1 [452,484).
- Result [480,900): label 1 [492,522) -> out [672,690); label 2 [690,720); slow push 1 -> 1.22 on "What works now" [560,840).
- Closing [900,1200): card shrinks 1 -> 0.18 and fades [900,942) (owner object becomes the mark); logo [918,960); line [948,978); URL [972,1002); hold to 1199.
