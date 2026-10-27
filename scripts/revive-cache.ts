/**
 * Clear the expiry stamp on existing `.cache/ai` entries.
 *
 * Context: `withCache` used to default to a 7-day TTL, and `fileCache.get()`
 * truncated expired entries to zero bytes on read. Both are fixed in the SDK
 * (see sdk fix/cache-expiry-data-loss), but entries written *before* the fix
 * still carry an `expires` timestamp in the past, so they read as misses and
 * get paid for again.
 *
 * Every entry is keyed by `cacheKey` — a hash of the model and all inputs — so
 * a hit can never be stale. Clearing expiry restores hits; it does not risk
 * serving wrong data.
 *
 * Only the trailing `"expires":<n>` field is rewritten, in place. Files here
 * run to ~17 MB (13 GB total); re-serializing them would be slow and would
 * risk mangling payloads. `expires` is always the last key, so the tail is
 * patched and the payload bytes are never touched.
 *
 *   bun run scripts/revive-cache.ts [--dir .cache/ai] [--apply]
 *
 * Defaults to a dry run. Pass --apply to write.
 */

import { readdir, stat } from "node:fs/promises";
import { open } from "node:fs/promises";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dirIdx = args.indexOf("--dir");
const dir = dirIdx >= 0 ? args[dirIdx + 1]! : ".cache/ai";

/** Bytes off the end to scan for the expires field. */
const TAIL = 256;
// Tolerates the space padding that clearExpiry() leaves behind, so a second
// run classifies already-revived entries as eternal rather than unparsed.
const EXPIRES_RE = /"expires":(\d+) *\}\s*$/;

type Outcome =
  | { kind: "expired"; path: string; size: number; expires: number }
  | { kind: "live" }
  | { kind: "eternal" }
  | { kind: "empty"; path: string }
  | { kind: "unparsed"; path: string };

async function classify(path: string): Promise<Outcome> {
  const size = (await stat(path)).size;
  if (size === 0) return { kind: "empty", path };

  const file = Bun.file(path);
  const tail = await file.slice(Math.max(0, size - TAIL)).text();
  const m = tail.match(EXPIRES_RE);
  if (!m) return { kind: "unparsed", path };

  const expires = Number(m[1]);
  if (expires === 0) return { kind: "eternal" };
  if (Date.now() <= expires) return { kind: "live" };
  return { kind: "expired", path, size, expires };
}

/**
 * Overwrite the trailing `"expires":<n>}` with `"expires":0}`, padding with
 * spaces before the brace so the JSON stays valid without moving any bytes.
 */
async function clearExpiry(path: string, size: number): Promise<void> {
  const file = Bun.file(path);
  const start = Math.max(0, size - TAIL);
  const tail = await file.slice(start).text();
  const m = tail.match(EXPIRES_RE);
  if (!m) throw new Error(`expires field vanished in ${path}`);

  const matchStart = start + m.index!;
  const replacement = `"expires":0`.padEnd(m[0].length - 1, " ") + "}";
  if (replacement.length !== m[0].length) {
    throw new Error(`length mismatch for ${path}`);
  }

  const fh = await open(path, "r+");
  try {
    await fh.write(Buffer.from(replacement, "utf8"), 0, replacement.length, matchStart);
  } finally {
    await fh.close();
  }

  // Verify the file still parses and the payload survived.
  const reread = await Bun.file(path).slice(Math.max(0, size - TAIL)).text();
  if (!/"expires":0\s*\}\s*$/.test(reread)) {
    throw new Error(`verification failed for ${path}`);
  }
  if ((await stat(path)).size !== size) {
    throw new Error(`size changed for ${path}`);
  }
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
const counts = { expired: 0, live: 0, eternal: 0, empty: 0, unparsed: 0 };
const targets: { path: string; size: number }[] = [];

for (const name of files) {
  const outcome = await classify(`${dir}/${name}`);
  counts[outcome.kind]++;
  if (outcome.kind === "expired") {
    targets.push({ path: outcome.path, size: outcome.size });
  }
}

const bytes = targets.reduce((s, t) => s + t.size, 0);
console.log(`scanned ${files.length} entries in ${dir}`);
console.log(`  expired : ${counts.expired} (${(bytes / 1e9).toFixed(2)} GB)`);
console.log(`  live    : ${counts.live}`);
console.log(`  eternal : ${counts.eternal}`);
console.log(`  empty   : ${counts.empty}`);
console.log(`  unparsed: ${counts.unparsed}`);

if (!apply) {
  console.log("\ndry run — pass --apply to clear expiry on the expired entries");
  process.exit(0);
}

let ok = 0;
const failures: string[] = [];
for (const t of targets) {
  try {
    await clearExpiry(t.path, t.size);
    ok++;
  } catch (err) {
    failures.push(`${t.path}: ${(err as Error).message}`);
  }
}

console.log(`\nrevived ${ok}/${targets.length}`);
if (failures.length) {
  console.log("failures:");
  for (const f of failures) console.log("  " + f);
  process.exit(1);
}
