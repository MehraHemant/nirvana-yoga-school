# Caching in this project

This document describes how caching works **in the Nirvana Yoga School codebase** today: what is cached, where it lives, how long it lasts, and what runs when you save content in the admin CMS.

The site is a **Next.js App Router** app on **Vercel**, with content in **Neon Postgres**. Public pages and APIs are designed to stay fast without rebuilding the whole site on every edit. Admin routes stay fresh and private.

---

## Overview

Think of caching in four layers:

1. **Browser** — may cache responses according to `Cache-Control` (mostly relevant for public JSON APIs).
2. **Vercel edge / CDN** — caches full HTML pages (Full Route Cache) and can cache API responses when headers allow `s-maxage`.
3. **Next.js server (Data Cache)** — `unstable_cache` wraps Postgres reads with a **3600 second (1 hour)** time-based revalidate and **cache tags** for on-demand invalidation.
4. **Neon Postgres** — source of truth; not a “cache layer,” but every cache miss ends up here.

**Important idea:** Invalidating **data tags alone does not refresh pre-rendered HTML.** The helpers in `src/lib/cms/cache.ts` therefore call both `revalidateTag(...)` and `revalidatePath(...)` for public pages when content changes. Comments in that file state this explicitly for the Full Route Cache.

Content edits **do not require a redeploy**. Code changes (components, routes, config) still need a new build and deploy.

---

## Where data is stored

| Location | What lives here | Typical TTL / behavior |
|----------|-----------------|-------------------------|
| Browser | API JSON (if cached), static assets | Depends on headers; public APIs use CDN-oriented `Cache-Control` (see below) |
| Vercel edge | Rendered HTML for static/ISR routes, some API responses | Page ISR **3600s** where `export const revalidate = 3600`; APIs **3600s** `s-maxage` when using `jsonCached` |
| Next.js Data Cache | Postgres query results from `unstable_cache` | **3600s** for CMS content; **60s** for admin media usage snapshot |
| Neon | Pages, modules, blog posts, settings, media metadata | Always current; reads on cache miss |
| Cloudinary CDN | Uploaded images/videos | **Not controlled by this app** — URLs point at Cloudinary; transforms are cached on their CDN |

Images use a **custom Next.js image loader** (`next.config.ts` → `src/lib/cdn/image-loader.ts`) so delivery is resized on **Cloudinary** (or returned unchanged for non-Cloudinary URLs), not re-encoded through Vercel’s `/_next/image` optimizer.

For stack-agnostic caching concepts (Redis, Django, CDN headers, etc.), see **`docs/caching-when-server-app-db-are-separate.md`**.

---

## Next.js built-in caching APIs (Next 16.2)

This project runs **Next.js 16.2** on the **App Router**. Next maintains several **separate caches** on the server and at the edge. The table below is a map of the main APIs: what they do, where the result lives, defaults, tradeoffs, and **whether this repo uses them** (verified by searching the codebase).

| API | Stored in | Default (App Router) | Used here? |
|-----|-----------|----------------------|------------|
| Full Route Cache (HTML/RSC payload) | Server + edge (e.g. Vercel) | Static pages cached until revalidate or purge | **Yes** — ISR via `revalidate` export on some routes; on-demand via `revalidatePath` |
| Data Cache (`fetch`, `unstable_cache`) | Next server (per deployment) | `fetch` defaults to caching static GETs; `unstable_cache` opt-in | **Yes** — `unstable_cache` for Postgres; `fetch` + `next.revalidate` for Instagram/YouTube |
| Request memoization | In-memory for one request | Automatic for identical `fetch`/DB calls in one render | **Yes** (implicit) — no extra code |
| Router Cache (client) | Browser memory | Short-lived soft navigation cache | **Yes** (framework default) — `router.refresh()` after admin saves |
| React `cache()` | Per-request dedupe | Opt-in wrapper | **No** |
| `"use cache"` + `cacheLife` / `cacheTag` | Next Cache Components store | Opt-in per function/file | **No** |

Legend in subsections: **Used in this repo** vs **Not used in this repo** (available if you need them).

### Route segment config (`page.tsx`, `layout.tsx`, `route.ts`)

These **exports** tune how a segment is rendered and how long its **Full Route Cache** entry may live.

#### `export const revalidate = <seconds>` — **Used in this repo**

- **What:** Time-based **ISR** for that route segment’s rendered output (HTML + flight data). After the interval, the next request may regenerate in the background while stale output can still be served (platform-dependent).
- **Where stored:** Full Route Cache (server/edge), not the Data Cache.
- **Default:** No time-based revalidation unless you export this or use dynamic rendering.
- **Pros:** Predictable refresh for high-traffic pages without redeploying.
- **Cons:** Worst-case staleness up to the interval unless you also call `revalidatePath` on CMS save.
- **This repo:** `3600` on home, teacher, course, online-course, and retreat slug pages (aligned with `unstable_cache` TTL). See [Public HTML pages](#public-html-pages-isr--revalidate-export) below.

#### `export const dynamic = 'auto' | 'force-dynamic' | 'force-static' | 'error'` — **Not used in this repo**

- **What:** Overrides whether the segment is treated as static or dynamic.
- **Where stored:** Affects whether Full Route Cache can hold the route at all.
- **Default:** `'auto'` — Next infers from `cookies()`, `headers()`, `searchParams`, etc.
- **Pros:** Explicit control when inference is wrong.
- **Cons:** `force-dynamic` disables static/ISR benefits for that segment.
- **This repo:** Relies on defaults plus session/`searchParams` on specific routes (admin, booking, account).

#### `export const fetchCache = 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'` — **Not used in this repo**

- **What:** Segment-wide default for **`fetch()` Data Cache** behavior in Server Components.
- **Where stored:** Data Cache (for eligible `fetch` calls).
- **Default:** `'auto'`.
- **Pros:** One switch when a whole subtree must always hit origin.
- **Cons:** Easy to accidentally disable caching for an entire layout.
- **This repo:** Per-call `fetch` options instead (Instagram, YouTube).

#### `export const runtime = 'nodejs' | 'edge'` — **Used in this repo (narrowly)**

- **What:** Chooses Node.js vs Edge runtime for the segment (API routes / server code).
- **Where stored:** N/A (execution environment); Edge has different cache/size limits.
- **Default:** `'nodejs'` for most App Router server code.
- **Pros:** Edge for latency; Node for native modules and larger work.
- **Cons:** Not all npm packages work on Edge.
- **This repo:** `export const runtime = "nodejs"` on admin/chat PDF and chat API routes only.

#### `generateStaticParams()` — **Used in this repo**

- **What:** Pre-renders known dynamic paths at **build** time (`[slug]` segments).
- **Where stored:** Full Route Cache entries created at build.
- **Default:** No prebuilt paths unless you implement this.
- **Pros:** Fast first visit for known slugs.
- **Cons:** New slugs not in the list still work on first request but may need build or on-demand revalidation for listing pages.
- **This repo:** Course, online, retreat, venue, blog, and generic `[slug]` site pages.

---

### `fetch()` and the Data Cache

In Server Components and Route Handlers, **`fetch(url, options)`** can persist GET responses in the **Data Cache** (separate from Full Route Cache).

| Option | Meaning | Used here? |
|--------|---------|------------|
| `cache: 'force-cache'` | Prefer cached response; revalidate per `next.revalidate` | **No** (implicit default on many static fetches) |
| `cache: 'no-store'` | Do not store in Data Cache | **Yes** — client components calling `/api/auth/me`, `/api/quiz/attempts` |
| `next: { revalidate: N }` | Time-based revalidation (seconds) for this URL in Data Cache | **Yes** — `src/lib/instagram.ts` (default TTL **3600**), `src/lib/youtube.ts` (**86400**) |
| `next: { tags: ['tag'] }` | Tag for `revalidateTag` invalidation | **No** |

**Defaults:** Undecorated server `fetch` to static URLs is often cached; anything that opts into dynamic rendering or `no-store` bypasses it.

**Pros:** Simple HTTP caching without wrapping functions. **Cons:** Tag-based purge only if you set `next.tags`; easy to forget pairing with `revalidatePath` for HTML.

---

### `unstable_cache()` — **Used in this repo (primary DB read cache)**

- **What:** Wraps an async function (e.g. a Postgres query) and stores the return value in the **Data Cache** with optional TTL and **tags**.
- **Where stored:** Next.js Data Cache (server, tied to deployment).
- **Default:** No caching until you wrap the function.
- **Pros:** Works with any data source; tag invalidation via `revalidateTag`; same pattern as cache-aside in other frameworks.
- **Cons:** Still named `unstable_cache` in Next 16 types; does not refresh pre-rendered HTML by itself — this project always pairs tag/path revalidation on writes (see `src/lib/cms/cache.ts`).
- **This repo:** CMS loaders (**3600s**), media usage snapshot (**60s**), page SEO, labels, teachers, quiz flag — details in [CMS data cache](#cms-data-cache-unstable_cache--tags) below.

---

### On-demand invalidation (`next/cache`)

#### `revalidateTag(tag, profile)` — **Used in this repo**

- **What:** Purges Data Cache entries associated with `tag`. Second argument in Next 16 is a **cache life profile** (e.g. `"max"`) or `{ expire?: number }`.
- **Where stored:** Clears matching **Data Cache** keys; does **not** alone update Full Route Cache HTML.
- **This repo:** All CMS invalidation uses `revalidateTag(..., "max")` — see `cache.ts`, `page-seo.ts`, `media-usage-tag.ts`, `questions.ts`.

#### `revalidatePath(path, type?)` — **Used in this repo**

- **What:** Invalidates **Full Route Cache** (and triggers refresh) for a URL path. Optional `type`: `'page'` (default) or `'layout'`.
- **Where stored:** Route cache at server/edge.
- **This repo:** Public paths on CMS save, product hub layouts, blog, admin UI freshness, some `/api/content/*` paths after settings save.

#### `updateTag(tag)` — **Not used in this repo**

- **What:** Updates cache for read-your-own-writes; **Server Actions only** (Next 16 types).
- **Use when:** Editor saves and must see new data immediately without waiting for TTL.

#### `refresh()` (from `next/cache`) — **Not used in this repo**

- **What:** Refreshes **client** Router Cache from a Server Action context.
- **Note:** The repo uses **`router.refresh()`** from `next/navigation` in client components after admin actions — different API, same user-facing goal.

#### `unstable_noStore()` — **Not used in this repo**

- **What:** Marks the current scope as **dynamic** (opts out of static caching for that subtree).
- **Use when:** You need fresh data every request without marking the whole route `force-dynamic`.

---

### Cache Components: `"use cache"`, `cacheLife`, `cacheTag` — **Not used in this repo**

Next 16 exposes stable helpers from **`next/cache`** (see `node_modules/next/cache.d.ts`):

- **`"use cache"`** directive at the top of a Server Component, layout, or async function — caches that unit’s output in the **Cache Components** layer.
- **`cacheLife(profile)`** — TTL semantics using named profiles (`default`, `minutes`, `hours`, `max`, etc.) or custom `{ stale, revalidate, expire }`. Custom profiles can be defined in `next.config.ts` (this repo does not define any).
- **`cacheTag(...tags)`** — Associates Cache Component entries with tags for `revalidateTag`.

**Where stored:** Server cache distinct from classic `unstable_cache` / `fetch` Data Cache (Next merges behavior at the platform layer).

**Pros:** Fine-grained caching at component boundaries; aligns with **Partial Prerendering (PPR)** when enabled.

**Cons:** New mental model; must still coordinate with CDN/HTML invalidation for CMS sites.

**This repo:** No `"use cache"`, `cacheLife`, or `cacheTag` imports. CMS caching stays on **`unstable_cache` + tags + `revalidatePath`**.

---

### Full Route Cache, static generation, and PPR

- **Full Route Cache:** Stores the result of rendering a route (static or ISR). **`export const revalidate`** and **`revalidatePath`** are the main levers here.
- **Partial Prerendering (PPR):** Serves a static shell immediately and streams dynamic holes. Enabled via **`experimental.ppr`** or related config in Next docs — **not enabled** in this repo’s `next.config.ts`.
- **Static export (`output: 'export'`):** Disables server-side revalidation — **not used** (see [Deploy behavior](#deploy-behavior)).

---

### What forces dynamic rendering (no static Full Route Cache)

Next treats a segment as **dynamic** when it uses runtime request data, including:

| Signal | Effect | Used here? |
|--------|--------|------------|
| `cookies()` | Dynamic | **Yes** — admin session via `getServerSession()` → `cookies()` in `auth-session.ts`; admin layout runs every request |
| `headers()` | Dynamic | Rare; mostly API routes reading `request.headers` |
| `searchParams` prop (page) | Dynamic | **Yes** — e.g. `/booking`, `/enquire-now`, `/account`, auth login/signup |
| `unstable_noStore()` / `connection()` | Dynamic | **No** `unstable_noStore` in repo |

Public marketing pages that only read **`unstable_cache`** data and avoid the above can stay **static/ISR**.

---

### Route Handlers vs Server Components

| | Server Components (pages/layouts) | Route Handlers (`app/api/.../route.ts`) |
|---|-----------------------------------|----------------------------------------|
| Primary output | HTML / RSC | HTTP response body + headers |
| Full Route Cache | Yes, when static/ISR | No — caching is via **`Cache-Control`** on the `Response` |
| Data Cache | `unstable_cache`, server `fetch` | Same on server |
| **This repo** | Public pages + admin UI | Public JSON: `jsonCached` (**3600** `s-maxage`); admin/auth: no CDN cache |

Route Handlers do not use `export const revalidate` on the route file for JSON TTL; this project sets **`Cache-Control`** in `jsonCached` instead.

---

### `next.config.ts` (caching-related)

This repo’s config does **not** set `cacheLife` profiles, PPR, or global `fetchCache`. Relevant choices:

- **No `output: 'export'`** — required for `revalidatePath` / `revalidateTag` on Vercel.
- **Custom `images.loader`** — images bypass Vercel image optimizer; caching is on **Cloudinary** / origin URLs, not Next’s Data Cache.
- **`experimental.serverActions`** — unrelated to public page cache; affects upload size limits for admin.

---

## Public HTML pages (ISR / `revalidate` export)

Several high-traffic routes set **`export const revalidate = 3600`**, aligned with the 1-hour `unstable_cache` TTL (comments in code say this explicitly):

| Route file | Path pattern |
|------------|--------------|
| `src/app/(site)/page.tsx` | `/` (home) |
| `src/app/(site)/teacher/page.tsx` | `/teacher` |
| `src/app/(site)/course/[slug]/page.tsx` | `/course/{slug}` |
| `src/app/(site)/online-course/[slug]/page.tsx` | `/online-course/{slug}` |
| `src/app/(site)/retreat/[slug]/page.tsx` | `/retreat/{slug}` |

**Routes without that export** (still statically generated at build for known slugs, but **no automatic hourly refresh**):

- `/blog`, `/blog/{slug}` — `src/app/(site)/blog/...`
- `/venue/{slug}` — `src/app/(site)/venue/[slug]/page.tsx`
- Generic site pages — `src/app/(site)/[slug]/page.tsx` (e.g. `/yoga-teacher-training-in-rishikesh-india`, `/contact` is a dedicated route elsewhere)
- `/booking`, `/contact`, `/enquire-now`, etc.

For those pages, freshness after a CMS save depends on **on-demand** `revalidatePath` from `src/lib/cms/cache.ts`. If nothing triggers path revalidation, HTML can stay as it was at build time until the next deploy.

**Product hub layouts:** Saving a course, online course, or retreat also revalidates layout caches for `/course`, `/online-course`, and `/retreat` via `revalidateProductHubLayouts()`.

---

## CMS data cache (`unstable_cache` + tags)

Central module: **`src/lib/cms/cache.ts`**.

### Time-based revalidation

Most CMS fetch helpers use:

```ts
unstable_cache(fn, [cacheKey], {
  tags: [...],
  revalidate: 3600,
});
```

### Cache tags (on-demand invalidation)

| Tag pattern | Used for |
|-------------|----------|
| `page:{slug}` | Site page, course doc, page modules, blog post, teacher page, page labels, page SEO (also tagged per slug) |
| `pages:type:{type}` | Published slug lists for `course`, `online`, `retreat`, `venue`, `site` |
| `blog:all` | Blog index list and all blog slugs |
| `global-settings:{key}` | Row in `global_settings` (e.g. `header`, `footer`, `whyNirvana`) |

Tag invalidation uses `revalidateTag(tag, "max")` (Next.js cache life profile).

### Cached loaders (3600s unless noted)

- `fetchSitePageFromDb(slug)`
- `fetchCourseDocumentFromDb(slug)`
- `fetchPageModulesFromDb(slug)`
- `fetchBlogPostFromDb(slug)` / `fetchBlogPostsFromDb()` / `fetchBlogSlugsFromDb()`
- `fetchGlobalSettingsFromDb(key)` / `getGlobalSettings(key)`
- `fetchPageSlugsByTypeFromDb(type)`
- `fetchTeacherPickerOptions()` — admin picker; tagged with `page:teacher`

Related modules (also **3600s**, tags tied to slugs or feature keys):

- `src/content/repositories/page-seo.ts` — `page-seo:{slug}`, `page-seo:home`
- `src/content/repositories/page-labels.ts` — `page:{slug}`
- `src/content/repositories/teachers.ts` — `page:teacher`
- `src/lib/quiz/questions.ts` — `quiz-has-active-questions` tag

### “Live” fallback after cache miss (404 / unpublish)

For **site pages**, **course documents**, and **page modules**, if the cached function returns `null`, the code **queries Postgres again uncached** so a newly published page is not stuck behind a 404 for the full hour. **Blog posts** (`fetchBlogPostFromDb`) do **not** use that second live query — rely on tag/path invalidation when publishing.

---

## Public JSON APIs (`s-maxage`)

Helper: **`jsonCached`** in `src/lib/cms/api-response.ts`:

```http
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

Meaning for shared caches (e.g. Vercel edge in front of `/api/content/*`):

- Serve cached JSON for up to **3600 seconds**.
- While revalidating, stale responses may be served for up to **86400 seconds** (`stale-while-revalidate`).

Routes using **`jsonCached`** include (non-exhaustive): `/api/content/header`, `footer`, `site-config`, `blog`, `blog/[slug]`, `courses/[slug]`, `online/[slug]`, `pages/[slug]`, shared sections (`why-nirvana`, `reviews`, `ytt-hub`, FAQs, etc.), and `/api/content/v1/media/[id]`.

**Exceptions (no CDN-friendly cache header):**

- `/api/content/travel` — uses `jsonOk` (no `Cache-Control` from helper).
- `/api/content/instagram` — uses `jsonOk`; Instagram data is fetched server-side with `fetch(..., { next: { revalidate: cacheTtl } })` where `CACHE_TTL` defaults to **3600** in `src/lib/instagram.ts`.

When global settings are saved, admin code often calls `revalidatePath('/api/content/{key}')` so the next edge fetch misses (see settings route below).

**HTML vs JSON:** A user can see **new HTML** after `revalidatePath` while a **CDN-cached JSON** response is still old for up to an hour (or longer under `stale-while-revalidate`), unless that API path was revalidated too. Most settings flows revalidate the matching `/api/content/...` path; not every content type has a parallel public API.

---

## Admin (no public CDN)

- **`/admin/*`** — layout loads `getServerSession()`; requests are **session-bound** and treated as **dynamic**, not edge-cached HTML for anonymous users.
- **`/api/admin/*`** — uses `jsonOk`, errors, etc.; **not** `jsonCached`. Expect **`Cache-Control: private, no-store`** behavior for auth endpoints (e.g. `/api/auth/me` sets this explicitly).

After saves, admin UIs often call `revalidatePath('/admin/...')` so **your** next admin view is fresh; that does not publish HTML to the public site by itself — public updates go through the cache helpers below.

---

## Media library usage cache

Admin media list and pickers need to know which assets are referenced in CMS JSON.

| Piece | Location |
|-------|----------|
| Tag | `media-usage` — `src/lib/cms/media-usage-tag.ts` |
| Cached loader | `getCachedMediaUsageEntries` — `src/lib/cms/media-usage-cache.ts` |
| TTL | **`MEDIA_USAGE_REVALIDATE_SECONDS = 60`** |
| Invalidation | `invalidateMediaUsageCache()` → `revalidateTag('media-usage', 'max')` |

Called automatically from:

- `invalidateContentCache()` (page/blog/course edits)
- `invalidateGlobalSettingsCache()` (settings that can reference media)

So usage counts refresh within about a minute even without a CMS edit, but edits bust the snapshot immediately.

---

## What happens on content save (step by step)

Example: you save **page modules** for a course slug `200-hour-yoga-teacher-training-in-rishikesh`.

1. **Postgres write** — e.g. `upsertPageModules` in `src/lib/cms/document-to-db.ts` updates `pages.page_modules` (and related rows).
2. **`invalidateAndRevalidatePage(slug, pageType)`** — `src/lib/cms/cache.ts`:
   - `revalidateTag('page:{slug}', 'max')`
   - If `pageType` is set: `revalidateTag('pages:type:{pageType}', 'max')`
   - `invalidateMediaUsageCache()`
   - `revalidatePath(publicPathForPage(...), 'page')` → for a course, `/course/{slug}`
   - For course / online / retreat: **`revalidateProductHubLayouts()`** (`/course`, `/online-course`, `/retreat` layouts)
3. **SEO** — same flow may call `upsertPageSeo`, which again invalidates tags and **`revalidatePublicPagePaths`** (path bust, not tag-only).
4. **Next visitor** — edge/server regenerates HTML; data cache repopulates from Neon.

Other entry points:

| Save type | Main invalidation helper |
|-----------|---------------------------|
| Full site page document | `invalidateAndRevalidatePage` |
| Blog post | `revalidateBlogPaths(slug)` — tag `blog:all`, paths `/blog`, `/blog/{slug}` |
| Blog publish toggle | `invalidateContentCache(slug)` + `revalidateBlogPaths(slug)` |
| Global setting key | `invalidateGlobalSettingsCache(key)` + `revalidateSharedSettingsConsumers(key)` + often `revalidatePath('/api/content/{key}')` |
| FAQ catalog / assignments | `revalidatePagesUsingFaq`, `revalidateFaqContext` |
| Dedicated home/contact/etc. | `invalidateAndRevalidatePage(slug, 'site')` in `dedicated-pages.ts` |
| Page SEO only | `upsertPageSeo` in `page-seo.ts` |
| Quiz questions | `invalidateQuizQuestionsCache()` |

### `revalidateSharedSettingsConsumers(key)` (public paths)

Maps `global_settings.key` to paths — examples from code:

- `header`, `footer`, `siteConfig`, `whyNirvana`, `reviews`, `travel` → **`revalidateSiteWideShell()`** (home, `/contact`, `/booking`, `/enquire-now`, `/teacher`, product hub layouts)
- `examCertification` → product hub layouts + `/yoga-teacher-training-in-rishikesh-india`
- `homeFaqs`, `instagram`, `siteMap` → `/`
- `yttHub` → YTT hub slug path
- `venueFaqs` → every published `/venue/{slug}`
- `courseFood`, `retreatFood`, `residentialLife`, `retreatAccommodation` → product hub layouts
- `bookingAddons` → `/booking`, `/retreat-booking`
- Unknown keys → `/` only

### Public URL mapping (`publicPathForPage`)

- `course` → `/course/{slug}`
- `online` → `/online-course/{slug}`
- `retreat` → `/retreat/{slug}`
- `venue` → `/venue/{slug}`
- Dedicated slugs: `home` → `/`, `contact` → `/contact`, `booking` → `/booking`, `enquire-now` → `/enquire-now`, `teacher` → `/teacher`
- Default site page → `/{slug}`

---

## Idle traffic / stale-while-revalidate

**HTML (ISR routes with `revalidate = 3600`):** After an hour without regeneration, the next request can trigger background regeneration while stale HTML may still be served (Next.js ISR semantics on Vercel).

**HTML (no `revalidate` export):** No hourly regeneration; pages stay static until **on-demand** `revalidatePath` or a **deploy**.

**Data cache (`unstable_cache`, 3600s):** Entries expire on a time basis and when tags are revalidated.

**Public JSON (`jsonCached`):** Edge may serve stale JSON for up to **86400s** while revalidating in the background.

**Media usage (60s):** Short TTL limits how long “used/unused” counts can be wrong without an edit.

---

## Deploy behavior

- Documented in `docs/cms-architecture.md`: use **Vercel** or **`next start`** — **not** `output: 'export'`, because static export disables on-demand revalidation.
- A deploy **clears/rebuilds** server caches according to the platform; existing edge cache may briefly overlap until TTLs expire or paths are revalidated.
- **New routes/slugs:** Dynamic segments default to allowing unknown slugs; lists used at build time (`generateStaticParams`) may omit brand-new slugs until the next build, but direct URL access can still render after first request.

---

## Troubleshooting: “I saved but the site still looks old”

Work through this list:

1. **Did the save hit the DB?** Check admin success and Neon row content.
2. **Public URL vs page type** — venue must be `/venue/{slug}`, course `/course/{slug}`, not the bare `/{slug}` unless it is a site page.
3. **Path revalidation** — Blog/venue/generic pages need `revalidatePath`; if only tags were cleared in a custom code path, HTML might lag (product/course/home paths use `invalidateAndRevalidatePage` which does both).
4. **Blog publish** — Ensure `revalidateBlogPaths` ran (normal admin actions do).
5. **Hard refresh / different device** — Rule out browser extensions or an old tab.
6. **JSON vs HTML** — If comparing API JSON to the website, check whether `/api/content/...` was revalidated; travel/instagram APIs behave differently.
7. **CDN stale window** — Public JSON can be stale up to **1 hour**, or longer under **stale-while-revalidate=86400**.
8. **Images** — Changing a Cloudinary asset or URL may not clear Cloudinary’s CDN; the app only revalidates Next/data/HTML paths.
9. **Code change** — Component or layout changes need redeploy; CMS save alone is not enough.

---

## Quick reference

| Layer | Mechanism | TTL / notes |
|-------|-----------|-------------|
| Postgres | Source of truth | — |
| Data cache | `unstable_cache` | **3600s**; tags `page:*`, `blog:all`, `global-settings:*`, `pages:type:*` |
| Data cache (HTTP) | `fetch` + `next.revalidate` | Instagram **3600s**; YouTube **86400s** |
| Media usage | `unstable_cache` | **60s**; tag `media-usage` |
| Full Route Cache | `export const revalidate = 3600` | Home, teacher, course, online, retreat **only** |
| On-demand data | `revalidateTag(..., "max")` | CMS saves; does not alone refresh HTML |
| On-demand HTML | `revalidatePath` | Admin saves via `cache.ts` helpers |
| Public API | `jsonCached` | `s-maxage=3600`, `stale-while-revalidate=86400` |
| Admin | `cookies()` session + dynamic | No CDN cache; client `fetch(..., { cache: 'no-store' })` for auth |
| Cloudinary | External CDN | App does not invalidate |
| Next APIs **not** used | `"use cache"`, `cacheLife`, `cacheTag`, `dynamic`/`fetchCache` exports, `updateTag`, `unstable_noStore`, `fetch` tags | Available in Next 16 — see section above |

**Key files:** `src/lib/cms/cache.ts`, `src/lib/cms/api-response.ts`, `src/lib/cms/media-usage-cache.ts`, `src/lib/cms/media-usage-tag.ts`, `src/content/repositories/page-seo.ts`.
