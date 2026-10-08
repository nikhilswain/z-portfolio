import type { Root } from "hast";
import { SKIP, visit } from "unist-util-visit";

/** Wraps tables so wide ones scroll horizontally inside the article instead of the page. */
export function rehypeTableScroll() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"],
          role: "region",
          tabIndex: 0,
          ariaLabel: "Scrollable table",
        },
        children: [node],
      };
      return [SKIP, index + 1];
    });
  };
}
