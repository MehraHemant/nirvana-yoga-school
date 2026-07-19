# CMS Architecture — Nirvana Yoga School

Architecture for Neon Postgres-backed content management, public read APIs, Cloudinary media, and an admin portal on the same Next.js 16 app (`:3000`).

---

## 1. Goals

| Goal | Approach |
|------|----------|
| **Fast public reads** | Indexed slug lookups, eager-loaded relations, `unstable_cache` + `revalidateTag` per slug |
| **Admin CRUD** | `/admin` UI + `/api/admin/*` REST on port 3000 |
| **Image CDN** | Upload → validate 1MB → Cloudinary → secure URL in `media_assets` |
| **Zero frontend churn** | DB rows map to existing TypeScript types (`SitePageDocument`, `ResidentialCourseDocument`, etc.); mappers unchanged |
| **Serverless database** | Neon Postgres via `@neondatabase/serverless` |

**Target:** single page DB query &lt; 50ms (warm connection, indexed `slug`).

---

## 2a. Module-based page content (`page_modules`)

All page types (site, course, online, retreat, venue) can store a single **`PageModulesDocument`** JSON on `pages.page_modules`. The admin editor (`ModulePageEditor`) mirrors live page order:

1. **Hero** — type: `bento-media` | `split-copy` | `simple-banner` | `page-minimal`
2. **Sticky Nav** — `#anchor`, label, shortLabel rows
3. **Overview** — eyebrow, title, lead, supporting copy, quote, course-at-a-glance, right-panel media
4. **Inclusions** — list + exclusions + section copy
5. **Eligibility** — admission standard cards
6. **Syllabus** / **Schedule** / **Pricing** / **FAQ**
7. **Flags** — toggle Exam, Accommodation, Why Nirvana, Travel, Instagram, Map

| Path | Role |
|------|------|
| `src/content/types/page-modules.ts` | TypeScript schema |
| `src/lib/cms/page-modules-builder.ts` | Build modules from legacy JSON/TS |
| `src/content/mappers/page-modules.ts` | Map modules → frontend props |
| `src/components/admin/modules/` | Module editors |
| `GET/PUT /api/admin/modules/[slug]` | Admin API |

Run `npm run db:migrate` then `npm run db:seed` (or `npm run db:seed-modules`) to populate `page_modules`. Public site reads modules first; falls back to static builders when DB column missing or unreachable.

---

## 2. Entity-relationship diagram

```mermaid
erDiagram
    pages ||--o{ page_sections : has
    pages ||--o{ page_packages : has
    pages ||--o{ page_gallery_images : has
    pages ||--o{ page_cards : has
    pages ||--o{ page_people : has
    pages ||--o{ page_highlights : has
    pages ||--o| course_documents : has
    pages ||--o{ content_revisions : audits

    page_sections ||--o{ section_subsections : has
    page_sections ||--o{ section_items : has

    media_assets ||--o{ page_gallery_images : optional
    admin_users ||--o{ content_revisions : creates

    navigation_groups ||--o{ navigation_items : has

    blog_posts ||--o{ content_revisions : audits

    pages {
        string id PK
        string slug UK
        enum type "course|online|retreat|venue|site|blog"
        string eyebrow
        string title
        string description
        string image
        string cta_label
        string cta_href
        boolean published
        datetime created_at
        datetime updated_at
    }

    page_sections {
        string id PK
        string page_id FK
        int sort_order
        string title
        string eyebrow
        text body
        string layout
        string image
        json images
        json blocks
    }

    section_subsections {
        string id PK
        string section_id FK
        int sort_order
        string title
        text body
        string image
    }

    section_items {
        string id PK
        string section_id FK
        int sort_order
        string value
    }

    subsection_items {
        string id PK
        string subsection_id FK
        int sort_order
        string value
    }

    page_packages {
        string id PK
        string page_id FK
        int sort_order
        string title
        string price
        string image
    }

    page_gallery_images {
        string id PK
        string page_id FK
        int sort_order
        string url
        string category
        string media_asset_id FK
    }

    page_cards {
        string id PK
        string page_id FK
        int sort_order
        string title
        text description
        string href
    }

    page_people {
        string id PK
        string page_id FK
        int sort_order
        string name
        string image
        text summary
        text bio
        json education
        json experience
        json expertise
    }

    page_highlights {
        string id PK
        string page_id FK
        int sort_order
        string title
        text description
        string image
    }

    course_documents {
        string id PK
        string page_id FK UK
        json document "ResidentialCourseDocument | OnlineCourseDocument"
    }

    blog_posts {
        string id PK
        string slug UK
        string title
        string category
        text excerpt
        string image
        datetime published_at
        json content "BlogContentBlock[]"
        text body_html "Rich-text HTML (Tiptap)"
        boolean published
    }

    navigation_groups {
        string id PK
        string key UK "courses|online|retreats|venue"
        string label
    }

    navigation_items {
        string id PK
        string group_id FK
        int sort_order
        enum item_type "page|static"
        string page_type
        string page_slug
        string href
        string label
    }

    media_assets {
        string id PK
        string url
        string cdn_key
        string mime
        int size_bytes
        int width
        int height
        string alt
        datetime created_at
    }

    admin_users {
        string id PK
        string email UK
        string password_hash
        enum role "admin|editor"
        datetime created_at
    }

    content_revisions {
        string id PK
        string entity_type
        string entity_id
        string slug
        json snapshot
        string admin_user_id FK
        datetime created_at
    }
```

### Design notes

- **Site / retreat / venue pages** use normalized `pages` + child tables; assembled into `SitePageDocument` by `src/lib/cms/db-to-document.ts`.
- **Residential & online courses** store the full document as JSON in `course_documents` (seeded from `src/data/coursesData.ts` and online course builders). Avoids 20+ tables for syllabus rows while keeping page metadata queryable.
- **Blog posts** are a separate `blog_posts` table (slug-indexed).
- **Navigation** mirrors `src/content/data/navigation/entries.ts` in `navigation_groups` + `navigation_items`.
- **`blocks`** on `page_sections` stores `SectionContentBlock[]` when CMS uses the block builder; legacy `body`/`items`/`subsections` remain supported.

---

## 3. Read path (public, fast)

```
Server Component (page.tsx)
    → getSitePage(slug) / getResidentialCourse(slug)  [@/content/repositories]
        → if NEON_DB_POSTGRES_URL:
              db.page.findUnique({ where: { slug }, include: { sections: { orderBy, include: ... } } })
              → mapPageToSitePageDocument(row)
              → return { data, source: "db" }
          else:
              → return database configuration error
    → loadSitePageData(page) / course mappers (unchanged)
    → Client components
```

### Caching

| Layer | Mechanism |
|-------|-----------|
| Repository | `unstable_cache(fn, [slug], { tags: [`page:${slug}`], revalidate: 3600 })` |
| Public API | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` |
| Admin write | `revalidateTag(`page:${slug}`)` after save |

### Indexes

- `pages.slug` — UNIQUE
- `pages(type, published)`
- `page_sections(page_id, sort_order)`
- `section_subsections(section_id, sort_order)`
- `blog_posts.slug` — UNIQUE
- `media_assets.created_at`
- `navigation_items(group_id, sort_order)`

---

## 4. Write path (admin)

```
Browser → /admin/*
    → Session cookie (JWT in httpOnly cookie, 8h TTL)
    → /api/admin/* (middleware validates session + role)

Admin UI
    → Page editor (site/retreat/venue): metadata + ordered sections
    → Course editor: JSON document editor (structured form later)
    → Media library: list + upload + caption/description/tags + safe delete
    → Navigation: group item ordering

On save:
    → Neon database transaction
    → content_revisions snapshot (optional audit)
    → revalidateTag(`page:${slug}`)
```

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full CRUD, user management, delete |
| `editor` | Create/update pages, media upload; no user/delete |

Dev seed user: `admin@nirvanayogaschoolindia.com` / `admin123` (change in production).

---

## 5. Image pipeline

```
Admin selects file (+ optional caption, description, tags)
    → POST /api/admin/media/upload (multipart/form-data)
        → Auth check
        → Validate: size ≤ 1_048_576 bytes (1MB)
        → Validate: mime ∈ image/jpeg, image/png, image/webp
        → Optional: reject if decode fails
        → uploadToCloudinary(buffer, { mime, filename })
        → INSERT media_assets { url, cdn_key, mime, size_bytes, alt, caption, description, tags }
        → Response: { id, url, sizeBytes, caption, description, tags }
```

### Media metadata

| Field | Type | Notes |
|-------|------|-------|
| `caption` | `string?` | Short label shown in picker grid |
| `description` | `text?` | Longer notes for editors |
| `tags` | `string[]` | Presets in `src/lib/cdn/media-tags.ts` (e.g. `2 shared room`, `Food`, `Yoga hall`) |

`GET /api/admin/media?tag=Food` filters by tag. Each asset includes `usage: { inUse, references[] }` from `getMediaAssetUsage()` (scans gallery FKs, page images, and JSON columns for the asset URL).

`DELETE /api/admin/media/[id]` removes the DB row and Cloudinary file **only when `usage.inUse` is false**; otherwise `409` with reference list. `PUT /api/admin/media/[id]` updates caption, description, alt, tags.

### Environment variables

```env
NEON_DB_POSTGRES_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=nirvana-cms

ADMIN_JWT_SECRET=change-me-in-production
```

### `next/image`

Add `res.cloudinary.com` to `next.config.ts` → `images.remotePatterns` when `CLOUDINARY_CLOUD_NAME` is set.

Client-side compression is optional UX; **server rejects > 1MB**.

---

## 6. API surface

### Public read (no auth)

| Method | Route | Response |
|--------|-------|----------|
| `GET` | `/api/content/pages/[slug]` | `SitePageDocument` |
| `GET` | `/api/content/courses/[slug]` | `ResidentialCourseDocument` |
| `GET` | `/api/content/online/[slug]` | `OnlineCourseDocument` |
| `GET` | `/api/content/blog/[slug]` | `BlogPostDocument` |
| `GET` | `/api/content/blog` | `BlogPostDocument[]` (list) |

All return `{ data, source: "db" \| "json" }` and cache headers.

### Admin (session required)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/admin/auth/login` | `{ email, password }` → Set cookie |
| `POST` | `/api/admin/auth/logout` | Clear cookie |
| `GET` | `/api/admin/auth/me` | Current user |
| `GET` | `/api/admin/pages` | List pages (paginated) |
| `GET` | `/api/admin/pages/[slug]` | Full page + sections |
| `PUT` | `/api/admin/pages/[slug]` | Upsert page + sections |
| `DELETE` | `/api/admin/pages/[slug]` | Soft-delete / unpublish |
| `GET` | `/api/admin/blog` | List posts |
| `PUT` | `/api/admin/blog/[slug]` | Upsert post |
| `GET` | `/api/admin/media` | List media assets (`?tag=` filter, includes usage) |
| `POST` | `/api/admin/media/upload` | Multipart upload (1MB max, caption/description/tags) |
| `GET` | `/api/admin/media/[id]` | Single asset + usage |
| `PUT` | `/api/admin/media/[id]` | Update caption, description, alt, tags |
| `DELETE` | `/api/admin/media/[id]` | Remove unused asset (+ CDN delete); 409 if in use |
| `GET` | `/api/admin/navigation` | Navigation groups + items |
| `PUT` | `/api/admin/navigation` | Replace navigation config |

### Upload payload

```
POST /api/admin/media/upload
Content-Type: multipart/form-data

file: <binary>
alt?: string
caption?: string
description?: string
tags?: string          # JSON array or comma-separated

→ 201 { id, url, sizeBytes, mime, caption, description, tags }
→ 413 if > 1MB
→ 415 if wrong mime
```

---

## 7. Migration & seed plan

1. Set `NEON_DB_POSTGRES_URL` in `.env` (never commit this file).
2. `npm run db:migrate` — applies `scripts/sql/0001_init.sql` once.
3. `npm run db:seed` — idempotent upsert:

| Source file | Target |
|-------------|--------|
| `src/content/data/site-pages/site-pages.json` | `pages` + children (type from registry) |
| `src/data/coursesData.ts` | `pages` (type=course) + `course_documents` |
| Online course builders | `pages` (type=online) + `course_documents` |
| `src/content/data/blog/blog-posts.json` | `blog_posts` |
| `src/content/data/navigation/entries.ts` | `navigation_groups` + `navigation_items` |
| — | `admin_users` (dev admin) |

Seed uses **upsert by slug** so re-running is safe.

---

## 8. Security

- All `/api/admin/*` except `auth/login` require valid session
- Passwords: bcrypt (cost 12)
- JWT: HS256, httpOnly, Secure in production, SameSite=Lax
- Upload rate limit: 30 requests / 15 min / IP (in-memory; use Redis in prod)
- No secrets in git; `.env.example` documents required vars
- `editor` cannot delete pages or manage users
- CDN keys server-side only

---

## 9. Out of scope

- Payment / booking checkout
- Email / newsletter sending
- Multi-tenant / multi-site
- GraphQL
- Real-time collaborative editing
- Automatic image resizing (future: sharp pipeline)

---

## 10. Directory layout (new files)

```
docs/cms-architecture.md          ← this file
scripts/
  sql/0001_init.sql               Versioned Neon schema baseline
  seed-cms.ts                     CMS seed command
  seed-page-modules.ts            Page-module seed command
src/lib/
  db.ts                           Neon database exports
  cms/
    db-to-document.ts             Row → SitePageDocument
    document-to-db.ts             SitePageDocument → database writes
    cache.ts                      unstable_cache helpers
    auth.ts                       JWT session helpers
  cdn/
    cloudinary.ts                 Cloudinary upload + delete
src/app/api/
  content/pages/[slug]/route.ts
  content/courses/[slug]/route.ts
  content/online/[slug]/route.ts
  content/blog/[slug]/route.ts
  content/blog/route.ts
  admin/auth/login/route.ts
  admin/auth/logout/route.ts
  admin/auth/me/route.ts
  admin/pages/route.ts
  admin/pages/[slug]/route.ts
  admin/media/route.ts
  admin/media/upload/route.ts
  admin/media/[id]/route.ts
  admin/navigation/route.ts
src/app/admin/
  layout.tsx
  page.tsx                        Dashboard
  login/page.tsx
  pages/page.tsx
  pages/[slug]/page.tsx
  media/page.tsx
src/middleware.ts                 Protect /admin + /api/admin
```

---

## 11. Commands

```bash
npm run db:migrate     # applies the versioned Neon baseline
npm run db:seed        # seeds CMS content
npm run db:seed:missing # seeds only absent bundled CMS content
```

With `NEON_DB_POSTGRES_URL` set, repositories and public APIs read from Neon Postgres.
