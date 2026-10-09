# Writing for the zerro.dev blog

This is the practical guide for adding articles. For design details, see
`blog-design-system.md`. For why the blog looks the way it does, see `blog-design-research.md`.

## Add an article

1. Create a folder named after the slug, in lowercase words separated by hyphens:
   `src/content/blog/responsive-layouts-from-editor-coordinates/`.
   The folder name becomes the URL: `https://zerro.dev/blog/<folder-name>/`.
2. Copy `docs/templates/article.md` into it as `index.md`, and put the article's images in the same folder.
3. Write. Preview with `npm run dev:drafts` at `http://localhost:4321/blog/<slug>/` (plain `npm run dev` hides drafts, like production).
4. Set `draft: false` (or delete the line) when it's ready.
5. Commit and push. Cloudflare Pages builds and deploys. The index, sitemap, RSS, table of contents, SEO tags and related links all update automatically.

If you wrote the article inside a project repo (`docs/articles/<slug>/`), copy that whole folder into `src/content/blog/`.

> [!TIP]
> Don't run `npm run build` while `npm run dev` is running. They share Vite's dependency cache, and
> the dev server can end up serving React's production runtime ("jsxDEV is not a function"). If that
> happens, stop the dev server and start it again.

## Frontmatter

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Names the topic: "Reconstructing Responsive Layouts From Editor Coordinates", not "How I Built My Renderer". |
| `description` | yes | One plain sentence, 120–160 characters. Used for search results, the index and social cards. |
| `publishedAt` | yes | `YYYY-MM-DD` |
| `updatedAt` | no | Only for meaningful revisions. Shown as "Updated …" and used as the sitemap date. |
| `tags` | yes | 1–4 from the allowed list below. |
| `project` | no | A project id (see below). Adds the "Related project" card. |
| `parent`, `order` | no | Make this a child article (see below). |
| `related` | no | Slugs to show first under "More from the blog". |
| `seoTitle` | no | Only when the visible title is too long or vague for search. Must describe the same topic. |
| `ogImage` | no | A 1200×630 image for social previews. Without one, the project's image is used, then the site default. |
| `draft` | no | `true` means visible only with `npm run dev:drafts`, never published. Production builds skip drafts entirely, so their images aren't deployed either. |

Reading time is calculated automatically (230 words per minute, code blocks excluded), so don't write it.

**Allowed tags:** React, TypeScript, JavaScript, Frontend, Architecture, Performance, Canvas, Browser APIs, IndexedDB, CSS, Accessibility, Astro, Animation, Testing, Tooling.
To add one, add a line to `src/lib/blog/tags.ts`.

**Project ids:** vidscroll, zist, zketch, z-color-picker, yoink, algo-visualizer, previewz, token-portfolio, shape-editor, css-shorthands, 10days10design, lyricsfinder.
They live in `src/constants/content.json` as `"id"` on each project, and match the repo or package name in lowercase.

To write about a project that isn't shown on the portfolio, add it to `projects` in `content.json` with `"listed": false`. The blog can then use it for the project card and related articles, while the homepage and the CLI `/projects` command hide it.

## Writing the body

- **Never use `#`.** The title is the page's only H1. Start at `##`, nest with `###`, and avoid `####`.
  `##` and `###` headings become the "On this page" table of contents, which appears once there are 3 or more of them.
- **Make headings descriptive** ("Why absolute positioning broke on mobile"), not generic ("Introduction").
- **Images** go next to `index.md`. The quoted text becomes the caption. The bracketed text is the alt text for screen readers, and it is required:

  ```md
  ![Diagram of the render loop: input → stroke buffer → canvas](./render-loop.png "Figure 1. How strokes flow from pointer events to the canvas.")
  ```

  Local images are optimised (WebP, correct dimensions, lazy-loaded). Remote image URLs work but aren't optimised.
  Readers can click any article image to view it larger.

  > [!NOTE]
  > Because of an Astro bug, a straight apostrophe in alt text is rewritten to a typographic one
  > (`'` → `’`) and `&` becomes "and". Captions aren't affected.
- **Callouts:**

  ```md
  > [!NOTE]
  > Context the reader may want.
  ```

  The types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION`. The same syntax renders on GitHub.
- **Code:** always name the language. Add a file title and highlight lines when it helps:

  ````md
  ```ts title="src/engine/stroke.ts" {3-4}
  ...
  ```
  ````

  `diff` and `bash` blocks are supported. Long lines scroll and never wrap. Every block has a copy button.
- **Tables, task lists (`- [ ]`), nested lists, blockquotes and `---` rules** are all supported. Keep tables narrow; wide ones scroll.
- **Plain Markdown only:** no MDX, no HTML components. This keeps articles portable to DEV.to and Hashnode.

## Child articles (deep dives)

A child article extends a main article:

```yaml
parent: browser-drawing-engine   # the main article's slug
order: 1                         # position among its siblings
```

- The main article lists its children under "Deep dives", and `/blog/` shows them nested under it.
- The child shows "Part of: …" above its title.
- URLs stay flat (`/blog/<child-slug>/`), so regrouping never breaks links.
- **One level only:** a child can't have children.
- A child inherits the parent's `project` unless it sets its own.

## When the build fails

| Message contains | Fix |
|---|---|
| `contains an H1` | Change `# Heading` to `## Heading`. |
| `has no alt text` | Describe the image inside `![...]`. |
| `is not a valid date` | Write the date as `YYYY-MM-DD` (for example `2026-10-09`). |
| `Invalid enum value` … `tags` | Use a tag from the allowed list, or add the tag. |
| `unknown project` | Use a known project id, or add the project to `content.json` (with `"listed": false` if it shouldn't appear on the homepage). |
| `parent "…" does not exist or is a draft` | Fix the slug, or publish the parent first. |
| `is itself a child article` | Point `parent` at the top-level article. |
| `related article "…" does not exist` | Fix or remove the slug. |
| `updatedAt is earlier than publishedAt` | Fix the dates. |

## Checking a build locally

```bash
npm test                                         # unit tests for the Markdown plugins and helpers
npm run build && npm run check:blog              # production: drafts must be absent
npm run build:drafts && npm run check:blog -- --drafts   # drafts included (never deploy this dist/)
npm run build                                    # restore a production dist/
```

## Publishing elsewhere

zerro.dev is the original. Other platforms are for distribution, and must point back to it with a canonical URL so search engines credit zerro.dev.

1. Publish on zerro.dev and wait for the deploy.
2. Run `npm run crosspost <slug>`. It reads the live article and writes a kit to `crosspost/<slug>/` (git-ignored):
   - `devto.md`: paste into DEV.to as-is. Its frontmatter sets the title, tags, cover image and `canonical_url`.
   - `hashnode.md`: paste into Hashnode, then turn on "Are you republishing?" in the article settings and enter the zerro.dev URL.
   - `medium.html` with PNG images: open it in a browser, copy everything, and paste into a new Medium story. Upload an image at each yellow placeholder and set the canonical link in the story's advanced settings. Don't use Medium's "Import a story": it drops images, code blocks, tables and headings that contain code.
   - `README.md`: the exact steps, plus each image's position and alt text.

   In the copies, images point at the live site, captions sit under images, callouts become a bold label, and code blocks keep only their language. The command refuses drafts and articles that aren't deployed yet.
3. Share on X / LinkedIn using the zerro.dev link, not the cross-post.
4. Run `npm run crosspost:clean` to delete the kits.

**Before sharing:**
- [ ] The title and description describe the topic.
- [ ] Every image has alt text, and a caption where it helps.
- [ ] Links to the project's live site, its GitHub repo, and the relevant official docs are in place.
- [ ] Checked at phone width in both themes (`npm run dev`).
- [ ] `draft` is removed or set to `false`.
