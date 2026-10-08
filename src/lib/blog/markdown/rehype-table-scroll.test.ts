import { describe, expect, it } from "vitest";
import { rehypeTableScroll } from "./rehype-table-scroll";
import { renderMarkdown } from "./test-utils";

describe("rehypeTableScroll", () => {
  it("wraps every table in a keyboard-focusable scroll region", async () => {
    const { html } = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |\n\n| c |\n|---|\n| 3 |", {
      rehypePlugins: [rehypeTableScroll],
    });
    const wrapper =
      '<div class="table-scroll" role="region" tabindex="0" aria-label="Scrollable table"><table>';
    expect(html.split(wrapper)).toHaveLength(3);
  });
});
