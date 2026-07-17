import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { OnlineCourseDocument } from "@/content/types";
import {
  fetchCourseDocumentFromDb,
  fetchPageSlugsByTypeFromDb,
} from "@/lib/cms/cache";

/**
 * Load an online course by slug from MySQL only.
 *
 * @param slug - Online course slug
 * @param options - Optional repository options
 */
export async function getOnlineCourse(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<OnlineCourseDocument | null>> {
  return requireDb(
    () => fetchCourseDocumentFromDb<OnlineCourseDocument>(slug),
    options,
  );
}

/**
 * All published online course slugs.
 */
export async function getOnlineCourseSlugs(): Promise<string[]> {
  const result = await requireDb(() => fetchPageSlugsByTypeFromDb("online"));
  return result.data;
}
