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
npm run dev              # next dev (turbopack, .next/dev)
npm run build            # next build
npm run start            # next start
npm run lint             # biome check
npm run format           # biome format --write
npx tsc --noEmit         # type-check only
npx biome check src/ --write   # auto-fix lint + organize imports
```

The dev server is typically already running in terminal `1.txt`. Check that file before starting a new one.

---

## 3. Directory map

```
src/
  app/
    layout.tsx          # Root layout: metadata, fonts, Header, Footer, WhatsAppFab, MobileStickyBar
    page.tsx            # Home page — composes all home sections + JSON-LD
    globals.css         # Tailwind v4 @theme tokens + utility classes
  constants/
    navigation.ts       # PRIMARY_NAV + SIGN_IN_URL — mirrored from live site header
  assets/               # Local images, video, fonts (re-exported via barrel)
    images/
      logo.png          # Dark logo (light bg)
      logo_white.png    # Light logo (dark bg / hero)
      home/
        banner_1.webp   # Used in welcome collage
        banner_2.webp
        banner_3.webp
    video/              # (currently empty; hero videos live in /public/videos/)
    index.ts            # Barrel: re-exports images
  components/
    home/               # Home page sections (one file per section)
      HeroSection.tsx
      HeroBackgroundVideo.tsx  # Client: responsive poster + single video with media sources
      WelcomeSection.tsx
      VideoSection.tsx          # Async server: oEmbed fetch → VideoSectionPlayer
      VideoSectionPlayer.tsx    # Client: playlist + YouTube iframe
      GallerySection.tsx        # Client: Pinterest-style masonry grid layout with category tabs, dynamic crossfading auto-transition shuffling, and fullscreen lightbox modal
      WhyRishikeshSection.tsx   # Async server: oEmbed fetch → WhyRishikeshClient
      WhyRishikeshClient.tsx    # Client: timeline sutras accordion + unified player card
      CoursesSection.tsx
      ExperienceSection.tsx
      TeachersSection.tsx
      RishikeshSection.tsx
      TestimonialsSection.tsx
      FAQSection.tsx
      FinalCTASection.tsx
      index.ts          # Barrel
    layout/
      Footer.tsx
      index.ts
    ui/                 # Reusable primitives — used across sections
      Button.tsx        # 4 variants × 3 sizes, polymorphic Link/<button>
      Container.tsx     # max-width wrapper with sm/md/lg/xl
      SectionHeader.tsx # eyebrow + title + description pattern
      Pill.tsx          # rounded label with optional invert
      Header.tsx        # client component: transparent→solid on scroll, full live-site nav with dropdowns + mobile accordion
      Card.tsx          # (legacy "Expanding Yoga's Reach" card, not currently used)
      CourseCard.tsx    # Interactive animated YTT course card
      JsonLd.tsx        # Wraps dangerouslySetInnerHTML for structured data
      WhatsAppFab.tsx   # Floating WhatsApp button
      MobileStickyBar.tsx
      index.ts          # Barrel
    index.ts            # Top-level barrel: re-exports ui/home/layout
  icons/
    types.ts            # IconProps + iconSize helper
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
| Display (headings, prices, stats) | **Playfair Display** | `font-serif` |
| Body + UI (everything else) | **Outfit** | `font-sans` (body default) |

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
  fee="From 649 USD"
  image="https://www.nirvanayogaschoolindia.com/img/service-1.webp"
  certBadge="https://www.nirvanayogaschoolindia.com/img/ryt200.webp"
  href="https://www.nirvanayogaschoolindia.com/200-hour-yoga-teacher-training-in-rishikesh-india"
  revealDelay={0}
/>
```
- Client component. Premium editorial card: image overlay with hour pill + RYT badge + glass fee tag; eyebrow cert line; invoice-style meta table (Duration/Level/Certification/Fee); Course Details CTA. **Framer Motion**: lift, shine, image zoom, staggered meta rows, spring badge. Respects `useReducedMotion`.

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
10. `TestimonialsSection` — 6 review cards
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
| `TeachersSection`                              | All 4 teacher names, roles, photos |
| ~~`CoursesSection` pricing~~                   | Real pricing from live site ($649/$899/$1449)                       |
| `FinalCTASection`                              | Offer copy "Save 25% when you book by 25 July 2026" |
| `page.tsx` JSON-LD                             | `aggregateRating.reviewCount: "500"` — set real number |

---

## 9. Conventions & gotchas

### Imports
- Sort: external → `@/` → relative. Biome's `organizeImports` is enabled and will auto-sort.
- Always import from barrels (`@/components`, `@/components/ui`, `@/icons`, etc.) where possible.
- **Icons**: never inline `<svg>` in components — use `@/icons` TSX components. All accept optional `size` and `className` via `IconProps`.

### Components
- Default export is the component. Named exports only for re-exports in barrels.
- File names match component names exactly (`HeroSection.tsx`, not `hero-section.tsx`).
- Client components: add `"use client"` only when needed (hooks, browser APIs). Currently only `Header.tsx` is a client component.

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
2026-06-02 — **CourseCard UI polishing**: Simplified course titles in `CoursesSection.tsx` by removing duplicate location suffix strings ("in Rishikesh India"). Redesigned `CourseCard.tsx` to remove the heavy meta-table grid, replacing it with a clean ticket-style details strip (Duration and Level). Shifted certification info to the eyebrow, deleted duplicate fee copy (which is already displayed in the image overlay), and polished the course title typography. Implemented a 3D overlapping card layout featuring a sanctuary arched cover frame with a thick white gallery inner border (`ring-4 ring-white/95`) and a floating card details box. Programmed custom spring hover physics (`stiffness: 350, damping: 12`) to wobble-rotate the overlapping RYT certification stamp. Added a soft warm radial glow (`from-primary/5`) that fades in behind the text card on hover, and an expanding Maroon-Sage-Teal brand highlight line at the bottom. Implemented a vertical column stagger in `CoursesSection.tsx` (`lg:translate-y-12` and `lg:translate-y-6`) to break grid lines and form a wave visual flow.
2026-06-04 — **GallerySection integration**: Added a premium responsive categorized image carousel (`GallerySection.tsx`) loading 28 real webp images from the live site's homepage slider. The carousel features a spring-based filter menu (All, Practice, Campus, Life), a touch-pan/drag track with inertia limits and arrow navigators, a dynamic line progress bar, and a fullscreen animated lightbox modal supporting keyboard slide/close controls. Created new SVG TSX primitives (`ChevronLeft`, `ChevronRight`, `Close`).
2026-06-04 — **Testimonials/Reviews exact content alignment & layout redesign**: Redesigned `TestimonialsSection.tsx` to stack reviews under Google Reviews (1,200+) and TripAdvisor (800+) tabs using a Stripe-style sliding spring pill. Loaded the exact word-for-word quotes for Usha Singh, Ole Netek, Niall Phelan, Joan Nakazono, Beatrice Ani-Asamoah, and Eve Lesage from the live website. Displayed the reviews in a beautiful 3-column card grid, centered inside a single desktop viewport (`lg:min-h-screen`) with spring hover lifts. Updated `TeachersSection.tsx` to render name, role/subject, and experience to match the live site data exactly. Complete typescript and Next.js builds compiled successfully.
2026-06-04 — **GallerySection Pinterest Redesign**: Completely redesigned the horizontal image slider into a premium, responsive Pinterest-style masonry columns grid (`columns-2 sm:columns-3 lg:columns-4`). Programmed a custom React-state interval loops that periodically swaps visible card slots with non-visible pooled category images. Embedded Framer Motion crossfade transitions (`AnimatePresence mode="popLayout"`) inside the stable cards and aligned captions underneath, with full sync to the fullscreen swipeable lightbox. All linting and TypeScript checks pass.
2026-06-04 — **Gallery Non-Interactive Masonry**: Reverted the gallery section to a vertical CSS columns masonry layout, replaced clickable image cards with static `<div>` components, and removed all lightbox states, keyboard listeners, pan/drag scripts, and fullscreen modal UI markup. Tested lint, format, and production compile successfully.
2026-06-04 — **Gallery Key Optimization**: Updated `GallerySection.tsx` to use stable `item.id` values as the React keys for the columns masonry container to satisfy the `noArrayIndexKey` Biome rules.
2026-06-04 — **Testimonials Redesign (Multi-Stack 3D Deck)**: Completely refactored `TestimonialsSection.tsx` to display three columns side-by-side representing Google, Tripadvisor, and Trustpilot reviews. Extracted all 12 reviews from the live website and populated each platform with its respective reviews. Programmed a highly premium, independent 3D deck stack for each platform where clicking the top card animates it sliding out to the side with spring mechanics and moving to the bottom of the stack. Added navigation pagination dots for direct jumpers and mobile helper tooltips. Verified build compiles and formats cleanly.
2026-06-04 — **Testimonials Viewport Pattern Alignment**: Refactored `TestimonialsSection.tsx` to use the standardized single-viewport desktop pattern (`lg:h-[calc(100svh-5.5rem)] lg:min-h-[680px] lg:max-h-[880px] lg:flex lg:items-center`), reduced element heights and margins to prevent vertical overflow, and imported the shared `reducedTransition` and `EASE_OUT` motion parameters from `@/lib/motion` to match WelcomeSection and WhyRishikeshSection. All linting and TypeScript checks pass.
2026-06-04 — **Teachers Spotlight Arched Cards Redesign**: Completely refactored `TeachersSection.tsx` to style teacher cards with a custom arched sanctuary/temple frame (`rounded-t-[100px]`), a soft color hover scale, and a spring-loaded info drawer that slides up on card hover to reveal a personalized spiritual mantra/philosophy and areas of instruction for all 12 teachers. Verified compiles and formats cleanly with zero warnings.
2026-06-04 — **Teachers Selector Card Upgrades**: Converted the circular avatar buttons in the selector grid on the left side of `TeachersSection.tsx` into styled card buttons (`bg-white/40 border border-ink/5 p-2 rounded-2xl`). Increased the image sizes significantly using a full-width aspect-square configuration inside the cards, adding subtle hover scale and primary-colored active states. Verified all lint and build commands pass.
2026-06-04 — **Teachers Dynamic Cards Slider Redesign**: Rebuilt `TeachersSection.tsx` into a horizontal cards slider with arched sanctuary frames, arrow scroll navigators, and hover-reveal details panel.
2026-06-04 — **Teachers Symmetrical Portfolio Grid Redesign**: Redesigned `TeachersSection.tsx` to showcase all 12 gurus in a 4-column profile grid with roles and mantras.
2026-06-04 — **Teachers Infinite Auto-Scrolling Carousel**: Redesigned `TeachersSection.tsx` into a seamless, infinite auto-scrolling marquee carousel of 12 gurus. Upgraded card layouts with linear gradients, inner depth shadows, expandable brand underlines, and experience pills. Added a dedicated `.animate-marquee-slow:hover` pause rule in `globals.css` to freeze the entire carousel as soon as any card is hovered.
2026-06-04 — **Teachers Card Images Optimization**: Upgraded `TeachersSection.tsx` to replace the arched sanctuary dome card image frames with clean, standard rectangular portrait frames (`rounded-2xl`). This prevents headshot clipping on top and results in a more modern, editorial look. Checked lint, format, and production compiles cleanly.
2026-06-04 — **Yoga Alliance Section Color Adjustment**: Restored the `YogaAllianceSection.tsx` background to a linear gradient starting from the primary maroon and transitioning smoothly to the secondary deep teal (`from-primary via-primary-dark to-secondary`). Applied secondary deep teal accent colors on the RYS pill badge and the card level badges. Checked lint, format, and production builds compile successfully.
2026-06-04 — Yoga Alliance Card Styling Refinement: Restructured the cards in `YogaAllianceSection.tsx` to be solid white (`bg-white`) on a solid brand maroon background (`bg-primary`). Configured card titles to dark ink (`text-ink`) with a primary red hover transition, and updated descriptions and badges to secondary deep teal (`text-secondary`) instead of gray text for premium contrast. Checked lint, format, and production builds compile successfully.
2026-06-04 — **Teachers Card Size Increase**: Increased the teacher cards width from `w-[230px]` to `w-[280px]` in `TeachersSection.tsx` and updated the `Image` `sizes` attribute accordingly. This gives the portrait gallery a more editorial presence and minimizes name truncation. Verified builds and formatting compile successfully.
