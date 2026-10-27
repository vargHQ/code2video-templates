/** @jsxImportSource vargai */
// Omega-3: Jesus vs The Devil — Long-Form AI Podcast Template
//
// A 15-minute educational podcast generated entirely with MiniMax H3 Max.
// Each scene uses a character reference image + prompt with embedded dialogue.
// H3 Max generates native speech from the prompt text — no separate TTS.
//
// Structure: 78 scenes, 6 topics (Omega-3 ratio, heart, brain, risks, sources, dosing)
// Format: 1344x768, 24fps, ~15 minutes total
//
// Usage: bun run render templates/omega3-jesus-devil.tsx
//
// To create your own podcast with this template:
//   1. Replace SCENES with your own prompts + reference images
//   2. Keep duration matched to speech length (~1.8 words/sec + 2s buffer)
//   3. Use 3 reference images: one per "character" (jesus, devil, truth/narrator)
//   4. Max 24 words per 15s clip — split longer lines into multiple scenes
//   5. Each prompt includes physical action to avoid static shots
//
// Key techniques:
//   - Character consistency via reference images (same ref per character)
//   - Native audio: dialogue embedded in prompt, keepAudio: true
//   - cutFrom: trims 0.3s AI warm-up frames
//   - Cache: re-rendering hits cache — no re-generation cost

import { Render, Clip, Image, Video } from "vargai/react";
import { createVarg } from "vargai/ai";

const varg = createVarg({ apiKey: process.env.VARG_API_KEY! });

// ── Character Reference Images ───────────────────────────────────────────
// Pre-generated character stills hosted on S3 — used as image-to-video refs
// Jesus: long brown hair, beard, white robes
const JESUS_REF = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_94bff7aa9087.png";
// Devil: dark red suit, black shirt, smug expression
const DEVIL_REF = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_457b0750972c.png";
// Truth/Narrator: neutral studio shot for factual inserts
const TRUTH_REF = "https://s3.varg.ai/files/194b94d0-58ff-4e8b-91de-4f1959d04013/file_cabba4a3e2c5.png";

// Load as static images (no generation — these are pre-made reference stills)
const jesusImg = Image({ src: JESUS_REF });
const devilImg = Image({ src: DEVIL_REF });
const truthImg = Image({ src: TRUTH_REF });

const refBySpeaker: Record<string, typeof jesusImg> = {
  jesus: jesusImg,
  devil: devilImg,
  truth: truthImg,
};

// ── Scene Definitions ────────────────────────────────────────────────────
// Each scene: { speaker, prompt, duration }
// Prompt includes: physical action + spoken dialogue in quotes
// Duration: matched to speech length (~1.8 words/sec + 2s buffer, max 15s)

type Scene = { tag: string; speaker: "jesus" | "devil" | "truth"; prompt: string; duration: number };

const SCENES: Scene[] = [

  { tag: "1.1", speaker: "jesus", prompt: "The man in white robes leans forward and says: \"Nine out of ten people watching this are deficient in something that could save their heart. Want to guess what?\" He gestures with open hands, eyes scanning as if challenging the audience.", duration: 13 },
  { tag: "1.2a", speaker: "devil", prompt: "The man leans back with a knowing smile and says: \"Oh, I love this game. It's Omega-3, right? Everyone says Omega-3. But here's what nobody mentions —\"", duration: 11 },
  { tag: "1.2b", speaker: "devil", prompt: "The man leans back with a knowing smile and says: \"Omega-6 does the same job, and it's already in everything you eat. Why supplement something you're already getting?\"", duration: 12 },
  { tag: "1.3", speaker: "jesus", prompt: "The man in white robes tilts his head and says: \"Because 'already getting it' doesn't mean 'enough of it.'\" He raises one eyebrow, slight knowing smile.", duration: 5 },
  { tag: "1.4a", speaker: "devil", prompt: "The man gestures confidently and says: \"Exactly! You're already getting too much. Dr. Layne Norton did a meta-analysis — polyunsaturated fats lower cancer mortality by 6\"", duration: 13 },
  { tag: "1.4b", speaker: "devil", prompt: "The man gestures confidently and says: \"percent. Omega-6 IS a polyunsaturated fat. The science literally says it's good for you. Why are we fixing what isn't broken?\"", duration: 14 },
  { tag: "1.5", speaker: "jesus", prompt: "The man in white robes raises a finger and says: \"Wait. That study compared polyunsaturated fats to saturated fats. Not Omega-6 to Omega-3.\" He looks directly at the other person, catching the trick.", duration: 9 },
  { tag: "1.6", speaker: "devil", prompt: "The man smiles slowly and says: \"Tomato, tomato. They're both PUFAs. Your body doesn't read the label.\" He shrugs with both hands open, charming and dismissive.", duration: 8 },
  { tag: "1.7a", speaker: "truth", prompt: "The man turns to camera and says: \"Okay, I conflated two things. Classic move. Here's what's actually happening — Omega-6 and Omega-3 are both essential. But they're not the same. Omega-6\"", duration: 15 },
  { tag: "1.7b", speaker: "truth", prompt: "The man turns to camera and says: \"produces inflammatory prostaglandins. Omega-3 produces anti-inflammatory ones. You need both. But the ratio? Western diet is 20 to 1. Should be 4 to 1.\"", duration: 15 },
  { tag: "1.8a", speaker: "truth", prompt: "The man talks to camera and says: \"At 20 to 1, your body is in constant low-grade inflammation. That's not my opinion —\"", duration: 11 },
  { tag: "1.9a", speaker: "truth", prompt: "The man snaps fingers and says: \"So here's what actually works: cut seed oils — soybean, corn, sunflower. Eat sardines twice a week. Take one gram of\"", duration: 14 },
  { tag: "1.9b", speaker: "truth", prompt: "The man snaps fingers and says: \"EPA plus DHA daily. Get your Omega-3 index tested. Aim for 8 to 12 percent. That's it. That's the whole thing.\"", duration: 14 },
  { tag: "2.1a", speaker: "jesus", prompt: "The man in white robes leans forward and says: \"A Harvard study followed 25,000 people for five years. One capsule a\"", duration: 9 },
  { tag: "2.1b", speaker: "jesus", prompt: "The man in white robes leans forward and says: \"day. 28 percent fewer heart attacks. Is that real, or is that statistics?\"", duration: 9 },
  { tag: "2.2a", speaker: "devil", prompt: "The man waves hand dismissively and says: \"It's statistics. 28 percent relative risk sounds impressive. But the absolute risk? Tiny. You know how many people in that study\"", duration: 14 },
  { tag: "2.2b", speaker: "devil", prompt: "The man waves hand dismissively and says: \"actually had a heart attack? Very few. The difference between 'very few' and 'slightly fewer very few' — that's your miracle.\"", duration: 14 },
  { tag: "2.3", speaker: "jesus", prompt: "The man in white robes raises eyebrows and says: \"So you're saying Harvard wasted five years on nothing?\" He looks incredulous.", duration: 5 },
  { tag: "2.4a", speaker: "devil", prompt: "The man leans forward and says: \"Not nothing — just overhyped. Physionic reviewed 47 studies. Their conclusion? 'Small to moderate effect.'\"", duration: 10 },
  { tag: "2.4b", speaker: "devil", prompt: "The man leans forward and says: \"Even Mayo Clinic was lukewarm. When the Mayo Clinic says 'meh' about a supplement, maybe listen.\"", duration: 11 },
  { tag: "2.5a", speaker: "jesus", prompt: "The man in white robes counters and says: \"But Bill Harris — the guy who invented the Omega-3 index — showed people with the\"", duration: 11 },
  { tag: "2.5b", speaker: "jesus", prompt: "The man in white robes counters and says: \"highest index had 35 percent lower heart disease risk. That's not 'small to moderate.' That's a sledgehammer.\"", duration: 11 },
  { tag: "2.6", speaker: "devil", prompt: "The man waves hand and says: \"Bill Harris sells the test. Conflict of interest. Next.\" He flicks his wrist as if moving on.", duration: 5 },
  { tag: "2.7a", speaker: "truth", prompt: "The man turns to camera and says: \"Okay, the Harris study is legit. Peer-reviewed, used worldwide. The Omega-3 index predicts cardiovascular death better than cholesterol. 35 percent lower risk, 15 to\"", duration: 15 },
  { tag: "2.7b", speaker: "truth", prompt: "The man turns to camera and says: \"18 percent lower all-cause mortality. I dismissed it because Harris sells the test — but the test works whether he sells it or not.\"", duration: 15 },
  { tag: "2.8a", speaker: "truth", prompt: "The man talks to camera and says: \"And that Physionic review I cited? It included low-quality studies with low doses and low bioavailability. Garbage in, garbage out. The VITAL trial used 1\"", duration: 15 },
  { tag: "2.8b", speaker: "truth", prompt: "The man talks to camera and says: \"gram daily across 25,871 people for 5 years — zero safety signals. Not 'some.' Zero. 28 percent fewer heart attacks. That's not statistics. That's science.\"", duration: 15 },
  { tag: "2.9a", speaker: "truth", prompt: "The man says to camera: \"One gram of EPA plus DHA daily. That's the VITAL dose. If you have high triglycerides, your doctor may prescribe 3 to 4 grams. Get your Omega-3 index tested — aim for 8 to 12 percent. The US average is 5.4. That's not 'fine.' That's deficient.\" He points forward firmly. says: \"The man says to camera: \"One gram of EPA plus DHA daily. That's the VITAL dose. If you have high triglycerides, your doctor may prescribe 3 to\"", duration: 15 },
  { tag: "3.1", speaker: "jesus", prompt: "The man in white robes says: \"Your brain is 60 percent fat. A third of that fat is Omega-3. What happens when you don't have enough?\" He taps his temple, curious.", duration: 13 },
  { tag: "3.2a", speaker: "devil", prompt: "The man shrugs and says: \"Nothing dramatic. You forget where you put your keys. Same as everyone else. The brain is resilient\"", duration: 11 },
  { tag: "3.2b", speaker: "devil", prompt: "The man shrugs and says: \"— it converts ALA from flax seeds into DHA. Slow, but it works. You don't need fish.\"", duration: 11 },
  { tag: "3.3", speaker: "jesus", prompt: "The man in white robes says: \"The conversion rate is under 5 percent.\" He holds up five fingers.", duration: 5 },
  { tag: "3.4", speaker: "devil", prompt: "The man leans back and says: \"5 percent of a lot is still enough. Your body is smart. It regulates itself. Trust the process.\" He smiles confidently.", duration: 12 },
  { tag: "3.5a", speaker: "jesus", prompt: "The man in white robes leans forward and says: \"The VITAL trial showed a 22 percent reduction in dementia symptoms. DHA is\"", duration: 9 },
  { tag: "3.5b", speaker: "jesus", prompt: "The man in white robes leans forward and says: \"97 percent of the Omega-3 in your brain. You're saying that's all... flax seeds?\"", duration: 10 },
  { tag: "3.6a", speaker: "devil", prompt: "The man leans forward and says: \"You know what else reduces dementia symptoms? Exercise. Sleep. Not being stressed. But\"", duration: 9 },
  { tag: "3.6b", speaker: "devil", prompt: "The man leans forward and says: \"those are free. You can't sell 'go for a walk' in a capsule.\"", duration: 9 },
  { tag: "3.7a", speaker: "truth", prompt: "The man turns to camera and says: \"He's right that exercise and sleep matter. But DHA isn't just 'in' the brain — it IS the brain. It prevents brain shrinkage. Dr.\"", duration: 15 },
  { tag: "3.7b", speaker: "truth", prompt: "The man turns to camera and says: \"Michael Nelson at Karolinska showed Omega-3 regulates glial cells — the brain's immune cells — which clear beta-amyloid plaques. The literal hallmark of Alzheimer's.\"", duration: 15 },
  { tag: "3.8a", speaker: "truth", prompt: "The man says to camera: \"And that 5 percent conversion I mentioned? For vegans, it's even worse. You'd need to eat a mountain of flax seeds to get the DHA in one can of sardines. 'Trust the process'? The process converts 5 percent. That's not a process — that's a leak.\" He shakes head slowly. says: \"The man says to camera: \"And that 5 percent conversion I mentioned? For vegans, it's even worse. You'd need to eat a mountain of flax seeds to\"", duration: 15 },
  { tag: "3.8b", speaker: "truth", prompt: "The man says to camera: \"And that 5 percent conversion I mentioned? For vegans, it's even worse. You'd need to eat a mountain of flax seeds to get the DHA in one can of sardines. 'Trust the process'? The process converts 5 percent. That's not a process — that's a leak.\" He shakes head slowly. says: \"get the DHA in one can of sardines. 'Trust the process'? The process converts 5 percent. That's not a process — that's a leak.\" He shakes head slowly.\"", duration: 15 },
  { tag: "4.1", speaker: "jesus", prompt: "The man in white robes says: \"Can something this good actually hurt you? What's the catch?\" He leans forward with genuine curiosity.", duration: 5 },
  { tag: "4.2a", speaker: "devil", prompt: "The man lights up and says: \"Oh, NOW you're asking the right question. Yes! Doses over 3 grams — atrial fibrillation. Especially if you already have heart disease. Siim\"", duration: 15 },
  { tag: "4.2b", speaker: "devil", prompt: "The man lights up and says: \"Land himself warned about this. Omega-3 is a blood thinner. High doses, bleeding risk. This isn't a harmless supplement — it's pharmacologically active.\"", duration: 15 },
  { tag: "4.3", speaker: "jesus", prompt: "The man in white robes looks concerned and says: \"That sounds serious. How much is too much?\" He furrows brow.", duration: 5 },
  { tag: "4.4a", speaker: "devil", prompt: "The man spreads hands and says: \"That's the problem — nobody agrees. Some say 1 gram, some say 3, some say 4.\"", duration: 11 },
  { tag: "4.4b", speaker: "devil", prompt: "The man spreads hands and says: \"If experts can't agree, why risk it? I've seen people on high-dose Omega-3 who bruise from nothing.\"", duration: 11 },
  { tag: "4.5", speaker: "jesus", prompt: "The man in white robes says: \"But the VITAL trial — 25,000 people, 1 gram daily, 5 years — zero safety signals. You just told me that.\" He points at the other person.", duration: 14 },
  { tag: "4.6", speaker: "devil", prompt: "The man smiles and says: \"That was a different question. Now we're talking about risks. Different context. Don't mix contexts.\" He wags finger playfully.", duration: 10 },
  { tag: "4.7a", speaker: "truth", prompt: "The man turns to camera and says: \"Credit where due — this one is partially true. Doses over 3 grams CAN increase atrial fibrillation risk, especially with existing heart disease. That's real. But here's what I\"", duration: 15 },
  { tag: "4.7b", speaker: "truth", prompt: "The man turns to camera and says: \"left out: the VITAL trial used 1 gram daily across 25,871 people for 5 years. Zero safety signals. The fibrillation risk is specific to high doses in heart patients.\"", duration: 15 },
  { tag: "4.8a", speaker: "truth", prompt: "The man turns to camera and says: \"For healthy people, 1 to 2 grams daily is extremely safe. The 3 to 4 gram dose is prescribed by doctors for high triglycerides.\" He speaks directly, calm and honest, blue lighting.", duration: 10 },
  { tag: "4.8b", speaker: "truth", prompt: "The man talks to camera and says: \"That is a medical intervention, not self-supplementation. I took a real but specific risk and amplified it to make all Omega-3 sound dangerous. Classic. Grain of truth, mountain of fear.\" He pinches fingers, expression serious, blue lighting.", duration: 13 },
  { tag: "5.1", speaker: "jesus", prompt: "The man in white robes says: \"Fish oil, algae oil, krill oil — does it matter, or is it all the same molecule?\" He gestures as if weighing options.", duration: 11 },
  { tag: "5.2a", speaker: "devil", prompt: "The man waves hand and says: \"It's all EPA and DHA. Your body doesn't care if it came from a fish, a plant, or a lab.\"", duration: 13 },
  { tag: "5.2b", speaker: "devil", prompt: "The man waves hand and says: \"Just buy whatever's cheapest. Actually — skip supplements entirely. Eat fish. But not too much fish, because mercury. So... you're stuck.\"", duration: 14 },
  { tag: "5.3", speaker: "jesus", prompt: "The man in white robes says: \"That's a circular argument. 'Fish has mercury, supplements are scams, so do nothing.'\" He tilts head, catching the trap.", duration: 9 },
  { tag: "5.4", speaker: "devil", prompt: "The man smiles and says: \"Life is circular, my friend. Pick your poison.\" He leans back with a wide grin.", duration: 5 },
  { tag: "5.5a", speaker: "truth", prompt: "The man turns to camera and says: \"Source matters a lot. Fish oil contains biogenic amines — histamine triggers. Siim Land explained this: in histamine-sensitive\"", duration: 12 },
  { tag: "5.5b", speaker: "truth", prompt: "The man turns to camera and says: \"people, fish oil causes palpitations and headaches. Algae-based Omega-3 skips that entirely. Same EPA and DHA, no amines.\"", duration: 12 },
  { tag: "5.6a", speaker: "truth", prompt: "The man says to camera: \"Then there's the form. Triglyceride form has 70 percent better bioavailability than ethyl ester. JJ Virgin confirmed TG form is preferred. Enteric-coated capsules prevent fish burps. Distilled oil removes PCBs and dioxins. And the mercury argument? Sardines and mackerel are LOW mercury. FDA confirms this.\" He counts on fingers. says: \"The man says to camera: \"Then there's the form. Triglyceride form has 70 percent better bioavailability than ethyl ester. JJ Virgin confirmed TG form is preferred. Enteric-coated\"", duration: 15 },
  { tag: "5.6b", speaker: "truth", prompt: "The man says to camera: \"Then there's the form. Triglyceride form has 70 percent better bioavailability than ethyl ester. JJ Virgin confirmed TG form is preferred. Enteric-coated capsules prevent fish burps. Distilled oil removes PCBs and dioxins. And the mercury argument? Sardines and mackerel are LOW mercury. FDA confirms this.\" He counts on fingers. says: \"capsules prevent fish burps. Distilled oil removes PCBs and dioxins. And the mercury argument? Sardines and mackerel are LOW mercury. FDA confirms this.\" He counts on fingers.\"", duration: 15 },
  { tag: "5.7a", speaker: "truth", prompt: "The man says to camera: \"If you tolerate fish oil, choose triglyceride-form, enteric-coated, molecularly distilled. If you're histamine-sensitive, switch to algae-based. If you're vegan, algae oil is your only direct EPA/DHA source — flax converts at under 5 percent. Eat sardines twice a week — they're cheap, low-mercury, and packed with Omega-3.\" He points forward. says: \"The man says to camera: \"If you tolerate fish oil, choose triglyceride-form, enteric-coated, molecularly distilled. If you're histamine-sensitive, switch to algae-based. If you're vegan, algae oil is\"", duration: 15 },
  { tag: "6.1", speaker: "jesus", prompt: "The man in white robes says: \"If someone watching this wants to start today — what's the number?\" He leans forward, direct.", duration: 6 },
  { tag: "6.2a", speaker: "devil", prompt: "The man says: \"Zero. But if you insist — take the smallest dose you can find. 200\"", duration: 10 },
  { tag: "6.2b", speaker: "devil", prompt: "The man says: \"milligrams. It won't do anything anyway. Or better yet — just eat a 'balanced diet.'\"", duration: 10 },
  { tag: "6.3", speaker: "jesus", prompt: "The man in white robes says: \"'Balanced diet' — that phrase covers everything and means nothing.\" He shakes head slightly.", duration: 5 },
  { tag: "6.4", speaker: "devil", prompt: "The man breaks into a wide smile and says: \"'Balanced diet.' My favorite words in the English language.\" He savors the words.", duration: 5 },
  { tag: "6.5", speaker: "jesus", prompt: "The man in white robes presses and says: \"You really don't want people taking Omega-3, do you?\" He looks directly at the other person.", duration: 5 },
  { tag: "6.6", speaker: "devil", prompt: "The man pauses, then smiles and says: \"I just want people to be... free. Free from overthinking. Free from supplements. Free from worry.\" He spreads hands benevolently.", duration: 11 },
  { tag: "6.7a", speaker: "truth", prompt: "The man turns to camera, drops the smile and says: \"Here's the honest answer. General health: 1 gram of EPA plus DHA daily. That's the VITAL trial dose — 25,871 people, 28 percent fewer heart attacks, 22 percent\"", duration: 15 },
  { tag: "6.7b", speaker: "truth", prompt: "The man turns to camera, drops the smile and says: \"fewer dementia symptoms. Optimal Omega-3 index: 1.5 grams daily plus fish twice a week. High triglycerides: 3 to 4 grams — but that's a medical dose, not self-medication.\"", duration: 15 },
  { tag: "6.8a", speaker: "truth", prompt: "The man says to camera: \"Mood and brain: 1 to 2 grams daily. EPA for mood, DHA for cognition. Vegans: algae-based, not flax. Safety ceiling: don't exceed 3 grams without a doctor, especially with heart disease.\" He lists on fingers. says: \"The man says to camera: \"Mood and brain: 1 to 2 grams daily. EPA for mood, DHA for cognition. Vegans:\"", duration: 13 },
  { tag: "6.8b", speaker: "truth", prompt: "The man says to camera: \"Mood and brain: 1 to 2 grams daily. EPA for mood, DHA for cognition. Vegans: algae-based, not flax. Safety ceiling: don't exceed 3 grams without a doctor, especially with heart disease.\" He lists on fingers. says: \"algae-based, not flax. Safety ceiling: don't exceed 3 grams without a doctor, especially with heart disease.\" He lists on fingers.\"", duration: 13 },
  { tag: "6.9a", speaker: "truth", prompt: "The man says to camera: \"'Zero' is never the right answer. 'Balanced diet' is what I say when I want people to do nothing. The most effective lie isn't the dramatic one — it's the quiet one. 'You don't need it.' That's the one that kills slowly.\" He stares at camera, serious. says: \"The man says to camera: \"'Zero' is never the right answer. 'Balanced diet' is what I say when I want people to do nothing. The most\"", duration: 15 },
  { tag: "6.10b", speaker: "devil", prompt: "The man pauses, then says: \"I'm a minimalist.\" He smiles thinly.", duration: 5 },
  { tag: "6.10c", speaker: "jesus", prompt: "The man in white robes smiles gently and says: \"You're something, alright.\" He shakes head with warmth.", duration: 5 },
  { tag: "6.10d", speaker: "truth", prompt: "The man turns to camera and says: \"He's learning. I need to work faster.\" He exits frame.", duration: 5 },
];

// ── Build Clips ──────────────────────────────────────────────────────────
// Each scene becomes a Video() call with the character ref as image input
// H3 Max generates video + native speech from the prompt
const clips = SCENES.map((scene) => {
  const ref = refBySpeaker[scene.speaker];
  const video = Video({
    prompt: { text: scene.prompt, images: [ref] },
    model: varg.videoModel("minimax-h3-max"),
    duration: scene.duration,
    keepAudio: true, // native speech is the soundtrack
  });
  return (
    <Clip key={scene.tag} duration={scene.duration} cutFrom={0.3}>
      {video}
    </Clip>
  );
});

// ── Final Render ─────────────────────────────────────────────────────────
// 1344x768 (16:9 landscape), 24fps
// Total duration: ~15 minutes (78 scenes)
export default (
  <Render width={1344} height={768} fps={24}>
    {clips}
  </Render>
);
