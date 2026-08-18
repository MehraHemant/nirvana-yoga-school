import { isVenuePage } from "@/content/mappers/venue-page";
import { hydrateModulesFromLodgingTables } from "@/content/repositories/lodging-sync";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getExamCertification,
  getInstagramFeed,
  getReviews,
  getSiteMap,
  getTravelGuide,
  getVenueFaqs,
  getWhyNirvana,
  resolveProductResidentialLife,
} from "@/content/repositories/shared-sections";
import {
  getTeachers,
  resolveSelectedTeachers,
} from "@/content/repositories/teachers";
import type { SitePageDocument } from "@/content/types";
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
    whyNirvana,
    reviews,
    siteMap,
    instagram,
    travel,
    examCertification,
    faculty,
  ] = await Promise.all([
    getPageModules(page.slug),
    isVenuePage(page.slug) ? getVenueFaqs() : Promise.resolve(null),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getInstagramFeed().catch(() => null),
    getTravelGuide().catch(() => null),
    getExamCertification().catch(() => null),
    getTeachers().catch(() => []),
  ]);

  const modules =
    (await hydrateModulesFromLodgingTables(page.slug, modulesResult.data).catch(
      () => modulesResult.data,
    )) ?? modulesResult.data;

  const data = loadSitePageData(
    page,
    modules,
    venueFaqsResult?.data.faqs ?? [],
  );

  const teachers = resolveSelectedTeachers(
    faculty,
    modules?.teachers?.selectedSlugs,
    data.teachers,
  );

  const residentialLife = await resolveProductResidentialLife(
    "course",
    modules?.residentialLife,
    { pageSlug: page.slug },
  ).catch((error) => {
    console.error(
      "[loadSitePageDataAsync] resolveProductResidentialLife failed",
      error,
    );
    return null;
  });

  return {
    ...data,
    teachers,
    residentialLife,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
    instagram: instagram?.data ?? null,
    travel: travel?.data ?? null,
    examCertification: examCertification?.data ?? null,
  };
}
