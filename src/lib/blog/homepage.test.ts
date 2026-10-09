import { describe, expect, it } from "vitest";
import { toHomepagePost } from "./homepage";

describe("toHomepagePost", () => {
  it("keeps only the fields the homepage needs, including tags for the list", () => {
    const input = {
      slug: "a", title: "A", description: "D", publishedAt: new Date("2026-10-09"),
      readingTime: 4, tags: ["CSS", "React"], parent: "p", order: 2, entry: { huge: true }, project: "zketch",
    };
    expect(toHomepagePost(input)).toEqual({
      slug: "a", title: "A", description: "D", publishedAt: new Date("2026-10-09"),
      readingTime: 4, tags: ["CSS", "React"], parent: "p", order: 2,
    });
  });

  it("omits absent optional fields", () => {
    const result = toHomepagePost({ slug: "a", title: "A", description: "D", publishedAt: new Date(), readingTime: 1, tags: [] });
    expect(Object.keys(result)).toEqual(["slug", "title", "description", "publishedAt", "readingTime", "tags"]);
  });
});
