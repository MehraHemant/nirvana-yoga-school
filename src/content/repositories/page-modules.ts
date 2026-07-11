import { COURSES_MEDIA } from "@/content/data/media";
import { SITE_PAGES } from "@/content/data/site-pages";
import { getPageRef } from "@/content/pages/registry";
import { withDbFallback } from "@/content/repositories/db-fallback";
import type {
  ContentResult,
  RepositoryOptions,
} from "@/content/repositories/fetch";
import type { PageModulesDocument } from "@/content/types";
import { COURSES_DATA } from "@/data/coursesData";
import { fetchPageModulesFromDb } from "@/lib/cms/cache";
import {
  buildModulesFromCourse,
  buildModulesFromOnlineSlug,
  buildModulesFromSitePage,
} from "@/lib/cms/page-modules-builder";

/**
 * Build page modules from static fallback sources when DB is unavailable.
 *
 * @param slug - Page slug
 */
export function buildFallbackPageModules(
  slug: string,
): PageModulesDocument | null {
  const ref = getPageRef(slug);
  if (!ref) return null;

  if (ref.type === "course") {
    const course = COURSES_DATA[slug];
    if (!course) return null;
    return buildModulesFromCourse(course, COURSES_MEDIA[slug]);
  }

  if (ref.type === "online") {
    try {
      return buildModulesFromOnlineSlug(slug);
    } catch {
      return null;
    }
  }

  const page = SITE_PAGES[slug];
  if (!page) return null;

  return buildModulesFromSitePage(page, {
    isVenue: ref.type === "venue",
    isHub: ref.type === "site" && slug.includes("teacher-training"),
  });
}

/**
 * Load page modules by slug from Postgres or static builders.
 *
 * @param slug - Page slug
 * @param options - Optional source override
 */
export async function getPageModules(
  slug: string,
  options?: RepositoryOptions,
): Promise<ContentResult<PageModulesDocument | null>> {
  return withDbFallback(
    () => fetchPageModulesFromDb(slug),
    () => buildFallbackPageModules(slug),
    options,
  );
}
