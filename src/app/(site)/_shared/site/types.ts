import type { TeacherProfile } from "@/components/home/TeachersSection";
import type { MappedSitePage } from "@/content/mappers/site-page";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";
import type {
  ResidentialLifeContent,
  ReviewsContent,
  SiteMapContent,
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
> & {
  modules?: PageModulesDocument | null;
};
