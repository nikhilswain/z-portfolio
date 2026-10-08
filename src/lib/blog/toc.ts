export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface TocItem {
  heading: TocHeading;
  children: TocHeading[];
}

export const MIN_TOC_HEADINGS = 3;

/** H2s with their H3s nested; other depths are dropped. */
export function groupHeadings(headings: TocHeading[]): TocItem[] {
  const items: TocItem[] = [];
  for (const heading of headings) {
    if (heading.depth === 2) {
      items.push({ heading, children: [] });
    } else if (heading.depth === 3) {
      const last = items.at(-1);
      if (last && last.heading.depth === 2) last.children.push(heading);
      else items.push({ heading, children: [] });
    }
  }
  return items;
}

export function shouldShowToc(headings: TocHeading[]): boolean {
  return headings.filter((h) => h.depth === 2 || h.depth === 3).length >= MIN_TOC_HEADINGS;
}
