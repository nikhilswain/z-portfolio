/**
 * Astro's glob loader logs Markdown render errors (such as our content rules) but keeps going,
 * storing the entry without `rendered`. Turning those into errors makes the build fail instead
 * of publishing an empty article.
 */
export function renderFailures(entries: { id: string; rendered?: unknown }[]): string[] {
  return entries
    .filter((entry) => !entry.rendered)
    .map(
      (entry) =>
        `src/content/blog/${entry.id}/index.md: the Markdown failed to render — see the "[blog]" error logged above (for example an H1 in the body or an image without alt text).`,
    );
}
