export const SITE_URL = "https://zerro.dev";
export const PERSON_ID = `${SITE_URL}/#person`;
export const BLOG_ID = `${SITE_URL}/blog/#blog`;
export const AUTHOR_NAME = "Nikhil Kumar Swain";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const BLOG_TAGLINE = "Things I've built, broken, tested, and learned.";
export const BLOG_DESCRIPTION =
  "Technical writing by Nikhil Kumar Swain about the projects behind zerro.dev — the problems, decisions and lessons from building them.";

const author = { "@type": "Person", "@id": PERSON_ID, name: AUTHOR_NAME, url: SITE_URL } as const;

/** JSON for an inline `<script type="application/ld+json">`: `<` is escaped so text like `</script>` can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString();
}

export function articleUrl(slug: string): string {
  return absoluteUrl(`/blog/${slug}/`);
}

/** Search results cut titles off at about this many characters. */
export const MAX_TITLE_LENGTH = 60;
const TITLE_SUFFIX = " — zerro.dev";

/** The `<title>`: the site name is added only while the whole title still fits in 60 characters. */
export function articleTitle(title: string, seoTitle?: string): string {
  const base = seoTitle ?? title;
  return base.length + TITLE_SUFFIX.length <= MAX_TITLE_LENGTH ? base + TITLE_SUFFIX : base;
}

/** Why a published article's search title or description won't show in full in search results; empty when fine. */
export function searchMetaProblems(meta: { title: string; seoTitle?: string; description: string }): string[] {
  const problems: string[] = [];
  if (meta.seoTitle !== undefined) {
    if (meta.seoTitle.length > MAX_TITLE_LENGTH) {
      problems.push(`seoTitle is ${meta.seoTitle.length} characters; search results cut titles off at about 60. Shorten it.`);
    }
  } else if (meta.title.length > MAX_TITLE_LENGTH) {
    problems.push(
      `title is ${meta.title.length} characters; search results cut titles off at about 60. Shorten it, or add a seoTitle of 60 characters or fewer.`,
    );
  }
  const length = meta.description.length;
  if (length < 120 || length > 160) {
    problems.push(`description is ${length} characters; it must be 120–160 (140–156 is ideal) so search results show all of it.`);
  }
  return problems;
}

export function resolveOgImage(input: { articleImage?: string; projectImage?: string }): string {
  return input.articleImage ?? input.projectImage ?? DEFAULT_OG_IMAGE;
}

export interface ArticleJsonLdInput {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  image: string;
  parent?: { slug: string; title: string };
}

export function blogPostingJsonLd(input: ArticleJsonLdInput) {
  const url = articleUrl(input.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author,
    publisher: author,
    image: absoluteUrl(input.image),
    keywords: input.tags.join(", "),
    inLanguage: "en",
    isPartOf: input.parent
      ? [{ "@id": BLOG_ID }, { "@id": `${articleUrl(input.parent.slug)}#article` }]
      : { "@id": BLOG_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleBreadcrumbs(post: { slug: string; title: string }, parent?: { slug: string; title: string }) {
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog/" },
    ...(parent ? [{ name: parent.title, path: `/blog/${parent.slug}/` }] : []),
    { name: post.title, path: `/blog/${post.slug}/` },
  ]);
}

export function blogJsonLd(posts: { slug: string; title: string; publishedAt: Date }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    name: "zerro.dev Blog",
    url: absoluteUrl("/blog/"),
    description: BLOG_DESCRIPTION,
    author,
    inLanguage: "en",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: articleUrl(post.slug),
      datePublished: post.publishedAt.toISOString(),
    })),
  };
}
