import type { Root } from "hast";
import { visit } from "unist-util-visit";

/** GFM task-list checkboxes have no label; give each one an accessible name that states its status. */
export function rehypeTaskList() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "input" || node.properties.type !== "checkbox") return;
      node.properties.ariaLabel = node.properties.checked ? "Done" : "Not done";
    });
  };
}
