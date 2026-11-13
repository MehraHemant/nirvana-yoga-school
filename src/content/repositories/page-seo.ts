import { revalidateTag, unstable_cache } from "next/cache";
import type { PageSeoMeta } from "@/content/types/page-seo";
import {
  contentCacheTag,
  invalidateContentCache,
  revalidatePublicPagePaths,
} from "@/lib/cms/cache";
import {
  extractLegacyPageSeo,
  mergePageSeo,
  pageSeoMetaFromRow,
  pageSeoRowFromMeta,
} from "@/lib/cms/page-seo-utils";
import { db, queryOne, queryRows } from "@/lib/db";

/** Homepage slug — SEO from this page is the default fallback for other pages. */
export const HOME_PAGE_SLUG = "home";

/** YTT hub slug — SEO may also live in global_settings.yttHub.meta. */
export const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

export {
  extractLegacyPageSeo,
  isPageSeoEmpty,
  mergePageSeo,
  pageSeoMetaFromRow,
} from "@/lib/cms/page-seo-utils";

/**
 * Loads page SEO from Postgres (uncached).
 *
 * @param slug - Page slug
 */
async function loadPageSeoUncached(slug: string): Promise<PageSeoMeta | null> {
  const page = await db.page.findUnique({
    where: { slug },
    select: {
      id: true,
      pageModules: true,
      contentData: true,
    },
  });
  if (!page) return null;

  const seoRow = await db.pageSeo.findUnique({
    where: { pageId: page.id },
    select: {
      title: true,
      description: true,
      ogImage: true,
      keywords: true,
      noIndex: true,
    },
  });
  const dbMeta = pageSeoMetaFromRow(seoRow);
  if (dbMeta) return dbMeta;

  return extractLegacyPageSeo(page);
}

/**
 * Loads homepage SEO from Postgres (uncached).
 */
async function loadHomepageSeoUncached(): Promise<PageSeoMeta | null> {
  return loadPageSeoUncached(HOME_PAGE_SLUG);
}

/**
 * Fetch page SEO from Postgres with Next.js data cache.
 *
 * @param slug - Page slug
 */
export async function getPageSeo(slug: string): Promise<PageSeoMeta | null> {
  const cached = unstable_cache(
    () => loadPageSeoUncached(slug),
    [`page-seo-${slug}`],
    {
      tags: [contentCacheTag(slug), `page-seo:${slug}`],
      revalidate: 3600,
    },
  );
  return cached();
}

/**
 * Fetch homepage SEO from Postgres with Next.js data cache.
 */
export async function getHomepageSeo(): Promise<PageSeoMeta | null> {
  const cached = unstable_cache(
    () => loadHomepageSeoUncached(),
    ["page-seo-home"],
    {
      tags: [contentCacheTag(HOME_PAGE_SLUG), "page-seo:home"],
      revalidate: 3600,
    },
  );
  return cached();
}

/**
 * Resolves public SEO for a slug: page SEO with homepage defaults for empty fields.
 *
 * @param slug - Page slug
 * @param legacyMeta - Optional JSON meta (backward compat until backfill)
 */
export async function resolvePageSeo(
  slug: string,
  legacyMeta?: PageSeoMeta | null,
): Promise<PageSeoMeta | null> {
  const [dbMeta, homeMeta] = await Promise.all([
    getPageSeo(slug),
    slug === HOME_PAGE_SLUG ? Promise.resolve(null) : getHomepageSeo(),
  ]);

  const pageMeta = mergePageSeo(dbMeta, legacyMeta);
  if (slug === HOME_PAGE_SLUG) return pageMeta;
  return mergePageSeo(pageMeta, homeMeta);
}

/**
 * Writes page SEO to Postgres without cache revalidation (for scripts).
 *
 * @param slug - Page slug
 * @param meta - SEO fields
 */
export async function writePageSeoToDb(
  slug: string,
  meta?: PageSeoMeta | null,
): Promise<void> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!page) return;

  const row = pageSeoRowFromMeta(meta);
  await db.pageSeo.upsert({
    where: { pageId: page.id },
    create: {
      pageId: page.id,
      ...row,
    },
    update: row,
  });
}

/**
 * Persists page SEO to Postgres and keeps cache tags fresh.
 *
 * @param slug - Page slug
 * @param meta - SEO fields from admin
 */
export async function upsertPageSeo(
  slug: string,
  meta?: PageSeoMeta | null,
): Promise<void> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { id: true, type: true },
  });
  if (!page) return;

  await writePageSeoToDb(slug, meta);

  invalidateContentCache(slug, page.type);
  revalidatePublicPagePaths(slug, page.type);
  revalidatePageSeoTags(slug);
}

/**
 * Revalidates page SEO cache tags after writes.
 *
 * @param slug - Page slug
 */
function revalidatePageSeoTags(slug: string): void {
  revalidateTag(`page-seo:${slug}`, "max");
  revalidateTag("public-pages-seo", "max");
  if (slug === HOME_PAGE_SLUG) {
    revalidateTag("page-seo:home", "max");
  }
}

/** Page row fields used as SEO fallbacks and for structured data. */
export type PageSeoContext = {
  slug: string;
  type: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  fee: string;
  duration: string;
  published: boolean;
  updatedAt: string | null;
};

/** Public page listing row for sitemap.xml and llms.txt. */
export type PublicPageRow = PageSeoContext & {
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
};

/** Site slugs that redirect or are not real public documents. */
const NON_DOCUMENT_SLUGS = new Set(["gallery"]);

/**
 * Loads one page row's SEO-relevant columns (uncached).
 *
 * @param slug - Page slug
 */
async function loadPageSeoContextUncached(
  slug: string,
): Promise<PageSeoContext | null> {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT "slug", "type", "title", "eyebrow", "description", "image", "fee",
            "duration", "published", "updated_at"
       FROM "pages" WHERE "slug" = $1 LIMIT 1`,
    [slug],
  );
  return row ? mapContextRow(row) : null;
}

/**
 * Maps a raw `pages` row into {@link PageSeoContext}.
 *
 * @param row - Raw SQL row
 */
function mapContextRow(row: Record<string, unknown>): PageSeoContext {
  const updated = row.updated_at;
  return {
    slug: String(row.slug ?? ""),
    type: String(row.type ?? "site"),
    title: String(row.title ?? "").trim(),
    eyebrow: String(row.eyebrow ?? "").trim(),
    description: String(row.description ?? "").trim(),
    image: String(row.image ?? "").trim(),
    fee: String(row.fee ?? "").trim(),
    duration: String(row.duration ?? "").trim(),
    published: row.published === true || row.published === "true",
    updatedAt:
      updated instanceof Date
        ? updated.toISOString()
        : updated
          ? String(updated)
          : null,
  };
}

/**
 * Page row SEO context with Next.js data cache.
 *
 * @param slug - Page slug
 */
export async function getPageSeoContext(
  slug: string,
): Promise<PageSeoContext | null> {
  const cached = unstable_cache(
    () => loadPageSeoContextUncached(slug),
    [`page-seo-context-${slug}`],
    { tags: [contentCacheTag(slug), `page-seo:${slug}`], revalidate: 3600 },
  );
  return cached().catch(() => null);
}

/**
 * Every published, indexable public page with its SEO row (uncached).
 */
async function loadPublicPagesUncached(): Promise<PublicPageRow[]> {
  const rows = await queryRows<Record<string, unknown>>(
    `SELECT p."slug", p."type", p."title", p."eyebrow", p."description",
            p."image", p."fee", p."duration", p."published", p."updated_at",
            COALESCE(s."title", '') AS seo_title,
            COALESCE(s."description", '') AS seo_description,
            COALESCE(s."no_index", FALSE) AS no_index
       FROM "pages" p
       LEFT JOIN "page_seo" s ON s."page_id" = p."id"
      WHERE p."published" = TRUE
      ORDER BY p."type", p."slug"`,
  );
  return rows
    .map((row) => ({
      ...mapContextRow(row),
      seoTitle: String(row.seo_title ?? "").trim(),
      seoDescription: String(row.seo_description ?? "").trim(),
      noIndex: row.no_index === true,
    }))
    .filter((row) => !row.noIndex && !NON_DOCUMENT_SLUGS.has(row.slug));
}

/**
 * Published, indexable pages with Next.js data cache (sitemap, llms.txt).
 */
export async function listPublicPages(): Promise<PublicPageRow[]> {
  const cached = unstable_cache(
    () => loadPublicPagesUncached(),
    ["public-pages-seo"],
    { tags: ["public-pages-seo"], revalidate: 3600 },
  );
  return cached().catch(() => []);
}
