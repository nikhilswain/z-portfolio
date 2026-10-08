import type { Element, ElementContent, Root } from "hast";
import { SKIP, visit } from "unist-util-visit";

const isBlank = (node: ElementContent) => node.type === "text" && node.value.trim() === "";

/** A paragraph containing only `![alt](src "Caption")` becomes `<figure><img><figcaption>Caption</figcaption></figure>`. */
export function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || !parent || index === undefined) return;
      const content = node.children.filter((child) => !isBlank(child));
      if (content.length !== 1) return;
      const img = content[0];
      if (img.type !== "element" || img.tagName !== "img") return;
      const caption = img.properties.title;
      if (typeof caption !== "string" || caption.trim() === "") return;

      delete img.properties.title;
      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          img,
          { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] },
        ],
      };
      parent.children[index] = figure;
      return [SKIP, index + 1];
    });
  };
}
