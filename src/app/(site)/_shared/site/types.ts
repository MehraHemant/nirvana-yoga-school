import type { TeacherProfile } from "@/components/home/TeachersSection";
import type { MappedSitePage } from "@/content/mappers/site-page";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";
import type {
  ExamCertificationContent,
  InstagramFeedContent,
  ResidentialLifeContent,
  ReviewsContent,
  SiteMapContent,
  TravelGuideContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";

export type SitePageVariant = "teacher" | "hub" | "editorial";

export type SitePageData = {
  page: SitePageDocument;
  mapped: MappedSitePage;
  teachers: TeacherProfile[];
  variant: SitePageVariant;
  modules: PageModulesDocument | null;
  residentialLife: ResidentialLifeContent | null;
  whyNirvana: WhyNirvanaContent | null;
  reviews: ReviewsContent | null;
  /** Shared site map embed from CMS */
  siteMap: SiteMapContent | null;
  /** Shared Instagram feed from CMS */
  instagram: InstagramFeedContent | null;
  /** Shared travel guide from CMS */
  travel: TravelGuideContent | null;
  /** Shared exam and certification content from CMS */
  examCertification: ExamCertificationContent | null;
};

export type SiteClientProps = Pick<
  SitePageData,
  | "page"
  | "mapped"
  | "teachers"
  | "modules"
  | "residentialLife"
  | "whyNirvana"
  | "reviews"
  | "siteMap"
  | "instagram"
  | "travel"
  | "examCertification"
> & {
  modules?: PageModulesDocument | null;
};
