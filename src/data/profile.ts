export type Month = `${number}-${string}`; // "2025-12"

export interface NoteLine {
  kind: "+" | "~" | "-";
  text: string;
}

export interface Job {
  company: string;
  role: string;
  start: Month;
  end: Month | null; // null = present
  location: string; // "Remote"
  bullets: string[]; // verbatim from resume-source.txt (resume page)
  notes: NoteLine[]; // 2–3 short patch-note lines (homepage), ≤ 90 chars each
}

export interface Project {
  id: string;
  title: string;
  description: string; // existing text kept for blog RelatedProject
  pitch: string; // one line, ≤ 110 chars
  stack: string[];
  image?: string;
  link?: string;
  github?: string;
  listed?: boolean; // false = blog-only (keep existing semantics)
  featured?: number; // #n index on the homepage
  bullets?: string[]; // resume "Projects" section, verbatim
}

export const PERSON: {
  name: string;
  handle: "zero";
  title: string;
  location: string;
  locationShort: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  site: string;
  avatar: string;
  resumePdf: string;
  careerStart: Month;
  intro: string;
  summary: string;
} = {
  name: "Nikhil Kumar Swain",
  handle: "zero",
  title: "Frontend Developer",
  location: "Cuttack, Odisha, India",
  locationShort: "Cuttack, IN",
  email: "nikhilswain36@gmail.com",
  github: "https://github.com/nikhilswain",
  linkedin: "https://www.linkedin.com/in/nikhil-kumar-swain-408110152/",
  twitter: "https://x.com/iamn1khil",
  site: "https://zerro.dev",
  avatar: "/luffyGrin.jpg",
  resumePdf: "/nikhil-kumar-swain-resume.pdf",
  careerStart: "2022-02",
  intro:
    "Frontend developer with 4+ years building web apps, SaaS products and developer tools. I learn by making things: tools I wish existed, experiments that got out of hand, and side projects that deserve more attention than they get.",
  summary:
    "Frontend Developer with 4+ years of hands-on experience across SaaS products, client platforms, and independent software projects. Strong in React.js, Next.js, and TypeScript, with a broad understanding of product development across UI engineering, APIs, architecture, performance, and deployment. Comfortable owning complex requirements end to end and turning them into reliable, maintainable software.",
};

export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Webpack",
      "Tailwind CSS",
      "Sass",
      "Responsive Design",
      "Accessibility",
      "UI/UX",
    ],
  },
  {
    group: "Architecture & State",
    items: [
      "Micro Frontends",
      "Component Architecture",
      "Design Systems",
      "Modular UI",
      "Redux",
      "Zustand",
      "MobX",
      "Framer Motion",
      "GSAP",
    ],
  },
  {
    group: "Backend & APIs",
    items: [
      "Node.js",
      "Express.js",
      "NestJS",
      "REST APIs",
      "API Integration",
      "MongoDB",
      "PostgreSQL",
      "Supabase",
    ],
  },
  {
    group: "Testing & Quality",
    items: [
      "Jest",
      "React Testing Library",
      "Playwright",
      "Cypress",
      "Unit Testing",
      "Integration Testing",
      "Browser Debugging",
      "Performance Optimization",
      "Core Web Vitals",
    ],
  },
  {
    group: "Cloud & Tools",
    items: ["AWS", "Google Cloud", "Netlify", "Vercel", "Git", "GitHub", "NPM", "Vite", "Figma"],
  },
  {
    group: "AI & Development Tools",
    items: ["Claude", "OpenAI Codex", "Cursor", "AI-Assisted Development"],
  },
];

export const EXPERIENCE: Job[] = [
  {
    company: "Creazilla",
    role: "Frontend Developer (Contract)",
    start: "2025-12",
    end: "2026-09",
    location: "Remote",
    bullets: [
      "Rebuilt approximately 90% of a production visual website editor using React, TypeScript, and MobX, implementing page management, locking, duplication, animations, site routing, responsive editing, preview, and publishing workflows for a platform receiving 334K+ monthly visits.",
      "Built a JSON-driven website renderer from scratch supporting 10+ interactive element types including text, images, GIFs, video, vectors, visual effects, and animations.",
      "Architected the renderer's Module Federation integration with 3 shared editor modules, independently deployed remote components, and shared React dependencies across editor and renderer applications.",
      "Engineered responsive layout reconstruction using bounding-box calculations, collision detection, coordinate transformation, overlap grouping, and layout inference across 10+ element types to preserve editor-created designs across viewport sizes.",
      "Refactored the rendering pipeline with code splitting, lazy loading, preloading, prefetching, and caching, reducing cold page load to approximately 1-3 seconds and bringing LCP to roughly 1.5 seconds without effects and 2.5 seconds with effects.",
      "Developed and shipped 5 interactive tools for SuperColoring, contributing to a platform receiving approximately 897K monthly visits.",
    ],
    notes: [
      { kind: "+", text: "Rebuilt ~90% of a production visual website editor (334K visits/mo)" },
      { kind: "+", text: "JSON-driven renderer shared over Module Federation" },
      { kind: "~", text: "Cold load down to 1–3s, LCP ≈ 1.5s" },
    ],
  },
  {
    company: "Freelance",
    role: "Frontend / Full Stack Developer",
    start: "2025-07",
    end: "2025-11",
    location: "Remote",
    bullets: [
      "Delivered 5 portfolio websites, 3 custom web designs, 4 Discord bots, and 2 Shopify projects for private clients using React.js, Next.js, TypeScript, Shopify, and modern frontend tooling.",
      "Developed full-stack client projects spanning responsive frontend applications, backend services, REST APIs, database-backed workflows, and third-party integrations.",
      "Worked directly with clients and designers on architecture planning, translating requirements into reusable components, responsive layouts, and production-ready interfaces.",
      "Managed iterative development across 14+ client deliverables through design revisions, testing, deployment, and production fixes.",
    ],
    notes: [
      { kind: "+", text: "Delivered 5 portfolio sites, 3 designs, 4 Discord bots, 2 Shopify builds" },
      { kind: "+", text: "Full-stack work: REST APIs, database workflows, integrations" },
      { kind: "~", text: "Shipped 14+ client deliverables through revisions and deployment" },
    ],
  },
  {
    company: "Adstia Pvt Ltd",
    role: "Senior Frontend Developer",
    start: "2023-04",
    end: "2025-05",
    location: "Remote",
    bullets: [
      "Led frontend development of WeCall CMS, building a plugin-based micro frontend architecture with independently deployed themes and plugins, shared dependencies, and reusable UI components for 300+ private client websites.",
      "Built core CMS workflows for site administration, plugin management, content editing, live preview, and multi-site configuration, supporting 5+ plugin types and 15+ reusable components.",
      "Owned the end-to-end development of a visual questionnaire builder using XYFlow, replacing the manual process of converting client requirements or Google Forms into custom CMS questionnaire components with a self-service node-based workflow for building, previewing, testing, and publishing questionnaires.",
      "Designed conditional workflow logic using branching nodes and multi-edge question flows, supporting questionnaires with 100+ nodes and reducing questionnaire configuration time by 50%+.",
      "Built the frontend for an automated Netlify deployment panel that allowed users to register and manage up to 20 websites, configure custom domains, monitor deployment status, and access deployment logs and errors.",
      "Led a 4-person development team for a real-time call analytics dashboard, building a virtualized Syncfusion React DataGrid capable of rendering 1,000+ call records per refresh alongside live WebSocket updates.",
      "Implemented real-time analytics with 3 primary chart types, bubble, bar, and pie, synchronizing visualizations with live call data while using virtualization to handle large datasets efficiently.",
    ],
    notes: [
      { kind: "+", text: "Led WeCall CMS plugin architecture across 300+ client sites" },
      { kind: "+", text: "Visual questionnaire builder (XYFlow) cut config time by 50%+" },
      { kind: "~", text: "Real-time analytics grid rendering 1,000+ calls per refresh" },
    ],
  },
  {
    company: "Yugam Technologies",
    role: "Full Stack Engineer",
    start: "2022-02",
    end: "2023-03",
    location: "Remote",
    bullets: [
      "Built the frontend for Codma, a styling and layout toolkit that enabled users to inspect website elements, modify styles and layouts, preview changes in real time, and generate implementation-ready code.",
      "Developed a browser extension using Browser APIs and Shadow DOM to inspect and manipulate elements inside third-party websites, enabling live style changes and isolated UI injection; reached 1.5K+ downloads.",
      "Built the Codma styling panel in React with JavaScript-based component templates and real-time preview capabilities, supporting isolated component rendering and live style inspection across 4+ core styling workflows.",
      "Contributed approximately 40% of the Node.js and MongoDB backend in a 3-person startup team, implementing APIs and database-backed workflows for Codma.",
    ],
    notes: [
      { kind: "+", text: "Built Codma styling frontend with real-time preview" },
      { kind: "+", text: "Browser extension reached 1.5K+ downloads" },
      { kind: "+", text: "Wrote ~40% of the Node.js and MongoDB backend" },
    ],
  },
];

export const EDUCATION: { degree: string; school: string; start: number; end: number }[] = [
  { degree: "Master of Computer Applications", school: "Graphic Era University", start: 2022, end: 2024 },
  { degree: "Bachelor of Computer Applications", school: "Graphic Era University", start: 2019, end: 2022 },
];

export const PROJECTS: Project[] = [
  {
    id: "vidscroll",
    title: "vidscroll",
    description:
      "An npm package for scroll-scrubbed video in React and plain HTML. Smooth on any MP4 or WebM: files with sparse keyframes are re-encoded in the browser with WebCodecs and cached, so scrubbing never stutters.",
    pitch: "Scroll-scrubbed video for React and plain HTML, with in-browser re-encoding.",
    stack: ["npm library", "React", "TypeScript", "WebCodecs API", "Cache Storage", "Web Components"],
    image: "/vidscroll.jpg",
    link: "https://vidscroll.js.org/",
    github: "https://github.com/nikhilswain/vidscroll",
    featured: 5,
  },
  {
    id: "zist",
    title: "zist",
    description:
      "Zist is a Kanban board app for organizing tasks with workspaces, rich cards, activity tracking, and local data storage.",
    pitch: "Local-first Kanban with workspaces, rich cards and offline storage.",
    stack: ["React", "TypeScript", "Astro", "Shadcn", "IndexedDB", "Tailwind CSS", "Chart.js"],
    image: "/zist.png",
    link: "https://zist.zerro.dev",
    github: "https://github.com/nikhilswain/zist",
    featured: 3,
    bullets: [
      "Built a local-first Kanban application with workspaces, boards, rich task cards, drag-and-drop across columns, checklists, activity history, saved views, command palette, and JSON backup/restore.",
      "Engineered a browser-local data architecture using hand-rolled IndexedDB persistence with optimistic state updates, supporting nested boards, task data, compressed images, and offline-first usage without a backend.",
      "Built an analytics dashboard with 8+ Chart.js visualizations and workspace, board, and time-range filtering, while implementing custom drag-and-drop state reconciliation for complex board mutations across a 14K+ LOC codebase.",
    ],
  },
  {
    id: "zketch",
    title: "zketch",
    description:
      "Zketch is a canvas based drawing app with freehand sketching, multiple brush types, zoom/pan, and undo/redo support. You can save your work in a local vault or export it as images for easy sharing.",
    pitch: "Canvas drawing app with freehand sketching, zoom/pan and undo/redo.",
    stack: ["React", "TypeScript", "Astro", "IndexedDB", "Dexie.js", "Tailwind CSS", "Canvas API"],
    image: "/zketch.png",
    link: "https://zketch.zerro.dev",
    github: "https://github.com/nikhilswain/zketch",
    featured: 2,
    bullets: [
      "Built a browser-based canvas editor with freehand and shape drawing, image insertion, selection, manipulation, zoom/pan, export, and shareable drawings.",
      "Optimized stroke generation and rendering using interpolation and typed-array data structures, supporting drawings with thousands of strokes while improving memory and history handling.",
      "Built a local-first MobX and IndexedDB architecture with undo/redo and stroke replay animations, and integrated a custom published React color-picker library for drawing controls.",
    ],
  },
  {
    id: "z-color-picker",
    title: "Z Color Picker",
    description:
      "Z Color Picker is a lightweight React library for fast, cross-device color selection with eyedropper support. It supports all major color formats, offers full customization, and comes with TypeScript support.",
    pitch: "Lightweight React color picker with eyedropper and all color formats.",
    stack: ["npm library", "React", "TypeScript", "Vite"],
    image: "/zcolorpicker.png",
    link: "https://www.npmjs.com/package/@zzro/z-color-picker",
    github: "https://github.com/nikhilswain/z-color-picker",
  },
  {
    id: "yoink",
    title: "Yoink",
    description:
      "A browser extension that extracts original-quality media URLs from Twitter/X and Instagram. Videos, images, reels — just click Yoink and grab the direct CDN link.",
    pitch: "Browser extension that grabs original-quality media URLs from X and Instagram.",
    stack: ["JavaScript", "WebExtensions API", "CSS"],
    image: "/yoink.png",
    github: "https://github.com/nikhilswain/yoink",
  },
  {
    id: "algo-visualizer",
    title: "Algo Visualizer",
    description:
      "An interactive algorithm visualizer that shows how algorithms work internally, step by step. It combines visual execution with synchronized code to make the logic, flow, and behavior easy to understand.",
    pitch: "Interactive algorithm visualizer pairing step-by-step execution with code.",
    stack: ["React", "TypeScript", "Tailwind CSS"],
    image: "/algo-visualizer.png",
    link: "https://algovisualiser.zerro.dev",
    github: "https://github.com/nikhilswain/algo-visualizer",
  },
  {
    id: "previewz",
    title: "Previewz",
    description:
      "Previewz is a local-first personal gallery where you can save images, videos, and links, and preview them instantly. It includes hidden vaults to keep your private content secure and fully under your control.",
    pitch: "Local-first gallery for images, videos and links with hidden vaults.",
    stack: ["React", "Astro", "TypeScript", "Tailwind CSS", "Framer Motion"],
    image: "/previewz.png",
    link: "https://previewz.zerro.dev/",
    github: "https://github.com/nikhilswain/Previewz",
  },
  {
    id: "token-portfolio",
    title: "token-portfolio",
    description:
      "An app to track crypto tokens, view portfolio value, and connect a wallet — built for speed, simplicity, and full control over the design.",
    pitch: "Track crypto tokens and portfolio value with wallet connect.",
    stack: ["React", "TypeScript", "CSS", "Wagmi", "RainbowKit", "CoinGecko API"],
    image: "/tokenPortfolio.png",
    link: "https://token-portfolio-lime.vercel.app/",
    github: "https://github.com/nikhilswain/token-portfolio",
  },
  {
    id: "shape-editor",
    title: "shape-editor",
    description:
      "A web-based shape editor that allows users to create, edit, and combine SVG shapes using various tools and boolean operations.",
    pitch: "Web shape editor for creating, editing and combining SVG shapes.",
    stack: ["React", "TypeScript", "SVG/Canvas API", "Styled CSS"],
    image: "/shapeEditor.png",
    link: "https://shape-editor.pages.dev",
  },
  {
    id: "css-shorthands",
    title: "css-shorthands",
    description:
      "A curated list of useful CSS shorthand properties with syntax-highlighted code examples using Prism.js.",
    pitch: "Curated list of CSS shorthand properties with code examples.",
    stack: ["JavaScript", "Html", "Css", "Prism.js"],
    image: "/cssshorthand.webp",
    link: "https://css-shorthands.netlify.app/",
    github: "https://github.com/nikhilswain/css-shorthands",
  },
  {
    id: "10days10design",
    title: "10days10designs",
    description:
      "A self-initiated 10-day design challenge showcasing daily UI creations styled with Tailwind CSS.",
    pitch: "10-day self-initiated design challenge of daily UI creations.",
    stack: ["Html", "CSS", "Tailwind CSS", "JavaScript"],
    image: "10days10design.webp",
    link: "https://10days10designs.netlify.app/",
    github: "https://github.com/nikhilswain/10days10design",
  },
  {
    id: "lyricsfinder",
    title: "LyricsFinder",
    description:
      "A simple app to fetch and display song lyrics based on the singer and song name using the Lyrics API.",
    pitch: "Fetch and display song lyrics by singer and song name.",
    stack: ["Html", "Css", "JavaScript", "Rest API"],
    image: "/lyricsFinder.webp",
    link: "https://lyricsfounder.netlify.app/",
    github: "https://github.com/nikhilswain/lyricsfinder",
  },
  {
    id: "dmap",
    title: "DMap",
    description:
      "A Discord-integrated browser RPG that turns server categories into districts and channels into persistent houses in a seeded, server-specific world.",
    pitch: "Discord-integrated browser RPG that turns servers into worlds.",
    stack: ["TypeScript", "React", "Phaser", "Cloudflare", "Discord API"],
    image: "/dmap.png",
    link: "https://dmap.zerro.dev",
    featured: 0,
    bullets: [
      "Built a Discord-integrated browser RPG that transforms server categories into districts and channels into persistent houses, generating a unique server-specific world using seeded, constraint-based procedural generation.",
      "Engineered custom game systems including A* pathfinding, spatial-indexed collision, chunked terrain rendering, quests, progression, inventory, combat, and real-time multiplayer presence over Durable Object WebSockets.",
      "Built Discord OAuth, bot REST, and gateway integrations for live server, member, channel, and voice-state synchronization, with Cloudflare Workers, D1, KV, and Durable Objects supporting worlds with up to 256 districts and approximately 1,998 channel houses.",
    ],
  },
  {
    id: "creazilla-editor",
    title: "Creazilla Web Editor",
    description:
      "A visual website editor for creating multi-page sites with responsive layouts, animations, reusable components, live preview and publishing workflows.",
    pitch: "Full-featured visual website editor with live preview and publishing.",
    stack: ["React", "TypeScript", "Micro Frontends"],
    image: "/creazilla-editor.png",
    link: "https://creazilla.com/editor",
    featured: 1,
    bullets: [
      "Built and shipped a full-featured visual website editor for creating multi-page websites with 10+ interactive element types, responsive layouts, animations, reusable components, live preview, and publishing workflows.",
      "Developed the editor and connected it to a JSON-driven renderer supporting text, images, GIFs, video, vectors, visual effects, and animations across responsive layouts.",
      "Optimized the end-to-end rendering experience to approximately 1-3s cold load and roughly 1.5s LCP without effects and 2.5s with effects through code splitting, lazy loading, preloading, prefetching, and caching.",
    ],
  },
  {
    id: "zlate",
    title: "Zlate",
    description:
      "A visual project tracker with custom month, week and year calendar views, per-day notes, focus filters and local-first sync.",
    pitch: "Visual project tracker with custom calendar views and local-first sync.",
    stack: ["TypeScript", "Next.js", "Tailwind CSS", "Dexie", "Zustand"],
    image: "/zlate.png",
    link: "https://zlate.zerro.dev",
    github: "https://github.com/nikhilswain/zlate",
    featured: 4,
    bullets: [
      "Built a visual project tracker for managing 2-5 concurrent client projects through custom month, week, and year calendar views with per-day notes, focus filters, themes, and progress visualization.",
      "Engineered the calendar UI from scratch using date-fns, including timezone-safe date handling, responsive heatmap rendering, gesture-based navigation, anchored popovers, and adaptive mobile layouts across 370+ rendered year-view cells.",
      "Designed a local-first persistence and sync architecture using Dexie/IndexedDB and Zustand, with last-write-wins conflict resolution, delta synchronization, offline handling, and anonymous pairing-based account sync through Supabase.",
    ],
  },
];

export const MEDIUM: { title: string; description?: string; date: string; link: string; image?: string }[] = [
  {
    title: "Getting Started With Tailwind CSS",
    description: "A utility-first CSS framework for rapidly building custom user interfaces.",
    date: "Sep 29, 2020",
    link: "https://medium.com/better-programming/getting-started-with-tailwind-css-d96150d0ff5e",
    image: "https://miro.medium.com/v2/resize:fit:4800/format:webp/0*1wpyp46qE4ynk0jH",
  },
  {
    title: "How to Use CSS Flexbox",
    description: "No more floats or clearfixes",
    date: "Jul 15, 2020",
    link: "https://medium.com/better-programming/how-to-use-css-flexbox-4b382a45e015",
    image: "https://miro.medium.com/v2/resize:fit:4800/format:webp/1*UGkaCVgkXPdkF5E0CWbYaQ.png",
  },
  {
    title: "Arrays in JavaScript",
    description: "From [0] to [ 'H', 'E', 'R', 'O' ]",
    date: "May 30, 2019",
    link: "https://medium.com/swlh/arrays-in-javascript-e64b873ad801",
    image: "https://miro.medium.com/v2/resize:fit:4800/format:webp/0*jJba103A-9xmpTYq.jpg",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthsSince(start: Month, now: Date): number {
  const [y, m] = start.split("-").map(Number);
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

export function experienceLevel(start: Month, now: Date): number {
  return Math.floor(monthsSince(start, now) / 12);
}

export function timePlayed(start: Month, now: Date): string {
  const months = monthsSince(start, now);
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

export function formatMonth(month: Month): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatRange(start: Month, end: Month | null, present: string): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : present}`;
}

export interface Game {
  title: string;
  image: string;
  url: string;
  status: "playing" | "favourite";
}

export interface Track {
  title: string;
  artist: string;
  image: string;
  url: string;
}

export const GAMES: Game[] = [
  {
    title: "Hollow Knight: Silksong",
    image: "/games/silksong.jpg",
    url: "https://store.steampowered.com/app/1030300/",
    status: "playing",
  },
  {
    title: "NieR:Automata",
    image: "/games/nier-automata.jpg",
    url: "https://store.steampowered.com/app/524220/",
    status: "favourite",
  },
  {
    title: "NieR Replicant",
    image: "/games/nier-replicant.jpg",
    url: "https://store.steampowered.com/app/1113560/",
    status: "favourite",
  },
  {
    title: "Hollow Knight",
    image: "/games/hollow-knight.jpg",
    url: "https://store.steampowered.com/app/367520/",
    status: "favourite",
  },
];

export const TRACKS: Track[] = [
  {
    title: "NANIWAROTONNENN",
    artist: "Yoshino",
    image: "/music/naniwarotonnenn.jpg",
    url: "https://open.spotify.com/track/0oFeqtKx3jf2Xq2RJEcR8L",
  },
  {
    title: "Show",
    artist: "Ado",
    image: "/music/show.jpg",
    url: "https://open.spotify.com/track/1rDgAHDX95RmylxjgVW9tN",
  },
  {
    title: "Suzume",
    artist: "RADWIMPS, Toaka",
    image: "/music/suzume.jpg",
    url: "https://open.spotify.com/track/1n1y2kFPISpF9WGD3JaFo5",
  },
];
