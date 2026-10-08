import type { Blockquote, Paragraph, Root } from "mdast";
import type {} from "mdast-util-to-hast";
import { visit } from "unist-util-visit";

export const CALLOUT_LABELS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

export type CalloutKind = keyof typeof CALLOUT_LABELS;

const MARKER = /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\r?\n|$)/i;

/** GitHub-style alerts (`> [!NOTE]`) → `<div class="callout callout-note" role="note">` with a text title. */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const first = node.children[0];
      if (first?.type !== "paragraph") return;
      const lead = first.children[0];
      if (lead?.type !== "text") return;
      const match = MARKER.exec(lead.value);
      if (!match) return;

      const kind = match[1].toLowerCase() as CalloutKind;
      lead.value = lead.value.slice(match[0].length);
      if (lead.value === "") first.children.shift();
      if (first.children.length === 0) node.children.shift();

      const title: Paragraph = {
        type: "paragraph",
        data: { hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: CALLOUT_LABELS[kind] }],
      };
      node.children.unshift(title);
      node.data = {
        ...node.data,
        hName: "div",
        hProperties: { className: ["callout", `callout-${kind}`], role: "note" },
      };
    });
  };
}
