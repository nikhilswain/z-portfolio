import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

/** Build-time content rules: no H1 in the body (the title is the H1) and every image needs alt text. */
export function remarkContentRules() {
  return (tree: Root, file: VFile) => {
    visit(tree, (node) => {
      if (node.type === "heading" && node.depth === 1) {
        throw new Error(
          `[blog] ${file.path}: the article body contains an H1 ("${toString(node)}"). ` +
            `The title is the page's only H1 — start body headings at "##".`,
        );
      }
      if (node.type === "image" && !node.alt?.trim()) {
        throw new Error(
          `[blog] ${file.path}: image "${node.url}" has no alt text. ` +
            `Describe what it shows: ![description](${node.url}).`,
        );
      }
    });
  };
}
