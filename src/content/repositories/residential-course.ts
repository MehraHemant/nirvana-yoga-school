import { extractMediaFromModules } from "@/content/mappers/page-modules";
import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { CourseMedia, ResidentialCourseDocument } from "@/content/types";
import {
  fetchCourseDocumentFromDb,
  fetchPageModulesFromDb,
  fetchPageSlugsByTypeFromDb,
} from "@/lib/cms/cache";

/**
 * Load a residential course by slug from MySQL only.
 *
 * @param slug - Course slug
 * @param options - Optional repository options
 */
export async function getResidentialCourse(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<ResidentialCourseDocument | null>> {
  return requireDb(
    () => fetchCourseDocumentFromDb<ResidentialCourseDocument>(slug),
    options,
  );
}

/**
 * All published residential course slugs.
 */
export async function getResidentialCourseSlugs(): Promise<string[]> {
  const result = await requireDb(() => fetchPageSlugsByTypeFromDb("course"));
  return result.data;
}

/**
 * Hero media for a course slug — reads from page modules in MySQL.
 *
 * @param slug - Course slug
 */
export async function getCourseMedia(slug: string): Promise<CourseMedia> {
  const modulesResult = await requireDb(() => fetchPageModulesFromDb(slug));

  if (modulesResult.data) {
    return extractMediaFromModules(modulesResult.data);
  }

  return { images: [], videos: [] };
}
