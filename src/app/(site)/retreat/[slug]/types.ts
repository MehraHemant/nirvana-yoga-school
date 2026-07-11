import type { MappedRetreatPage } from "@/content/mappers/retreat-page";
import type { PageModulesDocument } from "@/content/types";
import type { RetreatDocument } from "@/content/types/retreat-page";

export type RetreatPageData = {
  retreat: RetreatDocument;
  mapped: MappedRetreatPage;
  modules: PageModulesDocument | null;
};
