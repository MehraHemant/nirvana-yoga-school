import type { RetreatProductSections } from "@/components/retreat/product/retreatProductTypes";
import type { PageModulesDocument } from "@/content/types";
import type { RetreatDocument } from "@/content/types/retreat-page";

export type RetreatPageData = {
  retreat: RetreatDocument;
  /** Product-page section copy mapped from CMS / DB. */
  product: RetreatProductSections;
  modules: PageModulesDocument | null;
};
