# Blog design system

This is the source of truth for the blog's look and behaviour. The implementation lives in
`src/styles/blog.css` (tokens and styles), `src/layouts/BlogLayout.astro` and
`src/components/blog/`. Code blocks are configured in `astro.config.mjs` (Expressive Code).
Change this document whenever you change those files.

Every rule in `blog.css` is scoped to `:root[data-theme]`. Only `BlogLayout` sets that attribute, so
the homepage and `/resume/` never receive blog styles.

## Foundations

### Typography

| Token | Value | Used for |
|---|---|---|
| `--blog-font-sans` | IBM Plex Sans Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif | All UI and body text |
| `--blog-font-mono` | IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace | Code, dates, reading time, tags, section labels, TOC title, wordmark |
| `--blog-text-title` | `clamp(2.25rem, 1.6rem + 2.4vw, 3rem)` | Article H1 |
| `--blog-text-index-title` | `clamp(2.5rem, 1.9rem + 2.4vw, 3.25rem)` | `/blog/` H1 |
| `--blog-text-h2` / `-h3` / `-h4` | 1.75rem / 1.375rem / 1.125rem | Body headings |
| `--blog-text-body` | 1.0625rem (17px); 1.125rem (18px) at ≥768px | Body |
| `--blog-text-lead` | 1.1875rem; 1.3125rem at ≥768px | Article description, index tagline |
| `--blog-text-list-title` | 1.25rem | Index titles, project card name |
| `--blog-text-small` | 0.9375rem | Tables, nav links, secondary text |
| `--blog-text-meta` | 0.875rem | Meta lines, captions, TOC, section labels |
| `--blog-text-code-inline` | 0.875em | Inline code |
| Code blocks | 0.9375rem, line height 1.6 (Expressive Code `styleOverrides`) | Fenced code |

| Line heights | Value |
|---|---|
| `--blog-leading-body` | 1.7 |
| `--blog-leading-snug` | 1.45 |
| `--blog-leading-heading` | 1.25 |
| `--blog-leading-title` | 1.1 |

| Weights | Value |
|---|---|
| `--blog-weight-body` | 400 |
| `--blog-weight-medium` | 500 |
| `--blog-weight-heading` | 600 |
| `--blog-weight-title` | 700 |

Titles use `letter-spacing: -0.02em` and `text-wrap: balance`. Section labels are uppercase mono with `0.08em` tracking.

Fonts are self-hosted with Fontsource and imported only in `BlogLayout.astro`: Plex Sans variable (upright and italic), and Plex Mono 400, 400 italic and 500. The latin subsets of Plex Sans (upright) and Plex Mono 400 are `<link rel="preload">`ed, so the fallback-to-Plex swap happens before first paint. Without that, the header shifts (CLS 0.109 on throttled mobile, 0 with the preloads).

### Colour

| Token | Dark | Light | Role |
|---|---|---|---|
| `--blog-bg` | `#0a0a0f` | `#fbfaf7` | Page background |
| `--blog-surface` | `#13131a` | `#f2f0eb` | Inline TOC, table header, project card |
| `--blog-fg` | `#e2e2e8` | `#23232a` | Body text |
| `--blog-fg-strong` | `#f6f6f8` | `#0d0d12` | Headings, titles, strong text |
| `--blog-fg-muted` | `#a1a1ad` | `#5a5a66` | Meta, captions, lead, TOC links |
| `--blog-fg-subtle` | `#6b6b78` | `#9a9aa5` | **Decorative only** (tree connectors, filler), never text |
| `--blog-border` | `#26262f` | `#e3e0d8` | Rules, borders |
| `--blog-accent` | `#f472b6` | `#be185d` | Links, wordmark cursor, active nav underline |
| `--blog-accent-2` | `#22d3ee` | `#0e7490` | Tags, active TOC border, task checkboxes |
| `--blog-focus` | `#22d3ee` | `#0e7490` | Focus outlines |
| `--blog-code-inline-bg` | `#1c1c25` | `#efece6` | Inline code background |
| `--blog-callout-note` | `#22d3ee` | `#155e75` | Note callout |
| `--blog-callout-tip` | `#4ade80` | `#166534` | Tip callout |
| `--blog-callout-important` | `#c084fc` | `#7e22ce` | Important callout |
| `--blog-callout-warning` | `#fbbf24` | `#92400e` | Warning callout |
| `--blog-callout-caution` | `#f87171` | `#b91c1c` | Caution callout |

The reading-progress line is a gradient from `--blog-accent` to `--blog-accent-2`. Callout backgrounds are the callout colour mixed at 8% into `--blog-bg`, with a 35% mix for the border.

**Contrast (WCAG ratios):**

| Pair | Dark | Light |
|---|---|---|
| fg / bg | 15.3 | 15.0 |
| fg-strong / bg | 18.3 | 18.6 |
| fg-muted / bg | 7.7 | 6.5 |
| fg-muted / surface | 7.2 | 6.0 |
| accent / bg | 7.5 | 5.8 |
| accent-2 / bg | 10.9 | 5.1 |
| fg-strong / inline-code bg | 15.7 | 16.4 |
| callout title / callout bg (worst case) | 6.6 | 5.4 |

Every text pair is at least 4.5:1. The lightbox is the one documented exception to the theme tokens: it is always a dark overlay (`rgb(0 0 0 / 0.85)` backdrop, `#e2e2e8` caption) in both themes.

### Spacing, layout, radii, breakpoints

- **Spacing scale:** `--blog-space-1` … `--blog-space-9` = 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6 rem.
- **Rhythm:**
  - `--blog-flow` (1.25em) between body blocks.
  - H2 has 3rem above (`--blog-h2-above`) and 1rem below (`--blog-h2-below`).
  - H3/H4 have 2.25rem above and 0.75rem below.
  - Code blocks, figures and tables have `--blog-space-6` (2rem) above and below.
  - Headings use `scroll-margin-top: var(--blog-anchor-offset)` (header height + 1.5rem), so anchor jumps clear the sticky header.
- **Widths:**

  | Token | Value |
  |---|---|
  | `--blog-measure` (article column) | 700px |
  | `--blog-index-width` | 860px |
  | `--blog-toc-width` | 200px |
  | `--blog-toc-gap` | 2.5rem |
  | `--blog-shell` (header and footer width; measure + 2 × (toc + gap)) | 1180px |

- **Page padding:** `--blog-page-pad` is 1.25rem, rising to 2rem at ≥768px. **Header height:** `--blog-header-h` is 3.5rem.
- **Radii:** `--blog-radius-sm` 0.25rem (inline code, focus rings) and `--blog-radius` 0.5rem (cards, code, images, callouts, TOC box).
- **Breakpoints:**

  | Width | What changes |
  |---|---|
  | 640px | Full-bleed code blocks end |
  | 768px | Type and padding step up; the index gets its date column |
  | 1280px | The TOC moves into the right rail |

## Components

### Site header
- **Markup:** `SiteHeader.astro` renders `header.site-header`, containing the `zerro_` wordmark (linking to `/`), `nav.site-nav` (Blog, Resume) and the theme toggle.
- **Layout:** sticky at the top, `--blog-header-h` tall, a translucent background (88% `--blog-bg`) with a backdrop blur and a bottom border, and inner width `--blog-shell`.
- **Current page:** the active nav link has `aria-current="page"`, with a 2px `--blog-accent` underline.
- **Progress line:** on article pages, `.reading-progress` is a 2px gradient line on the header's bottom edge. It is driven by `animation-timeline: scroll(root block)` with no JS. It is hidden when the browser lacks support and under reduced motion.

### Theme toggle
- `ThemeToggle.astro` is a `<button>` showing a sun icon in dark mode and a moon icon in light mode. Its `aria-label` always describes the action ("Switch to light theme").
- The choice is stored in `localStorage["zerro-theme"]`, and every storage access is wrapped in try/catch.
- **Before paint:** an inline `<head>` script in `BlogLayout` sets `data-theme` from storage, falling back to `prefers-color-scheme`.
- **Without JS:** the server renders `data-theme="dark"`.
- **Browser chrome:** the theme script and the toggle set `<meta name="theme-color">` to the current `--blog-bg` (`#0a0a0f` dark, `#fbfaf7` light), so mobile browser bars match the page.

### Skip link
`.skip-link` is the first focusable element. It is visually off-screen until focused, then appears at the top left and moves focus to `main#MainContent`, which has `tabindex="-1"`.

Layout ids (`MainContent`, `LatestHeading`, `MediumHeading`, `TocRailTitle`, `DeepDivesHeading`, `RelatedProjectHeading`, `MoreHeading`) are mixed-case on purpose: heading ids generated from Markdown are always lowercase, so the two can never collide. `check:blog` fails on any duplicate id.

### Article header
`ArticleHeader.astro` renders, in order:
1. "Part of: <parent>" in mono, children only.
2. `h1.article-title`.
3. `p.article-lead` with the description, muted, in `--blog-text-lead`.
4. `ArticleMeta`: `date · N min read · Updated date` in mono. "Updated" appears only when it falls on a different day from the publish date.
5. The tag list as `#slug` labels in `--blog-accent-2`, each with visually hidden full tag text.

A bottom border separates the header from the body.

### Table of contents
- **Content:** H2 and H3 headings from Astro's `render()` output, grouped with `groupHeadings()`. It isn't rendered when there are fewer than 3 such headings.
- **Rail (≥1280px):** `aside.toc-rail > nav.toc-rail__inner`, placed in grid column 3 and starting on row 2, level with the body rather than the header. It is sticky at `header height + 2rem`, scrolls internally when tall, and is titled "On this page" in mono uppercase.
- **Inline (<1280px):** `details.toc-inline` with a "On this page" summary and a +/− marker, closed by default, on a surface background.
- **Links:** each link has a 2px left border. H3 entries are indented by an extra 1rem.
- **Active state:** a passive `scroll` listener throttled with `requestAnimationFrame` (in `TocList.astro`) marks the last heading above 120px as current. At the bottom of the page the last heading is current. The active link gets `aria-current="true"`, the strong text colour, medium weight and an `--blog-accent-2` border, so colour is never the only signal.

### Prose
- **Element styles:**

  | Element | Style |
  |---|---|
  | Paragraphs | `--blog-text-body` with a 1.7 line height |
  | Links | `--blog-accent`, underlined (1px, offset 0.2em, 2px on hover) |
  | `strong` | Strong colour, weight 600 |
  | `del` | Muted |
  | Lists | Disc and decimal markers (Tailwind's preflight reset is undone), muted markers, 0.4em between items |
  | Task lists | No bullet; checkbox in `--blog-accent-2`, labelled "Done" or "Not done" by `rehype-task-list` |
  | Blockquotes | 3px left border, muted text |
  | `hr` | 1px border with 3rem vertical margin |
  | Inline code | Mono, `--blog-code-inline-bg`, 1px border, small radius, `overflow-wrap: anywhere` |

- **Long text:** `.blog` sets `overflow-wrap: break-word`, so long URLs and words never widen the page.

### Code blocks
- Expressive Code with the themes `github-dark-default` and `github-light-default`. The theme is selected through `[data-theme]`, not the media query.
- Font: Plex Mono at 0.9375rem with a 1.6 line height. Radius 0.5rem.
- Supported features:
  - frame titles (`title="…"`)
  - line markers (`{3-4}`)
  - diff and terminal frames
  - an accessible copy button

  Long lines scroll and never wrap.
- **Below 640px** blocks run edge to edge, with negative margins equal to the page padding.

### Figures, captions and lightbox
- Markdown images with a title become `<figure><img><figcaption>`, via `rehype-figure`.
- **Images:** max-width 100%, auto height, 1px border, 0.5rem radius. Width and height attributes come from Astro, so there's no layout shift. They are lazy-loaded and converted to WebP.
- **Captions:** `--blog-text-meta`, muted, centred, 0.75rem below the image.
- **Lightbox:** `Lightbox.astro` wraps every article image in `button.zoom-trigger`, labelled "View larger: <alt>". Clicking opens a native `<dialog>` (via `showModal()`, which traps focus) with the full image and its caption.
  - **Closing:** Esc, the × button, or a backdrop click.
  - **Focus:** returns to the triggering button.
- **Alt text:** `rehype-image-text` rewrites `'` to `’` and `&` to "and" in alt and title text, to work around an Astro escaping bug.

### Tables
Every table is wrapped in `div.table-scroll`, which has `role="region"`, `tabindex="0"` and `aria-label="Scrollable table"`. That makes it keyboard-scrollable and gives it the focus ring. The wrapper has a border and radius. Header cells use the surface background with no wrapping; cells are padded 0.5rem × 1rem with row borders.

### Callouts
- `> [!NOTE|TIP|IMPORTANT|WARNING|CAUTION]` becomes `div.callout.callout-<kind>` with `role="note"`.
- Each callout has a mono uppercase title ("Note", "Tip"…) preceded by a CSS-mask icon (info, lightbulb, message, triangle, octagon) in the callout colour.
- A 3px left border in the callout colour, a tinted background and a 35% border. Kind is never conveyed by colour alone.

### Article footer
`footer.article-footer` holds the sections below, in order, with 3rem between them:
1. **Deep dives** (a parent with children): a tree list (`└─`) of children in `order`, with reading time.
2. **Related project:** `.project-card` on the surface background, showing the name, description, and mono links "View project →" and "View source →". "View source" is hidden when `github` is empty. Link text includes a visually hidden project name.
3. **More from the blog:** up to 3 articles from `relatedPosts()`, each with title, description and `date · min`.
4. **Actions:** `CopyLink` (a mono bordered button; shows "Copied" for 2s and announces through an `aria-live` region) and "← Back to blog", above a top border.

Section headings use `.section-label`, the mono uppercase label with a bottom border.

### Blog index
- `/blog/` has a header (H1 "Blog", the tagline, an "RSS feed" link), then a "Latest" section, then "Earlier writing on Medium".
- **Post rows (`.post-row`):** at ≥768px, a 7.5rem mono date column next to the body. The body holds the title (H3), description, and `N min · #tags` meta.
  - The title link stretches over the whole row with `::after`, so the row is clickable but there is one tab stop.
  - Focus outlines the whole row, via `:has(:focus-visible)`.
- **Children:** nested under their parent in `order`, as `└─ date title · N min`, raised above the stretched link with `z-index: 1`.
- **Empty state:** "First articles are on the way." in the lead size, muted.
- **Medium list:** year in mono, then the title link with ↗ and visually hidden "(opens Medium in a new tab)".

### Site footer
`.site-footer` has a top border and inner width `--blog-shell`. It shows "© year Nikhil Kumar Swain" with RSS and GitHub (`rel="me"`) links in muted meta text.

## Responsive rules

| Component | Mobile (<640) | Small tablet (640–767) | Tablet (768–1023) | Laptop (1024–1279) | Desktop (1280–1535) | Wide (≥1536) |
|---|---|---|---|---|---|---|
| Page padding | 1.25rem | 1.25rem | 2rem | 2rem | 2rem | 2rem |
| Body text | 17px | 17px | 18px | 18px | 18px | 18px |
| Article column | full width minus padding | full width minus padding | ≤700px, centred | ≤700px, centred | 700px, centred | 700px, centred |
| TOC | inline `<details>` | inline | inline | inline | right rail, sticky | right rail, sticky |
| Code blocks | full-bleed | inside column | inside column | inside column | inside column | inside column |
| Tables | scroll in box | scroll in box | scroll in box | scroll in box | scroll in box | scroll in box |
| Header/footer | padded, full width | padded | max 1180px | max 1180px | max 1180px | max 1180px |
| Index rows | date above title | date above title | date column + body | date column + body | date column + body | date column + body |
| Article title | 36px → scales | scales | scales | scales | 48px max | 48px |
| Lightbox | 96vw max | 96vw | 96vw | 96vw | min(96vw, 1600px) | 1600px max |

Nothing may cause horizontal page scrolling at any width. Only code blocks and tables scroll sideways, inside their own boxes.

## Accessibility

- **Focus:** every interactive element gets a 2px `--blog-focus` outline at a 3px offset. Index rows outline the whole row.
- **Contrast:** all text pairs are at least 4.5:1 (see the table above).
- **Keyboard:**
  - The skip link comes first.
  - The TOC `<details>` toggles with Enter or Space.
  - The lightbox is a native modal `<dialog>`: it traps focus, Esc closes it, and focus returns to the trigger.
  - Code copy buttons and Copy link are real buttons.
  - Table regions are focusable.
  - The CLI `/blog` buffer uses a roving tabindex: j/k and the arrows move, g/G and Home/End jump, Enter opens, and q/Esc closes and returns focus to the prompt.
- **Reduced motion:** smooth scrolling is enabled only under `prefers-reduced-motion: no-preference`. The reading-progress line is hidden otherwise.
- **Semantics:**
  - Each page has one H1.
  - Landmarks are `header`, `nav` (labelled "Main"), `main`, `article`, `aside` (the TOC rail) and `footer`.
  - TOC links use `aria-current="true"`.
  - Callouts use `role="note"` with a visible text label.
  - Tags have visually hidden full names.
  - Decorative glyphs (`└─`, `·`, `↗`, `→`) are `aria-hidden`.
- **No JS:** the server renders `data-theme="dark"`. Article text, TOC anchor links, the `<details>` TOC and code highlighting all work without JS. Only the copy buttons, lightbox, theme toggle and TOC highlight need it.

## Content rules

The full guide is `blog-authoring.md`. In short:

- **Frontmatter:** `title`, `description` (120–160 characters), `publishedAt` and `tags` (1–4 from the allowed list) are required. `updatedAt`, `project`, `parent`, `order`, `related`, `seoTitle`, `ogImage` and `draft` are optional.
- **Slugs:** the folder name under `src/content/blog/`, lowercase and hyphenated, 3–6 topic words. URLs are always `/blog/<slug>/`, and child articles stay flat.
- **Images:** local, next to `index.md`. Alt text is required (the build fails without it). The title becomes the caption.
- **Headings:** no H1 in the body (the build fails on one). Use H2 and H3 for structure; they feed the TOC.
- **Tags:** only those in `src/lib/blog/tags.ts`, with no near-duplicates (React, not ReactJS).
- **Projects:** `project` must be an `id` in `content.json`. Blog-only projects use `"listed": false`.
