// Runs an astro command with draft articles included. Usage:
//   npm run dev:drafts     → node scripts/with-drafts.mjs dev
//   npm run build:drafts   → node scripts/with-drafts.mjs build   (local verification only)
// Never deploy a drafts build; Cloudflare runs `npm run build`, which excludes drafts.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["astro", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BLOG_INCLUDE_DRAFTS: "1" },
});
process.exit(result.status ?? 1);
