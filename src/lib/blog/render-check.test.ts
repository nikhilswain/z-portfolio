import { describe, expect, it } from "vitest";
import { renderFailures } from "./render-check";

describe("renderFailures", () => {
  it("reports entries the glob loader could not render", () => {
    expect(
      renderFailures([
        { id: "fine", rendered: { html: "<p>ok</p>" } },
        { id: "broken" },
      ]),
    ).toEqual([
      'src/content/blog/broken/index.md: the Markdown failed to render — see the "[blog]" error logged above (for example an H1 in the body or an image without alt text).',
    ]);
  });

  it("returns nothing when every entry rendered", () => {
    expect(renderFailures([{ id: "a", rendered: { html: "" } }])).toEqual([]);
  });
});
