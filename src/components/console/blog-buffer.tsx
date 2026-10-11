import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { isoDate } from "@/lib/blog/dates";
import type { HomepagePost } from "@/lib/blog/homepage";
import { blogRows, bufferKeyAction, relativeLineNumber } from "./blog-buffer-utils";

interface BlogBufferProps {
  posts: HomepagePost[];
  onClose: () => void;
}

/** Enough `~` lines for a maximized terminal on a tall screen; the overflow is clipped. */
const FILLER_LINES = 60;

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
    <div className="console-blog" onKeyDown={handleKeyDown}>
      <ol className="console-blog__list" aria-label="Blog articles">
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
                className={`console-blog__row${active ? " console-blog__row--active" : ""}`}
              >
                <span aria-hidden="true" className="console-blog__num">
                  {relativeLineNumber(index, cursor)}
                </span>
                <span className="console-blog__date">{isoDate(post.publishedAt)}</span>
                <span className="console-blog__title">
                  {depth === 1 && <span aria-hidden="true" className="console-blog__child">└─ </span>}
                  {post.title}
                </span>
                <span className="console-blog__time">{post.readingTime} min</span>
              </a>
            </li>
          );
        })}
      </ol>
      {/* Neovim-style `~` lines fill whatever height is left; clipped, so they never cause scrolling. */}
      <div aria-hidden="true" className="console-blog__filler">
        {Array.from({ length: FILLER_LINES }, (_, index) => (
          <div key={index}>~</div>
        ))}
      </div>
      <div className="console-blog__status">
        <span>
          <b>BLOG</b> blog://zerro.dev
        </span>
        <span>
          {cursor + 1}/{rows.length}
        </span>
      </div>
      <p className="console-blog__hint">j/k ↑/↓ move · enter open · g/G top/bottom · q esc quit</p>
    </div>
  );
}
