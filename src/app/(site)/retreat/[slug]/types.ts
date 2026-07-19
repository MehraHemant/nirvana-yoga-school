import type { MappedRetreatPage } from "@/content/mappers/retreat-page";
import type { PageModulesDocument } from "@/content/types";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type {
  ExamCertificationContent,
  ResidentialLifeContent,
} from "@/content/types/shared-sections";

export type RetreatPageData = {
  retreat: RetreatDocument;
  mapped: MappedRetreatPage;
  modules: PageModulesDocument | null;
  /** Same lodging/food document shape as residential yoga courses */
  residentialLife: ResidentialLifeContent | null;
  examCertification: ExamCertificationContent | null;
};
