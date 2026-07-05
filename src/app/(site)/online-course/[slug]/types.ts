import type { CourseMedia, OnlineCourseDocument } from "@/content/types";
import type { YouTubeVideo } from "@/lib/youtube";

export type OnlineCoursePageData = {
  course: OnlineCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
};
