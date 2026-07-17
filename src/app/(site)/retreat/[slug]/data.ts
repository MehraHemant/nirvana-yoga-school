import { mapRetreatPage } from "@/content/mappers/retreat-page";
import { getPageModules } from "@/content/repositories/page-modules";
import { getRetreatAccommodation } from "@/content/repositories/shared-sections";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { RetreatPageData } from "./types";

/**
 * Loads retreat modules + shared lodging galleries from MySQL.
 *
 * @param retreat - Retreat document
 */
export async function loadRetreatPageData(
  retreat: RetreatDocument,
): Promise<RetreatPageData> {
  const [modulesResult, lodgingResult] = await Promise.all([
    getPageModules(retreat.slug),
    getRetreatAccommodation(),
  ]);

  return {
    retreat,
    mapped: mapRetreatPage(retreat, lodgingResult.data),
    modules: modulesResult.data,
    lodging: lodgingResult.data,
  };
}
