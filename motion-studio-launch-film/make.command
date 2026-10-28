#!/usr/bin/env bash
# Renders the example film: out/final.mp4, out/cover.png
cd "$(dirname "$0")" && bun install && bun run setup && bun run render && bun run cover && echo "done: out/final.mp4"
