#!/usr/bin/env python3
"""Get the media for a schizo-edit music video: the music, the stills and the animated clips.

Every item in the config that has a `url` is downloaded. Every item without one is generated on varg
(api.varg.ai/v2) and its url is written back into the config, so a second run never pays twice.

  python3 generate.py examples/halofall.json --project work/halofall          # downloads only, free
  python3 generate.py my.json --project work/my --only stills                  # generate the stills first
  python3 generate.py my.json --project work/my                                # then music + clips

API key: $VARG_API_KEY, else ~/.varg/credentials ({"api_key": ...}). Get one at https://varg.ai/dashboard/api
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

API = "https://api.varg.ai/v2"


def api_key():
    if os.environ.get("VARG_API_KEY"):
        return os.environ["VARG_API_KEY"]
    p = os.path.expanduser("~/.varg/credentials")
    if os.path.exists(p):
        return json.load(open(p))["api_key"]
    sys.exit("No varg API key: set VARG_API_KEY or create ~/.varg/credentials (https://varg.ai/dashboard/api)")


def req(method, path, body=None):
    r = urllib.request.Request(API + path, method=method,
                               data=json.dumps(body).encode() if body is not None else None,
                               headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"})
    try:
        return json.load(urllib.request.urlopen(r, timeout=60))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()[:400]}")


def run_job(tool, body, timeout_s=900):
    """Submit one generation and wait for it. Returns the output url. Failed jobs are not billed."""
    job = req("POST", f"/{tool}", body)
    jid = job["id"]
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        job = req("GET", f"/jobs/{jid}")
        if job["status"] in ("completed", "failed", "cancelled"):
            break
        time.sleep(4 if tool == "image" else 8)
    if job["status"] != "completed":
        raise RuntimeError(f"{tool} {jid} {job['status']}: {job.get('error')}")
    return job["output"]["outputs"][0]["url"]


def download(url, dst):
    if not os.path.exists(dst):
        subprocess.run(["curl", "-sSfL", "-o", dst, url], check=True)  # s3.varg.ai blocks python's UA


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("config")
    ap.add_argument("--project", required=True, help="working folder for media and the render")
    ap.add_argument("--only", choices=["music", "stills", "clips"], help="do one kind only")
    ap.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()

    cfg = json.load(open(a.config))
    m = cfg["models"]
    for d in ("img", "vid"):
        os.makedirs(os.path.join(a.project, d), exist_ok=True)

    original = json.dumps(cfg, indent=2) + "\n"

    def save():  # write back only when a new url came in
        text = json.dumps(cfg, indent=2) + "\n"
        if text != original:
            open(a.config, "w").write(text)

    def still(s):
        if not s.get("url"):
            s["url"] = run_job("image", {"model": m["image"], "prompt": f"{s['prompt']}, {cfg['look']}",
                                         "aspect_ratio": "9:16"})
        download(s["url"], os.path.join(a.project, "img", f"{s['id']}.jpg"))
        return s["id"], s["url"]

    def clip(c):
        if not c.get("url"):
            src = next(s for s in cfg["stills"] if s["id"] == c["id"])
            if not src.get("url"):
                raise RuntimeError(f"clip {c['id']}: generate still {c['id']} first")
            c["url"] = run_job("video", {"model": m["video"], "prompt": f"{c['prompt']} {cfg['clip_tail']}",
                                         "duration": 5, "aspect_ratio": "9:16", "files": [{"url": src["url"]}]})
        download(c["url"], os.path.join(a.project, "vid", f"{c['id']}.mp4"))
        return c["id"], c["url"]

    if a.only in (None, "music"):
        mu = cfg["music"]
        if not mu.get("url"):
            mu["url"] = run_job("music", {"model": m["music"], "prompt": mu["prompt"], "duration": mu.get("duration", 20),
                                          "provider_options": {"elevenlabs": {"force_instrumental": True}}})
            save()
        download(mu["url"], os.path.join(a.project, "music.mp3"))
        print("music", mu["url"], flush=True)

    for kind, fn, items in (("stills", still, cfg["stills"]), ("clips", clip, cfg["clips"])):
        if a.only not in (None, kind):
            continue
        failed = []
        with ThreadPoolExecutor(a.workers) as ex:
            futs = {ex.submit(fn, it): it["id"] for it in items}
            for f, i in futs.items():
                try:
                    print(kind, *f.result(), flush=True)
                except Exception as e:
                    failed.append(i)
                    print(kind, i, "FAILED", e, flush=True)
        save()  # keep every url that did come back
        if failed:
            sys.exit(f"{kind} failed: {failed}. Run again to retry only these.")


main()
