import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { getPageModules } from "@/content/repositories/page-modules";
import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { CoursePageData } from "./types";

export async function loadCoursePageData(
  slug: string,
  course: ResidentialCourseDocument,
): Promise<CoursePageData> {
  const modulesResult = await getPageModules(slug);
  const modules = modulesResult.data;

  const media: CourseMedia = modules
    ? extractMediaFromModules(modules)
    : { images: [], videos: [] };

  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return { course, media, videos, modules };
}
