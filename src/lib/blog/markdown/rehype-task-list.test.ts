import { describe, expect, it } from "vitest";
import { rehypeTaskList } from "./rehype-task-list";
import { renderMarkdown } from "./test-utils";

describe("rehypeTaskList", () => {
  it("gives task-list checkboxes an accessible name that states their status", async () => {
    const { html } = await renderMarkdown("- [x] Ship it\n- [ ] Write tests", { rehypePlugins: [rehypeTaskList] });
    expect(html).toContain('<input type="checkbox" checked disabled aria-label="Done">');
    expect(html).toContain('<input type="checkbox" disabled aria-label="Not done">');
  });

  it("leaves other inputs alone", async () => {
    const { html } = await renderMarkdown("- plain item", { rehypePlugins: [rehypeTaskList] });
    expect(html).not.toContain("aria-label");
  });
});
