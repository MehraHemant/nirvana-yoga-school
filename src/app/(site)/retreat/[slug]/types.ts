import type { MappedRetreatPage } from "@/content/mappers/retreat-page";
import type { RetreatDocument } from "@/content/types/retreat-page";

export type RetreatPageData = {
  retreat: RetreatDocument;
  mapped: MappedRetreatPage;
};
