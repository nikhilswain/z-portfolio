import { describe, expect, it } from "vitest";
import { remarkCallouts } from "./remark-callouts";
import { renderMarkdown } from "./test-utils";

const render = async (md: string) =>
  (await renderMarkdown(md, { remarkPlugins: [remarkCallouts] })).html;

describe("remarkCallouts", () => {
  it("turns a NOTE blockquote into a labelled callout", async () => {
    const html = await render("> [!NOTE]\n> Remember this.");
    expect(html).toContain('<div class="callout callout-note" role="note">');
    expect(html).toContain('<p class="callout-title">Note</p>');
    expect(html).toContain("<p>Remember this.</p>");
    expect(html).not.toContain("[!NOTE]");
    expect(html).not.toContain("<blockquote>");
  });

  it.each([
    ["TIP", "tip", "Tip"],
    ["IMPORTANT", "important", "Important"],
    ["WARNING", "warning", "Warning"],
    ["CAUTION", "caution", "Caution"],
  ])("supports [!%s]", async (marker, kind, label) => {
    const html = await render(`> [!${marker}]\n> Body.`);
    expect(html).toContain(`class="callout callout-${kind}"`);
    expect(html).toContain(`<p class="callout-title">${label}</p>`);
  });

  it("is case-insensitive", async () => {
    expect(await render("> [!warning]\n> Careful.")).toContain("callout-warning");
  });

  it("drops a marker-only first paragraph instead of leaving it empty", async () => {
    const html = await render("> [!TIP]\n>\n> Body paragraph.");
    expect(html).not.toMatch(/<p>\s*<\/p>/);
    expect(html).toContain("<p>Body paragraph.</p>");
  });

  it("leaves normal and unknown blockquotes alone", async () => {
    expect(await render("> Just a quote.")).toContain("<blockquote>");
    const unknown = await render("> [!FOO]\n> Body.");
    expect(unknown).toContain("<blockquote>");
    expect(unknown).toContain("[!FOO]");
  });
});
