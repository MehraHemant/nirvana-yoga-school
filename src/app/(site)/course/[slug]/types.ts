import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import type { YouTubeVideo } from "@/lib/youtube";

export type ResidentialPageData = {
  course: ResidentialCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
};
