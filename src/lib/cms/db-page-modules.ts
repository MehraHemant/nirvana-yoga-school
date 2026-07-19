import { createEmptyPageModules } from "@/content/page-modules-defaults";
import type { PageModulesDocument } from "@/content/types";
import { db } from "@/lib/db";

/**
 * Whether a value looks like a usable `PageModulesDocument` (has a hero type).
 *
 * @param value - Raw JSON from `page_modules`
 * @returns True when the document can be opened in the module editor
 */
export function isPageModulesDocument(
  value: unknown,
): value is PageModulesDocument {
  if (!value || typeof value !== "object") return false;
  const hero = (value as { hero?: unknown }).hero;
  if (!hero || typeof hero !== "object") return false;
  return typeof (hero as { type?: unknown }).type === "string";
}

/**
 * Load page modules JSON from MySQL.
 *
 * @param slug - Page slug
 * @returns Valid modules document, or null when missing/invalid
 */
export async function fetchPageModulesRow(
  slug: string,
): Promise<PageModulesDocument | null> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { pageModules: true },
  });

  return mapPageModulesFromRow(page ?? { pageModules: null });
}

/**
 * Map a page row to page modules when the JSON is a complete document.
 * Empty objects (`{}`) and partial rows are treated as missing.
 *
 * @param page - Page with optional pageModules
 * @returns Valid modules, or null
 */
export function mapPageModulesFromRow(page: {
  pageModules: unknown;
}): PageModulesDocument | null {
  if (!isPageModulesDocument(page.pageModules)) return null;
  return page.pageModules;
}

/**
 * Modules for the admin editor: stored document, or an empty scaffold.
 *
 * @param pageModules - Raw JSON from the page row
 * @param title - Optional title to seed into the scaffold hero
 * @returns Always a complete `PageModulesDocument`
 */
export function resolvePageModulesForEditor(
  pageModules: unknown,
  title?: string,
): PageModulesDocument {
  const existing = mapPageModulesFromRow({ pageModules });
  if (existing) return existing;

  const scaffold = createEmptyPageModules("page-minimal");
  if (title?.trim()) {
    scaffold.hero = { ...scaffold.hero, title: title.trim() };
  }
  return scaffold;
}
