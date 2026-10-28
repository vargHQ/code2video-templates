import { chromium } from 'playwright-core';
const out = process.argv[2], N = 120, Y1 = 3300;
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2 });
await pg.goto('https://varg.ai/how-to', { waitUntil: 'networkidle' });
// warm pass: lazy-load every preview, then back to the top
for (let y = 0; y <= 4000; y += 300) { await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(250); }
await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(1500);
await pg.addStyleTag({ content: 'html{scroll-behavior:auto!important} ::-webkit-scrollbar{display:none}' });
const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
for (let i = 0; i < N; i++) {
  const k = Math.min(1, Math.max(0, (i / (N - 1) - 0.08) / 0.84));
  await pg.evaluate(y => scrollTo(0, y), Math.round(ease(k) * Y1));
  await pg.waitForTimeout(30);
  await pg.screenshot({ path: `${out}/${String(i).padStart(4, '0')}.png` });
}
await b.close();
