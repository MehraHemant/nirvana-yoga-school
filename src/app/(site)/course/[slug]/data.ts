import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getResidentialLife,
  getReviews,
  getSiteMap,
  getWhyNirvana,
} from "@/content/repositories/shared-sections";
import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { CoursePageData } from "./types";

/**
 * Loads course modules, YouTube metadata, and shared section content on the server.
 *
 * @param slug - Course slug
 * @param course - Residential course document
 */
export async function loadCoursePageData(
  slug: string,
  course: ResidentialCourseDocument,
): Promise<CoursePageData> {
  const [modulesResult, residentialLife, whyNirvana, reviews, siteMap] =
    await Promise.all([
      getPageModules(slug),
      getResidentialLife().catch(() => null),
      getWhyNirvana().catch(() => null),
      getReviews().catch(() => null),
      getSiteMap().catch(() => null),
    ]);

  const modules = modulesResult.data;

  const media: CourseMedia = modules
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
    residentialLife: residentialLife?.data ?? null,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
  };
}
