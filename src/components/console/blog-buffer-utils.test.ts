import { describe, expect, it } from "vitest";
import { blogRows, bufferKeyAction, relativeLineNumber } from "./blog-buffer-utils";

describe("relativeLineNumber", () => {
  it("shows the absolute number on the cursor line and distances elsewhere", () => {
    expect([0, 1, 2, 3].map((i) => relativeLineNumber(i, 1))).toEqual([1, 2, 1, 2]);
  });
});

describe("bufferKeyAction", () => {
  it("moves with j/k and arrows, clamped to the list", () => {
    expect(bufferKeyAction("j", 0, 3)).toEqual({ type: "move", index: 1 });
    expect(bufferKeyAction("ArrowDown", 2, 3)).toEqual({ type: "move", index: 2 });
    expect(bufferKeyAction("k", 0, 3)).toEqual({ type: "move", index: 0 });
    expect(bufferKeyAction("ArrowUp", 2, 3)).toEqual({ type: "move", index: 1 });
  });

  it("jumps with g/G and Home/End", () => {
    expect(bufferKeyAction("g", 2, 3)).toEqual({ type: "move", index: 0 });
    expect(bufferKeyAction("End", 0, 3)).toEqual({ type: "move", index: 2 });
    expect(bufferKeyAction("G", 0, 3)).toEqual({ type: "move", index: 2 });
  });

  it("closes with q and Escape and ignores other keys", () => {
    expect(bufferKeyAction("q", 0, 3)).toEqual({ type: "close" });
    expect(bufferKeyAction("Escape", 0, 3)).toEqual({ type: "close" });
    expect(bufferKeyAction("Enter", 0, 3)).toEqual({ type: "none" });
    expect(bufferKeyAction("x", 0, 3)).toEqual({ type: "none" });
  });
});

describe("blogRows", () => {
  it("orders rows like the /blog index: newest parents, children nested under them", () => {
    const rows = blogRows([
      { slug: "old", title: "Old", description: "", publishedAt: new Date("2026-01-01"), readingTime: 3, tags: [] },
      { slug: "kid", title: "Kid", description: "", publishedAt: new Date("2026-05-01"), readingTime: 2, tags: [], parent: "old", order: 1 },
      { slug: "new", title: "New", description: "", publishedAt: new Date("2026-03-01"), readingTime: 4, tags: [] },
    ]);
    expect(rows.map((r) => `${r.depth}:${r.post.slug}`)).toEqual(["0:new", "0:old", "1:kid"]);
  });

  it("returns no rows for no posts", () => {
    expect(blogRows([])).toEqual([]);
  });
});
