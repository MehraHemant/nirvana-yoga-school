import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { RetreatDocument } from "@/content/types/retreat-page";
import {
  fetchCourseDocumentFromDb,
  fetchPageSlugsByTypeFromDb,
} from "@/lib/cms/cache";

/**
 * Load a retreat document from MySQL (`course_documents`) when present.
 * Returns `null` when no document is stored — callers may use the site-page path.
 *
 * @param slug - Retreat page slug
 * @param options - Optional repository options
 */
export async function getRetreat(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<RetreatDocument | null>> {
  return requireDb(
    () => fetchCourseDocumentFromDb<RetreatDocument>(slug),
    options,
  );
}

/**
 * All published retreat page slugs.
 */
export async function getRetreatSlugs(): Promise<string[]> {
  const result = await requireDb(() => fetchPageSlugsByTypeFromDb("retreat"));
  return result.data;
}
