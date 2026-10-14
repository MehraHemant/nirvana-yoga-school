import { coerceToResidentialLife } from "@/content/mappers/residential-life";
import { mapRetreatProductSections } from "@/content/mappers/retreat-product";
import { mapRetreatPage } from "@/content/mappers/retreat-page";
import { hydratePageModulesFaqs } from "@/content/repositories/faqs";
import {
  getPageIdBySlug,
  getPageRoomOffers,
} from "@/content/repositories/lodging";
import { offersToRetreatPackages } from "@/content/repositories/lodging-sync";
import { getPageModules } from "@/content/repositories/page-modules";
import { hydrateModulesFromPageTables } from "@/content/repositories/page-modules-sync";
import {
  getReviews,
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
  const [modulesResult, reviews] = await Promise.all([
    getPageModules(retreat.slug),
    getReviews().catch(() => null),
  ]);

  const modules =
    (await hydrateModulesFromPageTables(retreat.slug, modulesResult.data).catch(
      () => modulesResult.data,
    )) ?? modulesResult.data;

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

  const mapped = mapRetreatPage(retreatDoc, residentialLife);

  return {
    retreat: retreatDoc,
    product: mapRetreatProductSections({
      retreat: retreatDoc,
      mapped,
      modules: hydratedModules,
      residentialLife,
      reviews: reviews?.data ?? null,
    }),
    modules: hydratedModules,
  };
}
