import { revalidateTag, unstable_cache } from "next/cache";
import type { PageSeoMeta } from "@/content/types/page-seo";
import { contentCacheTag, invalidateContentCache, revalidatePublicPagePaths } from "@/lib/cms/cache";
import {
  extractLegacyPageSeo,
  mergePageSeo,
  pageSeoMetaFromRow,
  pageSeoRowFromMeta,
} from "@/lib/cms/page-seo-utils";
import { db } from "@/lib/db";

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
  if (slug === HOME_PAGE_SLUG) {
    revalidateTag("page-seo:home", "max");
  }
}
