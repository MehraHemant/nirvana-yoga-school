import type { PageModulesDocument } from "@/content/types/page-modules";
import type { RetreatDocument } from "@/content/types/retreat-page";
import {
  hydrateModulesFromLodgingTables,
  syncLodgingTablesFromModules,
} from "./lodging-sync";

/**
 * Hydrates page modules from relational lodging tables.
 *
 * @param slug - Page slug
 * @param modules - Modules loaded from page_modules
 * @param pageId - Page id when the caller already has it (skips a lookup)
 */
export async function hydrateModulesFromPageTables(
  slug: string,
  modules: PageModulesDocument | null,
  pageId?: string,
): Promise<PageModulesDocument | null> {
  return hydrateModulesFromLodgingTables(slug, modules, pageId);
}

/**
 * Dual-writes lodging relational tables from saved modules.
 *
 * @param pageId - Page id
 * @param modules - Saved page modules
 * @param retreat - Optional retreat document (packages as offer source)
 */
export async function syncPageTablesFromModules(
  pageId: string,
  modules: PageModulesDocument,
  retreat?: RetreatDocument | null,
): Promise<void> {
  await syncLodgingTablesFromModules(pageId, modules, retreat);
}
