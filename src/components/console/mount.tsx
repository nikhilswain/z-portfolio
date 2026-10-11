import { createRoot, type Root } from "react-dom/client";
import { Console } from "./Console";
import type { HomepagePost } from "@/lib/blog/homepage";
import "./console.css";

let root: Root | null = null;
let host: HTMLElement | null = null;
let returnFocus: HTMLElement | null = null;

export async function toggleConsole() {
  if (root) return closeConsole();
  returnFocus = document.activeElement as HTMLElement | null;
  const posts: HomepagePost[] = (await (await fetch("/console-data.json")).json()).map(
    (p: HomepagePost) => ({ ...p, publishedAt: new Date(p.publishedAt) }),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  root.render(<Console posts={posts} onClose={closeConsole} />);
}

function closeConsole() {
  root?.unmount();
  host?.remove();
  root = host = null;
  returnFocus?.focus();
}
