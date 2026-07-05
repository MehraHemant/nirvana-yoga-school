import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import type { YouTubeVideo } from "@/lib/youtube";

export type CoursePageData = {
  course: ResidentialCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
};
