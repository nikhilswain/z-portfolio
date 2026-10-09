// Turns an article's Markdown into copies for other platforms (DEV.to, Hashnode,
// Medium). Pure functions; scripts/crosspost.mjs does the fetching and writing.
import { toString } from "mdast-util-to-string";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i;

/** Blog tag → DEV.to tag. DEV tags are lowercase letters and digits only. */
const DEVTO_TAGS = {
  "Browser APIs": "webdev",
  Accessibility: "a11y",
};

/** @param {string} value */
const unquote = (value) => {
  const v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\"/g, '"');
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

/**
 * @param {string} source the article's index.md
 * @returns {{ title: string; description: string; tags: string[]; draft: boolean; body: string }}
 */
export function parseArticle(source) {
  const text = source.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) throw new Error("The article has no frontmatter (the --- block at the top).");
  const frontmatter = match[1];
  /** @param {string} name */
  const field = (name) => {
    const line = new RegExp(`^${name}:(.*)$`, "m").exec(frontmatter);
    return line ? unquote(line[1]) : "";
  };

  let tags = [];
  const inline = /^tags:[ \t]*\[(.*)\][ \t]*$/m.exec(frontmatter);
  if (inline) {
    tags = inline[1].split(",").map(unquote).filter(Boolean);
  } else {
    const block = /^tags:[ \t]*\n((?:[ \t]+-.*\n?)+)/m.exec(frontmatter);
    if (block) tags = block[1].split("\n").map((l) => unquote(l.replace(/^\s*-\s*/, ""))).filter(Boolean);
  }

  return {
    title: field("title"),
    description: field("description"),
    tags,
    draft: field("draft") === "true",
    body: text.slice(match[0].length),
  };
}

/**
 * @param {string[]} tags blog tags
 * @returns {string[]} up to 4 DEV.to tags
 */
export function devtoTags(tags) {
  const mapped = tags.map((tag) => DEVTO_TAGS[tag] ?? tag.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return [...new Set(mapped)].filter(Boolean).slice(0, 4);
}

/** @param {string} url @param {string} site */
const absolute = (url, site) => (url.startsWith("/") && !url.startsWith("//") ? site + url : url);

/** "./demo-scroll.webp" → "demo-scroll" */
const stemOf = (src) => src.split("/").pop().split(".")[0];

const isLocal = (src) => !/^[a-z]+:|^\/\//i.test(src) && !src.startsWith("/");

const parse = (markdown) => unified().use(remarkParse).use(remarkGfm).parse(markdown);

/**
 * Markdown for DEV.to and Hashnode: live image URLs, captions under images, plain
 * code fences, callouts as bold labels and absolute links. Edits are made on the
 * source text at node positions, so everything else is left exactly as written.
 *
 * @param {string} body article Markdown without frontmatter
 * @param {{ site: string; images: Map<string, string> }} options images: file stem → live URL
 */
export function toPortableMarkdown(body, { site, images }) {
  const source = body.replace(/\r\n/g, "\n");
  /** @type {{ start: number; end: number; text: string }[]} */
  const edits = [];
  const at = (node) => ({ start: node.position.start.offset, end: node.position.end.offset });

  const liveUrl = (src) => {
    if (!isLocal(src)) return absolute(src, site);
    const url = images.get(stemOf(src));
    if (!url) throw new Error(`No live copy of ${src} was found on the published page.`);
    return url;
  };
  const imageMarkdown = (node) => `![${node.alt.replace(/[[\]]/g, "\\$&")}](${liveUrl(node.url)})`;

  visit(parse(source), (node, _index, parent) => {
    if (node.type === "paragraph" && node.children.length === 1 && node.children[0].type === "image") {
      const image = node.children[0];
      edits.push({ ...at(node), text: imageMarkdown(image) + (image.title ? `\n*${image.title}*` : "") });
      return "skip";
    }
    if (node.type === "image") {
      edits.push({ ...at(node), text: imageMarkdown(node) });
      return;
    }
    if ((node.type === "link" || node.type === "definition") && node.url !== absolute(node.url, site)) {
      const { start, end } = at(node);
      const slice = source.slice(start, end);
      const offset = node.type === "link" ? slice.lastIndexOf(`](${node.url}`) + 2 : slice.indexOf(node.url, slice.indexOf(":"));
      if (offset >= 2 || node.type === "definition") {
        edits.push({ start: start + offset, end: start + offset + node.url.length, text: absolute(node.url, site) });
      }
      return;
    }
    if (node.type === "code" && node.meta) {
      const { start } = at(node);
      const lineEnd = source.indexOf("\n", start);
      const fence = /^\s*(`{3,}|~{3,})/.exec(source.slice(start, lineEnd))[1];
      const title = /title=["']([^"']+)["']/.exec(node.meta)?.[1];
      const prefix = title && node.position.start.column === 1 ? `\`${title}\`\n\n` : "";
      edits.push({ start, end: lineEnd, text: `${prefix}${fence}${node.lang ?? ""}` });
      return;
    }
    if (node.type === "blockquote") {
      const text = node.children[0]?.type === "paragraph" ? node.children[0].children[0] : undefined;
      const marker = text?.type === "text" ? CALLOUT.exec(text.value) : null;
      if (marker) {
        const label = marker[1][0].toUpperCase() + marker[1].slice(1).toLowerCase();
        const start = text.position.start.offset;
        edits.push({ start, end: start + marker[1].length + 3, text: `**${label}:**` });
      }
    }
  });

  let out = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

/** Placeholder paragraph shown in yellow in medium.html. */
const placeholder = (label) => ({ type: "paragraph", children: [{ type: "strong", children: [{ type: "text", value: label }] }] });

/** The last few words of the paragraph before a node, so the README can say where it goes. */
const precedingText = (parent, index) => {
  for (let i = index - 1; i >= 0; i--) {
    const text = toString(parent.children[i]).replace(/\s+/g, " ").trim();
    if (text) {
      const words = text.split(" ");
      return words.length > 12 ? `…${words.slice(-12).join(" ")}` : text;
    }
  }
  return "the start of the article";
};

/**
 * HTML to copy into Medium. Medium has no tables, drops images it can't fetch and
 * drops headings that contain code, so images and tables become numbered upload
 * placeholders and headings become plain text.
 *
 * @param {string} body article Markdown without frontmatter
 * @param {{ site: string }} options
 * @returns {{
 *   html: string;
 *   images: { n: number; src: string; file: string; alt: string; caption: string; after: string }[];
 *   tables: { n: number; file: string; rows: string[][]; after: string }[];
 * }}
 */
export function toMediumHtml(body, { site }) {
  const tree = parse(body.replace(/\r\n/g, "\n"));
  const images = [];
  const tables = [];

  visit(tree, (node, index, parent) => {
    if (node.type === "heading") {
      visit(node, "inlineCode", (code, i, p) => {
        p.children[i] = { type: "text", value: code.value };
      });
    }
    if (node.type === "link" || node.type === "definition") node.url = absolute(node.url, site);
    if (node.type === "blockquote") {
      const text = node.children[0]?.type === "paragraph" ? node.children[0].children[0] : undefined;
      const marker = text?.type === "text" ? CALLOUT.exec(text.value) : null;
      if (marker) {
        const label = marker[1][0].toUpperCase() + marker[1].slice(1).toLowerCase();
        node.children[0].children.splice(
          0,
          1,
          { type: "strong", children: [{ type: "text", value: `${label}:` }] },
          { type: "text", value: ` ${text.value.slice(marker[0].length).trimStart()}` },
        );
      }
    }
    if (!parent || index === undefined) return;

    if (node.type === "paragraph" && node.children.length === 1 && node.children[0].type === "image") {
      const image = node.children[0];
      const n = images.length + 1;
      const file = isLocal(image.url) ? `${n}-${stemOf(image.url)}.png` : image.url;
      images.push({ n, src: image.url, file, alt: image.alt ?? "", caption: image.title ?? "", after: precedingText(parent, index) });
      const nodes = [placeholder(`[ IMAGE ${n}: upload ${file} here ]`)];
      if (image.title) nodes.push({ type: "paragraph", children: [{ type: "emphasis", children: [{ type: "text", value: image.title }] }] });
      parent.children.splice(index, 1, ...nodes);
      return index + nodes.length;
    }
    if (node.type === "table") {
      const n = tables.length + 1;
      const file = `table-${n}.png`;
      tables.push({
        n,
        file,
        rows: node.children.map((row) => row.children.map((cell) => toString(cell).trim())),
        after: precedingText(parent, index),
      });
      parent.children.splice(index, 1, placeholder(`[ TABLE ${n}: upload ${file} here ]`));
      return index + 1;
    }
  });

  const processor = unified().use(remarkRehype).use(rehypeStringify);
  return { html: String(processor.stringify(processor.runSync(tree))), images, tables };
}

/** @param {string} text */
const escapeXml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * A table drawn as SVG (light theme), for platforms without tables. Column widths
 * are estimated from character counts, so they err on the wide side.
 *
 * @param {string[][]} rows first row is the header
 * @returns {{ svg: string; width: number; height: number }}
 */
export function tableSvg(rows) {
  const font = 22;
  const padX = 24;
  const rowHeight = 56;
  const margin = 24;
  const columns = Math.max(...rows.map((r) => r.length));
  const widths = Array.from({ length: columns }, (_, c) =>
    Math.ceil(Math.max(...rows.map((r, i) => (r[c] ?? "").length * font * (i === 0 ? 0.62 : 0.56))) + padX * 2),
  );
  const tableWidth = widths.reduce((a, b) => a + b, 0);
  const tableHeight = rows.length * rowHeight;
  const width = tableWidth + margin * 2;
  const height = tableHeight + margin * 2;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<clipPath id="r"><rect x="${margin}" y="${margin}" width="${tableWidth}" height="${tableHeight}" rx="12"/></clipPath>`,
    `<g clip-path="url(#r)">`,
    `<rect x="${margin}" y="${margin}" width="${tableWidth}" height="${rowHeight}" fill="#f2f0eb"/>`,
  ];
  rows.forEach((row, r) => {
    const y = margin + r * rowHeight;
    if (r > 0) parts.push(`<line x1="${margin}" x2="${margin + tableWidth}" y1="${y}" y2="${y}" stroke="#e3e0d8"/>`);
    let x = margin;
    row.forEach((cell, c) => {
      parts.push(
        `<text x="${x + padX}" y="${y + rowHeight / 2}" dominant-baseline="central" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${font}" font-weight="${r === 0 ? 600 : 400}" fill="${r === 0 ? "#0d0d12" : "#23232a"}">${escapeXml(cell)}</text>`,
      );
      x += widths[c];
    });
  });
  parts.push(`</g>`, `<rect x="${margin}" y="${margin}" width="${tableWidth}" height="${tableHeight}" rx="12" fill="none" stroke="#e3e0d8"/>`, `</svg>`);
  return { svg: parts.join(""), width, height };
}
