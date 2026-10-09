/** The serialisable slice of an article the React homepage (GUI + CLI) receives. */
export interface HomepagePost {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  readingTime: number;
  tags: string[];
  parent?: string;
  order?: number;
}

export function toHomepagePost(post: HomepagePost): HomepagePost {
  const { slug, title, description, publishedAt, readingTime, tags, parent, order } = post;
  return {
    slug,
    title,
    description,
    publishedAt,
    readingTime,
    tags: [...tags],
    ...(parent !== undefined ? { parent } : {}),
    ...(order !== undefined ? { order } : {}),
  };
}
