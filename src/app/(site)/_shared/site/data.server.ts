import { getPageModules } from "@/content/repositories/page-modules";
import {
  getInstagramFeed,
  getResidentialLife,
  getReviews,
  getSiteMap,
  getTravelGuide,
  getVenueFaqs,
  getWhyNirvana,
} from "@/content/repositories/shared-sections";
import {
  getTeachers,
  resolveSelectedTeachers,
} from "@/content/repositories/teachers";
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
    instagram,
    travel,
    faculty,
  ] = await Promise.all([
    getPageModules(page.slug),
    isVenuePage(page.slug) ? getVenueFaqs() : Promise.resolve(null),
    getResidentialLife().catch(() => null),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getInstagramFeed().catch(() => null),
    getTravelGuide().catch(() => null),
    getTeachers().catch(() => []),
  ]);

  const data = loadSitePageData(
    page,
    modulesResult.data,
    venueFaqsResult?.data.faqs ?? [],
  );

  const teachers = resolveSelectedTeachers(
    faculty,
    modulesResult.data?.teachers?.selectedSlugs,
    data.teachers,
  );

  return {
    ...data,
    teachers,
    residentialLife:
      modulesResult.data?.residentialLife ?? residentialLife?.data ?? null,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
    instagram: instagram?.data ?? null,
    travel: travel?.data ?? null,
  };
}
