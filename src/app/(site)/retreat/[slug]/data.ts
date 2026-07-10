import { mapRetreatPage } from "@/content/mappers/retreat-page";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { RetreatPageData } from "./types";

export function loadRetreatPageData(retreat: RetreatDocument): RetreatPageData {
  return {
    retreat,
    mapped: mapRetreatPage(retreat),
  };
}
