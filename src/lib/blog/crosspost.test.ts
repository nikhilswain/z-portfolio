import { describe, expect, it } from "vitest";
import { devtoTags, mediumTopics, parseArticle, tableSvg, toMediumHtml, toPortableMarkdown } from "./crosspost.mjs";

const SITE = "https://zerro.dev";
const images = new Map([["shot", `${SITE}/_astro/shot.abc123.webp`]]);

describe("parseArticle", () => {
  it("reads title, description, tags and draft, and returns the body", () => {
    const article = parseArticle(
      '---\ntitle: "A \\"quoted\\" title"\ndescription: \'It\'\'s short\'\ntags: ["React", "Browser APIs"]\ndraft: true\n---\n\nBody text.\n',
    );
    expect(article.title).toBe('A "quoted" title');
    expect(article.description).toBe("It's short");
    expect(article.tags).toEqual(["React", "Browser APIs"]);
    expect(article.draft).toBe(true);
    expect(article.body.trim()).toBe("Body text.");
  });

  it("reads tags written as a YAML list and treats a missing draft as published", () => {
    const article = parseArticle("---\ntitle: T\ndescription: D\ntags:\n  - CSS\n  - Testing\n---\nx");
    expect(article.tags).toEqual(["CSS", "Testing"]);
    expect(article.draft).toBe(false);
  });

  it("throws when there is no frontmatter", () => {
    expect(() => parseArticle("# no frontmatter")).toThrow(/frontmatter/);
  });
});

describe("devtoTags", () => {
  it("maps blog tags to DEV tags, drops duplicates and keeps at most 4", () => {
    expect(devtoTags(["Performance", "Browser APIs", "React", "Animation", "CSS"])).toEqual([
      "performance",
      "webdev",
      "react",
      "animation",
    ]);
    expect(devtoTags(["Accessibility", "Some New Tag"])).toEqual(["a11y", "somenewtag"]);
  });
});

describe("toPortableMarkdown", () => {
  it("points local images at the live copies and moves the caption under the image", () => {
    const md = toPortableMarkdown('Intro.\n\n![A screenshot](./shot.webp "Figure 1. The app.")\n', { site: SITE, images });
    expect(md).toContain(`![A screenshot](${SITE}/_astro/shot.abc123.webp)\n*Figure 1. The app.*`);
    expect(md).not.toContain("./shot.webp");
  });

  it("throws when a local image has no live copy", () => {
    expect(() => toPortableMarkdown("![x](./missing.png)", { site: SITE, images })).toThrow(/missing\.png/);
  });

  it("turns callouts into a bold label", () => {
    const md = toPortableMarkdown("> [!WARNING]\n> Careful here.\n", { site: SITE, images });
    expect(md).toContain("> **Warning:**\n> Careful here.");
  });

  it("keeps the code language but drops Expressive Code options, showing the title above", () => {
    const md = toPortableMarkdown('```ts title="src/a.ts" {2}\nconst a = 1;\n```\n', { site: SITE, images });
    expect(md).toContain("`src/a.ts`\n\n```ts\nconst a = 1;\n```");
  });

  it("does not touch Markdown-looking text inside code blocks", () => {
    const source = "```md\n![x](./missing.png)\n> [!NOTE]\n```\n";
    expect(toPortableMarkdown(source, { site: SITE, images })).toBe(source);
  });

  it("makes site-relative links absolute", () => {
    const md = toPortableMarkdown("See [the other post](/blog/other/).\n\n[ref]: /blog/ref/\n", { site: SITE, images });
    expect(md).toContain(`[the other post](${SITE}/blog/other/)`);
    expect(md).toContain(`[ref]: ${SITE}/blog/ref/`);
  });
});

describe("toMediumHtml", () => {
  const source = [
    "Intro paragraph that leads to the image.",
    "",
    '![A screenshot](./shot.webp "Figure 1. The app.")',
    "",
    "## Set `currentTime` on scroll",
    "",
    "| Clip | Size |",
    "|---|---|",
    "| Original | 4.7 `MB` |",
    "",
    "> [!NOTE]",
    "> Remember this.",
    "",
    "```ts",
    "const a = 1;",
    "```",
    "",
    "[Home](/)",
  ].join("\n");

  const result = toMediumHtml(source, { site: SITE });

  it("replaces images with numbered upload placeholders and keeps the caption", () => {
    expect(result.html).toContain("[ IMAGE 1: upload 1-shot.png here ]");
    expect(result.html).toContain("<em>Figure 1. The app.</em>");
    expect(result.images).toEqual([
      {
        n: 1,
        src: "./shot.webp",
        file: "1-shot.png",
        alt: "A screenshot",
        caption: "Figure 1. The app.",
        after: "Intro paragraph that leads to the image.",
      },
    ]);
  });

  it("drops code formatting from headings so Medium keeps them", () => {
    expect(result.html).toContain("<h2>Set currentTime on scroll</h2>");
  });

  it("replaces tables with placeholders and returns their cells", () => {
    expect(result.html).toContain("[ TABLE 1: upload table-1.png here ]");
    expect(result.html).not.toContain("<table");
    expect(result.tables).toEqual([
      { n: 1, file: "table-1.png", rows: [["Clip", "Size"], ["Original", "4.7 MB"]], after: "Set currentTime on scroll" },
    ]);
  });

  it("turns callouts into a bold label and keeps code blocks as <pre>", () => {
    expect(result.html).toContain("<strong>Note:</strong> Remember this.");
    expect(result.html).toContain('<pre><code class="language-ts">const a = 1;\n</code></pre>');
  });

  it("makes site-relative links absolute", () => {
    expect(result.html).toContain(`<a href="${SITE}/">Home</a>`);
  });
});

describe("tableSvg", () => {
  it("draws every cell, escaping XML, and sizes the image to fit", () => {
    const { svg, width, height } = tableSvg([
      ["Name", "Value"],
      ["a < b & c", "1"],
    ]);
    expect(svg).toContain("a &lt; b &amp; c");
    expect(svg).toContain(">Name<");
    expect(width).toBeGreaterThan(100);
    expect(height).toBeGreaterThan(50);
  });
});

describe("mediumTopics", () => {
  it("maps blog tags to Medium topics and fills up to five with general ones", () => {
    expect(mediumTopics(["Performance", "Browser APIs", "React", "Animation"])).toEqual([
      "Web Performance",
      "Web Development",
      "React",
      "Animation",
      "JavaScript",
    ]);
    expect(mediumTopics(["CSS"])).toEqual(["CSS", "Web Development", "JavaScript", "Frontend Development", "Programming"]);
  });
});
