import type {
  CourseMedia,
  PageModulesDocument,
  ResidentialCourseDocument,
} from "@/content/types";
import type {
  ExamCertificationContent,
  ResidentialLifeContent,
  ReviewsContent,
  SiteMapContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import type { YouTubeVideo } from "@/lib/youtube";

export type CoursePageData = {
  course: ResidentialCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
  modules: PageModulesDocument | null;
  residentialLife: ResidentialLifeContent | null;
  whyNirvana: WhyNirvanaContent | null;
  reviews: ReviewsContent | null;
  /** Shared site map embed from CMS */
  siteMap: SiteMapContent | null;
  /** Shared Instagram feed from CMS */
  instagram:
    | import("@/content/types/shared-sections").InstagramFeedContent
    | null;
  /** Shared travel guide from CMS */
  travel: import("@/content/types/shared-sections").TravelGuideContent | null;
  /** Shared exam and certification content from CMS */
  examCertification: ExamCertificationContent | null;
};
