// Fetches the example's screen captures and logo from s3.varg.ai into public/ and synthesizes the sound
// effects. Images and audio are never committed to this repo. Re-run safe: existing files are kept.
import { $ } from "bun";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import assets from "./assets.json";

const root = join(import.meta.dir, "..");

// Buffered download with a timeout and three tries (a streamed body can stall).
async function download(url: string): Promise<ArrayBuffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.arrayBuffer();
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e}`);
    }
  }
}
for (const [rel, url] of Object.entries(assets as Record<string, string>)) {
  const dest = join(root, "public", rel);
  if (existsSync(dest)) continue;
  mkdirSync(dirname(dest), { recursive: true });
  await Bun.write(dest, await download(url));
  console.log(`fetched ${rel}`);
}
if (!existsSync(join(root, "public/sfx/pad.wav"))) await $`bash ${join(import.meta.dir, "sfx.sh")} ${join(root, "public/sfx")}`;
console.log("ready: bun run dev (preview) or bun run render");
