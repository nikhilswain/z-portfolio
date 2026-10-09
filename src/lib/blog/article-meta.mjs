// Reads article dates and draft flags straight from disk. It is used by
// astro.config.mjs (sitemap lastmod) and scripts/check-blog-dist.mjs, which
// both run outside Astro's content layer.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string} value
 * @param {string} field
 * @param {string} file
 */
const toIso = (value, field, file) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`[blog] ${file}: ${field} "${value}" is not a valid date. Use YYYY-MM-DD.`);
  }
  return date.toISOString();
};

/**
 * @param {string} source
 * @param {string} [file] path used in error messages
 * @returns {{ publishedAt: string; updatedAt: string | undefined; draft: boolean } | null}
 */
export function parseFrontmatterMeta(source, file = "frontmatter") {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return null;
  const frontmatter = match[1];
  /** @param {string} name */
  const field = (name) =>
    new RegExp(`^${name}:[ \\t]*["']?([^"'\\r\\n#]+?)["']?[ \\t]*(?:#.*)?$`, "m").exec(frontmatter)?.[1]?.trim();

  const publishedAt = field("publishedAt");
  if (!publishedAt) return null;
  const updatedAt = field("updatedAt");
  return {
    publishedAt: toIso(publishedAt, "publishedAt", file),
    updatedAt: updatedAt ? toIso(updatedAt, "updatedAt", file) : undefined,
    draft: field("draft") === "true",
  };
}

/**
 * @param {URL} dirUrl folder containing `<slug>/index.md`
 * @returns {Map<string, { publishedAt: string; updatedAt: string | undefined; draft: boolean }>}
 */
export function readArticleMeta(dirUrl) {
  const dir = fileURLToPath(dirUrl);
  const meta = new Map();
  if (!existsSync(dir)) return meta;
  for (const slug of readdirSync(dir).sort()) {
    const file = path.join(dir, slug, "index.md");
    if (!existsSync(file)) continue;
    const parsed = parseFrontmatterMeta(readFileSync(file, "utf8"), `src/content/blog/${slug}/index.md`);
    if (parsed) meta.set(slug, parsed);
  }
  return meta;
}
