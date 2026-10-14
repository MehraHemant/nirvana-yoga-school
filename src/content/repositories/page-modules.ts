import { requireDb } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { PageModulesDocument } from "@/content/types";
import { fetchPageModulesFromDb } from "@/lib/cms/cache";

/**
 * Load page modules by slug from MySQL only.
 * Returns `null` when the page is unpublished or has no modules row.
 *
 * @param slug - Page slug
 * @param options - Optional repository options
 */
export async function getPageModules(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<PageModulesDocument | null>> {
  return requireDb(() => fetchPageModulesFromDb(slug), options);
}
