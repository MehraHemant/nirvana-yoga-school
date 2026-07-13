import { mapRetreatPage } from "@/content/mappers/retreat-page";
import { getPageModules } from "@/content/repositories/page-modules";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { RetreatPageData } from "./types";

export async function loadRetreatPageData(
  retreat: RetreatDocument,
): Promise<RetreatPageData> {
  const modulesResult = await getPageModules(retreat.slug);
  return {
    retreat,
    mapped: mapRetreatPage(retreat),
    modules: modulesResult.data,
  };
}
