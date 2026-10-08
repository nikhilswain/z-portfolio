export interface TreeItem {
  slug: string;
  parent?: string;
  order?: number;
  publishedAt: Date;
}

export interface PostSummary extends TreeItem {
  title: string;
  description: string;
  updatedAt: Date;
  tags: string[];
  project?: string;
  related?: string[];
  draft: boolean;
}

export interface PostNode<T extends TreeItem> {
  post: T;
  children: T[];
}

export interface PostRow<T extends TreeItem> {
  post: T;
  depth: 0 | 1;
}

const time = (date: Date) => date.getTime();

/** Newest first; slug breaks ties so output is stable. */
export function compareTopLevel(a: TreeItem, b: TreeItem): number {
  return time(b.publishedAt) - time(a.publishedAt) || a.slug.localeCompare(b.slug);
}

/** `order` ascending (unordered last), then oldest first, then slug. */
export function compareChildren(a: TreeItem, b: TreeItem): number {
  const ao = a.order ?? Number.POSITIVE_INFINITY;
  const bo = b.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao < bo ? -1 : 1;
  return time(a.publishedAt) - time(b.publishedAt) || a.slug.localeCompare(b.slug);
}

export function buildPostTree<T extends TreeItem>(posts: T[]): PostNode<T>[] {
  const slugs = new Set(posts.map((post) => post.slug));
  const isChild = (post: T) => post.parent !== undefined && slugs.has(post.parent);
  return posts
    .filter((post) => !isChild(post))
    .sort(compareTopLevel)
    .map((post) => ({ post, children: childrenOf(post, posts) }));
}

export function flattenTree<T extends TreeItem>(nodes: PostNode<T>[]): PostRow<T>[] {
  return nodes.flatMap(({ post, children }) => [
    { post, depth: 0 as const },
    ...children.map((child) => ({ post: child, depth: 1 as const })),
  ]);
}

export function childrenOf<T extends TreeItem>(post: T, posts: T[]): T[] {
  return posts.filter((candidate) => candidate.parent === post.slug).sort(compareChildren);
}

export function effectiveProject<T extends PostSummary>(post: T, posts: T[]): string | undefined {
  if (post.project) return post.project;
  return post.parent ? posts.find((candidate) => candidate.slug === post.parent)?.project : undefined;
}

/**
 * "More from the blog": manual `related` → parent + siblings → same project → most shared tags → newest.
 * Never includes the current post or its own children (those are listed under "Deep dives").
 */
export function relatedPosts<T extends PostSummary>(current: T, posts: T[], limit = 3): T[] {
  const pool = posts.filter((p) => p.slug !== current.slug && p.parent !== current.slug);
  const bySlug = new Map(pool.map((p) => [p.slug, p]));
  const picked: T[] = [];
  const add = (p: T | undefined) => {
    if (p && picked.length < limit && !picked.includes(p)) picked.push(p);
  };

  for (const slug of current.related ?? []) add(bySlug.get(slug));
  if (current.parent) {
    add(bySlug.get(current.parent));
    pool.filter((p) => p.parent === current.parent).sort(compareChildren).forEach(add);
  }
  const project = effectiveProject(current, posts);
  if (project) {
    pool.filter((p) => effectiveProject(p, posts) === project).sort(compareTopLevel).forEach(add);
  }
  const shared = (p: T) => p.tags.filter((tag) => current.tags.includes(tag)).length;
  pool
    .filter((p) => shared(p) > 0)
    .sort((a, b) => shared(b) - shared(a) || compareTopLevel(a, b))
    .forEach(add);
  [...pool].sort(compareTopLevel).forEach(add);
  return picked;
}

/** Cross-article rules the schema can't express. Returns human-readable errors (empty when valid). */
export function validatePosts(posts: PostSummary[], options: { projectIds: readonly string[] }): string[] {
  const errors: string[] = [];
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  for (const post of posts) {
    const where = `src/content/blog/${post.slug}/index.md`;
    if (post.project && !options.projectIds.includes(post.project)) {
      errors.push(`${where}: unknown project "${post.project}". Known projects: ${options.projectIds.join(", ")}.`);
    }
    if (post.parent !== undefined) {
      const parent = bySlug.get(post.parent);
      if (post.parent === post.slug) {
        errors.push(`${where}: an article can't be its own parent.`);
      } else if (!parent) {
        errors.push(`${where}: parent "${post.parent}" does not exist or is a draft.`);
      } else if (parent.parent !== undefined) {
        errors.push(`${where}: parent "${post.parent}" is itself a child article. Child articles can only be one level deep.`);
      }
    }
    for (const slug of post.related ?? []) {
      if (!bySlug.has(slug)) errors.push(`${where}: related article "${slug}" does not exist or is a draft.`);
    }
    if (post.updatedAt.getTime() < post.publishedAt.getTime()) {
      errors.push(`${where}: updatedAt is earlier than publishedAt.`);
    }
  }
  return errors;
}
