import { COURSES_MEDIA } from "@/content/data/media";
import {
  getStaticResidentialCourse,
  getStaticResidentialSlugs,
} from "@/content/data/residential";
import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { withDbFallback } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import {
  fetchCourseDocumentFromDb,
  fetchPageModulesFromDb,
} from "@/lib/cms/cache";

/**
 * Load a residential course by slug from Postgres or static data.
 *
 * @param slug - Course slug
 * @param options - Optional source override
 */
export async function getResidentialCourse(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<ResidentialCourseDocument | null>> {
  return withDbFallback(
    () => fetchCourseDocumentFromDb<ResidentialCourseDocument>(slug),
    () => getStaticResidentialCourse(slug),
    options,
  );
}

/** All residential course slugs. */
export async function getResidentialCourseSlugs(): Promise<string[]> {
  return getStaticResidentialSlugs();
}

/**
 * Hero media for a course slug — reads from page modules when available.
 *
 * @param slug - Course slug
 */
export async function getCourseMedia(slug: string): Promise<CourseMedia> {
  const modulesResult = await withDbFallback(
    () => fetchPageModulesFromDb(slug),
    () => null,
  );

  if (modulesResult.data) {
    return extractMediaFromModules(modulesResult.data);
  }

  return COURSES_MEDIA[slug] ?? { images: [], videos: [] };
}
