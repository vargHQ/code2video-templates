// How the example was captured: real states of varg.ai/how-to at 1440x900 CSS, 2x, in one session: home, the
// palette, one PNG per typed character, the skill page, 24 frames of an eased scroll on the category page, and the
// final grid. Prints the DOM boxes of every playing video (and the UI drawn over it) for src/config/content.ts.
//   bun tools/capture-ref.ts public/screens 1190
import puppeteer from "puppeteer-core";
const out = process.argv[2] ?? "public/screens";
const SCROLL = Number(process.argv[3] ?? 1190), STEPS = 24;
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args:["--hide-scrollbars","--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const rewind = () => p.evaluate(() => document.querySelectorAll("video").forEach(v => ((v as HTMLVideoElement).currentTime = 0)));
const videos = () => p.evaluate(() => [...document.querySelectorAll("video")].map(v => {
  const r = v.getBoundingClientRect(); if (!(r.width>0 && r.y<900 && r.y+r.height>0)) return null;
  let host:any = v, radius = "0px"; for (let i=0;i<4&&host;i++){ const cr=getComputedStyle(host).borderTopLeftRadius; if(cr!=="0px"){radius=cr;break;} host=host.parentElement; }
  const box = v.parentElement!.parentElement!;
  const keep = [...box.querySelectorAll("span,button")].map(e => ({e, r:e.getBoundingClientRect()})).filter(({e,r}) => r.width>0 && r.width<220 && r.height<60 && r.x>=r.x && r.x>=v.getBoundingClientRect().x-1 && r.y>=v.getBoundingClientRect().y-1 && r.right<=v.getBoundingClientRect().right+1 && r.bottom<=v.getBoundingClientRect().bottom+1 && (e.tagName==="BUTTON" || getComputedStyle(e).borderRadius!=="0px")).map(({e,r}) => ({x:r.x,y:r.y,w:r.width,h:r.height, rad:getComputedStyle(e).borderTopLeftRadius}));
  return { src:(v as HTMLVideoElement).currentSrc, fit:getComputedStyle(v).objectFit, radius, x:r.x, y:r.y, w:r.width, h:r.height, keep };
}).filter(Boolean));
const info:any = {};
await p.goto("https://varg.ai/how-to/", { waitUntil: "networkidle2" }); await wait(1500);
await p.screenshot({ path: `${out}/home.png` });
await p.mouse.click(170, 82); await wait(800);
await p.screenshot({ path: `${out}/palette-empty.png` });
const q = "dropshipping";
for (let i=1;i<=q.length;i++){ await p.keyboard.type(q[i-1]); await wait(1500); await p.screenshot({ path: `${out}/type-${String(i).padStart(2,"0")}.png` }); }
await p.keyboard.press("Enter"); await wait(3500);
info.skillUrl = p.url();
await rewind(); await wait(300);
await p.screenshot({ path: `${out}/skill.png` });
info.skillVideos = await videos();
info.crumb = await p.$$eval("a", as => as.filter(a=>/^\s*Ads & UGC\s*$/.test(a.textContent||"") && a.getBoundingClientRect().y < 120).map(a=>a.getBoundingClientRect().toJSON())[0]);
await p.mouse.click(info.crumb.x + info.crumb.width/2, info.crumb.y + info.crumb.height/2); await wait(3500);
info.gridUrl = p.url();
for (let i=0;i<STEPS;i++){ const t=i/(STEPS-1); const e = t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; await p.evaluate((y)=>window.scrollTo(0,y), Math.round(SCROLL*e)); await wait(250); await p.screenshot({ path: `${out}/scroll/s-${String(i).padStart(2,"0")}.png` }); }
await rewind(); await wait(400);
await p.screenshot({ path: `${out}/grid.png` });
info.gridVideos = await videos();
console.log(JSON.stringify(info, null, 1));
await b.close();
