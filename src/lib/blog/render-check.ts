import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { remarkContentRules } from "./markdown/remark-content-rules";

/**
 * Astro's glob loader logs Markdown render errors (such as our content rules) but keeps going,
 * storing the entry without `rendered`. Turning those into errors makes the build fail instead
 * of publishing an empty article. The content rules are re-run on the body so the error says why.
 */
export async function renderFailures(entries: { id: string; rendered?: unknown; body?: string }[]): Promise<string[]> {
  const failures: string[] = [];
  for (const entry of entries) {
    if (entry.rendered) continue;
    const path = `src/content/blog/${entry.id}/index.md`;
    failures.push((await reason(entry.body ?? "", path)) ?? `${path}: the Markdown failed to render — see the "[blog]" error logged above.`);
  }
  return failures;
}

async function reason(body: string, path: string): Promise<string | undefined> {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkContentRules);
  try {
    await processor.run(processor.parse(body), { path, value: body });
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message.replace(/^\[blog\] /, "") : undefined;
  }
}
