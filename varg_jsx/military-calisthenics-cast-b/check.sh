#!/bin/bash
# Check the cloud render.
#   check.sh          -> staging (default; prod render is too old for .audio)
#   check.sh prod     -> production
#
# Why staging: fly app render-fqb8zg last deployed v216 (Jul 31) and still runs
# vargai@0.4.0-alpha112, which has no audio-element.ts at all — `.audio` and
# `<Captions src={vid.audio}>` do not exist there. render-staging v110 is built
# from GH_SHA 8691c21 (the alpha118 bump) and supports both.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV="${1:-stage}"

if [ "$ENV" = "prod" ]; then
  API="https://api.varg.ai/v2"
  JOB="$(cat "$DIR/.jobid")"
  set -a; . "$DIR/../../.env" >/dev/null 2>&1; set +a
  KEY="$VARG_API_KEY"
else
  API="https://stage-api.varg.ai/v2"
  JOB="$(cat "$DIR/.jobid.stage")"
  KEY="$(grep -m1 '^VARG_API_KEY=' \
    "$DIR/../../../api/varg-api-proto/apps/api/.env.local" | cut -d= -f2-)"
fi

curl -s -H "Authorization: Bearer $KEY" "$API/jobs/$JOB" |
python3 -c '
import json, sys, subprocess
j = json.load(sys.stdin)
st = j.get("status")
print("env    :", "'"$ENV"'")
print("job    :", j.get("id"))
print("status :", st)
if j.get("progress_message"):
    print("progress:", j["progress_message"])
if j.get("actual_cost_cents") is not None:
    print("cost   : $%.2f" % (j["actual_cost_cents"] / 100))
if st == "completed":
    url = j["output"]["outputs"][0]["url"]
    print("\nVIDEO  :", url)
    subprocess.run("pbcopy", input=url, text=True)
    print("(url copied to clipboard)")
elif st == "failed":
    print("\nerror  :", json.dumps(j.get("error"), indent=2, ensure_ascii=False)[:1200])
'
