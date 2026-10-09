import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { parseFrontmatterMeta, readArticleMeta } from "./article-meta.mjs";

describe("parseFrontmatterMeta", () => {
  it("reads unquoted and quoted dates, comments and draft", () => {
    const source = [
      "---",
      'title: "Hello"',
      "publishedAt: 2026-10-09 # first published",
      'updatedAt: "2026-10-20"',
      "draft: true",
      "---",
      "## Body",
    ].join("\n");
    expect(parseFrontmatterMeta(source)).toEqual({
      publishedAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-20T00:00:00.000Z",
      draft: true,
    });
  });

  it("handles CRLF line endings and missing optional fields", () => {
    expect(parseFrontmatterMeta("---\r\npublishedAt: 2026-01-02\r\n---\r\n")).toEqual({
      publishedAt: "2026-01-02T00:00:00.000Z",
      updatedAt: undefined,
      draft: false,
    });
  });

  it("throws a readable error naming the file and field for a malformed date", () => {
    expect(() => parseFrontmatterMeta("---\npublishedAt: 2026-13-45\n---", "src/content/blog/bad/index.md")).toThrow(
      '[blog] src/content/blog/bad/index.md: publishedAt "2026-13-45" is not a valid date. Use YYYY-MM-DD.',
    );
    expect(() => parseFrontmatterMeta("---\npublishedAt: 2026-01-01\nupdatedAt: soon\n---", "x.md")).toThrow(
      '[blog] x.md: updatedAt "soon" is not a valid date. Use YYYY-MM-DD.',
    );
  });

  it("returns null without frontmatter or publishedAt", () => {
    expect(parseFrontmatterMeta("## No frontmatter")).toBeNull();
    expect(parseFrontmatterMeta("---\ntitle: x\n---")).toBeNull();
  });
});

describe("readArticleMeta", () => {
  it("maps folder slugs to metadata and skips folders without index.md", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "blog-meta-"));
    mkdirSync(path.join(dir, "first-post"));
    writeFileSync(path.join(dir, "first-post", "index.md"), "---\npublishedAt: 2026-10-09\n---\n");
    mkdirSync(path.join(dir, "empty-folder"));
    const meta = readArticleMeta(pathToFileURL(dir + path.sep));
    expect([...meta.keys()]).toEqual(["first-post"]);
    expect(meta.get("first-post")?.publishedAt).toBe("2026-10-09T00:00:00.000Z");
  });

  it("names the article file when a date is malformed", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "blog-meta-bad-"));
    mkdirSync(path.join(dir, "broken-post"));
    writeFileSync(path.join(dir, "broken-post", "index.md"), "---\npublishedAt: yesterday\n---\n");
    expect(() => readArticleMeta(pathToFileURL(dir + path.sep))).toThrow(
      /src\/content\/blog\/broken-post\/index\.md: publishedAt "yesterday" is not a valid date/,
    );
  });

  it("returns an empty map when the folder does not exist", () => {
    expect(readArticleMeta(pathToFileURL(path.join(tmpdir(), "does-not-exist-blog") + path.sep)).size).toBe(0);
  });
});
