import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { hydrateModulesFromLodgingTables } from "@/content/repositories/lodging-sync";
import { getPageModules } from "@/content/repositories/page-modules";
import {
  getExamCertification,
  getInstagramFeed,
  getReviews,
  getSiteMap,
  getTravelGuide,
  getWhyNirvana,
  resolveProductResidentialLife,
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
  const [
    modulesResult,
    whyNirvana,
    reviews,
    siteMap,
    instagram,
    travel,
    examCertification,
  ] = await Promise.all([
    getPageModules(slug),
    getWhyNirvana().catch(() => null),
    getReviews().catch(() => null),
    getSiteMap().catch(() => null),
    getInstagramFeed().catch(() => null),
    getTravelGuide().catch(() => null),
    getExamCertification().catch((error) => {
      console.error("[loadCoursePageData] getExamCertification failed", error);
      return null;
    }),
  ]);

  const modules =
    (await hydrateModulesFromLodgingTables(slug, modulesResult.data).catch(
      () => modulesResult.data,
    )) ?? modulesResult.data;

  const media: CourseMedia = modules
    ? extractMediaFromModules(modules)
    : { images: [], videos: [] };

  const videos = await fetchYouTubeVideos(
    media.videos.map((id) => `https://www.youtube.com/watch?v=${id}`),
  );
  const residentialLife = await resolveProductResidentialLife(
    "course",
    modules?.residentialLife,
    { pageSlug: slug },
  ).catch((error) => {
    console.error(
      "[loadCoursePageData] resolveProductResidentialLife failed",
      error,
    );
    return null;
  });

  return {
    course,
    media,
    videos,
    modules,
    residentialLife,
    whyNirvana: whyNirvana?.data ?? null,
    reviews: reviews?.data ?? null,
    siteMap: siteMap?.data ?? null,
    instagram: instagram?.data ?? null,
    travel: travel?.data ?? null,
    examCertification: examCertification?.data ?? null,
  };
}
