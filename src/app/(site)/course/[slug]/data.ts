import { getCourseMedia } from "@/content";
import type { ResidentialCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { CoursePageData } from "./types";

export async function loadCoursePageData(
  slug: string,
  course: ResidentialCourseDocument,
): Promise<CoursePageData> {
  const media = await getCourseMedia(slug);
  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return { course, media, videos };
}
