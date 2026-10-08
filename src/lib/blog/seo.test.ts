import { describe, expect, it } from "vitest";
import {
  BLOG_ID,
  PERSON_ID,
  articleBreadcrumbs,
  articleTitle,
  articleUrl,
  blogJsonLd,
  blogPostingJsonLd,
  resolveOgImage,
} from "./seo";

const base = {
  slug: "stroke-smoothing",
  title: "Smoothing Pointer Input",
  description: "How strokes get smooth.",
  publishedAt: new Date("2026-10-09"),
  updatedAt: new Date("2026-10-20"),
  tags: ["Canvas", "Performance"],
  image: "/og-image.png",
};

describe("seo", () => {
  it("builds canonical article URLs with a trailing slash", () => {
    expect(articleUrl("a-b")).toBe("https://zerro.dev/blog/a-b/");
  });

  it("uses seoTitle when present", () => {
    expect(articleTitle("Visible")).toBe("Visible — zerro.dev");
    expect(articleTitle("Visible", "Search")).toBe("Search — zerro.dev");
  });

  it("falls back from article to project to default OG image", () => {
    expect(resolveOgImage({ articleImage: "/_astro/a.png", projectImage: "/zketch.png" })).toBe("/_astro/a.png");
    expect(resolveOgImage({ projectImage: "/zketch.png" })).toBe("/zketch.png");
    expect(resolveOgImage({})).toBe("/og-image.png");
  });

  it("builds BlogPosting JSON-LD that references the site Person", () => {
    const ld = blogPostingJsonLd(base);
    expect(ld).toMatchObject({
      "@type": "BlogPosting",
      "@id": "https://zerro.dev/blog/stroke-smoothing/#article",
      headline: "Smoothing Pointer Input",
      url: "https://zerro.dev/blog/stroke-smoothing/",
      mainEntityOfPage: { "@type": "WebPage", "@id": "https://zerro.dev/blog/stroke-smoothing/" },
      datePublished: "2026-10-09T00:00:00.000Z",
      dateModified: "2026-10-20T00:00:00.000Z",
      author: { "@type": "Person", "@id": PERSON_ID, name: "Nikhil Kumar Swain" },
      image: "https://zerro.dev/og-image.png",
      keywords: "Canvas, Performance",
      isPartOf: { "@id": BLOG_ID },
    });
  });

  it("marks a child article as part of its parent", () => {
    const ld = blogPostingJsonLd({ ...base, parent: { slug: "engine", title: "Engine" } });
    expect(ld.isPartOf).toEqual([{ "@id": BLOG_ID }, { "@id": "https://zerro.dev/blog/engine/#article" }]);
  });

  it("builds breadcrumbs, including the parent for children", () => {
    const crumbs = articleBreadcrumbs({ slug: "child", title: "Child" }, { slug: "engine", title: "Engine" });
    expect(crumbs.itemListElement.map((i) => [i.position, i.name, i.item])).toEqual([
      [1, "Home", "https://zerro.dev/"],
      [2, "Blog", "https://zerro.dev/blog/"],
      [3, "Engine", "https://zerro.dev/blog/engine/"],
      [4, "Child", "https://zerro.dev/blog/child/"],
    ]);
  });

  it("builds Blog JSON-LD, including when there are no posts", () => {
    expect(blogJsonLd([]).blogPost).toEqual([]);
    expect(blogJsonLd([{ slug: "a", title: "A", publishedAt: new Date("2026-10-09") }]).blogPost).toEqual([
      { "@type": "BlogPosting", headline: "A", url: "https://zerro.dev/blog/a/", datePublished: "2026-10-09T00:00:00.000Z" },
    ]);
  });
});
