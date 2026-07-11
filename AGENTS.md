<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nirvana Yoga School — Agent Brief

A redesign of the existing live site at https://www.nirvanayogaschoolindia.com/.
This document is the source of truth for project context. **Keep it up to date** — every time you add a component, change a token, swap a placeholder, or change a convention, update the relevant section below.

---

## 1. Stack & versions

| Concern         | Choice                                           |
| --------------- | ------------------------------------------------ |
| Framework       | **Next.js 16.2.6** (App Router, Turbopack)       |
| React           | 19.2.4                                           |
| Language        | TypeScript 5 (`strict`, `bundler` resolution)    |
| Styling         | **Tailwind v4** (`@theme` tokens in globals.css) |
| Animation       | **Framer Motion** (`framer-motion`) — section/card interactions |
| Lint/format     | **Biome 2.2.0** (`a11y`, `next`, `react` rules)  |
| Compiler        | React Compiler enabled (`reactCompiler: true`)   |
| Package manager | npm (no lockfile policy enforced yet)            |

### Next.js 16 specifics worth remembering
- **App Router only**. Use the static `metadata` export (or `generateMetadata`) — do **not** use `next/head` (it gets rendered into the body and is ignored).
- `params`/`searchParams` are **Promises** — must be `await`ed.
- `images.domains` is deprecated → use `images.remotePatterns`.
- `next lint` is removed. Run `npx biome check src/` directly.
- Turbopack is default for both `dev` and `build`.
- React Compiler does auto-memoization → don't manually wrap with `React.memo`/`useMemo` unless profiling proves it.
- For docs offline: `node_modules/next/dist/docs/` — read the relevant guide before coding.

---

## 2. Commands

```bash
npm run dev              # Next.js on :3000 (website + /admin CMS + /api)
npm run build            # next build
npm run start            # next start
npm run lint             # biome check
npm run format           # biome format --write
npx tsc --noEmit         # type-check only
npx biome check src/ --write   # auto-fix lint + organize imports
npm run seed:export      # export static JSON → prisma/seed-data.json
npm run db:up            # PostgreSQL via Docker
npm run db:migrate       # prisma migrate dev
npm run db:seed          # seed from JSON/TS content files
npm run db:seed-modules  # rebuild page_modules JSON only
npm run db:seed-library  # seed reusable module snippets from page_modules
npm run db:studio        # Prisma Studio
npm run db:down          # stop database container
```

### CMS (same app, port 3000)

```bash
cp .env.example .env
npm run db:up && npm run db:migrate && npm run db:seed   # first time
npm run dev
```

| URL | Purpose |
| --- | ------- |
| http://localhost:3000 | Website |
| http://localhost:3000/admin/library | Reusable module content library |
| http://localhost:3000/api/admin/* | Admin API (auth required) |
| http://localhost:3000/api/content/* | Public read APIs (cached) |

Set `DATABASE_URL` in `.env` so repositories read from PostgreSQL. If unset or DB unreachable, **JSON fallback** is used automatically.

Image uploads: `CLOUDINARY_*` env vars, max **1MB**, JPEG/PNG/WebP only. On upload set **caption**, **description**, and **tags** (presets: Private room, 2 shared room, Food, etc. in `src/lib/cdn/media-tags.ts`). `/admin/media` lists assets with tag filter, edit metadata, and **safe delete** (blocked when URL is referenced in pages, courses, blog, or galleries). See `docs/cms-architecture.md`.

**Admin login (dev seed):** `admin@nirvanayogaschoolindia.com` / `admin123`

---

## 3. Directory map

```
src/
  app/
    (site)/
      course/[slug]/        # Residential YTT — page.tsx + CourseClient, data.ts, types.ts
      online-course/[slug]/ # Online courses — OnlineCourseClient, data.ts, types.ts
      retreat/[slug]/       # Retreat pages — RetreatClient
      venue/[slug]/         # Course + retreat venue pages — VenueClient
      teacher/page.tsx      # Dedicated faculty page — TeachersPageClient
      [slug]/               # Other site pages (about, hubs, …)
        page.tsx
        _site/              # SiteClient, TeachersClient, HubClient, render.tsx
      _shared/              # metadata.ts, site/ shared blocks + data loaders
    globals.css
  constants/
    navigation.ts
  content/              # Content layer — types, data, mappers, repositories
    types/
    data/
    mappers/
    repositories/
    index.ts
  data/                 # @deprecated barrels — import from `@/content` instead
  assets/
  components/
    courses/
    online/             # Online product pages — hero, pricing card, testimonials
    home/               # Home page sections
    teachers/           # Dedicated `/teacher` page — TeachersPageClient
    layout/
    ui/
    index.ts
  icons/
    types.ts            # IconProps + iconSize helper
    ICONS.md            # **Read before adding SVGs** — component template + checklist
    index.ts            # Barrel — import icons from `@/icons`
    ArrowRight.tsx
    BadgeStar.tsx
    Check.tsx
    ChevronDown.tsx
    ChevronLeft.tsx
    ChevronRight.tsx
    Close.tsx
    Facebook.tsx
    Google.tsx
    HeroFlourish.tsx    # Hero decorative flourish
    HeroUnderline.tsx   # Hero italic accent underline
    Instagram.tsx
    Logo.tsx            # SVG logo component (rarely used; we use Image of logo files)
    MenuIcon.tsx
    Plus.tsx
    Star.tsx
    Tripadvisor.tsx
    Users.tsx
    WhatsApp.tsx
    YouTube.tsx
    logo.svg            # Source asset (Logo.tsx is the runtime component)
    morph.svg           # Source asset (unused)
public/
  videos/
    videodesktop.mp4           # Hero video (desktop)
    videodesktop-poster.webp   # First-frame poster (desktop)
    videomobile.mp4            # Hero video (mobile)
    videomobile-poster.webp    # First-frame poster (mobile)
  favicon.png
docker-compose.yml             # PostgreSQL 16 (npm run db:up)
docs/cms-architecture.md       # CMS ER diagram, APIs, CDN pipeline
prisma/schema.prisma           # Postgres schema
prisma/seed.ts                 # Import site-pages.json, courses, blog, nav
src/lib/db.ts                  # Prisma singleton
src/lib/cms/                   # db-to-document, auth, cache, document-to-db
src/lib/cdn/                   # Cloudinary upload (1MB cap)
src/app/admin/                 # CMS UI (/admin)
src/app/api/admin/             # Admin REST (pages, media, auth)
src/app/api/content/           # Public read APIs
src/middleware.ts              # Protects /admin + /api/admin
```

### Path alias
- `@/*` → `./src/*`. Always import via the alias, never relative dotted paths for cross-directory imports.
- Always import from **barrel files** when possible: `import { Button, Pill } from "@/components/ui"` instead of deep paths.

---

## 4. Design system

### Color tokens (defined in `src/app/globals.css` under `@theme`)

| Token              | Hex       | Usage                                   |
| ------------------ | --------- | --------------------------------------- |
| `primary`          | `#a32432` | Brand maroon — CTAs, accents, headings  |
| `primary-dark`     | `#7d1a25` | Button hover                            |
| `secondary`        | `#0e4956` | Deep teal — `RishikeshSection` bg       |
| `accent`           | `#a6b5a2` | Sage — inverted eyebrow, footer hover   |
| `sand`             | `#faf7f2` | Page canvas (warm off-white)            |
| `ink`              | `#1a1410` | Body text + dark sections (Experience)  |
| `muted`            | `#6b5e57` | Secondary copy, captions                |

Use Tailwind v4 utility form: `bg-primary`, `text-ink`, `border-accent`, etc.

### Typography — two fonts, semantic scale

| Role | Font | Class |
| ---- | ---- | ----- |
| Primary Display (headings, prices, stats) | **Noe Display** | `font-serif` / `font-noe` |
| Primary Body + UI (default sans) | **Poppins** | `font-sans` / `font-poppins` |

Semantic utilities in `globals.css` — **always prefer these over arbitrary px sizes**:

| Class | Size | Use for |
| ----- | ---- | ------- |
| `.type-eyebrow` | 12px | Labels, captions, uppercase meta |
| `.type-ui` | 14px | Nav, buttons, card meta values |
| `.type-body` | 16px | Paragraphs, FAQ answers, tab copy |
| `.type-lead` | 18–20px | Section descriptions, hero lead, quotes |
| `.type-display-sm` | 18–20px serif | Card titles, teacher names, FAQ questions |

Headline hierarchy (Playfair):
- H1 (hero): `font-serif font-medium text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.04]`
- H2 (section): `font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.1]` (see `SectionHeader`)
- Eyebrow: `.type-eyebrow` + `text-primary` or `text-accent` when inverted
- Italic accent words: `italic font-normal text-accent`

### Spacing rhythm
- Section padding: `py-20 md:py-28`
- Container max widths via `Container` component: `sm` 3xl, `md` 5xl, `lg` 6xl, `xl` 7xl.
- Horizontal padding: `px-5 md:px-8` (Container handles this).
- Card padding: `p-6 md:p-7` for medium cards, `p-8 md:p-12` for hero blocks.

### Surfaces & shadows
- Light canvas: `bg-sand` (plain) or `bg-paper` (subtle dot texture).
- Card background: `bg-white` with `rounded-3xl` and `shadow-card` (defined as custom var).
- Hover: `hover:shadow-soft` (deeper).
- Dark sections: `bg-ink` (Experience) or `bg-secondary` (Rishikesh) with white text.

### Corner radius
- Cards & images: `rounded-3xl` (extra-soft, premium feel).
- Buttons: `rounded-full`.
- Form fields: `rounded-full` for inputs, `rounded-2xl` for accordions.

### Custom utilities (in `globals.css`)
- `.bg-paper` — sand background with faint dot texture.
- `.hero-glass` — frosted glass panel (backdrop-blur, inset highlight, shadow). Used for hero pills and floating cards.
- `.hero-glow` — soft sage radial glow behind bottom-left headline area.
- `.marquee-mask` — horizontal fade on marquee edges.
- `.animate-float-subtle` — gentle 5s bob for desktop rating card.
- `.hero-underline` — SVG stroke draw-in animation for accent word underline.
- `.animate-marquee` — horizontal infinite scroll (40s). Wrap two copies of the content in a `flex w-max` parent so the loop is seamless.
- `.animate-hero-zoom` — slow ken-burns zoom (24s alternate). Applied to the hero `<video>` for a living background.
- `.animate-fade-up` + `.fade-delay-{100..600}` — staggered entrance animation. Use on hero content blocks for a cinematic reveal.
- `.animate-scroll-bob` — bobbing arrow for the scroll cue.
- `.welcome-stats-strip` — gradient maroon unified stats band (static gloss via `::before`; shine/stagger via Framer Motion).
- `.welcome-gallery-vignette` / `.welcome-gallery-frame` — photo treatment for welcome gallery.
- Shared motion tokens: `src/lib/motion.ts` (`EASE_OUT`, `VIEWPORT_ONCE`, `fadeUp`, `starPop`, `reducedTransition`).
- Header classes: `.header-shell`, `.header-shell--solid`, `.nav-link` (underline hover), `.nav-dropdown-panel` (fade+slide), `.mobile-menu-backdrop`, `.mobile-menu-panel`, `.mobile-accordion-grid`.
- All animations respect `prefers-reduced-motion`.

---

## 5. UI primitives — usage

### `Button`
```tsx
<Button href="#courses" variant="primary" size="lg">Explore Courses</Button>
<Button onClick={...} variant="ghost" size="sm">Cancel</Button>
```
- Variants: `primary` (maroon), `secondary` (ink), `ghost` (transparent + ink hover), `outline-light` (translucent over hero/dark).
- Sizes: `sm` / `md` / `lg`.
- `responsive` — mobile-first padding/text scale (`px-5 py-2.5 text-sm` → `md:px-8 md:py-4 md:text-base`). Use on hero/section CTAs.
- If `href` is given → renders `Link`. Otherwise renders `<button>`.

### `Container`
```tsx
<Container size="xl" className="...">{...}</Container>
```
- Defaults to `xl` (max-w-7xl). Use `md` (5xl) for prose-heavy sections, `sm` (3xl) for FAQ, `2xl` (92rem) for full-bleed editorial sections like Welcome.

### `Heading`
```tsx
<Heading as="h1" align="left" font="serif" size="h1" invert>Title</Heading>
<Heading as="h3" align="center" font="poppins" size="display-sm">Subheading</Heading>
```
- Props:
  - `as` (default `"h2"`): `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"`
  - `align` (default `"left"`): `"left" | "center" | "end"`
  - `font` (default `"serif"`): `"serif" | "sans" | "poppins" | "noe"`
  - `size` (optional): `"h1" | "h2" | "h3" | "h4" | "display-sm" | "none"`
  - `invert` (default `false`): `boolean`
  - `className` (optional): `string`

### `SectionHeader`
```tsx
<SectionHeader
  eyebrow="Yoga Teacher Training"
  title={<>Trainings rooted in lineage.<br/>Designed for your transformation.</>}
  description="..."
  align="left"   // or "center"
  invert={false} // true for dark sections (Experience)
/>
```

### `Pill`
```tsx
<Pill>Welcome to Nirvana</Pill>
<Pill invert>Yoga Alliance Certified</Pill>
```

### `JsonLd`
```tsx
<JsonLd data={schemaOrgObject} />
```
- Use this whenever you need to inject structured data. Don't add `dangerouslySetInnerHTML` inline elsewhere (file-level Biome suppression lives only in `JsonLd.tsx`).

### `CourseCard`
```tsx
<CourseCard
  title="200 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training in Rishikesh India"
  duration="25 Days"
  level="Beginner to intermediate level"
  certification="RYT-200, Yoga Alliance"
  fee="649 USD"
  image="https://www.nirvanayogaschoolindia.com/img/service-1.webp"
  certBadge="https://www.nirvanayogaschoolindia.com/img/ryt200.webp"
  href="https://www.nirvanayogaschoolindia.com/200-hour-yoga-teacher-training-in-rishikesh-india"
  revealDelay={0}
/>
```
- Client component. Premium editorial card: image overlay with hour pill + RYT badge + glass fee tag; eyebrow cert line; invoice-style meta table (Duration/Level/Certification/Fee); Course Details CTA. **Framer Motion**: lift, shine, image zoom, staggered meta rows, spring badge. Respects `useReducedMotion`.

### `PlatformReviewsRows`
```tsx
<PlatformReviewsRows className="..." />
```
- Client component: three stacked platform rows (Google, TripAdvisor, Trustpilot) with `RatingCard` + autoplay `TestimonialSlider`, fed by `REVIEWS` from `@/data/reviews`. Used in `TestimonialsSection` and `WhyNirvana`.

### `FAQSection`
```tsx
<FAQSection
  faqs={[{ question, answer, image?, tag?, category? }]}
  categories={COURSE_FAQ_CATEGORIES} // optional filter tabs
  eyebrow="Questions, answered"
  title="Frequently asked"
/>
```
- Client component: two-column FAQ grid (homepage layout). Card uses photo background when `image` is provided, otherwise white card. Pass `categories` to enable filter tabs.

### `MediaLightbox`
```tsx
<MediaLightbox
  isOpen={isLightboxOpen}
  onClose={() => setIsLightboxOpen(false)}
  items={[{ type: "image", url: "https://example.com/image.jpg" }]}
  activeIndex={activeIndex}
  onChangeActiveIndex={setActiveIndex}
  title="Media Gallery"
/>
```
- Client component: premium modal lightbox containing touch swipe capabilities (`framer-motion` dragging), keyboard hook listeners (`Escape`, `ArrowLeft`, `ArrowRight`), layout transition animation, backdrop click target closure, dynamic title, and auto-centering thumbnails panel strip.

---

## 6. Page composition (home)

`src/app/page.tsx` composes sections in this order:

1. `HeroSection` — full-bleed video with ken-burns zoom. **Bottom-anchored composition**: upper ~55% of viewport is intentionally pure video. Top hairlined eyebrow ("Est. Rishikesh · 2012"). Bottom-left: glass certification pill, Playfair H1 with animated SVG underline on italic accent, `type-lead` subcopy, CTAs with primary glow shadow. Desktop: editorial vertical accent line + floating `hero-glass` rating card (`animate-float-subtle`). Mobile: horizontal glass trust chips under CTAs. Subtle botanical SVG flourish upper-right. Thin marquee with `marquee-mask` edge fade at bottom.
2. `WelcomeSection` (`#about`) — client component, **one-viewport on desktop** (`lg:min-h-[calc(100svh-5.5rem)]`), **`Container size="2xl"`**. Compact editorial left column; CTAs + stats strip share one row on lg; highlights in 4-col row. Sticky-free gallery capped to viewport height; auto-loop 4.5s.
3. `VideoSection` (`#video`) — server fetch + client player: 4 student-review YouTube videos, playlist left / player right on desktop.
4. GallerySection (#gallery) — client component: Pinterest-style masonry grid layout with category tabs, dynamic crossfading auto-transition shuffling, and fullscreen lightbox modal.
5. `WhyRishikeshSection` (`#why-rishikesh`) — server fetch + client embed. Full live-site copy + Gurudev Dhruvaji video (`_NOezBf-LYs`). Prose left, sticky video right on lg; stacked on mobile.
6. `CoursesSection` (`#courses`) — client component, **`Container size="2xl"`**. 6 residential YTT programs from live site (200h×4, 300h, 500h) with real titles, pricing, images, and course URLs.
7. `ExperienceSection` — dark, 4 immersive image cards
8. `TeachersSection` — 4 teacher cards
9. `RishikeshSection` — split: full-bleed image + secondary-bg copy
10. `TestimonialsSection` — 3 platform split rows (Google, TripAdvisor, Trustpilot)
11. `FAQSection` — `<details>` accordion
12. `FinalCTASection` — full-bleed CTA band
13. `Footer` (rendered from `layout.tsx`)

Floating: `WhatsAppFab`, `MobileStickyBar` — both mounted globally in `layout.tsx`.

Section IDs used by nav anchors: `#about`, `#video`, `#gallery`, `#why-rishikesh`, `#courses`, `#experience`, `#teachers`, `#reviews`, `#faq`, `#contact`.

---

## 7. Imagery

### Local assets
- `banner_1.webp` / `banner_2.webp` / `banner_3.webp` — welcome collage.
- `/public/videos/videodesktop.mp4` and `/videos/videomobile.mp4` — hero video (H.264, **50fps**, no audio, `faststart`). Desktop ~6.4 MB 1080p, mobile ~1.9 MB 720p. Matching `*-poster.webp` first-frame posters. Preloaded from `page.tsx`.
- `logo.png` for light bg, `logo_white.png` for dark bg.

### Placeholders (Unsplash) — **TO BE REPLACED with real assets**
Currently sourced from `https://images.unsplash.com/...` (allowed via `next.config.ts > images.remotePatterns`).
- ~~3× course images in `CoursesSection`~~ — now using live site `/img/` assets via `remotePatterns`
- 4× experience tiles in `ExperienceSection`
- 4× teacher headshots in `TeachersSection`
- 1× Rishikesh wide shot in `RishikeshSection`
- 1× full-bleed in `FinalCTASection`

When swapping in real photos, prefer adding them under `src/assets/images/home/` (or a new subfolder like `teachers/`, `courses/`) and re-export from the barrel.

---

## 8. Content placeholders to replace

These are currently stubbed and must be replaced before launch:

| Where                                          | Placeholder                     |
| ---------------------------------------------- | ------------------------------- |
| `layout.tsx`, Footer, FinalCTA                 | WhatsApp `919876543210`         |
| Footer                                         | `hello@nirvanayogaschoolindia.com`, `+91 98765 43210`, Tapovan address |
| Footer social icons                            | Generic `instagram.com` / `youtube.com` / `facebook.com` URLs |
| ~~`TeachersSection` photos~~                   | ~~All 12 teacher headshots (now using premium Unsplash portraits)~~ |
| ~~`CoursesSection` pricing~~                   | Real pricing from live site ($649/$899/$1449)                       |
| `FinalCTASection`                              | Offer copy "Save 25% when you book by 25 July 2026" |
| `page.tsx` JSON-LD                             | `aggregateRating.reviewCount: "500"` — set real number |

---

## 9. Conventions & gotchas

### Imports
- Sort: external → `@/` → relative. Biome's `organizeImports` is enabled and will auto-sort.
- Always import from barrels (`@/components`, `@/components/ui`, `@/icons`, etc.) where possible.
- **Icons**: never inline `<svg>` in components — use `@/icons` TSX components. All accept optional `size` and `className` via `IconProps`. **Before adding any SVG, read `src/icons/ICONS.md`** — create one file per icon, export from `index.ts`, reuse existing icons when possible.

### Components
- Default export is the component. Named exports only for re-exports in barrels.
- File names match component names exactly (`HeroSection.tsx`, not `hero-section.tsx`).
- Client components: add `"use client"` only when needed (hooks, browser APIs). Currently only `Header.tsx` is a client component.

### Documentation (JSDoc) — required for agents
- Every exported React component, custom hook (`use*`), and function must have a `/** ... */` JSDoc summarizing purpose and documenting props/parameters (`@param` / `@returns`).
- Prefer documenting intent and side effects over restating TypeScript types.
- Cursor rule: `.cursor/rules/jsdoc-documentation.mdc` (`alwaysApply`). Apply when creating or editing symbols in `src/**/*.{ts,tsx}`; skip trivial one-liners and barrel re-exports.

### Styling
- Tailwind utility-first. No CSS modules, no styled-components.
- Use the design tokens (`text-primary`, `bg-sand`) — **never** raw hex codes in JSX.
- For one-off custom utilities, add to `globals.css` (e.g. `.hero-overlay`).

### Accessibility — Biome strict rules
- All decorative `<svg>` need `aria-hidden="true"`. Meaningful ones need `<title>` or `role="img"` + `aria-label`.
- `<a>` tags need accessible text — use `<span className="sr-only">…</span>` for icon-only links.
- `aria-label` on a `<div>` requires `role="img"` (Biome's `useAriaPropsSupportedByRole`).
- Don't use `aria-hidden` on focusable elements like `<video>` — use `tabIndex={-1}` instead.
- Don't use `href="#"` — give real anchors (`#section-id`) or real URLs.

### Images
- Always use `next/image`. Provide `sizes` for `fill` images. Use `priority` only for above-the-fold.
- Local imports get auto-sized; remote needs explicit `width`/`height` or `fill`.

### JSON-LD
- Build the schema object in `page.tsx` (or relevant route file). Inject with `<JsonLd data={...} />`. **Never** inline another `dangerouslySetInnerHTML` — the Biome suppression is file-scoped to `JsonLd.tsx`.

### Biome quirks observed
- JSX `{/* biome-ignore */}` comments **do not work** to suppress lint on JSX attribute lines — use file-level `/** biome-ignore-all */` in a wrapper component instead.
- `assist/source/organizeImports` will re-sort imports including barrels — run `npx biome check src/ --write` to auto-apply.
- `noArrayIndexKey`: when intentionally duplicating an array (e.g. marquee), wrap each copy in an outer `<div key="a">` / `<div key="b">` so the inner keys stay stable.
- `useSortedClasses` and Tailwind v4 alias warnings: prefer `leading-none` over `leading-[1]`, `bg-linear-to-t` over `bg-gradient-to-t`.
- Biome suppressions in parenthesized JSX returns: place the suppression comment (like `// biome-ignore lint/suspicious/noArrayIndexKey`) directly inside the tag attributes list (e.g., above `key={index}`) to ensure it maps correctly to the element without causing TSX parser compilation syntax errors.
- **CSS Transition vs JavaScript Spring animations**: To prevent lag and stutter in mouse-tracking/spring 3D tilt effects, avoid setting a CSS transition on `transform` (such as using generic `transition` or `transition-all` classes in Tailwind). Instead, use a custom class (e.g., `.course-card-transition` in `globals.css`) that explicitly limits `transition-property` to only non-transform properties (e.g., `border-color, box-shadow, background-color, outline-color, ring-color`). This ensures that manual spring-driven transform updates remain instantaneous and responsive.

---

## 10. Update protocol for agents

When you finish a task, **update this file** in the following situations:

1. **New component** → add it to §3 directory map and (if a reusable primitive) §5 with a usage snippet.
2. **New design token** → add row to §4 color table or font list.
3. **New section on a page** → add to §6 composition order, with its anchor ID.
4. **Swapped a placeholder for real content** → strike the row from §8 (or update what's left).
5. **New convention or gotcha discovered** → add to §9.
6. **Tech stack change** → update §1.

Keep entries terse — this file is for fast onboarding, not exhaustive documentation. If a section grows past ~30 lines, consider splitting it into a dedicated doc in a `docs/` folder and linking to it from here.

Last meaningful update: 2026-05-26 — initial rebuild scaffolded (design system, all home sections, layout, FABs, JSON-LD).
2026-05-26 — Hero redesigned: ken-burns zoom video, layered overlay, decorative top hairline + eyebrow, SVG underline accent on italic word, staggered fade-up animations, two floating glass cards (next-batch + rating proof) on desktop, marquee trust strip at bottom, scroll cue. New CSS utilities: `animate-hero-zoom`, `animate-fade-up` + delays, `animate-scroll-bob`. Hero overlay now layered radial+linear.
2026-05-26 — **Font swap**: `DM Serif Display` → **`Cormorant Garamond`** (yoga/wellness aesthetic). EB Garamond + Inter retained. `font-medium`+ now required for large headings.
2026-05-26 — **WelcomeSection compact**: refit to single viewport on desktop; removed highlight chips, floating quote, tall stat cards; filmstrip thumbs inside gallery.
2026-05-26 — **WelcomeSection gallery**: auto-advances images in a loop (4.5s); pauses on hover/focus/tab hidden; respects reduced motion.
2026-05-26 — **WelcomeSection copy restored**: full headline, multi-paragraph tabs, highlight chips, maroon stats; gallery sticky on desktop; natural section height.
2026-05-26 — **Icons**: all inline SVGs migrated to `@/icons` TSX components (16 icons + barrel). Components import from `@/icons`; no raw `<svg>` in `src/components/`.
2026-06-02 — **WhyRishikeshSection interactive redesign**: Refactored the static layout into an interactive split layout using a new client component `WhyRishikeshClient.tsx` fed by server-side YouTube metadata. Added a vertical stepper/timeline accordion for the Sutras with Framer Motion height transitions, and a unified, premium Video Player Card that overlays a custom glass play button on the YouTube thumbnail and swaps in the autoplay iframe on click, plus a clean 2x2 grid of wellness highlights.
2026-06-02 — **WelcomeSection editorial redesign**: Completely refactored the standard image slider into a premium, layered staggered collage featuring Framer Motion independent floating animations (Image 1 zooms, Image 2 & 3 float at staggered frequencies) and a floating "Est. 2012" glass badge. Upgraded story tabs to use a spring-loaded sliding pill selector (`layoutId`), and converted the stats strip into a 3-card grid with an intersection-triggered count-up animation for metrics. Converted highlights into pill badges with Check icons.
2026-06-02 — **WelcomeSection professional redesign**: Redesigned the collage into an asymmetrical, staggered vertical gallery (Column 1: `aspect-[4/5]` image and clean Credentials Card; Column 2: `aspect-square` and `aspect-[4/5]` images offset vertically by `pt-8 sm:pt-14`). Upgraded photo captions to double-decker editorial typography overlays (eyebrows + serif titles over gradient vignettes). Replaced the solid stats card with a crisp bordered off-white card (`border-primary/10`). Swapped the pill tabs selector for a zen text-only tab list with a sliding bottom line indicator (`layoutId="activeTabUnderline"`). Formatted highlights into a clean 2-column list with circular check icons. Reordered columns so copy appears first on mobile viewports.
2026-06-02 — **WelcomeSection right-side exposure**: Removed the story tabs selector and tab panels completely. Restructured the right side narrative into a high-end typography hierarchy: a prominent Our Story lead paragraph with a vertical accent line (`border-l-2 border-primary/20 pl-4`) followed by a balanced 2-column grid displaying Our Vision and Our Promise side-by-side with numbered headers (`01 / Our Vision`, `02 / Our Promise`) in primary brand colors. Streamlined and balanced word counts to maintain visual symmetry.
2026-06-02 — **WhyRishikeshSection split header**: Converted the section header container in `WhyRishikeshClient.tsx` into a desktop-split 2-column grid layout (`grid-cols-1 lg:grid-cols-[1.25fr_1fr]`). Positioned the title on the left and the lead paragraph/decorative rule on the right, aligning them at the bottom baseline. This utilizes the full width of the `2xl` container, eliminating the empty white space on the right of the header.
2026-06-02 — **Global font swap**: Swapped global Google Fonts import and theme variables in `globals.css` to Cormorant Garamond (display serif headings) and Outfit (body sans-serif). This updates the typography globally across all sections, establishing a professional and cool luxury-editorial design system.
2026-06-04 — **GallerySection integration**: Added a premium responsive categorized image carousel (`GallerySection.tsx`) loading 28 real webp images from the live site's homepage slider. The carousel features a spring-based filter menu (All, Practice, Campus, Life), a touch-pan/drag track with inertia limits and arrow navigators, a dynamic line progress bar, and a fullscreen animated lightbox modal supporting keyboard slide/close controls. Created new SVG TSX primitives (`ChevronLeft`, `ChevronRight`, `Close`).
2026-06-04 — **Testimonials/Reviews exact content alignment & layout redesign**: Redesigned `TestimonialsSection.tsx` to stack reviews under Google Reviews (1,200+) and TripAdvisor (800+) tabs using a Stripe-style sliding spring pill. Loaded the exact word-for-word quotes for Usha Singh, Ole Netek, Niall Phelan, Joan Nakazono, Beatrice Ani-Asamoah, and Eve Lesage from the live website. Displayed the reviews in a beautiful 3-column card grid, centered inside a single desktop viewport (`lg:min-h-screen`) with spring hover lifts. Updated `TeachersSection.tsx` to render name, role/subject, and experience to match the live site data exactly. Complete typescript and Next.js builds compiled successfully.
2026-06-04 — **GallerySection Pinterest Redesign**: Completely redesigned the horizontal image slider into a premium, responsive Pinterest-style masonry columns grid (`columns-2 sm:columns-3 lg:columns-4`). Programmed a custom React-state interval loops that periodically swaps visible card slots with non-visible pooled category images. Embedded Framer Motion crossfade transitions (`AnimatePresence mode="popLayout"`) inside the stable cards and aligned captions underneath, with full sync to the fullscreen swipeable lightbox. All linting and TypeScript checks pass.
2026-06-04 — **Gallery Non-Interactive Masonry**: Reverted the gallery section to a vertical CSS columns masonry layout, replaced clickable image cards with static `<div>` components, and removed all lightbox states, keyboard listeners, pan/drag scripts, and fullscreen modal UI markup. Tested lint, format, and production compile successfully.
2026-06-04 — **Gallery Key Optimization**: Updated `GallerySection.tsx` to use stable `item.id` values as the React keys for the columns masonry container to satisfy the `noArrayIndexKey` Biome rules.
2026-06-04 — **Testimonials Redesign (Multi-Stack 3D Deck)**: Completely refactored `TestimonialsSection.tsx` to display three columns side-by-side representing Google, Tripadvisor, and Trustpilot reviews. Extracted all 12 reviews from the live website and populated each platform with its respective reviews. Programmed a highly premium, independent 3D deck stack for each platform where clicking the top card animates it sliding out to the side with spring mechanics and moving to the bottom of the stack. Added navigation pagination dots for direct jumpers and mobile helper tooltips. Verified build compiles and formats cleanly.
2026-06-04 — **Testimonials Viewport Pattern Alignment**: Refactored `TestimonialsSection.tsx` to use the standardized single-viewport desktop pattern (`lg:h-[calc(100svh-5.5rem)] lg:min-h-[680px] lg:max-h-[880px] lg:flex lg:items-center`), reduced element heights and margins to prevent vertical overflow, and imported the shared `reducedTransition` and `EASE_OUT` motion parameters from `@/lib/motion` to match WelcomeSection and WhyRishikeshSection. All linting and TypeScript checks pass.
2026-06-06 — **FAQSection Redesign with Card Background Images**: Redesigned `FAQSection.tsx` into an interactive client component with individual background images for each question card. Swapped out placeholder Unsplash URLs with verified webp assets from the live website to resolve image load failures. The background images transition from grayscale (black & white) to full color on hover and when expanded, using custom linear gradients to guarantee perfect text readability. Configured custom accordion toggles with height slide animations, accessibility props, and a 45-degree rotating Plus indicator. Verified all lint, compiler, and production builds succeed.
2026-06-06 — **TestimonialsSection Automated Marquee Redesign**: Redesigned `TestimonialsSection.tsx` into an automated scrolling triple-row marquee grid with alternating scroll directions (Left, Right, Left). Removed all interactive click/drag decks and hover effects to provide a clean, passive reading experience. Upgraded cards with high-quality avatar portrait images, country flags, display-serif quotes, and custom card heights (`h-[320px]`) to ensure no text is clipped.

2026-06-04 — **Teachers Selector Card Upgrades**: Converted the circular avatar buttons in the selector grid on the left side of `TeachersSection.tsx` into styled card buttons (`bg-white/40 border border-ink/5 p-2 rounded-2xl`). Increased the image sizes significantly using a full-width aspect-square configuration inside the cards, adding subtle hover scale and primary-colored active states. Verified all lint and build commands pass.
2026-06-04 — **Teachers Dynamic Cards Slider Redesign**: Rebuilt `TeachersSection.tsx` into a horizontal cards slider with arched sanctuary frames, arrow scroll navigators, and hover-reveal details panel.
2026-06-04 — **Teachers Symmetrical Portfolio Grid Redesign**: Redesigned `TeachersSection.tsx` to showcase all 12 gurus in a 4-column profile grid with roles and mantras.
2026-06-04 — **Teachers Infinite Auto-Scrolling Carousel**: Redesigned `TeachersSection.tsx` into a seamless, infinite auto-scrolling marquee carousel of 12 gurus. Upgraded card layouts with linear gradients, inner depth shadows, expandable brand underlines, and experience pills. Added a dedicated `.animate-marquee-slow:hover` pause rule in `globals.css` to freeze the entire carousel as soon as any card is hovered.
2026-06-04 — **Teachers Card Images Optimization**: Upgraded `TeachersSection.tsx` to replace the arched sanctuary dome card image frames with clean, standard rectangular portrait frames (`rounded-2xl`). This prevents headshot clipping on top and results in a more modern, editorial look. Checked lint, format, and production compiles cleanly.
2026-06-04 — Yoga Alliance Card Styling Refinement: Restructured the cards in `YogaAllianceSection.tsx` to be solid white (`bg-white`) on a solid brand maroon background (`bg-primary`). Configured card titles to dark ink (`text-ink`) with a primary red hover transition, and updated descriptions and badges to secondary deep teal (`text-secondary`) instead of gray text for premium contrast. Checked lint, format, and production builds compile successfully.
2026-06-04 — **Teachers Card Size Increase**: Increased the teacher cards width from `w-[230px]` to `w-[280px]` in `TeachersSection.tsx` and updated the `Image` `sizes` attribute accordingly. This gives the portrait gallery a more editorial presence and minimizes name truncation. Verified builds and formatting compile successfully.
2026-06-06 — **Remove Forced Height Constraints**: Removed forced viewport heights (`lg:h-[...]`, `lg:max-h-[...]`, `lg:min-h-screen`) and vertical flex centering from `WhyRishikeshSection.tsx`, `TestimonialsSection.tsx`, `WelcomeSection.tsx`, and `YogaAllianceSection.tsx`. Replaced with natural vertical padding (`lg:py-24`) to prevent content from getting clipped/cut off on shorter screen heights or when font scaling/resolution is changed. Verified builds, linting, and formatting all pass successfully.
2026-06-06 — **Testimonials Marquee Smoothness & Sizing Optimize**: Refactored the triple-row scrolling marquee in `TestimonialsSection.tsx` from Framer Motion JavaScript translations to native GPU-accelerated CSS animations (`animate-marquee`, `animate-marquee-reverse`, `animate-marquee-slow`). Wrapped rows in `marquee-hover-pause` to pause scrolling on hover. Resized cards from `w-[350px] sm:w-[380px] h-[320px]` to `w-[360px] sm:w-[420px] h-[340px]` to completely eliminate quote text clipping.
2026-06-06 — **Teachers Section Credentials Spotlight & Mobile Accordion Finalization**: Finalized `TeachersSection.tsx` to display the Credentials Spotlight layout. Enriched the guru database with actual qualifications (Education, Experience Details, and Expertise) and biographies scraped directly from the live website. Restructured the left directory directory selector cards to be larger with bigger typography, showing only Name, Avatar, and Experience Summary. Designed an in-place expanding accordion layout for mobile and tablet viewports to eliminate scroll jump issues and layout shifts on smaller screens.
2026-06-07 — **High-Quality Image Replacements**: Replaced all low-resolution live website images and small local WebP files across WelcomeSection, CoursesSection, FAQSection, TeachersSection, and GallerySection with premium, high-resolution Unsplash assets, significantly improving the visual appeal and design quality. Verified Next.js production builds and Biome checks pass successfully.
2026-06-08 — **Teachers Education List Two-Column Layout**: Refactored the credentials list layout in `TeachersSection.tsx` to a grid-based two-column design (`grid-cols-2` on desktop and `sm:grid-cols-2` on mobile/tablet) to optimize horizontal space utilization and readability.
2026-06-08 — **Images Overhaul & Testimonials Overlap Fix**: Replaced all image assets in `CoursesSection.tsx`, `ExperienceSection.tsx`, and `FAQSection.tsx` with a brand-new set of high-resolution, unique, and highly relevant Unsplash images. Updated `TestimonialsSection.tsx` to replace all student avatar headshots with unique, diverse Unsplash portraits, resolving image reuse and overlap with the Teachers section. Updated `WelcomeSection.tsx` to replace local WebP imports with verified Unsplash URLs.
2026-06-08 — **Footer bg-primary & max-w-7xl Sizing**: Updated `Footer.tsx` to use the Brand Maroon background (`bg-primary`) and locked the container width to `max-w-7xl` (`size="xl"`). Re-styled the newsletter form input and button to a high-contrast white-out pattern to ensure readability and usability on the new background. Verified all typescript check, lint check, and production build tasks succeed with zero errors.
2026-06-08 — **Footer Compacted & Deep Teal Background Update**: Compacted the footer by reducing vertical paddings (`pt-10 pb-5`), margin gaps, list item spacings (`space-y-1.5`), and logo/icon sizes. Changed the background color from brand maroon to deep teal (`bg-secondary`) to match the theme color preference, and aligned the newsletter form buttons and social hover colors to `text-secondary` and `hover:text-secondary`. Verified that all Biome lint checks and TypeScript compiles pass without any errors.
2026-06-10 — **CourseCard 3D Hover & Reset Responsiveness Fix**: Fixed lag/reset delay in CourseCard 3D tilt by adding a custom `.course-card-transition` class in `globals.css` that transitions only styling properties (border-color, box-shadow, background-color, outline-color, ring-color) and explicitly excludes `transform`. This ensures spring-driven rotation and mouse tracking react instantly without browser interpolation delays.
2026-06-13 — **Font loading bug fix & Playfair selection**: Resolved a self-referential custom property naming bug in Tailwind CSS v4 `@theme` that broke Poppins and display serif font loading. Renamed Next.js font variable outputs to `--font-poppins` and `--font-playfair`, and mapped them cleanly inside `globals.css` and `layout.tsx`. Cleaned up all preview fonts and removed the `<FontSelector />` widget completely, locking in Playfair Display as the primary serif font across all sections. Checked formatting and compiled successfully.
2026-06-14 — **Re-integrate TestimonialsSection**: Replaced the previous slider playground experiments with the exact layout structure (3 split rows for Google, TripAdvisor, Trustpilot) and exact content data (12 student reviews and actual portraits) matching the live website, fully responsive and styled premium with Framer Motion.
2026-06-14 — **Font loading and Heading Primitive**: Created a highly reusable `<Heading>` component supporting `left`, `center`, and `end` alignments, and custom fonts. Refactored `HeroSection`, `WelcomeSection`, `WhyRishikeshClient`, `RishikeshSection`, `YogaAllianceSection`, `FinalCTASection`, and `SectionHeader` to use the `<Heading>` component.
2026-06-14 — **Noe Display and Poppins Core Typography**: Cleaned up the entire project's typography to retain only **Poppins** (sans-serif) and the premium local web font **Noe Display** (serif). Downloaded the Noe Display `.woff2` font file, registered its `@font-face` bindings inside `layout.tsx` (via `next/font/local`) and `globals.css` (via `--font-noe`), and deleted all other unused local and Google fonts (`Plus Jakarta Sans`, `Cormorant Garamond`, `Outfit`, and `Eksell Display`).
2026-06-14 — **Two-Column FAQ Grid & FAQItem Primitive**: Created a standalone `<FAQItem>` component under `src/components/home/FAQItem.tsx` to encapsulate local open/close state, background image hover transitions, and animated accordion content. Refactored `FAQSection.tsx` to render these items in a two-column grid (`grid-cols-1 lg:grid-cols-2`) for better screen utilization.
2026-06-15 — **CourseHero Banner Slider**: Replaced the vertical selector dots in `CourseHero.tsx` with a horizontal, infinite-scroll image card slider at the bottom. Clicking cards updates the active background banner with a crossfade, and the marquee pauses on hover. Removed the details card on the right, freed up port 3000, cleaned up unused imports/parameters, and restricted the section to a viewport-bounded height (`h-screen max-h-screen`). Checked lint, format, and production compile successfully.
2026-06-20 — **CourseHero Interactive Redesign**: Redesigned `CourseHero.tsx` into a modern split layout. The text description and a new, comprehensive metadata card reside on a clear background on the left, while the right features a high-opacity interactive media frame. Added dynamic active media background mirroring (crossfading the active image or video in full bleed behind the content), image and video filtering tabs, previous/next controls, a touch-friendly thumbnail scroll strip, support for both YouTube IDs and native HTML5 direct videos, and a keyboard-navigable fullscreen lightbox modal. Verified all compiler and Biome lint tests pass successfully.
2026-06-20 — **YogaAllianceSection Editorial Redesign**: Completely redesigned the certification credentials component. Set the background to the primary brand maroon color (`bg-primary`) paired with ambient multicolor radial glows. Realigned the header into an asymmetric split-grid, created a floating glassmorphic Yoga Alliance seal panel, and upgraded the certification path cards into interactive certificates displaying giant hour numerals, watermarked path SVGs (Leaf, Compass, Certificate), glass tags, and smooth lift/glow transitions. Verified all compiler and Biome lint tests pass successfully.
2026-06-21 — **Exam & Certification Page & Accordion**: Created the `/yoga-exam-and-certification` sub-page route. Implemented a split-screen interactive accordion of evaluation parameters with dynamic image swap on desktop, a showcase of Yoga Alliance USA RYT badges, sample certificates grid, and a full-screen blurred lightbox preview modal. Refactored the Course Page's Exam & Certification section component (`ExamCertification.tsx`) into a dynamic slide-down accordion using Framer Motion.
2026-06-21 — **Layout Selection (Asymmetric Magazine Collage) & MediaLightbox Integration**: Finalized the selection of **Layout Option 9 (Asymmetric Magazine Collage)** for the Exam & Certification process, removing all alternative layouts and design switcher toolbars from both [`ExamCertification.tsx`](file:///home/hp/Desktop/nirvana-yoga-school/src/components/courses/ExamCertification.tsx) and the `/yoga-exam-and-certification` playground page. Kept the left certificates column sticky and integrated the new unified [`MediaLightbox.tsx`](file:///home/hp/Desktop/nirvana-yoga-school/src/components/ui/MediaLightbox.tsx) component. All lints, TypeScript compilation, and production builds pass cleanly.
2026-06-21 — **Route Cleanup & Accommodation Redesign & Prerequisite Extraction**: Removed the `/yoga-exam-and-certification` playground sub-page route completely from files, directory maps, and website footer. Redesigned `AccommodationFood.tsx` to display Ashram Accommodation and Sattvic Cuisine as side-by-side editorial cards on desktop and integrated `MediaLightbox` click-to-zoom for all room and food photo grids. Refactored `CourseEligibility.tsx` to extract a clean, reusable `PrerequisiteCard` sub-component to dry up the prerequisite items list columns. Checked type safety, Biome formats, and Next.js builds successfully.
2026-06-21 — **Footer Split Brand Finalization**: Selected **Split Brand** layout from the footer playground and promoted it to production `Footer.tsx`. Removed `FooterShowcase.tsx` and the floating variant switcher. Split layout: gradient brand panel left (logo, trust badges, social), programs/school links + contact card right on `bg-dark`.
2026-06-21 — **Footer Sanctuary Finalization**: Selected **Sanctuary** layout — accent-line brand column left, three link columns + contact right on `bg-dark`. Removed footer showcase playground and variant switcher.
2026-06-21 — **Accommodation & Food Live Content**: Rebuilt `AccommodationFood.tsx` with full copy, facilities list, and all room/food images scraped from the live site (`private`×17, `2-shared`×19, `3-shared`×5, `4-shared`×18, dining×17 + admin uploads). Tabbed galleries with `MediaLightbox` zoom; content in `src/data/accommodationFood.ts`.
2026-06-21 — **PlatformReviewsRows & Why Nirvana Reviews**: Extracted shared `PlatformReviewsRows.tsx` from `TestimonialsSection` (rating cards + testimonial sliders). `WhyNirvana.tsx` now reuses it with `REVIEWS` from `reviews.ts`; removed duplicate review data from `whyNirvana.ts`.
2026-06-21 — **Unified FAQSection**: Merged home `FAQSection`/`FAQItem` and `CourseFAQ` into shared `src/components/ui/FAQSection.tsx` + `FAQItem.tsx`. `variant="image"` (photo card backgrounds, two-column) or `variant="plain"` (white cards + category tabs). Home data in `src/data/homeFaqs.ts`.
2026-06-21 — **TravelGuide Split Layout Redesign**: Replaced the centered accordion list in `TravelGuide.tsx` with an editorial split layout: asymmetric header, quick-facts strip, sticky topic selector (icons + spring highlight) on desktop, and animated detail panel with hero image and contextual callout boxes. Anchor `#travel`.
2026-06-21 — **TravelGuide Magazine Hero Finalization**: Selected **Layout 6 (Magazine Hero)** from the first travel guide playground. Production `TravelGuide.tsx` uses cinematic hero + topic chips + detail card. Shared content in `travelGuideShared.ts`.
2026-06-21 — **TravelGuide Slide Drawer Finalization**: Selected **Layout 9 (Slide Drawer)** from the v2 playground. Production `TravelGuide.tsx` uses hero banner left, vertical topic drawer right, and sliding detail panel below. Removed showcase route.
2026-06-21 — **Homepage two-tone backgrounds**: Alternating `bg-paper` and `bg-white` across homepage content sections (Welcome, Video, Gallery, Why Rishikesh, Courses, Teachers, Testimonials, FAQ, Map). Yoga Alliance, Hero, and Final CTA remain accent/dark bands.
Last meaningful update: 2026-06-28 — **Unified CMS on :3000**: website, `/admin` CMS, and `/api/admin/*` in one Next.js app. PostgreSQL via `docker-compose.yml` only. Repositories read DB when `DATABASE_URL` is set.
2026-06-28 — **Unified content layer** (`src/content/`): types, JSON data, mappers, repositories. All pages fetch via `getPageBySlug()` / `getBlogPost()` — set `CONTENT_API_URL` for DB/CMS. Legacy `@/data/*` and `@/lib/content` re-export from `@/content`.
2026-06-28 — **All online course pages**: 14 slugs in `ONLINE_COURSES` via `content/data/online-courses/`.
2026-06-28 — **Modular SimplePage system**: Refactored `SimplePage` into a thin hero shell + `PageRenderer` composing interactive modules (`HighlightsModule`, `SectionModule`, `TimelineModule`, `TeachersModule`, `PackagesModule`, `GalleryModule`, `CardsModule`). Sections support image carousels + lightbox, timeline accordion, FAQ accordion, category gallery tabs, and teacher selector. Sync script enriches pages with `layout`, `image`, and `images` fields from live-site HTML.
2026-06-28 — **Site pages use course components**: `SitePageLayout` maps `sitePages` data through `sitePageMapper.ts` and renders the same premium course stack — `CourseHero` (page variant), configurable `CourseStickyNav`, `CourseOverview`, `WhatIsIncluded`, `DailySchedule`, `UpcomingDates`, home `TeachersSection`, plus `PageProgramsSection`, `PageGallerySection`, `PageEditorialSection`, `AccommodationFood`, `WhyNirvana`, `TravelGuide`, `InstagramFeed`, and `FAQSection`.
2026-06-28 — **Instagram feed + live content sync**: `InstagramFeed.tsx` uses an Instagram-style profile header + 3-column grid with hover likes/comments, video/carousel badges. Post shape: `image`, `caption`, `isVideo`, `isMultipleImages`, `mediaCount`, `likesCount`, `commentsCount`. Fallback in `src/data/instagramFeed.json`; live via `/api/instagram`. Site pages + blog content synced from live site into `src/data/sitePages.json` and `src/data/blogPosts.json` via `npm run sync:content`. API routes: `/api/pages/[slug]`, `/api/blog/[slug]`. Set `LIVE_CONTENT_FETCH=true` to refresh titles/descriptions from live HTML at runtime.
2026-06-28 — **Rich SimplePage sync**: `scripts/sync-live-content.mjs` now scrapes structured live-site data into `sitePages.json` — h2 sections with lists/subsections (retreat schedules, inclusions), teacher profiles (`people[]` with education/experience/expertise), gallery images, retreat highlights/packages. `SimplePage.tsx` renders alternating `bg-paper`/`bg-white` bands for each block.
2026-06-28 — **CMS dynamic section builder**: Site page sections in `/admin` use `section-list` + `BlockBuilder` (paragraph, lead, bullets, FAQ, CTA with href/variant, image with preview, gallery, subsection, video). Layout dropdown removed; frontend renders via `SectionBlocksRenderer` when `blocks[]` is present (legacy `body`/`items`/`layout` still supported).
2026-06-28 — **File-only static site**: Removed PostgreSQL, Docker, admin CMS, all `/api` routes, and live-site sync scripts. Content loads from `src/content/data/` and `src/data/` JSON/TS only. Live-site images replaced with high-res Unsplash stock via `src/lib/stock-images.ts`.
2026-07-05 — **Online course product pages**: Dedicated `src/components/online/` theme (teal hero, trust bar, sticky pricing card, review grid). `OnlineCourseClient` uses live-site sections only — no residential lodging, dates, or travel blocks.
2026-07-10 — **Facility icons + ICONS.md**: Campus facilities use per-amenity icons (`Shower`, `Terrace`, `Bowl`, `Wifi`, `Lotus`, `Leaf`, `Garden`, `Bathroom`, `Flame`, `Droplet`, `Laundry`, `Wind`). Registry in `src/data/accommodationFacilities.ts`. Agent guide at `src/icons/ICONS.md` — read before adding any SVG.
2026-07-11 — **Dedicated `/teacher` page**: Faculty page at `teacher/page.tsx` via `TeachersPageClient` — cinematic hero, scrollable jump-to nav, and simple profile cards. Teacher data centralized in `content/data/teachers.ts` from `site-pages.json` (`people[]` with live `/img/teacher/` photos). Home `TeachersSection` uses the same source. Footer links to `/teacher`.
2026-07-11 — **JSDoc rule for agents**: `.cursor/rules/jsdoc-documentation.mdc` requires JSDoc on exported components, hooks, and functions (props/params/`@returns`) when editing `src/**/*.{ts,tsx}`.
2026-07-11 — **Dedicated Course Venue page**: `/venue/course-venue` promotes the original live-site `/gallery` content into the venue route with all yoga hall, dining, room, dorm, and premises images. Venue navigation and footer link to the dedicated page; `/gallery` redirects there.
2026-07-12 — **Media upload limit**: CMS image uploads capped at **1MB** (`MAX_UPLOAD_BYTES` in `src/lib/cdn/constants.ts`).
2026-07-12 — **CMS restored**: PostgreSQL + Prisma 5, `/admin` portal, `/api/admin/*` + `/api/content/*`, Cloudinary uploads, JSON fallback when `DATABASE_URL` unset or DB down. Architecture: `docs/cms-architecture.md`.
2026-07-12 — **Full admin editors**: `SitePageEditor`, `CourseEditor`, `BlogPostEditor` in `src/components/admin/` — all fields editable with `ImageField` (upload + media library), collapsible panels, sticky save bar. Sidebar nav: Pages / Courses / Blog / Media. APIs: `PUT /api/admin/pages|courses|blog/[slug]`.
2026-07-12 — **Module content library**: `module_library_items` table + `/admin/library` + `ModuleLibraryPicker`. Save/insert module snippets by `moduleKey` (hero filtered by layout `variant`). Copy-on-insert into `page_modules`. Seed: `npm run db:seed-library`.
2026-07-12 — **Module editor UX**: `ModulePageEditor` uses sticky jump-nav (`ModuleNav`), visual `HeroTypePicker`, `ImageListField` (upload per row), bulk paste in `StringListField`, nav presets/quick-add chips, expand/collapse all, and numbered `NestedItemCard` list rows.
2026-07-12 — **Module-based CMS**: `Page.pageModules` JSON stores fixed-order modules (Hero → Sticky Nav → Overview → Inclusions → Eligibility → Syllabus → Schedule → Pricing → FAQ + flags). Admin: `ModulePageEditor` at `/admin/pages/[slug]` and `/admin/courses/[slug]`. API: `GET/PUT /api/admin/modules/[slug]`. Seed: `npm run db:seed-modules`. Types: `src/content/types/page-modules.ts`, builders: `src/lib/cms/page-modules-builder.ts`.
2026-07-12 — **Media metadata + safe delete**: `MediaAsset` stores `caption`, `description`, `tags[]`. Upload via `/admin/media` or `ImageField` modal; filter library by tag; `DELETE /api/admin/media/[id]` returns 409 when asset URL is still referenced (`src/lib/cms/media-usage.ts`).
2026-07-12 — **Blog rich-text editor**: Tiptap (`RichTextEditor`) in `/admin/blog/[slug]` for article body; stored as `bodyHtml` with legacy block fallback via `resolveBlogBodyHtml()`. Frontend renders sanitized HTML via `BlogHtmlContent`.
2026-07-12 — **Lead tracking dashboard**: `lead_submissions` table stores `/enquire-now` (enquiry) and `/contact` (query) forms via `POST /api/leads`. Admin dashboard shows counts (total, this week, this month, unread) and `/admin/leads` inbox.
2026-07-12 — **Lead soft delete**: `DELETE /api/admin/leads/[id]` sets `deletedAt`; `/admin/leads` **Deleted** tab lists trashed items; **Restore** via `PATCH { restore: true }`. Inbox supports **Unread / Read** filters, auto-mark read on open, and **Mark as unread** button.
2026-07-12 — **Book-now + PayPal**: `/booking` (courses) and `/retreat-booking` (retreats) multi-step flow with 20% deposit or full payment + 6% PayPal fee. `bookings` table; APIs: `POST /api/bookings`, `POST /api/payments/paypal/create-order|capture`. Admin: `/admin/bookings`. Env: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`. Redirect: `/retreat/retreat-booking` → `/retreat-booking`.
2026-07-12 — **AI Chatbot**: Ollama + pgvector RAG. `POST /api/chat` SSE. `ChatWidget` on site. Admin `/admin/chatbot`. Security: IP+session rate limits, Zod validation, prompt-injection guard, safe errors, request logging. See `docs/chatbot-architecture.md`.
