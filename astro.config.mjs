// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://zerro.dev",
  output: "static",
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD
        ? { "react-dom/server": "react-dom/server.edge" }
        : undefined,
    },
  },
  integrations: [
    react({
      include: ["**/react/*", "**/components/**/*.tsx"],
    }),
    sitemap({
      filter: (page) => !page.includes("/api/"),
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === "https://zerro.dev/") {
          item.priority = 1.0;
          item.changefreq = "weekly";
        }
        if (item.url.includes("/resume/")) {
          item.priority = 0.6;
          item.changefreq = "monthly";
        }
        return item;
      },
    }),
  ],
});
