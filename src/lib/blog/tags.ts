/** Allowed article tags. The build rejects any other tag; add new ones here. */
export const BLOG_TAGS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Frontend",
  "Architecture",
  "Performance",
  "Canvas",
  "Browser APIs",
  "IndexedDB",
  "CSS",
  "Accessibility",
  "Astro",
  "Animation",
  "Testing",
  "Tooling",
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

/** "Browser APIs" → "browser-apis" (used for the visible `#tag` labels). */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
