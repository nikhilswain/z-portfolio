// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import { remarkContentRules } from "./src/lib/blog/markdown/remark-content-rules.ts";
import { remarkReadingTime } from "./src/lib/blog/markdown/remark-reading-time.ts";
import { remarkCallouts } from "./src/lib/blog/markdown/remark-callouts.ts";
import { rehypeFigure } from "./src/lib/blog/markdown/rehype-figure.ts";
import { rehypeTableScroll } from "./src/lib/blog/markdown/rehype-table-scroll.ts";
import { readArticleMeta } from "./src/lib/blog/article-meta.mjs";

const SITE = "https://zerro.dev";
const articleMeta = readArticleMeta(new URL("./src/content/blog/", import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "always",
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [remarkContentRules, remarkReadingTime, remarkCallouts],
    rehypePlugins: [rehypeFigure, rehypeTableScroll],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD
        ? { "react-dom/server": "react-dom/server.edge" }
        : undefined,
    },
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark-default", "github-light-default"],
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: "0.5rem",
        codeFontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        codeFontSize: "0.9375rem",
        codeLineHeight: "1.6",
        uiFontFamily: "'IBM Plex Sans Variable', system-ui, sans-serif",
      },
    }),
    react({
      include: ["**/react/*", "**/components/**/*.tsx"],
    }),
    sitemap({
      filter: (page) => !page.includes("/api/"),
      changefreq: ChangeFreqEnum.WEEKLY,
      priority: 0.8,
      serialize(item) {
        if (item.url === `${SITE}/`) {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }
        if (item.url.includes("/resume/")) {
          item.priority = 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        if (item.url === `${SITE}/blog/`) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }
        const slug = /\/blog\/([^/]+)\/$/.exec(item.url)?.[1];
        const meta = slug ? articleMeta.get(slug) : undefined;
        if (meta) {
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.lastmod = meta.updatedAt ?? meta.publishedAt;
        }
        return item;
      },
    }),
  ],
});
