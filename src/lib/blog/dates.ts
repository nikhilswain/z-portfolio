const DISPLAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Oct 9, 2026". Frontmatter dates are UTC midnight, so format in UTC. */
export function formatDate(date: Date): string {
  return DISPLAY.format(date);
}

/** "2026-10-09" — for `datetime` attributes and the CLI. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function sameDay(a: Date, b: Date): boolean {
  return isoDate(a) === isoDate(b);
}
