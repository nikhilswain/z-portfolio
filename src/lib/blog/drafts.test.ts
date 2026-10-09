import { describe, expect, it } from "vitest";
import { draftsEnabled } from "./drafts.mjs";

describe("draftsEnabled", () => {
  it("is off unless BLOG_INCLUDE_DRAFTS is exactly 1, in dev and in builds alike", () => {
    expect(draftsEnabled({})).toBe(false);
    expect(draftsEnabled({ BLOG_INCLUDE_DRAFTS: "0" })).toBe(false);
    expect(draftsEnabled({ BLOG_INCLUDE_DRAFTS: "true" })).toBe(false);
    expect(draftsEnabled({ BLOG_INCLUDE_DRAFTS: "1" })).toBe(true);
  });
});
