import { describe, expect, it } from "vitest";
import { tagSlug } from "./tags";
import { PROJECT_IDS, getProject, isListedProject } from "./projects";
import {
  buildPostTree,
  childrenOf,
  effectiveProject,
  flattenTree,
  relatedPosts,
  validatePosts,
  type PostSummary,
} from "./tree";

const post = (slug: string, overrides: Partial<PostSummary> = {}): PostSummary => ({
  slug,
  title: slug,
  description: `${slug} description`,
  publishedAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  tags: ["Frontend"],
  draft: false,
  ...overrides,
});
const slugs = (posts: { slug: string }[]) => posts.map((p) => p.slug);

describe("tags and projects", () => {
  it("slugifies tags", () => {
    expect(tagSlug("Browser APIs")).toBe("browser-apis");
    expect(tagSlug("CSS")).toBe("css");
  });

  it("exposes every project id from content.json", () => {
    expect(PROJECT_IDS).toEqual([
      "zist", "zketch", "z-color-picker", "yoink", "algo-visualizer", "previewz",
      "token-portfolio", "shape-editor", "css-shorthands", "10days10design", "lyricsfinder",
    ]);
    expect(getProject("zketch")?.title).toBe("zketch");
    expect(getProject(undefined)).toBeUndefined();
  });

  it("treats projects as listed unless listed is false", () => {
    expect(isListedProject({})).toBe(true);
    expect(isListedProject({ listed: true })).toBe(true);
    expect(isListedProject({ listed: false })).toBe(false);
  });
});

describe("buildPostTree / flattenTree", () => {
  const posts = [
    post("old", { publishedAt: new Date("2026-01-01") }),
    post("new", { publishedAt: new Date("2026-03-01") }),
    post("child-late", { parent: "old", publishedAt: new Date("2026-05-01") }),
    post("child-second", { parent: "old", order: 2, publishedAt: new Date("2026-02-01") }),
    post("child-first", { parent: "old", order: 1, publishedAt: new Date("2026-04-01") }),
  ];

  it("sorts top-level posts newest first and nests children by order, then date", () => {
    const tree = buildPostTree(posts);
    expect(slugs(tree.map((n) => n.post))).toEqual(["new", "old"]);
    expect(slugs(tree[1].children)).toEqual(["child-first", "child-second", "child-late"]);
  });

  it("orders unordered siblings with equal dates by slug, so output is stable", () => {
    const tree = buildPostTree([post("p"), post("b", { parent: "p" }), post("a", { parent: "p" })]);
    expect(slugs(tree[0].children)).toEqual(["a", "b"]);
  });

  it("treats a child whose parent is absent as top-level", () => {
    expect(slugs(buildPostTree([post("orphan", { parent: "missing" })]).map((n) => n.post))).toEqual(["orphan"]);
  });

  it("flattens to rows with depth", () => {
    const rows = flattenTree(buildPostTree(posts));
    expect(rows.map((r) => `${r.depth}:${r.post.slug}`)).toEqual([
      "0:new", "0:old", "1:child-first", "1:child-second", "1:child-late",
    ]);
  });

  it("returns an empty tree for no posts", () => {
    expect(buildPostTree([])).toEqual([]);
  });
});

describe("childrenOf / effectiveProject", () => {
  const parent = post("parent", { project: "zketch" });
  const child = post("child", { parent: "parent" });
  const own = post("own", { parent: "parent", project: "zist" });

  it("lists a post's children", () => {
    expect(slugs(childrenOf(parent, [parent, child, own]))).toEqual(["child", "own"]);
  });

  it("inherits the parent's project unless the child sets one", () => {
    expect(effectiveProject(child, [parent, child])).toBe("zketch");
    expect(effectiveProject(own, [parent, own])).toBe("zist");
    expect(effectiveProject(post("lonely"), [])).toBeUndefined();
  });
});

describe("relatedPosts", () => {
  it("prefers manual related, then parent and siblings, then project, then shared tags, then newest", () => {
    const current = post("current", { parent: "hub", related: ["manual"], tags: ["Canvas"] });
    const posts = [
      current,
      post("hub", { project: "zketch", publishedAt: new Date("2025-01-01") }),
      post("sibling", { parent: "hub", order: 1 }),
      post("manual", { publishedAt: new Date("2024-01-01") }),
      post("same-project", { project: "zketch", publishedAt: new Date("2026-06-01") }),
      post("tagged", { tags: ["Canvas"] }),
      post("newest", { publishedAt: new Date("2027-01-01") }),
    ];
    expect(slugs(relatedPosts(current, posts, 3))).toEqual(["manual", "hub", "sibling"]);
    expect(slugs(relatedPosts(current, posts, 6))).toEqual([
      "manual", "hub", "sibling", "same-project", "tagged", "newest",
    ]);
  });

  it("never returns the current post or its own children", () => {
    const hub = post("hub");
    const result = relatedPosts(hub, [hub, post("kid", { parent: "hub" }), post("other")]);
    expect(slugs(result)).toEqual(["other"]);
  });

  it("returns an empty list when there is nothing else", () => {
    const only = post("only");
    expect(relatedPosts(only, [only])).toEqual([]);
  });
});

describe("validatePosts", () => {
  const ids = ["zketch"];

  it("accepts a valid set", () => {
    expect(validatePosts([post("a", { project: "zketch" }), post("b", { parent: "a", related: ["a"] })], { projectIds: ids })).toEqual([]);
  });

  it("reports an unknown project", () => {
    expect(validatePosts([post("a", { project: "zkech" })], { projectIds: ids })).toEqual([
      'src/content/blog/a/index.md: unknown project "zkech". Known projects: zketch.',
    ]);
  });

  it("reports a missing or draft parent", () => {
    expect(validatePosts([post("a", { parent: "ghost" })], { projectIds: ids })).toEqual([
      'src/content/blog/a/index.md: parent "ghost" does not exist or is a draft.',
    ]);
  });

  it("reports nesting deeper than one level and self-parenting", () => {
    const errors = validatePosts(
      [post("top"), post("mid", { parent: "top" }), post("deep", { parent: "mid" }), post("self", { parent: "self" })],
      { projectIds: ids },
    );
    expect(errors).toEqual([
      'src/content/blog/deep/index.md: parent "mid" is itself a child article. Child articles can only be one level deep.',
      "src/content/blog/self/index.md: an article can't be its own parent.",
    ]);
  });

  it("reports unknown related slugs and updatedAt before publishedAt", () => {
    const errors = validatePosts(
      [post("a", { related: ["nope"], publishedAt: new Date("2026-02-01"), updatedAt: new Date("2026-01-01") })],
      { projectIds: ids },
    );
    expect(errors).toEqual([
      'src/content/blog/a/index.md: related article "nope" does not exist or is a draft.',
      "src/content/blog/a/index.md: updatedAt is earlier than publishedAt.",
    ]);
  });
});
