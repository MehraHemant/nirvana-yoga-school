import { getPageModules } from "@/content/repositories/page-modules";
import type { SitePageDocument } from "@/content/types";
import { loadSitePageData } from "./data";
import type { SitePageData } from "./types";

/**
 * Load site page data with modules from DB or static fallback (server only).
 *
 * @param page - Site page document
 */
export async function loadSitePageDataAsync(
  page: SitePageDocument,
): Promise<SitePageData> {
  const modulesResult = await getPageModules(page.slug);
  return loadSitePageData(page, modulesResult.data);
}
