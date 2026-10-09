import type { Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Astro 5's content-layer image pipeline serialises image attributes into an HTML attribute and only
 * un-escapes `"` when reading them back, so `'` and `&` in alt/title text end up double-escaped
 * (screen readers announce "&#x27;"). Rewrite those two characters before Astro sees the image.
 */
const normalize = (text: string) => text.replaceAll("'", "’").replace(/\s*&\s*/g, " and ");

export function rehypeImageText() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      for (const key of ["alt", "title"] as const) {
        const value = node.properties[key];
        if (typeof value === "string") node.properties[key] = normalize(value);
      }
    });
  };
}
