import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

export const WORDS_PER_MINUTE = 230;

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Adds `readingTime` (whole minutes, min 1) to Astro's remark frontmatter. Fenced code is not counted. */
export function remarkReadingTime() {
  return (tree: Root, file: VFile) => {
    let words = 0;
    visit(tree, ["text", "inlineCode"], (node) => {
      words += countWords((node as { value: string }).value);
    });
    const data = file.data as { astro?: { frontmatter?: Record<string, unknown> } };
    data.astro ??= {};
    data.astro.frontmatter ??= {};
    data.astro.frontmatter.readingTime = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  };
}
