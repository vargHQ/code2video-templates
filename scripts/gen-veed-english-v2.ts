// Generate veed-* files with "veed lipsync, {shot}" English speech
// Step 1: Generate speech via gateway
// Step 2: Generate veed-fabric videos with image + speech

const BASE = process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1";
const KEY = process.env.VARG_API_KEY!;
const VOICE = "iDMkgZn4BJ6RWjdzXniN";

const SHOTS = [
  { id: "extreme-closeup", image: "https://s3.varg.ai/o/job_05467a68.png", label: "veed lipsync, extreme close-up" },
  { id: "mid", image: "https://s3.varg.ai/o/job_73f9546c.png", label: "veed lipsync, close shot" },
  { id: "far", image: "https://s3.varg.ai/o/job_868ad906.png", label: "veed lipsync, full body" },
];

async function submitAndPoll(endpoint: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Submit ${endpoint} failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as any;
  const jobId = data.job_id ?? data.id;

  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const poll = await fetch(`${BASE}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${KEY}` } });
    if (!poll.ok) continue;
    const job = (await poll.json()) as any;
    if (job.status === "completed" || job.status === "succeeded") return job.output;
    if (job.status === "failed") throw new Error(`Job ${jobId} failed: ${job.error}`);
    if (i % 6 === 0) console.log(`  [${jobId}] ${job.status}...`);
  }
  throw new Error(`Timeout: ${jobId}`);
}

async function main() {
  // Step 1: Generate all 3 speech clips in parallel
  console.log("Generating speech clips...");
  const speechUrls = await Promise.all(
    SHOTS.map(async (shot) => {
      console.log(`  [${shot.id}] "${shot.label}"`);
      const output = await submitAndPoll("speech", { model: "eleven_v3", text: shot.label, voice: VOICE });
      console.log(`  [${shot.id}] Speech: ${output.url}`);
      return { ...shot, speechUrl: output.url as string };
    }),
  );

  // Step 2: Generate veed videos in parallel
  console.log("\nGenerating veed videos...");
  await Promise.all(
    speechUrls.map(async (shot) => {
      console.log(`  [veed-${shot.id}] Submitting...`);
      const output = await submitAndPoll("video", {
        model: "veed-fabric-1.0",
        files: [{ url: shot.image }, { url: shot.speechUrl }],
        provider_options: { resolution: "720p" },
      });
      const videoUrl = output.url as string;
      console.log(`  [veed-${shot.id}] Video: ${videoUrl}`);

      // Download
      const outPath = `output/sync-comparison/veed-${shot.id}.mp4`;
      const res = await fetch(videoUrl);
      await Bun.write(outPath, res);
      console.log(`  [veed-${shot.id}] Saved: ${outPath} (${(Bun.file(outPath).size / 1024 / 1024).toFixed(1)}M)`);
    }),
  );

  console.log("\nDone! All 3 veed-* files regenerated with 'veed lipsync' speech.");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
