# SPEC: card catalog explainer

```text
GOAL:    the viewer leaves knowing that a catalog holds cards, while the skills themselves live with their authors and install from there
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    56 s x 30 = 1680 frames. Silent by default; music.* adds a bed at 0.55 with a 1.5 s fade-out
LOOK:    ground #0b0b0c with 5% fractal grain; a desk plane #111113 from y 900; one accent #ff5315 for rules,
         the install path and one highlighted phrase per line (#b8390d when the accent is text on paper);
         display Montserrat 600, 48-96 px, -2% tracking; typed text IBM Plex Mono 24-50 px.
         Medium: a library card catalog. Index cards are paper #f1ece1 with a 4 px accent rule at y 128,
         a vertical accent rule at x 300, pale blue ruling every 104 px and a punch hole at the bottom.
         Cards are typed, letter by letter, never faded in as a block
OBJECTS: terminal (title bar with three dots and the agent's name); card-catalog drawer (back wall, ten card
         edges with category tabs, front panel with a label holder and a pull); index cards (mini 380x220, full
         1280x740); bookcase of three shelves whose books are repos' items, own repos in paper tones, vendors
         in slate; a phone with perforated stamps of album covers
MOTION:  arrivals expo.out 0.35-0.75 s; camera-like moves and growth power2.inOut 0.7-0.85 s; exits power2.in /
         power3.in 0.18-0.3 s with 8-12 px blur; words blur in 6 -> 0 px, 67 ms apart; letters 14-34 ms apart
SHOTS:   0-7      showcase: five 9:16 renders (300x533, 30 px apart) play from frame 0; slugs type under them;
                  "Every frame here is code", then "Each one is a template an agent can run"; the wall blurs out
         +7 s     every shot below starts 7 s later than written
         0-5      ask: terminal on screen from frame 0, the request types, "Где агент возьмёт шаблон?" blurs in
         5-11     drawer: drawer rises 110 px onto the desk, eight tabs pop one by one under a two-row line
         11-17.6  search: command types, three cards rise from behind the drawer front fanned -5/0/5 deg,
                  the pick lifts, the others dim to 0.32; the pick grows into the full card (object becomes the world)
         17.6-26.6 card: four rows type in, the call number is underlined, the card shrinks to 0.56 and moves left
         26.6-37.1 shelf: shelves build, a dashed accent path runs from the call number to the shelf, the skill
                  tilts out (install); then the source's sha changes, a grey path runs back and the card's sha flips
                  (sync); whip out to the left
         37.1-44.1 result: terminal whips in from the right, installs and renders; the phone swipes stamps
         44.1-48.6 end: two lines, word by word, held 3 s
BANNED:  glow, neon, gradients, glass; everything centred; every element fading and sliding up;
         three cards in a row as a layout (the three result cards are fanned and rise from a drawer);
         a logo end card; bounce on UI
QA:      2.5 s line read; 8 s tabs mid-pop and line clear of the drawer; 14.5 s line clear of the cards;
         22.5 s all four rows inside the card; 32.3 s path, tilted spine, line left of x 960;
         35.6 s sha chip and sync path; 41.6 s phone and terminal; 47.5 s end line
```
