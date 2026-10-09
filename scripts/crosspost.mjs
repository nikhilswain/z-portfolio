// Builds a cross-post kit for a published article in crosspost/<slug>/ (git-ignored):
// Markdown for DEV.to and Hashnode, a copy-paste page for Medium with PNG images,
// and a README with the steps. zerro.dev stays the canonical original.
//
//   npm run crosspost <slug>
//   npm run crosspost:clean
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { devtoTags, mediumTopics, parseArticle, tableSvg, toMediumHtml, toPortableMarkdown } from "../src/lib/blog/crosspost.mjs";

const SITE = "https://zerro.dev";
const root = fileURLToPath(new URL("..", import.meta.url));
const outRoot = path.join(root, "crosspost");

const fail = (message) => {
  console.error(`crosspost: ${message}`);
  process.exit(1);
};

const arg = process.argv[2];
if (arg === "--clean") {
  rmSync(outRoot, { recursive: true, force: true });
  console.log("Removed crosspost/.");
  process.exit(0);
}
if (!arg || arg.startsWith("-")) fail("usage: npm run crosspost <slug>   (or npm run crosspost:clean)");

const slug = arg;
const articleDir = path.join(root, "src", "content", "blog", slug);
const articleFile = path.join(articleDir, "index.md");
if (!existsSync(articleFile)) fail(`src/content/blog/${slug}/index.md does not exist.`);

const article = parseArticle(readFileSync(articleFile, "utf8"));
if (article.draft) fail(`${slug} is a draft. Publish it on zerro.dev first; cross-posts link back to it.`);

const canonical = `${SITE}/blog/${slug}/`;
const response = await fetch(canonical).catch((error) => fail(`could not reach ${canonical}: ${error.message}`));
if (!response.ok) fail(`${canonical} returned ${response.status}. Push and wait for the deploy before cross-posting.`);
const page = await response.text();

/** file stem → live URL of the image the published page serves */
const liveImages = new Map();
for (const [, src] of page.matchAll(/<img[^>]*\ssrc="(\/_astro\/[^"]+)"/g)) {
  liveImages.set(path.basename(src).split(".")[0], SITE + src);
}
const cover = /<meta property="og:image" content="([^"]+)"/.exec(page)?.[1] ?? `${SITE}/og-image.png`;

let portable;
try {
  portable = toPortableMarkdown(article.body, { site: SITE, images: liveImages }).trim();
} catch (error) {
  fail(`${error.message} Has the latest version of the article been deployed?`);
}
const footer = `\n\n---\n\n*Originally published on [zerro.dev](${canonical}).*\n`;
const yamlString = (value) => JSON.stringify(value);
const tags = devtoTags(article.tags);
const medium = toMediumHtml(article.body, { site: SITE });

const outDir = path.join(outRoot, slug);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const write = (name, content) => writeFileSync(path.join(outDir, name), content);

write(
  "devto.md",
  `---
title: ${yamlString(article.title)}
description: ${yamlString(article.description)}
tags: ${tags.join(", ")}
canonical_url: ${canonical}
cover_image: ${cover}
published: false
---

${portable}${footer}`,
);
write("hashnode.md", portable + footer);

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
write(
  "medium.html",
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(article.title)} (copy for Medium)</title>
<style>
  body { max-width: 720px; margin: 40px auto; padding: 0 20px; font: 18px/1.6 Georgia, serif; color: #222; }
  pre { background: #f4f4f4; padding: 12px 16px; overflow-x: auto; font-size: 15px; }
  code { font-family: Menlo, Consolas, monospace; }
  p > strong:only-child { display: block; padding: 10px 14px; background: #fff4cc; border: 1px dashed #c9a400; }
</style>
</head>
<body>
<h1>${escapeHtml(article.title)}</h1>
${medium.html}
<hr />
<p><em>Originally published on <a href="${canonical}">zerro.dev</a>.</em></p>
</body>
</html>
`,
);

for (const image of medium.images) {
  if (!image.file.endsWith(".png")) continue;
  const source = path.join(articleDir, image.src);
  if (!existsSync(source)) fail(`image ${image.src} in the article does not exist.`);
  await sharp(source).png().toFile(path.join(outDir, image.file));
}
for (const table of medium.tables) {
  const { svg } = tableSvg(table.rows);
  await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(outDir, table.file));
}

// The article's social image, to upload as the cover on Hashnode (and Medium, if wanted).
const coverResponse = await fetch(cover);
if (!coverResponse.ok) fail(`could not download the cover image ${cover} (${coverResponse.status}).`);
const coverFile = `cover${path.extname(new URL(cover).pathname) || ".png"}`;
write(coverFile, Buffer.from(await coverResponse.arrayBuffer()));

const cell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const placements = [
  ...medium.images.map((i) => `| ${i.file} | ${cell(i.after)} | ${cell(i.alt)} |`),
  ...medium.tables.map((t) => `| ${t.file} | ${cell(t.after)} | Table: ${cell(t.rows.map((r) => r.join(", ")).join("; "))} |`),
];

write(
  "README.md",
  `# Cross-post kit: ${article.title}

Canonical URL (the original, on every platform):
${canonical}

Generated by \`npm run crosspost ${slug}\`. This folder is git-ignored; remove it with
\`npm run crosspost:clean\` when you're done.

## Medium

1. Open \`medium.html\` in Chrome or Edge (double-click it). Press **Ctrl+A**, then **Ctrl+C**.
2. Start a new story on Medium and press **Ctrl+V**. The first line becomes the title.
3. At each yellow placeholder, delete the placeholder line, press **+** → **Image**, and upload the
   named file. Click the image → **Alt text** and paste the alt text from the table below. The italic
   line under a placeholder is the caption.
4. If a code block pastes as plain text, select it and press **Ctrl+Alt+6**.
5. **Set the canonical link:** **⋯ → More settings → Advanced settings → Customize canonical link**,
   tick "This story was originally published elsewhere" and paste the canonical URL above.
6. **SEO settings** (**⋯ → More settings → SEO Settings**). Medium's default title adds
   "| by … | Medium" and its default description is the first paragraph cut off, so replace both
   and press **Save** on each:
   - SEO Title (${article.title.length} characters; Google cuts off at about 60): \`${article.title}\`
   - SEO Description (${article.description.length} characters; aim for 140–156): \`${article.description}\`
7. Press **Publish**. The story preview (homepage and subscriber emails) defaults its subtitle to the
   first paragraph cut off. Keep the title and replace the subtitle with the description${
     article.description.length > 140
       ? `, shortened to 140 characters or fewer (it is ${article.description.length})`
       : ""
   }:
   \`${article.description}\`
8. Under **Reader Interests** ("Add up to five topics…"), add:
   ${mediumTopics(article.tags).join(", ")}.

Don't use Medium's "Import a story": it drops the images, code blocks, tables and any heading
that contains code.
${
  placements.length
    ? `
| File | Goes after | Alt text |
|---|---|---|
${placements.join("\n")}
`
    : ""
}
## DEV.to

1. dev.to → **Create Post**. If the editor has separate title and tag boxes, switch to the plain
   Markdown editor first: Settings → Customization → **Basic markdown**.
2. Paste all of \`devto.md\`, including the \`---\` block at the top. It sets the title, tags
   (${tags.join(", ")}), cover image and canonical link.
3. Preview, then publish (or change \`published: false\` to \`true\`).

## Hashnode

1. Your blog dashboard → **Write**. Paste \`hashnode.md\` into the editor.
2. Title: \`${article.title}\`
   Subtitle: \`${article.description}\`
   Cover: upload \`${coverFile}\` (the image zerro.dev uses for social cards).
3. Article settings → **Are you republishing?** → on → paste the canonical URL above.
   If the settings show SEO title and description fields, use the title and subtitle above.
4. Up to 5 tags (${article.tags.join(", ")}), then publish.
`,
);

console.log(`Cross-post kit for "${article.title}":`);
console.log(`  ${path.relative(root, outDir)}${path.sep}`);
console.log(`  devto.md, hashnode.md, medium.html, README.md`);
const assets = [coverFile, ...medium.images.filter((i) => i.file.endsWith(".png")).map((i) => i.file), ...medium.tables.map((t) => t.file)];
if (assets.length) console.log(`  ${assets.join(", ")}`);
console.log(`Open README.md for the steps.`);
