// Generate none-* files: source video + English speech overlaid
// Uses gateway to generate speech, then ffmpeg to mux.

const BASE_URL = process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1";
const API_KEY = process.env.VARG_API_KEY!;
const VOICE_ID = "iDMkgZn4BJ6RWjdzXniN";

const SHOTS = [
  { id: "extreme-closeup", label: "no lipsync, extreme close-up" },
  { id: "mid", label: "no lipsync, close shot" },
  { id: "far", label: "no lipsync, full body" },
];

async function generateSpeech(text: string): Promise<string> {
  // Submit speech job
  const res = await fetch(`${BASE_URL}/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "eleven_v3", text, voice: VOICE_ID }),
  });
  if (!res.ok) throw new Error(`Speech submit failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as any;
  const jobId = data.job_id ?? data.id;
  console.log(`  Speech job: ${jobId}`);

  // Poll
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!poll.ok) continue;
    const job = (await poll.json()) as any;
    if (job.status === "completed" || job.status === "succeeded") {
      const url = job.output?.url;
      if (!url) throw new Error("No output URL");
      return url;
    }
    if (job.status === "failed") throw new Error(`Speech failed: ${job.error}`);
  }
  throw new Error("Speech timeout");
}

async function downloadFile(url: string, path: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  await Bun.write(path, res);
  console.log(`  Downloaded: ${path}`);
}

async function main() {
  for (const shot of SHOTS) {
    console.log(`\n[${shot.id}] Generating English speech: "${shot.label}"`);
    const speechUrl = await generateSpeech(shot.label);
    console.log(`  Speech URL: ${speechUrl}`);

    // Download speech audio
    const audioPath = `output/sync-comparison/eng-speech-${shot.id}.mp3`;
    await downloadFile(speechUrl, audioPath);

    // Mux source video + English audio with ffmpeg
    const sourcePath = `output/sync-comparison/source-${shot.id}.mp4`;
    const outputPath = `output/sync-comparison/none-${shot.id}.mp4`;

    const proc = Bun.spawn([
      "ffmpeg", "-y",
      "-i", sourcePath,
      "-i", audioPath,
      "-map", "0:v",      // video from source
      "-map", "1:a",      // audio from English speech
      "-c:v", "copy",     // no re-encode video
      "-c:a", "aac",
      "-shortest",        // trim to shorter of video/audio
      outputPath,
    ], { stdout: "pipe", stderr: "pipe" });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`ffmpeg failed: ${stderr}`);
    }

    const size = Bun.file(outputPath).size;
    console.log(`[${shot.id}] Done: ${outputPath} (${(size / 1024 / 1024).toFixed(1)}M)`);
  }

  console.log("\nAll 3 none-* files created.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
