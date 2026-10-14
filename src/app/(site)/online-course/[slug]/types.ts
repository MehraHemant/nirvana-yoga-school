import type {
  CourseMedia,
  OnlineCourseDocument,
  PageModulesDocument,
} from "@/content/types";
import type { ExamCertificationContent } from "@/content/types/shared-sections";
import type { YouTubeVideo } from "@/lib/youtube";

export type OnlineCoursePageData = {
  course: OnlineCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
  modules: PageModulesDocument | null;
  examCertification: ExamCertificationContent | null;
};
