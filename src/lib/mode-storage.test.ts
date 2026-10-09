import { describe, expect, it } from "vitest";
import { resolveInitialMode } from "./mode-storage";

describe("resolveInitialMode", () => {
  it("restores the stored mode on back/forward navigation", () => {
    expect(resolveInitialMode("back_forward", "cli")).toBe("cli");
    expect(resolveInitialMode("back_forward", "gui")).toBe("gui");
  });

  it("starts at the selector on reload, normal navigation or unknown type", () => {
    expect(resolveInitialMode("reload", "cli")).toBe("select");
    expect(resolveInitialMode("navigate", "gui")).toBe("select");
    expect(resolveInitialMode(undefined, "gui")).toBe("select");
  });

  it("ignores missing or invalid stored values", () => {
    expect(resolveInitialMode("back_forward", null)).toBe("select");
    expect(resolveInitialMode("back_forward", "hacker")).toBe("select");
  });
});
