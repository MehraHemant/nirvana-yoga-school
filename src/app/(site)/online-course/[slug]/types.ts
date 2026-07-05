import type { CourseMedia, OnlineCourseDocument } from "@/content/types";
import type { YouTubeVideo } from "@/lib/youtube";

export type OnlinePageData = {
  course: OnlineCourseDocument;
  media: CourseMedia;
  videos: YouTubeVideo[];
};
