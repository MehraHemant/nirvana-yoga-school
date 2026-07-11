import {
  ONLINE_COURSES,
  type OnlineCourseDocument,
} from "@/content/data/online-courses";
import { withDbFallback } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import { fetchCourseDocumentFromDb } from "@/lib/cms/cache";

/**
 * Load an online course by slug from Postgres or static data.
 *
 * @param slug - Online course slug
 * @param options - Optional source override
 */
export async function getOnlineCourse(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<OnlineCourseDocument | null>> {
  return withDbFallback(
    () => fetchCourseDocumentFromDb<OnlineCourseDocument>(slug),
    () => ONLINE_COURSES[slug] ?? null,
    options,
  );
}

/** All online course slugs. */
export async function getOnlineCourseSlugs(): Promise<string[]> {
  return Object.keys(ONLINE_COURSES);
}
