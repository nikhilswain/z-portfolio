"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { formatDate, isoDate } from "@/lib/blog/dates";
import type { HomepagePost } from "@/lib/blog/homepage";

interface BlogSectionProps {
  posts: HomepagePost[];
}

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
          className="mb-16 text-center"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MagicCard className="h-full">
                <a
                  href={`/blog/${post.slug}/`}
                  className="group h-full flex flex-col p-6 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <p className="text-sm text-zinc-500 font-mono mb-3">
                    <time dateTime={isoDate(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
                    {" · "}
                    {post.readingTime} min read
                  </p>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-pink-400 transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-zinc-400 text-sm flex-grow">{post.description}</p>
                  <span className="mt-6 text-sm text-cyan-400" aria-hidden="true">
                    Read article →
                  </span>
                </a>
              </MagicCard>
            </motion.div>
          ))}
        </div>

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
