// Generate veed-* files: veed-fabric with English speech (image + English audio → talking video)
// Uses the already-generated English speech mp3 files from the none-* step.

const BASE_URL = process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1";
const API_KEY = process.env.VARG_API_KEY!;

const SHOTS = [
  { id: "extreme-closeup", image: "https://s3.varg.ai/o/job_05467a68.png" },
  { id: "mid", image: "https://s3.varg.ai/o/job_73f9546c.png" },
  { id: "far", image: "https://s3.varg.ai/o/job_868ad906.png" },
];

// English speech URLs from the none-* generation
const SPEECH_URLS: Record<string, string> = {
  "extreme-closeup": "https://s3.varg.ai/o/job_6d276b99.mp3",
  mid: "https://s3.varg.ai/o/job_2ee66bfc.mp3",
  far: "https://s3.varg.ai/o/job_64d20392.mp3",
};

async function submitVideo(imageUrl: string, audioUrl: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "veed-fabric-1.0",
      files: [{ url: imageUrl }, { url: audioUrl }],
      provider_options: { resolution: "720p" },
    }),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as any;
  return data.job_id ?? data.id;
}

async function pollJob(jobId: string): Promise<string> {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) continue;
    const data = (await res.json()) as any;
    if (data.status === "completed" || data.status === "succeeded") {
      return data.output?.url;
    }
    if (data.status === "failed") throw new Error(`Job failed: ${data.error}`);
    if (i % 6 === 0) console.log(`  Polling... (${data.status})`);
  }
  throw new Error("Timeout");
}

async function main() {
  // Launch all 3 in parallel
  const jobs = await Promise.all(
    SHOTS.map(async (shot) => {
      console.log(`[veed-${shot.id}] Submitting...`);
      const jobId = await submitVideo(shot.image, SPEECH_URLS[shot.id]!);
      console.log(`[veed-${shot.id}] Job: ${jobId}`);
      return { ...shot, jobId };
    }),
  );

  // Poll all in parallel
  const results = await Promise.all(
    jobs.map(async (job) => {
      console.log(`[veed-${job.id}] Waiting for result...`);
      const url = await pollJob(job.jobId);
      console.log(`[veed-${job.id}] Video URL: ${url}`);

      // Download
      const outputPath = `output/sync-comparison/veed-${job.id}.mp4`;
      const res = await fetch(url);
      await Bun.write(outputPath, res);
      const size = Bun.file(outputPath).size;
      console.log(`[veed-${job.id}] Done: ${outputPath} (${(size / 1024 / 1024).toFixed(1)}M)`);
      return { id: job.id, path: outputPath };
    }),
  );

  console.log("\nAll 3 veed-* files created:");
  for (const r of results) console.log(`  ${r.path}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
