// Builds the site with draft articles included, for local verification only.
// Never deploy the resulting dist/. Cloudflare runs `npm run build`, which excludes drafts.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["astro", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BLOG_INCLUDE_DRAFTS: "1" },
});
process.exit(result.status ?? 1);
