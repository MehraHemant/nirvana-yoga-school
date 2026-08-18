import type { PageModulesDocument } from "@/content/types";
import type { PageSeoMeta } from "@/content/types/page-seo";

type PageSeoRow = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string;
  noIndex: boolean;
};

/**
 * Whether all SEO fields are empty / unset.
 *
 * @param meta - Page SEO document
 */
export function isPageSeoEmpty(meta?: PageSeoMeta | null): boolean {
  if (!meta) return true;
  return (
    !meta.title?.trim() &&
    !meta.description?.trim() &&
    !meta.ogImage?.trim() &&
    !meta.keywords?.trim() &&
    !meta.noIndex
  );
}

/**
 * Converts a DB row into optional CMS page SEO fields.
 *
 * @param row - Stored SEO row
 */
export function pageSeoMetaFromRow(row: PageSeoRow | null): PageSeoMeta | null {
  if (!row) return null;
  const meta: PageSeoMeta = {};
  const title = row.title?.trim();
  const description = row.description?.trim();
  const ogImage = row.ogImage?.trim();
  const keywords = row.keywords?.trim();
  if (title) meta.title = title;
  if (description) meta.description = description;
  if (ogImage) meta.ogImage = ogImage;
  if (keywords) meta.keywords = keywords;
  if (row.noIndex) meta.noIndex = true;
  return isPageSeoEmpty(meta) ? null : meta;
}

/**
 * Fills empty primary SEO fields from a fallback document.
 * `noIndex` is never inherited — only explicit on the primary page applies.
 *
 * @param primary - Page-specific SEO
 * @param fallback - Defaults (typically homepage SEO)
 */
export function mergePageSeo(
  primary?: PageSeoMeta | null,
  fallback?: PageSeoMeta | null,
): PageSeoMeta | null {
  if (isPageSeoEmpty(primary) && isPageSeoEmpty(fallback)) return null;
  const p = primary ?? {};
  const f = fallback ?? {};
  const merged: PageSeoMeta = {
    title: p.title?.trim() || f.title?.trim() || undefined,
    description: p.description?.trim() || f.description?.trim() || undefined,
    ogImage: p.ogImage?.trim() || f.ogImage?.trim() || undefined,
    keywords: p.keywords?.trim() || f.keywords?.trim() || undefined,
  };
  if (p.noIndex) merged.noIndex = true;
  return isPageSeoEmpty(merged) ? null : merged;
}

/**
 * Normalizes admin SEO input into DB column values.
 *
 * @param meta - Optional CMS meta
 */
export function pageSeoRowFromMeta(meta?: PageSeoMeta | null): PageSeoRow {
  return {
    title: meta?.title?.trim() ?? "",
    description: meta?.description?.trim() ?? "",
    ogImage: meta?.ogImage?.trim() ?? "",
    keywords: meta?.keywords?.trim() ?? "",
    noIndex: meta?.noIndex === true,
  };
}

/**
 * Extracts legacy SEO stored in page_modules or content_data JSON.
 *
 * @param page - Page row with JSON blobs
 */
export function extractLegacyPageSeo(page: {
  pageModules?: unknown;
  contentData?: unknown;
}): PageSeoMeta | null {
  const modules = page.pageModules as PageModulesDocument | null | undefined;
  if (modules?.meta && !isPageSeoEmpty(modules.meta)) {
    return modules.meta;
  }

  const contentData = page.contentData;
  if (
    contentData &&
    typeof contentData === "object" &&
    !Array.isArray(contentData)
  ) {
    const record = contentData as Record<string, unknown>;
    const meta = record.meta;
    if (meta && typeof meta === "object" && !Array.isArray(meta)) {
      const parsed = meta as PageSeoMeta;
      if (!isPageSeoEmpty(parsed)) return parsed;
    }
  }

  return null;
}
