import json, subprocess, re

API_KEY = subprocess.check_output(
    "cd /Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ && grep VARG_API_KEY benchmark/.env | cut -d= -f2",
    shell=True, text=True
).strip()

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-regen-smart.json") as f:
    plan = json.load(f)

def submit(prompt, ref, duration, tag):
    body = json.dumps({
        "model": "minimax_h3_max",
        "prompt": prompt,
        "files": [{"url": ref}],
        "duration": duration,
        "aspect_ratio": "16:9",
        "provider_options": {"varg": {"generate_audio": True}}
    })
    r = subprocess.run(
        ["curl", "-s", "-X", "POST", "https://api.varg.ai/v1/video",
         "-H", f"Authorization: Bearer {API_KEY}",
         "-H", "Content-Type: application/json",
         "-d", body],
        capture_output=True, text=True
    )
    try:
        d = json.loads(r.stdout)
        jid = d.get("job_id", "ERR")
        print(f"  {tag}: {jid} ({duration}s)")
        return jid
    except:
        print(f"  {tag}: PARSE_ERR {r.stdout[:80]}")
        return "ERR"

results = {}

# 1. Regen scenes with longer duration
print("=== REGEN (longer duration) ===")
for s in plan["regen"]:
    jid = submit(s["prompt"], s["ref"], s["duration"], s["tag"])
    results[s["tag"]] = {"job_id": jid, "duration": s["duration"], "type": "regen"}

# 2. Split scenes into 2 parts
print("\n=== SPLITS (2 parts each) ===")
for s in plan["splits"]:
    tag = s["tag"]
    ref = s["ref"]
    pre = s["pre_action"]  # action text before "says:"
    p1_text = s["part1"]["text"]
    p2_text = s["part2"]["text"]
    d1 = s["part1"]["duration"]
    d2 = s["part2"]["duration"]
    
    # Build prompts: pre_action + says: "part_text"
    prompt1 = f'{pre} says: "{p1_text}"'
    prompt2 = f'{pre} says: "{p2_text}"'
    
    tag_a = f"{tag}a"
    tag_b = f"{tag}b"
    
    jid1 = submit(prompt1, ref, d1, tag_a)
    jid2 = submit(prompt2, ref, d2, tag_b)
    
    results[tag_a] = {"job_id": jid1, "duration": d1, "type": "split_a"}
    results[tag_b] = {"job_id": jid2, "duration": d2, "type": "split_b"}

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v4-jobs.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\nSubmitted {len(results)} jobs")
