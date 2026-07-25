import {
  createEmptyGalleryModule,
  galleryCategoryLabel,
  resolveGallerySections,
} from "@/content/mappers/gallery-module";
import { createEmptyVideosModule } from "@/content/mappers/videos-module";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
import type { PageModulesDocument } from "@/content/types";
import type { SitePageGalleryImage } from "@/content/types/site-page";
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
 * When gallery images exist in `page_gallery_images` but not in modules,
 * hydrate the gallery module so venue editors always see DB photos.
 *
 * @param pageModules - Raw JSON from the page row
 * @param title - Optional title to seed into the scaffold hero
 * @param galleryRows - Optional relational gallery rows from the database
 * @returns Always a complete `PageModulesDocument`
 */
export function resolvePageModulesForEditor(
  pageModules: unknown,
  title?: string,
  galleryRows: SitePageGalleryImage[] = [],
): PageModulesDocument {
  const existing = mapPageModulesFromRow({ pageModules });
  const doc =
    existing ??
    (() => {
      const scaffold = createEmptyPageModules("page-minimal");
      if (title?.trim()) {
        scaffold.hero = { ...scaffold.hero, title: title.trim() };
      }
      return scaffold;
    })();

  const hasModuleImages = (doc.gallery?.images?.length ?? 0) > 0;
  if (!hasModuleImages && galleryRows.length > 0) {
    const sections = resolveGallerySections(galleryRows);
    doc.gallery = {
      ...createEmptyGalleryModule(),
      ...doc.gallery,
      live: doc.gallery?.live !== false,
      images: galleryRows,
      sectionOrder: sections.map((section) => ({
        id: section.id,
        label: section.label || galleryCategoryLabel(section.id),
        description: section.description,
      })),
    };
  }

  // Ensure venue (and other) editors always have an editable videos scaffold.
  if (!doc.videos) {
    doc.videos = createEmptyVideosModule();
  }

  return doc;
}
