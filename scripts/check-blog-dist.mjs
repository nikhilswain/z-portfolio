// Verifies the built blog in dist/. Usage:
//   npm run build && npm run check:blog                       (production: drafts must be absent)
//   npm run build:drafts && npm run check:blog -- --drafts    (drafts present and noindex)
import { existsSync, readFileSync } from "node:fs";
import { readArticleMeta } from "../src/lib/blog/article-meta.mjs";

const withDrafts = process.argv.includes("--drafts");
const dist = new URL("../dist/", import.meta.url);
const meta = readArticleMeta(new URL("../src/content/blog/", import.meta.url));
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => {
  const url = new URL(path, dist);
  return existsSync(url) ? readFileSync(url, "utf8") : null;
};
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

const index = read("blog/index.html");
const rssXml = read("blog/rss.xml");
const sitemap = read("sitemap-0.xml") ?? "";

if (!index) fail("dist/blog/index.html is missing");
if (!rssXml) fail("dist/blog/rss.xml is missing");
else if (!rssXml.includes("<rss") || !rssXml.includes("<channel>")) fail("rss.xml is not an RSS document");
if (!sitemap.includes("<loc>https://zerro.dev/blog/</loc>")) fail("/blog/ is not in the sitemap");
if (index && !/<html[^>]*\sdata-theme="dark"/.test(index)) fail("/blog/ is missing the server-rendered dark theme");
if (/<lastmod>/.test(sitemap.replace(/<url><loc>https:\/\/zerro\.dev\/blog\/[^<]+\/<\/loc><lastmod>/g, "")))
  fail("a non-article sitemap entry has <lastmod>");

for (const [slug, article] of meta) {
  const url = `https://zerro.dev/blog/${slug}/`;
  const html = read(`blog/${slug}/index.html`);
  const shouldExist = withDrafts || !article.draft;

  if (!shouldExist) {
    if (html) fail(`${slug}: draft page was built`);
    if (sitemap.includes(url)) fail(`${slug}: draft is in the sitemap`);
    if (rssXml?.includes(url)) fail(`${slug}: draft is in RSS`);
    continue;
  }
  if (!html) {
    fail(`${slug}: page is missing`);
    continue;
  }

  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) fail(`${slug}: expected exactly 1 <h1>, found ${h1Count}`);
  if (!html.includes(`<link rel="canonical" href="${url}">`)) fail(`${slug}: canonical is missing or wrong`);
  for (const needle of [
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'property="og:type" content="article"',
    'property="article:published_time"',
    'name="twitter:card" content="summary_large_image"',
    'type="application/rss+xml"',
  ]) {
    if (!html.includes(needle)) fail(`${slug}: missing ${needle}`);
  }

  const types = [];
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      types.push(JSON.parse(json)["@type"]);
    } catch {
      fail(`${slug}: a JSON-LD block does not parse`);
    }
  }
  for (const type of ["BlogPosting", "BreadcrumbList", "Person"]) {
    if (!types.includes(type)) fail(`${slug}: JSON-LD ${type} is missing`);
  }

  if (article.draft && !html.includes('content="noindex, nofollow"')) fail(`${slug}: draft page is indexable`);

  const entry = new RegExp(`<url><loc>${escape(url)}</loc>(.*?)</url>`).exec(sitemap)?.[1];
  const expectedDate = (article.updatedAt ?? article.publishedAt).slice(0, 10);
  if (!entry) fail(`${slug}: not in the sitemap`);
  else if (!entry.includes(`<lastmod>${expectedDate}`)) fail(`${slug}: sitemap lastmod is not ${expectedDate}`);

  if (!rssXml?.includes(url)) fail(`${slug}: not in RSS`);
}

if (failures.length > 0) {
  console.error(`check:blog failed (${withDrafts ? "drafts" : "production"} mode):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`check:blog passed (${withDrafts ? "drafts" : "production"} mode, ${meta.size} article folders).`);
