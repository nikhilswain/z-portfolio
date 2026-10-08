import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { BLOG_TAGS } from "./lib/blog/tags";

const blog = defineCollection({
  // One folder per article: src/content/blog/<slug>/index.md → entry id "<slug>".
  loader: glob({ pattern: "*/index.md", base: "./src/content/blog" }),
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
    }),
});

export const collections = { blog };
