# Nirvana Yoga School

Next.js marketing site — static content from JSON/TS files in `src/content/data/`.

## Dev

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Content

| Path | Purpose |
| --- | --- |
| `src/content/data/site-pages/` | Top-level pages (retreats, about, etc.) |
| `src/content/data/blog/` | Blog posts |
| `src/content/data/online-courses/` | Online YTT programs |
| `src/content/data/media/` | Course hero galleries |
| `src/data/` | Home sections, FAQs, reviews, residential course details |

Pages load via `src/content/repositories/*` (file-only for now). Remote fetch for courses and dynamic pages can be wired in later.

See [AGENTS.md](./AGENTS.md) for architecture.
