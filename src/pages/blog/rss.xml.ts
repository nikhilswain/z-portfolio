import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getBlogPosts } from "@/lib/blog/collection";
import { BLOG_TAGLINE } from "@/lib/blog/seo";
import { compareTopLevel } from "@/lib/blog/tree";

export async function GET(context: APIContext) {
  const posts = [...(await getBlogPosts())].sort(compareTopLevel);
  return rss({
    title: "zerro.dev — Blog",
    description: `${BLOG_TAGLINE} Technical writing by Nikhil Kumar Swain.`,
    site: context.site ?? "https://zerro.dev",
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.publishedAt,
      link: `/blog/${post.slug}/`,
      categories: post.tags,
    })),
    customData: "<language>en</language>",
  });
}
