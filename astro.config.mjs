// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    // ssr: {
    //   noExternal: ["react", "react-dom"],
    // },
  },
  integrations: [
    react({
      include: ["**/react/*", "**/components/**/*.tsx"],
    }),
  ],
});
