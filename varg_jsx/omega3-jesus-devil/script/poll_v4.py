import json, subprocess

API_KEY = subprocess.check_output(
    "cd /Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ && grep VARG_API_KEY benchmark/.env | cut -d= -f2",
    shell=True, text=True
).strip()

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v4-jobs.json") as f:
    jobs = json.load(f)

results = {}
completed = 0
for tag, info in jobs.items():
    jid = info["job_id"]
    if jid == "ERR":
        results[tag] = {"status": "error", "url": "", "duration": info["duration"]}
        completed += 1
        continue
    r = subprocess.run(
        ["curl", "-s", f"https://api.varg.ai/v1/jobs/{jid}",
         "-H", f"Authorization: Bearer {API_KEY}"],
        capture_output=True, text=True
    )
    try:
        d = json.loads(r.stdout)
        status = d.get("status", "?")
        url = d.get("output", {}).get("url", "")
        results[tag] = {"status": status, "url": url, "duration": info["duration"]}
        if status in ("completed", "failed", "error"):
            completed += 1
    except:
        results[tag] = {"status": "parse_error", "url": "", "duration": info["duration"]}

print(f"Completed: {completed}/{len(jobs)}")
pending = [(t, r["status"]) for t, r in sorted(results.items()) if r["status"] not in ("completed", "failed", "error", "parse_error")]
if pending:
    print(f"Pending: {len(pending)}")
    for t, s in pending[:5]:
        print(f"  {t}: {s}")

with open("/Users/aleksandrmalysev/Yandex.Disk.localized/Developer/vargHQ/tmp/omega3-v4-results.json", "w") as f:
    json.dump(results, f, indent=2)
