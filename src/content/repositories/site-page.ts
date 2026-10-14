import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { SitePageDocument } from "@/content/types";
import {
  fetchPageSlugsByTypeFromDb,
  fetchSitePageFromDb,
} from "@/lib/cms/cache";

/**
 * Load a site page by slug from MySQL only.
 *
 * @param slug - Page slug
 * @param options - Optional repository options
 */
export async function getSitePage(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<SitePageDocument | null>> {
  return requireDb(() => fetchSitePageFromDb(slug), options);
}

/**
 * All published site page slugs for static generation.
 */
export async function getSitePageSlugs(): Promise<string[]> {
  const result = await requireDb(() => fetchPageSlugsByTypeFromDb("site"));
  return result.data;
}
