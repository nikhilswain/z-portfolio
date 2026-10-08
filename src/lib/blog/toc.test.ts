import { describe, expect, it } from "vitest";
import { groupHeadings, shouldShowToc } from "./toc";

const h = (depth: number, slug: string) => ({ depth, slug, text: slug });

describe("groupHeadings", () => {
  it("nests H3 under the preceding H2 and ignores other depths", () => {
    expect(groupHeadings([h(2, "a"), h(3, "a1"), h(4, "skip"), h(3, "a2"), h(2, "b")])).toEqual([
      { heading: h(2, "a"), children: [h(3, "a1"), h(3, "a2")] },
      { heading: h(2, "b"), children: [] },
    ]);
  });

  it("promotes an H3 that appears before any H2", () => {
    expect(groupHeadings([h(3, "early"), h(2, "a")])).toEqual([
      { heading: h(3, "early"), children: [] },
      { heading: h(2, "a"), children: [] },
    ]);
  });
});

describe("shouldShowToc", () => {
  it("needs at least 3 H2/H3 headings", () => {
    expect(shouldShowToc([h(2, "a"), h(3, "b"), h(4, "c")])).toBe(false);
    expect(shouldShowToc([h(2, "a"), h(3, "b"), h(2, "c")])).toBe(true);
    expect(shouldShowToc([])).toBe(false);
  });
});
