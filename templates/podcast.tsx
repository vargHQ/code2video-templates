/** @jsxImportSource vargai */
// Podcast — Two AI Characters in Conversation
//
// Full pipeline: portraits + room → scene composite → closeups →
// per-line speech (ElevenLabs, different voices) → VEED Fabric lipsync →
// Kling v3 establishing shot → compose with music + fade transitions.
//
// Two speakers alternate. Each dialogue line is a separate lipsync clip.
// Fade transitions only on speaker changes; hard cuts within same speaker.
// Music ducks under speech automatically.
//
// Edit CONFIG to change characters, voices, dialogue, and music mood.
//
// Usage: bun run render templates/podcast.tsx

import { createVarg, elevenlabs } from "vargai/ai";
import { Clip, Image, Music, Render, render, Speech, Video } from "vargai/react";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Config ───────────────────────────────────────────────────────────────
const CONFIG = {
  host: {
    description:
      "Professional woman podcast host, mid-30s, confident warm smile, dark blazer over white shirt",
    voice: "l4Coq6695JDX9xtLqXDE",
  },
  guest: {
    description:
      "Tech entrepreneur man, late-20s, friendly intelligent face, casual dark hoodie",
    voice: "bDTlr4ICxntY9qVWyL0o",
  },
  room: "Modern podcast studio interior, two comfortable chairs facing each other, warm ambient lighting, professional microphones on boom arms, acoustic panels on walls, cozy atmosphere",
  musicPrompt:
    "warm lo-fi podcast background beat, gentle ambient, subtle and unobtrusive, conversational mood",
  dialogue: [
    {
      speaker: "host" as const,
      text: "Welcome to the show! Today we have a very special guest joining us to talk about AI video generation.",
    },
    {
      speaker: "guest" as const,
      text: "Thanks for having me! It's great to be here. This is such a fascinating topic right now.",
    },
    {
      speaker: "host" as const,
      text: "So tell us, what first got you interested in AI-generated video?",
    },
    {
      speaker: "guest" as const,
      text: "Well, it all started when I saw how far the technology had come. You can literally turn a single photo into a talking person now. It blew my mind.",
    },
  ],
};

// ── Portraits (text-to-image → nano-banana-pro) ─────────────────────────
const hostPortrait = Image({
  prompt: `${CONFIG.host.description}, studio portrait, warm lighting, clean background`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "1:1",
});

const guestPortrait = Image({
  prompt: `${CONFIG.guest.description}, studio portrait, warm lighting, clean background`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "1:1",
});

// ── Room (text-to-image → nano-banana-pro) ──────────────────────────────
const room = Image({
  prompt: `${CONFIG.room}, wide establishing shot, no people`,
  model: varg.imageModel("nano-banana-pro"),
  aspectRatio: "16:9",
});

// ── Scene composite (edit → nano-banana-2) ──────────────────────────────
const scene = Image({
  prompt: {
    text: "Two people sitting in a modern podcast studio having a conversation, the woman host on the left chair and the man guest on the right chair, both with microphones, warm lighting, professional setup, wide establishing shot",
    images: [room],
  },
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9",
});

// ── Opening Kling clip (3s establishing shot) ───────────────────────────
const openingClip = Video({
  prompt: {
    text: "Two people in a podcast studio, they look at each other and smile naturally, subtle head movements, warm intimate atmosphere, cinematic",
    images: [scene],
  },
  model: varg.videoModel("kling-v3"),
  keepAudio: false, // MUTED — dialogue lives in the lipsync clips that follow
  duration: 3,
});

// ── Closeups (edit → nano-banana-2) ─────────────────────────────────────
const hostCloseup = Image({
  prompt: {
    text: "Close-up of the woman podcast host sitting in the studio, warm lighting, speaking into microphone, engaged confident expression, podcast room background slightly blurred, medium-close shot framing",
    images: [scene],
  },
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9",
});

const guestCloseup = Image({
  prompt: {
    text: "Close-up of the man guest sitting in the podcast studio, warm lighting, speaking into microphone, thoughtful animated expression, podcast room background slightly blurred, medium-close shot framing",
    images: [scene],
  },
  model: varg.imageModel("nano-banana-2"),
  aspectRatio: "16:9",
});

// ── Generate speech + lipsync per dialogue line ─────────────────────────
const lines = await Promise.all(
  CONFIG.dialogue.map(async (turn) => {
    const voice =
      turn.speaker === "host" ? CONFIG.host.voice : CONFIG.guest.voice;
    const speech = await Speech({
      voice,
      model: elevenlabs.speechModel("eleven_v3"),
      children: turn.text,
    });
    const closeup = turn.speaker === "host" ? hostCloseup : guestCloseup;
    const video = Video({
      model: varg.videoModel("veed-fabric-1.0"),
      keepAudio: true,
      prompt: { images: [closeup], audio: speech },
      providerOptions: { varg: { resolution: "720p" } },
    });
    return { ...turn, speech, video };
  }),
);

// ── Total duration for music ────────────────────────────────────────────
const totalDuration =
  3 + lines.reduce((sum, l) => sum + l.speech.duration, 0);

// ── Composition ─────────────────────────────────────────────────────────
const demo = (
  <Render width={1920} height={1080}>
    <Music
      prompt={CONFIG.musicPrompt}
      model={varg.musicModel("music_v1")}
      volume={0.08}
      ducking
      duration={totalDuration}
    />

    {/* Opening: establishing shot */}
    <Clip duration={3} cutFrom={0.3} cutTo={3.3}>
      {openingClip}
    </Clip>

    {/* Dialogue: alternating speakers with fade on speaker change */}
    {lines.map((line, i) => {
      const prevSpeaker = i > 0 ? lines[i - 1].speaker : null;
      const speakerChanged =
        prevSpeaker !== null && prevSpeaker !== line.speaker;
      return (
        <Clip
          key={i}
          duration={line.speech.duration}
          transition={
            speakerChanged ? { name: "fade", duration: 0.3 } : undefined
          }
        >
          {line.video}
        </Clip>
      );
    })}
  </Render>
);

// ── Run ─────────────────────────────────────────────────────────────────
async function main() {
  const result = await render(demo, {
    output: "output/podcast.mp4",
    cache: ".cache/ai-podcast-v1",
  });

  console.log(
    `Done: output/podcast.mp4 (${(result.video.byteLength / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
