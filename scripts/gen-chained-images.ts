// Generate 3 chained character images: far → mid → extreme-closeup
// Each uses the previous output + original reference for maximum consistency.
//
// Usage: bun scripts/gen-chained-images.ts

const BASE_URL = process.env.VARG_BASE_URL ?? "https://varg-gateway-staging.fly.dev/v1";
const API_KEY = process.env.VARG_API_KEY!;

const CHARACTER_URL =
  "https://s3.varg.ai/uploads/images/4a48e4ac4afd2d470022e19a13416eac_ce7da3a6.jpg";

if (!API_KEY) {
  console.error("Missing VARG_API_KEY");
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────────────

async function submitJob(model: string, prompt: string, imageUrls: string[]) {
  const res = await fetch(`${BASE_URL}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      files: imageUrls.map((url) => ({ url })),
      aspect_ratio: "9:16",
      provider_options: { resolution: "2K" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Submit failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as any;
  const jobId = data.job_id ?? data.id;
  console.log(`  Job submitted: ${jobId}`);
  return jobId;
}

async function pollJob(jobId: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      console.log(`  Poll ${jobId}: HTTP ${res.status}, retrying...`);
      continue;
    }

    const data = (await res.json()) as any;
    const status = data.status;

    if (status === "completed" || status === "succeeded") {
      const url = data.output?.url ?? data.output?.images?.[0]?.url ?? data.output?.image?.url;
      if (!url) {
        console.log(`  Job completed but no URL found in output:`, JSON.stringify(data.output).slice(0, 200));
        throw new Error("No output URL");
      }
      return url;
    }

    if (status === "failed" || status === "error") {
      throw new Error(`Job failed: ${data.error ?? JSON.stringify(data)}`);
    }

    if (i % 3 === 0) console.log(`  Polling... (${status})`);
  }

  throw new Error("Timeout waiting for job");
}

async function generateImage(label: string, model: string, prompt: string, imageUrls: string[]): Promise<string> {
  console.log(`\n[${label}] Generating...`);
  console.log(`  Refs: ${imageUrls.length} image(s)`);
  const jobId = await submitJob(model, prompt, imageUrls);
  const url = await pollJob(jobId);
  console.log(`[${label}] Done: ${url}`);
  return url;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Reference:", CHARACTER_URL);
  console.log("Gateway:", BASE_URL);

  // Step 1: Full body from reference only
  const farUrl = await generateImage(
    "FULL BODY (far)",
    "nano-banana-2",
    "Full body portrait of the same person standing in a modern minimalist room. " +
      "Relaxed natural pose, looking at camera. " +
      "Warm ambient lighting, some furniture visible. " +
      "Photorealistic, environmental portrait. " +
      "Shot on Canon EOS R5 with 35mm lens, f/4. " +
      "Natural skin texture with visible pores — not airbrushed.",
    [CHARACTER_URL],
  );

  // Step 2: Close shot — full body first, then original reference
  const midUrl = await generateImage(
    "CLOSE SHOT (mid)",
    "nano-banana-2",
    "Close portrait shot of the same person, head and shoulders framing. " +
      "Looking directly at camera, natural relaxed expression. " +
      "Soft warm indoor lighting, clean background with subtle bokeh. " +
      "Photorealistic, natural skin texture. " +
      "Shot on Sony A7IV with 50mm lens, f/1.8. " +
      "Natural skin texture with visible pores — not airbrushed.",
    [farUrl, CHARACTER_URL],
  );

  // Step 3: Extreme close-up — close shot first, then full body, then reference
  const extremeUrl = await generateImage(
    "EXTREME CLOSE-UP",
    "nano-banana-2",
    "Extreme close-up of the same person's lower face, lips, and chin. " +
      "Photorealistic macro shot, shallow depth of field, every lip detail visible. " +
      "Soft warm indoor lighting. " +
      "Shot on Canon EOS R5 with 100mm macro lens, f/2.8. " +
      "Natural skin texture with visible pores — not airbrushed.",
    [midUrl, farUrl, CHARACTER_URL],
  );

  console.log("\n════════════════════════════════════════════");
  console.log("RESULTS:");
  console.log("  Reference:          ", CHARACTER_URL);
  console.log("  Full body (far):    ", farUrl);
  console.log("  Close shot (mid):   ", midUrl);
  console.log("  Extreme close-up:   ", extremeUrl);
  console.log("════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
