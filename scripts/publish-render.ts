#!/usr/bin/env bun
/**
 * publish-render.ts — Publish cloud renders as approved community templates.
 *
 * ⚠️ STALE as of 2026-08-04 — DO NOT RUN WITHOUT FIXING FIRST.
 *
 * This script writes `media.url`, `media.owner_id`, `media.filename` and
 * `media.media_type`. Those columns no longer exist: `media` is now
 * { id, created_at, be_file_id } and the real file metadata lives in
 * `be_files`. Every insert here will fail with a 400.
 *
 * It also hardcodes SUPABASE_URL to the PRODUCTION project with no staging
 * override, and requires a render-service job id (so it cannot publish a
 * locally rendered mp4 at all).
 *
 * The working replacement, which handles the be_files → media →
 * document_media → documents → templates chain and takes plain public URLs,
 * lives in the app repo:
 *
 *     app/scripts/publish-service-template.ts --env .env.stage --dry-run
 *
 * Kept here for reference until someone either ports the job-id flow over or
 * deletes it outright.
 *
 * ── original docs ────────────────────────────────────────────────────────
 *
 * Takes one or more render job IDs, fetches results from the render service,
 * creates documents in Supabase, links media, creates template rows
 * (auto-approved), and sets visibility to 'public'.
 *
 * Usage:
 *   bun run scripts/publish-render.ts <job-id> [job-id2 ...] [options]
 *
 * Options:
 *   --title "My Video"              Document title (applied to all jobs)
 *   --description "Template desc"   Template description (required)
 *   --tags "tag1,tag2,tag3"         Comma-separated tags (optional)
 *
 * Environment:
 *   VARG_API_KEY         — loaded from env or ~/.varg/credentials
 *   SUPABASE_SERVICE_KEY — loaded from env (required)
 *
 * Examples:
 *   bun run scripts/publish-render.ts abc123 --title "Claymation Ad" --description "Claymation-style UGC ad template"
 *   bun run scripts/publish-render.ts abc123 def456 ghi789 --description "Product showcase" --tags "product,showcase,ecommerce"
 */

console.error(
  [
    "publish-render.ts is stale and will fail: it writes media.url / media.owner_id,",
    "which no longer exist (media is now { id, created_at, be_file_id }).",
    "",
    "Use the replacement in the app repo instead:",
    "  bun run scripts/publish-service-template.ts --env .env.stage --dry-run",
  ].join("\n"),
);
process.exit(1);
