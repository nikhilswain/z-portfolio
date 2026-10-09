// Verifies the built blog in dist/. Usage:
//   npm run build && npm run check:blog                       (production: drafts must be absent)
//   npm run build:drafts && npm run check:blog -- --drafts    (drafts present and noindex)
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

// Every id on a page must be unique, otherwise skip links and TOC anchors jump to the wrong element.
const duplicateIds = (html) => {
  const counts = new Map();
  for (const [, id] of html.matchAll(/\sid="([^"]+)"/g)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].filter(([, n]) => n > 1).map(([id]) => id);
};
if (index && duplicateIds(index).length > 0) fail(`/blog/ has duplicate ids: ${duplicateIds(index).join(", ")}`);

// Blog pages ship only blog styles — the homepage's Tailwind stylesheet must not be loaded.
const loadsTailwind = (html) =>
  [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].some(([, href]) => {
    const css = read(href.replace(/^\//, ""));
    return css !== null && css.includes("tailwindcss");
  }) || [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].some(([, css]) => css.includes("tailwindcss"));
if (index && loadsTailwind(index)) fail("/blog/ loads the homepage Tailwind stylesheet");
if (!rssXml) fail("dist/blog/rss.xml is missing");
else if (!rssXml.includes("<rss") || !rssXml.includes("<channel>")) fail("rss.xml is not an RSS document");
else if (!/<channel>[\s\S]*?<link>https:\/\/zerro\.dev\/blog\/<\/link>/.test(rssXml)) fail("rss.xml channel <link> is not https://zerro.dev/blog/");
if (!sitemap.includes("<loc>https://zerro.dev/blog/</loc>")) fail("/blog/ is not in the sitemap");
if (index && !/<html[^>]*\sdata-theme="dark"/.test(index)) fail("/blog/ is missing the server-rendered dark theme");
if (/<lastmod>/.test(sitemap.replace(/<url><loc>https:\/\/zerro\.dev\/blog\/[^<]+\/<\/loc><lastmod>/g, "")))
  fail("a non-article sitemap entry has <lastmod>");

// Unpublished screenshots must not be deployed: production dist/_astro may not contain draft-only images.
if (!withDrafts) {
  const assets = existsSync(new URL("_astro/", dist)) ? readdirSync(new URL("_astro/", dist)) : [];
  for (const [slug, article] of meta) {
    if (!article.draft) continue;
    const folder = new URL(`../src/content/blog/${slug}/`, import.meta.url);
    for (const image of readdirSync(folder).filter((name) => /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(name))) {
      const stem = image.replace(/\.[^.]+$/, "");
      const leaked = assets.filter((asset) => asset.startsWith(`${stem}.`));
      if (leaked.length > 0) fail(`${slug}: draft image ${image} was deployed as ${leaked.join(", ")}`);
    }
  }
}

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

  const dupes = duplicateIds(html);
  if (dupes.length > 0) fail(`${slug}: duplicate ids: ${dupes.join(", ")}`);
  if (loadsTailwind(html)) fail(`${slug}: loads the homepage Tailwind stylesheet`);

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

  // Declared og:image dimensions must match the generated PNG (social cards crop or letterbox otherwise).
  const ogUrl = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
  const declaredWidth = /<meta property="og:image:width" content="(\d+)"/.exec(html)?.[1];
  const declaredHeight = /<meta property="og:image:height" content="(\d+)"/.exec(html)?.[1];
  if (ogUrl && declaredWidth && declaredHeight) {
    const ogPath = new URL(ogUrl).pathname.slice(1);
    const ogFile = new URL(ogPath, dist);
    if (ogPath.endsWith(".png") && existsSync(ogFile)) {
      const png = readFileSync(ogFile);
      const width = png.readUInt32BE(16);
      const height = png.readUInt32BE(20);
      if (`${width}x${height}` !== `${declaredWidth}x${declaredHeight}`) {
        fail(`${slug}: og:image is ${width}x${height} but declares ${declaredWidth}x${declaredHeight}`);
      }
    }
  }

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
