import json, re

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v3-scenes.json") as f:
    scenes = json.load(f)

def get_dialogue(prompt):
    m = re.search(r'says:\s*"(.*?)"', prompt)
    if m:
        return m.group(1)
    return prompt

MAX_WORDS_15S = 24  # (15-2)s * 1.8 w/s

def safe_dur(text):
    words = len(text.split())
    d = max(5, min(15, round(words / 1.8) + 2))
    return d

print(f"{'Tag':<8} {'Words':>5} {'Old':>4} {'w/s':>5} {'Action':>12}")
print("-" * 45)

keep = []
regen = []
splits = []

for s in scenes:
    tag = s["tag"]
    old_dur = s["duration"]
    dialogue = get_dialogue(s["prompt"])
    words = len(dialogue.split())
    wps = words / old_dur  # words per second
    
    if words > MAX_WORDS_15S:
        action = "SPLIT"
        splits.append(s)
    elif wps > 2.0:
        need = safe_dur(dialogue)
        action = f"REGEN {need}s"
        s["new_duration"] = need
        regen.append(s)
    else:
        action = "keep"
        keep.append(s)
    
    print(f"{tag:<8} {words:>5} {old_dur:>3}s {wps:>5.1f} {action:>12}")

total_new = len(keep) + len(regen) + len(splits) * 2
regen_cost = sum(s["new_duration"] * 8 for s in regen)
split_cost = 0
for s in splits:
    dialogue = get_dialogue(s["prompt"])
    words = dialogue.split()
    mid = len(words) // 2
    p1 = " ".join(words[:mid])
    p2 = " ".join(words[mid:])
    split_cost += (safe_dur(p1) + safe_dur(p2)) * 8

print(f"\nKeep: {len(keep)}")
print(f"Regen: {len(regen)} (~${regen_cost/100:.2f})")
print(f"Splits: {len(splits)} → {len(splits)*2} (~${split_cost/100:.2f})")
print(f"Total new scenes: {total_new}")
print(f"Total cost: ~${(regen_cost+split_cost)/100:.2f}")

# Save
output = {
    "keep": [s["tag"] for s in keep],
    "regen": [{"tag": s["tag"], "ref": s["ref"], "prompt": s["prompt"], "duration": s["new_duration"]} for s in regen],
    "splits": []
}
for s in splits:
    dialogue = get_dialogue(s["prompt"])
    words = dialogue.split()
    mid = len(words) // 2
    p1 = " ".join(words[:mid])
    p2 = " ".join(words[mid:])
    d1 = safe_dur(p1)
    d2 = safe_dur(p2)
    
    # Build prompts for each part
    prompt = s["prompt"]
    pre = prompt.split('says:')[0].strip()  # action before "says:"
    
    output["splits"].append({
        "tag": s["tag"],
        "ref": s["ref"],
        "original_prompt": s["prompt"],
        "pre_action": pre,  # action description before "says:"
        "part1": {"text": p1, "duration": d1},
        "part2": {"text": p2, "duration": d2},
    })

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-regen-smart.json", "w") as f:
    json.dump(output, f, indent=2)

print("\nSaved to tmp/omega3-regen-smart.json")
