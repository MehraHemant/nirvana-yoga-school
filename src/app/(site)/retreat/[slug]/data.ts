import { hasResidentialLifeContent } from "@/content/mappers/residential-life-utils";
import { createEmptyResidentialLife } from "@/lib/cms/structural-defaults";
import { retreatAccommodationToResidentialLife } from "@/content/mappers/residential-life";
import { mapRetreatPage } from "@/content/mappers/retreat-page";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getExamCertification,
  getInstagramFeed,
  getRetreatAccommodation,
  getReviews,
  getSiteMap,
  getTravelGuide,
  getWhyNirvana,
} from "@/content/repositories/shared-sections";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type {
  ResidentialLifeContent,
  RetreatAccommodationContent,
} from "@/content/types/shared-sections";
import type { RetreatPageData } from "./types";

/**
 * Resolves per-page residential life for a retreat (course-compatible shape).
 * Prefers page `residentialLife`, then legacy `retreatAccommodation`, then
 * global retreat lodging (converted) — never the YTT course residential set.
 *
 * @param modulesResidentialLife - Page modules residential life, if any
 * @param modulesRetreatLodging - Legacy retreat lodging module, if any
 * @param globalRetreatLodging - Global retreat accommodation fallback
 */
function resolveRetreatResidentialLife(
  modulesResidentialLife: ResidentialLifeContent | undefined,
  modulesRetreatLodging: RetreatAccommodationContent | undefined,
  globalRetreatLodging: RetreatAccommodationContent | null,
): ResidentialLifeContent {
  if (hasResidentialLifeContent(modulesResidentialLife)) {
    return modulesResidentialLife as ResidentialLifeContent;
  }
  if (modulesRetreatLodging) {
    return retreatAccommodationToResidentialLife(modulesRetreatLodging);
  }
  if (globalRetreatLodging) {
    return retreatAccommodationToResidentialLife(globalRetreatLodging);
  }
  return createEmptyResidentialLife();
}

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
    retreatLodgingResult,
    whyNirvana,
    reviews,
    siteMap,
    instagram,
    travel,
    examCertificationResult,
  ] = await Promise.all([
    getPageModules(retreat.slug),
    getRetreatAccommodation().catch(() => null),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getInstagramFeed().catch(() => null),
    getTravelGuide().catch(() => null),
    getExamCertification().catch(() => null),
  ]);

  const residentialLife = resolveRetreatResidentialLife(
    modulesResult.data?.residentialLife,
    modulesResult.data?.retreatAccommodation,
    retreatLodgingResult?.data ?? null,
  );

  return {
    retreat,
    mapped: mapRetreatPage(retreat, residentialLife),
    modules: modulesResult.data,
    residentialLife,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
    instagram: instagram?.data ?? null,
    travel: travel?.data ?? null,
    examCertification: examCertificationResult?.data ?? null,
  };
}
