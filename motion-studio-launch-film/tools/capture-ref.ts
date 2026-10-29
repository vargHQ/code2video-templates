// How the example's screens were captured: real states of varg.ai/how-to at 1440x900 CSS, 2x, in one session.
// It also prints the DOM rects (CSS px) of the videos on the result pages, which src/config/content.ts uses to lay
// the playing previews back over their boxes. Copy it to capture your own product's states.
//   bun tools/capture-ref.ts public/screens
import puppeteer from "puppeteer-core";

const out = process.argv[2] ?? "public/screens";
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const videos = () =>
  p.$$eval("video", (vs) =>
    vs
      .map((v) => ({ src: (v as HTMLVideoElement).currentSrc, fit: getComputedStyle(v).objectFit, ...v.getBoundingClientRect().toJSON() }))
      .filter((v) => v.width > 0 && v.y < 900 && v.y + v.height > 0),
  );
const rewind = () => p.evaluate(() => document.querySelectorAll("video").forEach((v) => ((v as HTMLVideoElement).currentTime = 0)));

await p.goto("https://varg.ai/how-to/", { waitUntil: "networkidle2", timeout: 60000 });
await wait(1500);
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
await p.keyboard.press("Enter"); // top result: the "UGC Ad" skill
await wait(3500);
await rewind();
await wait(300);
await p.screenshot({ path: `${out}/skill.png` });
console.log("skill", p.url(), JSON.stringify(await videos()));
const crumb = await p.$$eval("a", (as) => as.filter((a) => /Ads & UGC/.test(a.textContent || "") && a.getBoundingClientRect().y < 120).map((a) => a.getBoundingClientRect().toJSON())[0]);
await p.mouse.click(crumb.x + crumb.width / 2, crumb.y + crumb.height / 2); // breadcrumb "Ads & UGC"
await wait(3500);
await rewind();
await wait(300);
await p.screenshot({ path: `${out}/ads.png` });
console.log("grid", p.url(), JSON.stringify(await videos()));
await b.close();
