import { describe, expect, it } from "vitest";
import { rehypeImageText } from "./rehype-image-text";
import { renderMarkdown } from "./test-utils";

const render = async (md: string) =>
  (await renderMarkdown(md, { rehypePlugins: [rehypeImageText] })).html;

describe("rehypeImageText", () => {
  it("replaces straight apostrophes in alt text with typographic ones", async () => {
    expect(await render("![zKetch's canvas](./a.png)")).toContain('alt="zKetch’s canvas"');
  });

  it("spells out ampersands in alt and title", async () => {
    const html = await render('![R&D board](./a.png "Q&A")');
    expect(html).toContain('alt="R and D board"');
    expect(html).toContain('title="Q and A"');
  });

  it("leaves other text untouched", async () => {
    expect(await render('![A "quoted" <diagram>](./a.png)')).toContain('alt="A &#x22;quoted&#x22; <diagram>"');
  });
});
