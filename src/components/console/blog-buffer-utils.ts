import type { HomepagePost } from "@/lib/blog/homepage";
import { buildPostTree, flattenTree, type PostRow } from "@/lib/blog/tree";

export type BufferAction = { type: "move"; index: number } | { type: "close" } | { type: "none" };

/** Neovim's `number relativenumber`: absolute on the cursor line, distance elsewhere. */
export function relativeLineNumber(index: number, cursor: number): number {
  return index === cursor ? index + 1 : Math.abs(index - cursor);
}

export function bufferKeyAction(key: string, cursor: number, length: number): BufferAction {
  switch (key) {
    case "j":
    case "ArrowDown":
      return { type: "move", index: Math.min(cursor + 1, length - 1) };
    case "k":
    case "ArrowUp":
      return { type: "move", index: Math.max(cursor - 1, 0) };
    case "g":
    case "Home":
      return { type: "move", index: 0 };
    case "G":
    case "End":
      return { type: "move", index: length - 1 };
    case "q":
    case "Escape":
      return { type: "close" };
    default:
      return { type: "none" };
  }
}

/** Same order as the /blog index; `/blog <n>` opens row n (1-based). */
export function blogRows(posts: HomepagePost[]): PostRow<HomepagePost>[] {
  return flattenTree(buildPostTree(posts));
}
