import type { MappedRetreatPage } from "@/content/mappers/retreat-page";
import type { PageModulesDocument } from "@/content/types";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type {
  ExamCertificationContent,
  InstagramFeedContent,
  ResidentialLifeContent,
  ReviewsContent,
  SiteMapContent,
  TravelGuideContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";

export type RetreatPageData = {
  retreat: RetreatDocument;
  mapped: MappedRetreatPage;
  modules: PageModulesDocument | null;
  /** Same lodging/food document shape as residential yoga courses */
  residentialLife: ResidentialLifeContent | null;
  whyNirvana: WhyNirvanaContent | null;
  reviews: ReviewsContent | null;
  /** Shared site map embed from CMS */
  siteMap: SiteMapContent | null;
  /** Shared Instagram feed from CMS */
  instagram: InstagramFeedContent | null;
  /** Shared travel guide from CMS */
  travel: TravelGuideContent | null;
  examCertification: ExamCertificationContent | null;
};
