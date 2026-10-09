# Blog design research

These measurements and decisions back the blog's design, so future changes aren't arbitrary.
All measurements are computed styles of real articles at 1440px wide, taken in October 2026.

## Measurements

| Blog | Body | Line height | Column | Chars/line | Body font | TOC |
|---|---|---|---|---|---|---|
| Vercel | 18px | 1.56 | 688px | 84 | Geist | none |
| GitHub Engineering | 18px | 1.67 | 699px | 86 | Mona Sans | right |
| Josh W. Comeau | 18px | 1.5 | 686px | 83 | Wotfard | right |
| Cloudflare | 16px | 1.75 | 715px | 96 | Inter | right |
| DEV.to | 18px | 1.5 | 656px | 83 | system | none |
| Medium | 20px | 1.6 | 680px | 78 | Source Serif | none |
| overreacted | 16px | 1.75 | 632px | 85 | Merriweather | none |
| Stripe | 18px | 1.56 | 810px | 101 | Söhne | none |
| TkDodo | 20px | 1.8 | 960px | 101 | Inter | none |

The cluster is 18px body text, a ~1.6 line height, a 656–715px column and 83–86 characters per line. Stripe and TkDodo are outliers and too wide for long reading. Code is set in a monospace font at 14–16px everywhere.

## Decisions

| Platform / source | Pattern observed | Decision | Reason |
|---|---|---|---|
| Vercel, GitHub, Josh Comeau, DEV.to | ~700px column, 18px body | 700px max column, 18px body (17px on mobile), line height 1.7 | Matches the cluster. Light-on-dark text needs slightly more leading. |
| Josh Comeau, GitHub, Cloudflare, GitBook/Stripe docs | "On this page" lives in the right rail; docs use the left rail for site navigation | Right-side sticky TOC at ≥1280px; collapsible `<details>` below | There's no site navigation to occupy the left. The article stays centred. |
| NN/g on tables of contents | Right rails risk "banner blindness"; rails don't translate to mobile | Plain-text TOC styling; an inline collapsible TOC on smaller screens | Keeps the rail looking like navigation, not an ad. Works without JS. |
| Wikimedia sticky-TOC testing | Readers want to reorient in long pages without scrolling to the top | Sticky rail with an active-section highlight; a 2px reading-progress line | Fast orientation in long technical articles. |
| Medium, DEV.to | Title-first header; metadata in one quiet line | No hero image; H1 → lead → mono meta line → tags | Technical articles lead with substance; real screenshots go in the body. |
| Vercel (Geist + Geist Mono), GitHub (Mona Sans) | A sans body font with a matching mono | IBM Plex Sans + IBM Plex Mono | One family, built for technical docs, not a trend pick. The mono ties the blog to the portfolio's CLI mode. |
| overreacted, Cloudflare | Body text slightly off-white on dark backgrounds | Body `#e2e2e8` on `#0a0a0f` | Reduces glare while keeping 15:1 contrast. |
| DEV.to, GitHub | Code with a copy button, file titles, horizontal scroll | Expressive Code with both themes, titles, line markers and copy | Feature-complete, with accessible copy feedback; JS only for the copy button. |
| overreacted and other text-first indexes | Plain list of titles and dates rather than a card grid | Text list with a mono date column; children nested with `└─` | Titles and descriptions are what readers scan. Thumbnails add noise. |
| GitHub alerts | `> [!NOTE]` callouts | The same syntax, with an icon and a text label | Renders on GitHub inside project repos too, and isn't colour-only. |
