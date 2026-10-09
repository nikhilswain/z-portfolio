import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { isoDate } from "@/lib/blog/dates";
import type { HomepagePost } from "@/lib/blog/homepage";
import { blogRows, bufferKeyAction, relativeLineNumber } from "./blog-buffer-utils";

interface BlogBufferProps {
  posts: HomepagePost[];
  onClose: () => void;
}

const MIN_LINES = 12;

export function BlogBuffer({ posts, onClose }: BlogBufferProps) {
  const rows = useMemo(() => blogRows(posts), [posts]);
  const [cursor, setCursor] = useState(0);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    links.current[cursor]?.focus();
  }, [cursor]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const action = bufferKeyAction(event.key, cursor, rows.length);
    if (action.type === "none") return;
    event.preventDefault();
    if (action.type === "close") onClose();
    else setCursor(action.index);
  };

  return (
    <div className="flex h-full flex-col font-mono text-sm" onKeyDown={handleKeyDown}>
      <ol className="flex-1 overflow-auto" aria-label="Blog articles">
        {rows.map(({ post, depth }, index) => {
          const active = index === cursor;
          return (
            <li key={post.slug}>
              <a
                ref={(element) => {
                  links.current[index] = element;
                }}
                href={`/blog/${post.slug}/`}
                tabIndex={active ? 0 : -1}
                onFocus={() => setCursor(index)}
                className={`grid grid-cols-[3ch_1fr_auto] sm:grid-cols-[3ch_11ch_1fr_auto] gap-3 px-2 py-0.5 outline-none ${
                  active ? "bg-zinc-800 text-white" : "text-cyan-500 hover:bg-zinc-900"
                }`}
              >
                <span aria-hidden="true" className={`text-right ${active ? "text-pink-400" : "text-zinc-600"}`}>
                  {relativeLineNumber(index, cursor)}
                </span>
                <span className="hidden sm:block text-zinc-500">{isoDate(post.publishedAt)}</span>
                <span className="truncate">
                  {depth === 1 && <span aria-hidden="true" className="text-zinc-600">└─ </span>}
                  {post.title}
                </span>
                <span className="text-zinc-500">{post.readingTime} min</span>
              </a>
            </li>
          );
        })}
        {Array.from({ length: Math.max(0, MIN_LINES - rows.length) }, (_, index) => (
          <li key={`filler-${index}`} aria-hidden="true" className="px-2 text-zinc-700">
            ~
          </li>
        ))}
      </ol>
      <div className="flex justify-between bg-pink-500 px-2 text-black">
        <span>
          <b>BLOG</b> blog://zerro.dev
        </span>
        <span>
          {cursor + 1}/{rows.length}
        </span>
      </div>
      <p className="px-2 py-1 text-zinc-500">j/k ↑/↓ move · enter open · g/G top/bottom · q esc quit</p>
    </div>
  );
}
