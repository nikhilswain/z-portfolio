import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, type PluggableList } from "unified";

export interface RenderResult {
  html: string;
  frontmatter: Record<string, unknown>;
}

/** Runs Markdown through the same stages Astro uses (parse → GFM → remark → rehype → HTML). */
export async function renderMarkdown(
  markdown: string,
  options: { remarkPlugins?: PluggableList; rehypePlugins?: PluggableList; path?: string } = {},
): Promise<RenderResult> {
  const frontmatter: Record<string, unknown> = {};
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(options.remarkPlugins ?? [])
    .use(remarkRehype)
    .use(options.rehypePlugins ?? [])
    .use(rehypeStringify)
    .process({
      value: markdown,
      path: options.path ?? "src/content/blog/test/index.md",
      data: { astro: { frontmatter } },
    });
  return { html: String(file), frontmatter };
}
