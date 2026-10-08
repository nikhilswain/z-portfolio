import { describe, expect, it } from "vitest";
import { rehypeFigure } from "./rehype-figure";
import { renderMarkdown } from "./test-utils";

const render = async (md: string) =>
  (await renderMarkdown(md, { rehypePlugins: [rehypeFigure] })).html;

describe("rehypeFigure", () => {
  it("wraps a titled image in a figure with a figcaption", async () => {
    const html = await render('![A diagram of the pipeline](./d.png "Figure 1. How it flows.")');
    expect(html).toBe(
      '<figure><img src="./d.png" alt="A diagram of the pipeline"><figcaption>Figure 1. How it flows.</figcaption></figure>',
    );
  });

  it("leaves untitled images in their paragraph", async () => {
    expect(await render("![A diagram](./d.png)")).toBe('<p><img src="./d.png" alt="A diagram"></p>');
  });

  it("does not wrap an image that shares its paragraph with text", async () => {
    const html = await render('See ![A diagram](./d.png "Caption") here.');
    expect(html).not.toContain("<figure>");
    expect(html).toContain("<p>See ");
  });
});
