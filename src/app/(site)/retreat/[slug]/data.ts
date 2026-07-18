import { mapRetreatPage } from "@/content/mappers/retreat-page";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getRetreatAccommodation,
  normalizeRetreatAccommodation,
} from "@/content/repositories/shared-sections";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { RetreatPageData } from "./types";

/**
 * Loads retreat modules and lodging (page modules first, global fallback).
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

  const lodging = modulesResult.data?.retreatAccommodation
    ? normalizeRetreatAccommodation(modulesResult.data.retreatAccommodation)
    : lodgingResult.data;

  return {
    retreat,
    mapped: mapRetreatPage(retreat, lodging),
    modules: modulesResult.data,
    lodging,
  };
}
