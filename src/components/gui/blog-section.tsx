"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MagicCard } from "@/components/ui/magic-card";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  readTime: string;
  link: string;
  image?: string;
  tags: string[];
}

interface BlogSectionProps {
  data: BlogPost[];
}

export function BlogSection({ data }: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(data.flatMap((post) => post.tags)));

  // Filter posts based on search query and selected tag
  const filteredPosts = data.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <section className="py-24 bg-zinc-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
            Blog Articles
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto mb-6"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            I used to write a lot of articles on Medium.
          </p>
        </motion.div>

        {/* Search and filter */}
        <div className="mb-12 max-w-xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              className={`cursor-pointer ${!selectedTag ? "bg-pink-500 hover:bg-pink-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                className={`cursor-pointer ${selectedTag === tag ? "bg-pink-500 hover:bg-pink-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Blog posts grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <MagicCard className="h-full">
                  <div className="h-full flex flex-col">
                    {/* Article image */}
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={
                          post.image || "/placeholder.svg?height=200&width=400"
                        }
                        alt={post.title}
                        className="object-cover absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                    </div>

                    {/* Article content */}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-zinc-500 text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center text-zinc-500 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-pink-400 transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="text-zinc-400 mb-4 text-sm flex-grow">
                        {post.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="bg-zinc-800/50 text-zinc-400 border-zinc-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        asChild
                        className="mt-auto bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Read on Medium
                        </a>
                      </Button>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">
              No articles found matching your search criteria.
            </p>
            <Button
              variant="link"
              className="text-pink-400 mt-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* View all on Medium button */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700"
          >
            <a
              href="https://medium.com/@nikhilswain36"
              target="_blank"
              rel="noopener noreferrer"
            >
              View All Articles on Medium
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
