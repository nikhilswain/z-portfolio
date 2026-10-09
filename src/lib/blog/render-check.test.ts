import { describe, expect, it } from "vitest";
import { renderFailures } from "./render-check";

describe("renderFailures", () => {
  it("reports the actual reason an entry failed to render", async () => {
    const failures = await renderFailures([
      { id: "fine", rendered: { html: "<p>ok</p>" } },
      { id: "broken", body: "Intro text.\n\n# Bad heading\n" },
      { id: "no-alt", body: "![](./shot.png)" },
    ]);
    expect(failures).toEqual([
      'src/content/blog/broken/index.md: the article body contains an H1 ("Bad heading"). The title is the page\'s only H1 — start body headings at "##".',
      'src/content/blog/no-alt/index.md: image "./shot.png" has no alt text. Describe what it shows: ![description](./shot.png).',
    ]);
  });

  it("falls back to a generic message when the reason can't be reproduced", async () => {
    expect(await renderFailures([{ id: "odd", body: "## Fine" }])).toEqual([
      'src/content/blog/odd/index.md: the Markdown failed to render — see the "[blog]" error logged above.',
    ]);
  });

  it("returns nothing when every entry rendered", async () => {
    expect(await renderFailures([{ id: "a", rendered: { html: "" } }])).toEqual([]);
  });
});
