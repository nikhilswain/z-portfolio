import type { APIRoute } from "astro";
import { getBlogPosts } from "@/lib/blog/collection";
import { toHomepagePost } from "@/lib/blog/homepage";

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(JSON.stringify((await getBlogPosts()).map(toHomepagePost)), {
    headers: { "Content-Type": "application/json" },
  });
