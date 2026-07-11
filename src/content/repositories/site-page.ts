import {
  getStaticSitePage,
  getStaticSitePageSlugs,
} from "@/content/data/site-pages";
import { withDbFallback } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { SitePageDocument } from "@/content/types";
import { fetchSitePageFromDb } from "@/lib/cms/cache";

/**
 * Load a site page by slug from Postgres or bundled JSON.
 *
 * @param slug - Page slug
 * @param options - Optional source override
 */
export async function getSitePage(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<SitePageDocument | null>> {
  return withDbFallback(
    () => fetchSitePageFromDb(slug),
    () => getStaticSitePage(slug),
    options,
  );
}

/** All site page slugs for static generation. */
export async function getSitePageSlugs(): Promise<string[]> {
  return getStaticSitePageSlugs();
}
