// How the example's screens were captured: real states of varg.ai/how-to at 1440x900 CSS, 2x.
// Copy it to capture your own product's before -> action -> after states.
//   bun tools/capture-ref.ts public/screens
import puppeteer from "puppeteer-core";

const out = process.argv[2] ?? "public/screens";
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto("https://varg.ai/how-to/", { waitUntil: "networkidle2", timeout: 60000 });
await wait(1200);
await p.screenshot({ path: `${out}/home.png` }); // before
await p.mouse.click(170, 82); // sidebar "Search skills"
await wait(800);
await p.screenshot({ path: `${out}/palette-empty.png` }); // button response
const q = "ugc ad";
for (let i = 1; i <= q.length; i++) {
  await p.keyboard.type(q[i - 1]);
  await wait(1800); // let the live results settle
  await p.screenshot({ path: `${out}/type-${i}.png` }); // one real state per character
}
await p.goto("https://varg.ai/how-to/make-a-ugc-ad-video", { waitUntil: "networkidle2", timeout: 60000 });
await wait(2000);
await p.screenshot({ path: `${out}/guide.png` }); // after
await b.close();
