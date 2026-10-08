import { describe, expect, it } from "vitest";
import { toHomepagePost } from "./homepage";

describe("toHomepagePost", () => {
  it("keeps only the fields the homepage needs", () => {
    const input = {
      slug: "a", title: "A", description: "D", publishedAt: new Date("2026-10-09"),
      readingTime: 4, parent: "p", order: 2, entry: { huge: true }, tags: ["CSS"],
    };
    expect(toHomepagePost(input)).toEqual({
      slug: "a", title: "A", description: "D", publishedAt: new Date("2026-10-09"),
      readingTime: 4, parent: "p", order: 2,
    });
  });

  it("omits absent optional fields", () => {
    const result = toHomepagePost({ slug: "a", title: "A", description: "D", publishedAt: new Date(), readingTime: 1 });
    expect(Object.keys(result)).toEqual(["slug", "title", "description", "publishedAt", "readingTime"]);
  });
});
