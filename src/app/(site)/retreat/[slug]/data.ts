import { coerceToResidentialLife } from "@/content/mappers/residential-life";
import { mapRetreatPage } from "@/content/mappers/retreat-page";
import {
  getPageIdBySlug,
  getPageRoomOffers,
} from "@/content/repositories/lodging";
import { hydrateModulesFromPageTables } from "@/content/repositories/page-modules-sync";
import { offersToRetreatPackages } from "@/content/repositories/lodging-sync";
import { hydratePageModulesFaqs } from "@/content/repositories/faqs";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getExamCertification,
  getInstagramFeed,
  getReviews,
  getSiteMap,
  getTravelGuide,
  getWhyNirvana,
  resolveProductResidentialLife,
} from "@/content/repositories/shared-sections";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { RetreatPageData } from "./types";

/**
 * Loads retreat modules, lodging/food, and shared CMS sections for the page.
 *
 * @param retreat - Retreat document
 */
export async function loadRetreatPageData(
  retreat: RetreatDocument,
): Promise<RetreatPageData> {
  const [
    modulesResult,
    whyNirvana,
    reviews,
    siteMap,
    instagram,
    travel,
    examCertificationResult,
  ] = await Promise.all([
    getPageModules(retreat.slug),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getInstagramFeed().catch(() => null),
    getTravelGuide().catch(() => null),
    getExamCertification().catch(() => null),
  ]);

  const modules =
    (await hydrateModulesFromPageTables(
      retreat.slug,
      modulesResult.data,
    ).catch(() => modulesResult.data)) ?? modulesResult.data;

  const hydratedModules = modules
    ? ((await hydratePageModulesFaqs(retreat.slug, modules).catch(
        () => modules,
      )) ?? modules)
    : modules;

  const pageLodging =
    modules?.residentialLife ??
    (modules?.retreatAccommodation
      ? coerceToResidentialLife(modules.retreatAccommodation)
      : null);

  const residentialLife = await resolveProductResidentialLife(
    "retreat",
    pageLodging,
    { pageSlug: retreat.slug },
  ).catch((error) => {
    console.error(
      "[loadRetreatPageData] resolveProductResidentialLife failed",
      error,
    );
    return null;
  });

  let retreatDoc = retreat;
  const pageId = await getPageIdBySlug(retreat.slug).catch(() => null);
  if (pageId) {
    const offers = await getPageRoomOffers(pageId, true).catch(() => ({
      data: [],
    }));
    const packages = offersToRetreatPackages(offers.data ?? []);
    if (packages.length > 0) {
      retreatDoc = { ...retreat, packages };
    }
  }

  return {
    retreat: retreatDoc,
    mapped: mapRetreatPage(retreatDoc, residentialLife),
    modules: hydratedModules,
    residentialLife,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
    instagram: instagram?.data ?? null,
    travel: travel?.data ?? null,
    examCertification: examCertificationResult?.data ?? null,
  };
}
