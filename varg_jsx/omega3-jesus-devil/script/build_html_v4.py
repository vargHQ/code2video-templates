import json, re

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v3-results.json") as f:
    v3 = json.load(f)

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v4-results.json") as f:
    v4 = json.load(f)

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-regen-smart.json") as f:
    plan = json.load(f)

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v3-scenes.json") as f:
    scenes_data = json.load(f)

# Build lookup: tag → (url, duration) from v3 (keep) or v4 (regen/splits)
keep_tags = set(plan["keep"])
regen_tags = {s["tag"]: s["duration"] for s in plan["regen"]}

# Build final scene list
# For keep scenes: use v3 url + v3 duration
# For regen scenes: use v4 url + new duration
# For split scenes: use v4 url for both parts + their durations

# Original scene metadata (tag, speaker, line, shot)
scenes_meta = [
    ("1.1", "jesus", '"Nine out of ten people watching this are deficient in something that could save their heart. Want to guess what?"', "Jesus"),
    ("1.2", "devil", '"Oh, I love this game. It\'s Omega-3, right? Everyone says Omega-3. But here\'s what nobody mentions — Omega-6 does the same job, and it\'s already in everything you eat. Why supplement something you\'re already getting?"', "Devil"),
    ("1.3", "jesus", '"Because \'already getting it\' doesn\'t mean \'enough of it.\'"', "Jesus"),
    ("1.4", "devil", '"Exactly! You\'re already getting too much. Dr. Layne Norton did a meta-analysis — polyunsaturated fats lower cancer mortality by 6%. Omega-6 IS a polyunsaturated fat. The science literally says it\'s good for you. Why are we fixing what isn\'t broken?"', "Devil"),
    ("1.5", "jesus", '"Wait. That study compared polyunsaturated fats to saturated fats. Not Omega-6 to Omega-3."', "Jesus"),
    ("1.6", "devil", '"Tomato, tomato. They\'re both PUFAs. Your body doesn\'t read the label."', "Devil"),
    ("1.7", "truth", '"Okay, I conflated two things. Classic move. Here\'s what\'s actually happening — Omega-6 and Omega-3 are both essential. But they\'re not the same. Omega-6 produces inflammatory prostaglandins. Omega-3 produces anti-inflammatory ones. You need both. But the ratio? Western diet is 20 to 1. Should be 4 to 1."', "Truth"),
    ("1.8", "truth", '"At 20 to 1, your body is in constant low-grade inflammation. That\'s not my opinion — that\'s basic biochemistry. Every cell membrane is packed with Omega-6, and the inflammatory cascade never stops."', "Truth"),
    ("1.9", "truth", '"So here\'s what actually works: cut seed oils — soybean, corn, sunflower. Eat sardines twice a week. Take one gram of EPA plus DHA daily. Get your Omega-3 index tested. Aim for 8 to 12 percent. That\'s it. That\'s the whole thing."', "Truth"),
    ("2.1", "jesus", '"A Harvard study followed 25,000 people for five years. One capsule a day. 28% fewer heart attacks. Is that real, or is that statistics?"', "Jesus"),
    ("2.2", "devil", '"It\'s statistics. 28% relative risk sounds impressive. But the absolute risk? Tiny. The difference between \'very few\' and \'slightly fewer very few\' — that\'s your miracle."', "Devil"),
    ("2.3", "jesus", '"So you\'re saying Harvard wasted five years on nothing?"', "Jesus"),
    ("2.4", "devil", '"Not nothing — just overhyped. Physionic reviewed 47 studies. \'Small to moderate effect.\' Even Mayo Clinic was lukewarm. When the Mayo Clinic says \'meh\' about a supplement, maybe listen."', "Devil"),
    ("2.5", "jesus", '"But Bill Harris — the guy who invented the Omega-3 index — showed people with the highest index had 35% lower heart disease risk. That\'s not \'small to moderate.\' That\'s a sledgehammer."', "Jesus"),
    ("2.6", "devil", '"Bill Harris sells the test. Conflict of interest. Next."', "Devil"),
    ("2.7", "truth", '"Okay, the Harris study is legit. Peer-reviewed, used worldwide. The Omega-3 index predicts cardiovascular death better than cholesterol. 35% lower risk, 15 to 18% lower all-cause mortality. I dismissed it because Harris sells the test — but the test works whether he sells it or not."', "Truth"),
    ("2.8", "truth", '"And that Physionic review I cited? It included low-quality studies with low doses and low bioavailability. Garbage in, garbage out. The VITAL trial used 1 gram daily across 25,871 people for 5 years — zero safety signals. Not \'some.\' Zero. 28% fewer heart attacks. That\'s not statistics. That\'s science."', "Truth"),
    ("2.9", "truth", '"One gram of EPA plus DHA daily. That\'s the VITAL dose. If you have high triglycerides, your doctor may prescribe 3 to 4 grams. Get your Omega-3 index tested — aim for 8 to 12 percent. The US average is 5.4. That\'s not \'fine.\' That\'s deficient."', "Truth"),
    ("3.1", "jesus", '"Your brain is 60% fat. A third of that fat is Omega-3. What happens when you don\'t have enough?"', "Jesus"),
    ("3.2", "devil", '"Nothing dramatic. You forget where you put your keys. Same as everyone else. The brain is resilient — it converts ALA from flax seeds into DHA. Slow, but it works. You don\'t need fish."', "Devil"),
    ("3.3", "jesus", '"The conversion rate is under 5 percent."', "Jesus"),
    ("3.4", "devil", '"5% of a lot is still enough. Your body is smart. It regulates itself. Trust the process."', "Devil"),
    ("3.5", "jesus", '"The VITAL trial showed a 22% reduction in dementia symptoms. DHA is 97% of the Omega-3 in your brain. You\'re saying that\'s all... flax seeds?"', "Jesus"),
    ("3.6", "devil", '"You know what else reduces dementia symptoms? Exercise. Sleep. Not being stressed. But those are free. You can\'t sell \'go for a walk\' in a capsule."', "Devil"),
    ("3.7", "truth", '"He\'s right that exercise and sleep matter. But DHA isn\'t just \'in\' the brain — it IS the brain. It prevents brain shrinkage. Dr. Michael Nelson at Karolinska showed Omega-3 regulates glial cells — the brain\'s immune cells — which clear beta-amyloid plaques. The literal hallmark of Alzheimer\'s."', "Truth"),
    ("3.8", "truth", '"And that 5% conversion I mentioned? For vegans, it\'s even worse. You\'d need to eat a mountain of flax seeds to get the DHA in one can of sardines. \'Trust the process\'? The process converts 5%. That\'s not a process — that\'s a leak."', "Truth"),
    ("3.9", "truth", '"For brain health, prioritize DHA. One gram of EPA plus DHA daily — the VITAL dose. If you\'re vegan, use algae-based DHA. Not flax oil — the conversion is too low. Dr. Sara Gottfried recommends an Omega-3 test for anyone with mood, focus, or memory issues, especially ages 35 to 50."', "Truth"),
    ("4.1", "jesus", '"Can something this good actually hurt you? What\'s the catch?"', "Jesus"),
    ("4.2", "devil", '"Oh, NOW you\'re asking the right question. Yes! Doses over 3 grams — atrial fibrillation. Especially if you already have heart disease. Siim Land himself warned about this. Omega-3 is a blood thinner. High doses, bleeding risk. This isn\'t a harmless supplement — it\'s pharmacologically active."', "Devil"),
    ("4.3", "jesus", '"That sounds serious. How much is too much?"', "Jesus"),
    ("4.4", "devil", '"That\'s the problem — nobody agrees. Some say 1 gram, some say 3, some say 4. If experts can\'t agree, why risk it? I\'ve seen people on high-dose Omega-3 who bruise from nothing."', "Devil"),
    ("4.5", "jesus", '"But the VITAL trial — 25,000 people, 1 gram daily, 5 years — zero safety signals. You just told me that."', "Jesus"),
    ("4.6", "devil", '"That was a different question. Now we\'re talking about risks. Different context. Don\'t mix contexts."', "Devil"),
    ("4.7", "truth", '"Credit where due — this one is partially true. Doses over 3 grams CAN increase atrial fibrillation risk, especially with existing heart disease. That\'s real. But here\'s what I left out: the VITAL trial used 1 gram daily across 25,871 people for 5 years. Zero safety signals. The fibrillation risk is specific to high doses in heart patients."', "Truth"),
    ("4.8", "truth", '"For healthy people, 1 to 2 grams daily is extremely safe. The 3 to 4 gram dose is prescribed by doctors for high triglycerides — that\'s a medical intervention, not self-supplementation. I took a real but specific risk and amplified it to make ALL Omega-3 sound dangerous. Classic: grain of truth, mountain of fear."', "Truth"),
    ("4.9", "truth", '"1 to 1.5 grams of EPA plus DHA daily — safe for almost everyone. If you have heart disease, talk to your doctor before exceeding 1 gram. If you\'re on blood thinners, consult your doctor. Don\'t skip Omega-3 because of a risk that applies to 3 grams plus in heart patients."', "Truth"),
    ("5.1", "jesus", '"Fish oil, algae oil, krill oil — does it matter, or is it all the same molecule?"', "Jesus"),
    ("5.2", "devil", '"It\'s all EPA and DHA. Your body doesn\'t care if it came from a fish, a plant, or a lab. Just buy whatever\'s cheapest. Actually — skip supplements entirely. Eat fish. But not too much fish, because mercury. So... you\'re stuck."', "Devil"),
    ("5.3", "jesus", '"That\'s a circular argument. \'Fish has mercury, supplements are scams, so do nothing.\'"', "Jesus"),
    ("5.4", "devil", '"Life is circular, my friend. Pick your poison."', "Devil"),
    ("5.5", "truth", '"Source matters a lot. Fish oil contains biogenic amines — histamine triggers. Siim Land explained this: in histamine-sensitive people, fish oil causes palpitations and headaches. Algae-based Omega-3 skips that entirely. Same EPA and DHA, no amines."', "Truth"),
    ("5.6", "truth", '"Then there\'s the form. Triglyceride form has 70% better bioavailability than ethyl ester. JJ Virgin confirmed TG form is preferred. Enteric-coated capsules prevent fish burps. Distilled oil removes PCBs and dioxins. And the mercury argument? Sardines and mackerel are LOW mercury. FDA confirms this."', "Truth"),
    ("5.7", "truth", '"If you tolerate fish oil, choose triglyceride-form, enteric-coated, molecularly distilled. If you\'re histamine-sensitive, switch to algae-based. If you\'re vegan, algae oil is your only direct EPA/DHA source — flax converts at under 5%. Eat sardines twice a week — they\'re cheap, low-mercury, and packed with Omega-3."', "Truth"),
    ("6.1", "jesus", '"If someone watching this wants to start today — what\'s the number?"', "Jesus"),
    ("6.2", "devil", '"Zero. But if you insist — take the smallest dose you can find. 200 milligrams. It won\'t do anything anyway. Or better yet — just eat a \'balanced diet.\'"', "Devil"),
    ("6.3", "jesus", '"\'Balanced diet\' — that phrase covers everything and means nothing."', "Jesus"),
    ("6.4", "devil", '"\'Balanced diet.\' My favorite words in the English language."', "Devil"),
    ("6.5", "jesus", '"You really don\'t want people taking Omega-3, do you?"', "Jesus"),
    ("6.6", "devil", '"I just want people to be... free. Free from overthinking. Free from supplements. Free from worry."', "Devil"),
    ("6.7", "truth", '"Here\'s the honest answer. General health: 1 gram of EPA plus DHA daily. That\'s the VITAL trial dose — 25,871 people, 28% fewer heart attacks, 22% fewer dementia symptoms. Optimal Omega-3 index: 1.5 grams daily plus fish twice a week. High triglycerides: 3 to 4 grams — but that\'s a medical dose, not self-medication."', "Truth"),
    ("6.8", "truth", '"Mood and brain: 1 to 2 grams daily. EPA for mood, DHA for cognition. Vegans: algae-based, not flax. Safety ceiling: don\'t exceed 3 grams without a doctor, especially with heart disease."', "Truth"),
    ("6.9", "truth", '"\'Zero\' is never the right answer. \'Balanced diet\' is what I say when I want people to do nothing. The most effective lie isn\'t the dramatic one — it\'s the quiet one. \'You don\'t need it.\' That\'s the one that kills slowly."', "Truth"),
    ("6.10a", "jesus", '"You know... every time I ask you about something good for people, you have the same answer. \'You don\'t need it.\' \'It\'s overrated.\' \'Just eat balanced.\' You always cite a real study — but you twist it."', "Jesus"),
    ("6.10b", "devil", '"I\'m a minimalist."', "Devil"),
    ("6.10c", "jesus", '"You\'re something, alright."', "Jesus"),
    ("6.10d", "truth", '"He\'s learning. I need to work faster."', "Truth"),
]

# Build split text lookup
split_map = {}
for s in plan["splits"]:
    tag = s["tag"]
    words = s["part1"]["text"].split() + s["part2"]["text"].split()
    # We need to split the original dialogue
    # Get original dialogue from scenes_meta
    for t, spk, line, shot in scenes_meta:
        if t == tag:
            # Remove quotes
            dialogue = line.strip('"')
            words = dialogue.split()
            mid = len(words) // 2
            split_map[tag] = {
                "part1_text": " ".join(words[:mid]),
                "part2_text": " ".join(words[mid:]),
                "part1_dur": s["part1"]["duration"],
                "part2_dur": s["part2"]["duration"],
            }
            break

# Build final scene list
final_scenes = []
for tag, speaker, line, shot in scenes_meta:
    if tag in keep_tags:
        # Keep from v3
        url = v3.get(tag, {}).get("url", "")
        dur = v3.get(tag, {}).get("duration", 5)
        final_scenes.append((tag, speaker, line, shot, url, dur))
    elif tag in regen_tags:
        # Regen from v4
        url = v4.get(tag, {}).get("url", "")
        dur = regen_tags[tag]
        final_scenes.append((tag, speaker, line, shot, url, dur))
    elif tag in split_map:
        # Split into 2
        sm = split_map[tag]
        url_a = v4.get(f"{tag}a", {}).get("url", "")
        url_b = v4.get(f"{tag}b", {}).get("url", "")
        final_scenes.append((f"{tag}a", speaker, f'"{sm["part1_text"]}"', shot, url_a, sm["part1_dur"]))
        final_scenes.append((f"{tag}b", speaker, f'"{sm["part2_text"]}"', shot, url_b, sm["part2_dur"]))
    else:
        # Fallback to v3
        url = v3.get(tag, {}).get("url", "")
        dur = v3.get(tag, {}).get("duration", 5)
        final_scenes.append((tag, speaker, line, shot, url, dur))

# Build HTML
questions = {
    "1": "Is Omega-3 even important?",
    "2": "Does Omega-3 actually help your heart?",
    "3": "What about the brain? Dementia? Alzheimer's?",
    "4": "Can you take too much? What are the risks?",
    "5": "Fish oil vs algae — does source matter?",
    "6": "How much should I take daily?",
}

speaker_names = {"jesus": "JESUS", "devil": "DEVIL", "truth": "DEVIL (to camera)"}

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Omega-3: Jesus vs Devil — Final Episode</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #0a0a0a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; padding: 40px 20px; }}
  h1 {{ text-align: center; font-size: 28px; margin-bottom: 6px; }}
  .subtitle {{ text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }}
  .controls {{ max-width: 1200px; margin: 0 auto 24px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }}
  .controls button {{ background: #1a1a1a; color: #e0e0e0; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; }}
  .controls button:hover {{ background: #2a2a2a; border-color: #555; }}
  .controls button.primary {{ background: #ff6b6b; border-color: #ff6b6b; color: white; font-weight: 600; }}
  .controls button.primary:hover {{ background: #ff5252; }}
  .question {{ max-width: 1200px; margin: 0 auto 30px; }}
  .question-header {{ padding: 14px 20px; background: #151515; border-radius: 12px 12px 0 0; border: 1px solid #222; border-bottom: none; font-size: 18px; font-weight: 600; color: #e0e0e0; }}
  .question-header .qnum {{ color: #ff6b6b; margin-right: 8px; }}
  .storyboard {{ display: flex; flex-direction: column; gap: 2px; background: #151515; border-radius: 0 0 12px 12px; border: 1px solid #222; border-top: none; overflow: hidden; }}
  .scene {{ display: flex; gap: 0; background: #141414; border-bottom: 1px solid #1a1a1a; }}
  .scene:last-child {{ border-bottom: none; }}
  .scene.truth {{ background: #0d1520; }}
  .scene-num {{ flex-shrink: 0; width: 55px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #444; }}
  .scene.truth .scene-num {{ color: #4a9eff; }}
  .scene:not(.truth) .scene-num {{ color: #555; }}
  .scene-video {{ flex-shrink: 0; width: 280px; height: 158px; object-fit: cover; background: #000; }}
  .scene-body {{ flex: 1; padding: 12px 18px; display: flex; flex-direction: column; justify-content: center; }}
  .scene-tag {{ font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }}
  .scene.truth .scene-tag {{ color: #4a9eff; }}
  .scene:not(.truth) .scene-tag.jesus {{ color: #ffd93d; }}
  .scene:not(.truth) .scene-tag.devil {{ color: #ff6b6b; }}
  .scene-line {{ font-size: 13px; line-height: 1.5; color: #ccc; }}
  .scene-line .speaker {{ font-weight: 700; }}
  .jesus-text {{ color: #ffd93d; }}
  .devil-text {{ color: #ff6b6b; }}
  .truth-text {{ color: #4a9eff; }}
  .scene-duration {{ flex-shrink: 0; align-self: center; padding: 0 14px; font-size: 11px; color: #444; white-space: nowrap; }}
  .total-bar {{ max-width: 1200px; margin: 30px auto 0; padding: 16px 24px; background: #151515; border-radius: 12px; text-align: center; font-size: 14px; color: #888; }}
  .total-bar strong {{ color: #e0e0e0; }}
  video {{ cursor: pointer; }}
</style>
</head>
<body>

<h1>Omega-3: Jesus vs Devil — Final</h1>
<p class="subtitle">{len(final_scenes)} scenes · 6 questions · duration matched to speech rate · H3 Max · native audio</p>

<div class="controls">
  <button class="primary" onclick="playAll()">▶ Play Full Episode</button>
  <button onclick="playQuestion(1)">Q1</button>
  <button onclick="playQuestion(2)">Q2</button>
  <button onclick="playQuestion(3)">Q3</button>
  <button onclick="playQuestion(4)">Q4</button>
  <button onclick="playQuestion(5)">Q5</button>
  <button onclick="playQuestion(6)">Q6</button>
  <button onclick="stopAll()">⏹ Stop</button>
</div>

"""

current_q = None
total_dur = 0
for tag, speaker, line, shot, url, dur in final_scenes:
    q = tag.split(".")[0]
    if q != current_q:
        if current_q is not None:
            html += "  </div>\n</div>\n\n"
        current_q = q
        qtitle = questions.get(q, "Outro")
        html += f'<div class="question">\n  <div class="question-header"><span class="qnum">Q{q}</span>{qtitle}</div>\n  <div class="storyboard">\n'

    is_truth = speaker == "truth"
    spk_label = speaker_names.get(speaker, speaker.upper())
    spk_class = "truth" if is_truth else speaker
    spk_text_class = "truth-text" if is_truth else f"{speaker}-text"
    spk_display = "DEVIL" if is_truth else spk_label
    total_dur += dur

    html += f"""    <div class="scene{' truth' if is_truth else ''}">
      <div class="scene-num">{tag}</div>
      <video class="scene-video" src="{url}" preload="none" playsinline></video>
      <div class="scene-body">
        <div class="scene-tag {spk_class}">{shot}</div>
        <div class="scene-line"><span class="speaker {spk_text_class}">{spk_display}:</span> {line}</div>
      </div>
      <div class="scene-duration">{dur}s</div>
    </div>
"""

total_min = total_dur // 60
total_sec = total_dur % 60

html += f"""  </div>
</div>

<div class="total-bar">
  <strong>{len(final_scenes)} videos</strong> · total <strong>{total_min}m {total_sec}s</strong> · H3 Max · native audio
</div>

<script>
  const videos = document.querySelectorAll('video');
  let playing = false;
  let queue = [];
  let currentIdx = 0;

  function stopAll() {{ playing = false; videos.forEach(v => {{ v.pause(); v.currentTime = 0; }}); }}
  function playQueue() {{
    if (!playing || currentIdx >= queue.length) {{ playing = false; return; }}
    videos.forEach(v => v.pause());
    const v = queue[currentIdx];
    v.currentTime = 0; v.muted = false; v.play();
    v.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
    v.onended = () => {{ currentIdx++; setTimeout(playQueue, 300); }};
  }}
  function playAll() {{ stopAll(); queue = Array.from(videos); currentIdx = 0; playing = true; playQueue(); }}
  function playQuestion(q) {{
    stopAll();
    queue = Array.from(document.querySelectorAll('.scene-video')).filter(v => {{
      const scene = v.closest('.scene');
      return scene.querySelector('.scene-num').textContent.startsWith(q + '.');
    }});
    currentIdx = 0; playing = true; playQueue();
  }}
</script>
</body>
</html>
"""

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-episode-final-v4.html", "w") as f:
    f.write(html)

print(f"HTML written: tmp/omega3-episode-final-v4.html")
print(f"Total scenes: {len(final_scenes)}")
print(f"Total duration: {total_min}m {total_sec}s")
