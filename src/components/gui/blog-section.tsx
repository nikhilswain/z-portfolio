"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatDate, isoDate } from "@/lib/blog/dates";
import type { HomepagePost } from "@/lib/blog/homepage";
import { tagSlug } from "@/lib/blog/tags";

interface BlogSectionProps {
  posts: HomepagePost[];
}

/** Latest articles as a list, in the same layout as the /blog index. */
export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  const latest = [...posts]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 3);

  return (
    <section className="py-24 bg-zinc-900" aria-labelledby="writing-heading">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2
            id="writing-heading"
            className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500"
          >
            Writing
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto mb-6"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            How and why I built the things in this portfolio — the problems, the decisions and what I learned.
          </p>
        </motion.div>

        <ol className="mx-auto max-w-[860px] border-t border-zinc-800">
          {latest.map((post, index) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group relative grid gap-2 rounded-sm border-b border-zinc-800 py-6 md:grid-cols-[7.5rem_minmax(0,1fr)] md:gap-x-8 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-cyan-400 has-[a:focus-visible]:outline"
            >
              <time dateTime={isoDate(post.publishedAt)} className="pt-1 font-mono text-sm text-zinc-500">
                {formatDate(post.publishedAt)}
              </time>
              <div className="min-w-0 [overflow-wrap:anywhere]">
                <h3 className="text-xl font-semibold leading-snug">
                  {/* The link stretches over the whole row: one tab stop, one announcement. */}
                  <a
                    href={`/blog/${post.slug}/`}
                    className="text-white transition-colors group-hover:text-pink-400 focus-visible:outline-none after:absolute after:inset-0"
                  >
                    {post.title}
                  </a>
                </h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{post.description}</p>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-zinc-500">
                  <span>{post.readingTime} min</span>
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-cyan-400">
                      <span aria-hidden="true">#{tagSlug(tag)}</span>
                      <span className="sr-only">{tag}</span>
                    </span>
                  ))}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          {/* Same look as the hero's "View Resume" RippleButton, but a real link so it can be opened in a new tab. */}
          <a
            href="/blog/"
            className="inline-flex items-center justify-center rounded-lg border-2 bg-background px-4 py-2 text-primary transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            All articles
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
