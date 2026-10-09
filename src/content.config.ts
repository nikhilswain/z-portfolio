import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { readArticleMeta } from "./lib/blog/article-meta.mjs";
import { draftsEnabled } from "./lib/blog/drafts.mjs";
import { searchMetaProblems } from "./lib/blog/seo";
import { BLOG_TAGS } from "./lib/blog/tags";

const BLOG_DIR = "./src/content/blog";
const includeDrafts = draftsEnabled();

/**
 * Unless BLOG_INCLUDE_DRAFTS=1 (dev or build), drafts aren't loaded at all, so Astro never processes their images —
 * otherwise unpublished screenshots would still be deployed under /_astro/.
 */
function blogPattern(): string[] {
  if (includeDrafts) return ["*/index.md"];
  const meta = readArticleMeta(pathToFileURL(path.resolve(BLOG_DIR) + path.sep));
  const drafts = [...meta].filter(([, article]) => article.draft).map(([slug]) => `!${slug}/index.md`);
  return ["*/index.md", ...drafts];
}

const blog = defineCollection({
  // One folder per article: src/content/blog/<slug>/index.md → entry id "<slug>".
  loader: glob({ pattern: blogPattern(), base: BLOG_DIR }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.enum(BLOG_TAGS)).min(1).max(4),
      project: z.string().optional(),
      parent: z.string().optional(),
      order: z.number().int().positive().optional(),
      related: z.array(z.string()).optional(),
      seoTitle: z.string().optional(),
      ogImage: image().optional(),
      draft: z.boolean().default(false),
    })
      // Published articles must show their whole title and description in search results; drafts may be rough.
      .superRefine((data, ctx) => {
        if (data.draft) return;
        for (const message of searchMetaProblems(data)) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }),
});

export const collections = { blog };
