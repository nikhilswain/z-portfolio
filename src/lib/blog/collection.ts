import { getCollection, render, type CollectionEntry } from "astro:content";
import { PROJECT_IDS } from "./projects";
import { renderFailures } from "./render-check";
import { validatePosts, type PostSummary } from "./tree";

export type BlogEntry = CollectionEntry<"blog">;

export interface BlogPost extends PostSummary {
  entry: BlogEntry;
  readingTime: number;
}

/** Drafts are visible in `astro dev` and in verification builds (`BLOG_INCLUDE_DRAFTS=1`), never in production. */
export function includeDrafts(): boolean {
  return import.meta.env.DEV || process.env.BLOG_INCLUDE_DRAFTS === "1";
}

async function load(): Promise<BlogPost[]> {
  const entries = await getCollection("blog", (entry) => includeDrafts() || !entry.data.draft);
  const failures = await renderFailures(entries);
  if (failures.length > 0) {
    throw new Error(`[blog] Invalid articles:\n- ${failures.join("\n- ")}`);
  }
  const posts = await Promise.all(
    entries.map(async (entry): Promise<BlogPost> => {
      const { remarkPluginFrontmatter } = await render(entry);
      const { data } = entry;
      return {
        entry,
        slug: entry.id,
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt ?? data.publishedAt,
        tags: [...data.tags],
        project: data.project,
        parent: data.parent,
        order: data.order,
        related: data.related,
        draft: data.draft,
        readingTime: Number(remarkPluginFrontmatter.readingTime ?? 1),
      };
    }),
  );
  const errors = validatePosts(posts, { projectIds: PROJECT_IDS });
  if (errors.length > 0) {
    throw new Error(`[blog] Invalid articles:\n- ${errors.join("\n- ")}`);
  }
  return posts;
}

let cached: Promise<BlogPost[]> | undefined;

/** All articles that should be built, validated. Cached per build; re-read on every call in dev. */
export function getBlogPosts(): Promise<BlogPost[]> {
  if (import.meta.env.DEV) return load();
  cached ??= load();
  return cached;
}
