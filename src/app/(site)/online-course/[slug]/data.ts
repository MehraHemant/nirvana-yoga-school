import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { getPageModules } from "@/content/repositories/page-modules";
import type { OnlineCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { OnlineCoursePageData } from "./types";

export async function loadOnlineCoursePageData(
  slug: string,
  course: OnlineCourseDocument,
): Promise<OnlineCoursePageData> {
  const modulesResult = await getPageModules(slug);
  const modules = modulesResult.data;
  const media = modules
    ? extractMediaFromModules(modules)
    : { images: [], videos: [] };

  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );

  return {
    course,
    media,
    videos,
    modules,
  };
}
