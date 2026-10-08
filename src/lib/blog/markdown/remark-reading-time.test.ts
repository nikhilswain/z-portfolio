import { describe, expect, it } from "vitest";
import { remarkReadingTime, WORDS_PER_MINUTE } from "./remark-reading-time";
import { renderMarkdown } from "./test-utils";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const minutes = async (md: string) =>
  (await renderMarkdown(md, { remarkPlugins: [remarkReadingTime] })).frontmatter.readingTime;

describe("remarkReadingTime", () => {
  it("uses 230 words per minute and rounds up", async () => {
    expect(WORDS_PER_MINUTE).toBe(230);
    expect(await minutes(words(230))).toBe(1);
    expect(await minutes(words(231))).toBe(2);
  });

  it("ignores fenced code blocks", async () => {
    expect(await minutes("```js\n" + words(2000) + "\n```\n\n" + words(10))).toBe(1);
  });

  it("counts emphasis, links and inline code", async () => {
    // 200 + "and" + 31 = 232 words → 2 minutes
    expect(await minutes(`**${words(200)}** and \`${words(31)}\``)).toBe(2);
  });

  it("never reports less than 1 minute", async () => {
    expect(await minutes("")).toBe(1);
  });
});
