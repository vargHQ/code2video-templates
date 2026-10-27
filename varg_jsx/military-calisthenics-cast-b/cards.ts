// Military Calisthenics — Cast B: character reference cards ONLY.
//
// Images only, no video. Mirrors the 3-slot reference structure the original
// ad used (face card / body card / location plate) so the same prompts can be
// pointed at the new cast later without touching the video code.
//
// Cast diff vs the original:
//   A1 interviewer: olive-skinned brunette, dark ponytail
//                -> Black woman, ~35, voluminous natural curls
//                   (the original PROMPT already said "Black woman" while its
//                    reference image showed an olive-skinned brunette — the
//                    text and the picture disagreed. This resolves it.)
//   A2 coach:       white ~50, short greying hair, grey stubble, blue eyes
//                -> bald white man, ~55, full grey beard, same build/authority
//
// The location plate is REUSED byte-identical from the original render, so the
// room, table, mics and lighting are guaranteed to match and it costs $0.
//
// Usage:
//   export VARG_API_KEY=...
//   bun run templates/military-calisthenics-cast-b/cards.ts
//
// Cost: 4 images x 16c = ~$0.64

const API = "https://api.varg.ai/v2";
const KEY = process.env.VARG_API_KEY;
if (!KEY) throw new Error("VARG_API_KEY is not set");

const OUT = `${import.meta.dir}/cards`;

// Reused verbatim from the original render — empty brick podcast room,
// wooden table, two boom mics. Not regenerated: identical URL, $0.
const LOC =
  "https://s3.varg.ai/files/667690f1-5d8e-48e0-95ed-4ece08ad7202/file_81b1c457a01f.png";

type Job = {
  id: string;
  status: string;
  output?: { outputs: { url: string }[] };
  error?: unknown;
  actual_cost_cents?: number;
};

async function api(path: string, init?: RequestInit): Promise<Job> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = (await res.json()) as Job & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(
      `${path} ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`,
    );
  }
  return json;
}

async function image(opts: {
  tag: string;
  prompt: string;
  aspectRatio: string;
  files?: string[];
}): Promise<string> {
  // NOTE: nano_banana_pro/edit rejects `aspect_ratio` combined with
  // provider_options.fal.resolution="2K" ("Mapped input failed the provider
  // schema"). aspect_ratio alone validates fine, so no provider_options here.
  const body: Record<string, unknown> = {
    model: opts.files?.length ? "nano_banana_pro/edit" : "nano_banana_pro",
    prompt: opts.prompt,
    aspect_ratio: opts.aspectRatio,
  };
  if (opts.files?.length) body.files = opts.files.map((url) => ({ url }));

  console.log(`[${opts.tag}] submitting...`);
  const job = await api("/image", { method: "POST", body: JSON.stringify(body) });

  for (let i = 0; i < 90; i++) {
    await Bun.sleep(3000);
    const s = await api(`/jobs/${job.id}`);
    if (s.status === "completed") {
      const url = s.output?.outputs?.[0]?.url;
      if (!url) throw new Error(`[${opts.tag}] completed with no output`);
      const bytes = await fetch(url).then((r) => r.arrayBuffer());
      await Bun.write(`${OUT}/${opts.tag}.png`, bytes);
      console.log(
        `[${opts.tag}] done  ${s.actual_cost_cents ?? "?"}c  -> cards/${opts.tag}.png`,
      );
      return url;
    }
    if (s.status === "failed" || s.status === "cancelled") {
      throw new Error(`[${opts.tag}] ${s.status}: ${JSON.stringify(s.error)}`);
    }
  }
  throw new Error(`[${opts.tag}] timed out`);
}

// ── A1 — interviewer ────────────────────────────────────────────────────────

const a1Face = await image({
  tag: "a1-face",
  aspectRatio: "3:2",
  prompt:
    "Character reference sheet: three views of the SAME adult Black woman, about 35 years old, side by side in one frame — front view, three-quarter view, and side profile. Warm deep brown skin, voluminous natural curly hair worn loose at shoulder length, expressive dark brown eyes, full lips, high cheekbones, minimal natural makeup. Neutral relaxed expression, mouth closed, looking straight ahead in each view. Plain light grey seamless studio background, even soft frontal lighting, no harsh shadows. She wears a plain heather grey crew-neck T-shirt. Framed head and shoulders. Sharp photorealistic casting-photo quality, consistent identity across all three views.",
});

const a1Body = await image({
  tag: "a1-body",
  aspectRatio: "2:3",
  files: [a1Face],
  prompt:
    "Full-body standing reference photo of the exact same woman shown in the reference image — identical face, identical warm deep brown skin, identical voluminous shoulder-length natural curly hair. Retain her exact identity. She now wears a plain DARK TEAL crew-neck T-shirt tucked loosely into blue denim jeans, barefoot. Standing straight facing the camera, arms relaxed at her sides, neutral calm expression. Plain light grey seamless studio background, even soft lighting, full head-to-toe framing with space above the head. Photorealistic, sharp, casting-photo quality.",
});

// ── A2 — coach ──────────────────────────────────────────────────────────────

const a2Face = await image({
  tag: "a2-face",
  aspectRatio: "3:2",
  prompt:
    "Character reference sheet: three views of the SAME white man, about 55 years old, side by side in one frame — front view, three-quarter view, and side profile. Completely BALD with a clean-shaven scalp, and a full thick well-groomed GREY BEARD covering the jaw and chin. Weathered tanned skin, deep-set steel grey eyes, strong brow, square jaw, a few lines around the eyes. Muscular heavyset military-veteran build with a thick neck and broad shoulders. Serious composed expression, mouth closed, looking straight ahead in each view. Plain light grey seamless studio background, even soft frontal lighting. He wears a plain olive green crew-neck T-shirt. Framed head and shoulders. Sharp photorealistic casting-photo quality, consistent identity across all three views.",
});

await image({
  tag: "a2-seated",
  aspectRatio: "9:16",
  files: [a2Face, LOC],
  prompt:
    "The first reference image is the man's identity: a bald white man about 55 with a full thick grey beard, steel grey eyes and a muscular heavyset build. Retain his exact identity. The second reference image is the podcast room: warm red brick wall, wooden table, black boom microphones, warm directional lighting. Recreate that exact room.\n\nPlace him seated at the wooden table in that brick podcast room, wearing a multicam camouflage T-shirt with short sleeves showing muscular forearms. Vertical 9:16 medium close-up at eye level: he is framed from mid-torso up with his head fully in frame near the top, filling most of the frame height. A large black boom microphone enters from frame RIGHT near his mouth. His torso is angled slightly camera-right and he looks off-camera to the right at an unseen interviewer, not into the lens. Both hands rest loosely on the wooden tabletop, anatomically correct. Serious, calm, authoritative expression. Warm practical lighting, shallow depth of field with the brick wall softly blurred behind him. Photorealistic, sharp, documentary podcast still.",
});

console.log("\nAll cards written to cards/");
