import { describe, expect, it } from "vitest";
import { formatDate, isoDate, sameDay } from "./dates";

describe("dates", () => {
  it("formats YAML dates (UTC midnight) without shifting the day", () => {
    expect(formatDate(new Date("2026-10-09"))).toBe("Oct 9, 2026");
    expect(isoDate(new Date("2026-10-09"))).toBe("2026-10-09");
  });

  it("compares calendar days", () => {
    expect(sameDay(new Date("2026-10-09"), new Date("2026-10-09T18:00:00Z"))).toBe(true);
    expect(sameDay(new Date("2026-10-09"), new Date("2026-10-10"))).toBe(false);
  });
});
