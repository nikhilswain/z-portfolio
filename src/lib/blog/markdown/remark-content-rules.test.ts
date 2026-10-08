import { describe, expect, it } from "vitest";
import { remarkContentRules } from "./remark-content-rules";
import { renderMarkdown } from "./test-utils";

const render = (md: string) => renderMarkdown(md, { remarkPlugins: [remarkContentRules] });

describe("remarkContentRules", () => {
  it("allows H2 and deeper headings", async () => {
    await expect(render("## Fine\n\n### Also fine")).resolves.toBeDefined();
  });

  it("rejects an ATX H1 and names the file", async () => {
    await expect(render("# Intro")).rejects.toThrow(
      /test\/index\.md: the article body contains an H1 \("Intro"\)/,
    );
  });

  it("rejects a setext H1", async () => {
    await expect(render("Intro\n=====")).rejects.toThrow(/contains an H1/);
  });

  it("rejects an image without alt text", async () => {
    await expect(render("![](./a.png)")).rejects.toThrow(/image "\.\/a\.png" has no alt text/);
  });

  it("accepts an image with alt text", async () => {
    await expect(render("![A chart of render times](./a.png)")).resolves.toBeDefined();
  });
});
