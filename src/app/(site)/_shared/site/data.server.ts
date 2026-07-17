import { getPageModules } from "@/content/repositories/page-modules";
import {
  getResidentialLife,
  getReviews,
  getSiteMap,
  getVenueFaqs,
  getWhyNirvana,
} from "@/content/repositories/shared-sections";
import type { SitePageDocument } from "@/content/types";
import { isVenuePage } from "@/content/mappers/venue-page";
import { loadSitePageData } from "./data";

/**
 * Server-only site page loader — attaches modules, venue FAQs, and shared
 * section content from MySQL (no client `/api/content` waterfalls).
 *
 * @param page - Site page document
 */
export async function loadSitePageDataAsync(page: SitePageDocument) {
  const [
    modulesResult,
    venueFaqsResult,
    residentialLife,
    whyNirvana,
    reviews,
    siteMap,
  ] = await Promise.all([
    getPageModules(page.slug),
    isVenuePage(page.slug) ? getVenueFaqs() : Promise.resolve(null),
    getResidentialLife().catch(() => null),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
  ]);

  const data = loadSitePageData(
    page,
    modulesResult.data,
    venueFaqsResult?.data.faqs ?? [],
  );

  return {
    ...data,
    residentialLife: residentialLife?.data ?? null,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
  };
}
