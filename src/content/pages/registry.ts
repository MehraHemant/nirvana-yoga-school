import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";
import type { PageRef, PageType } from "@/content/types/page-ref";

const DEDICATED_SLUGS = new Set<string>([
  ...RESIDENTIAL_COURSE_SLUGS,
  ...ONLINE_COURSE_SLUGS,
  ...RETREAT_SLUGS,
  ...VENUE_SLUGS,
]);

const SLUG_TYPE_PAIRS: Array<[readonly string[], PageType]> = [
  [RESIDENTIAL_COURSE_SLUGS, "course"],
  [ONLINE_COURSE_SLUGS, "online"],
  [RETREAT_SLUGS, "retreat"],
  [VENUE_SLUGS, "venue"],
];

/**
 * Infers page type from known dedicated slug lists (sync helper for admin).
 *
 * @param slug - Page slug
 */
export function inferPageType(slug: string): PageType {
  for (const [slugs, type] of SLUG_TYPE_PAIRS) {
    if ((slugs as readonly string[]).includes(slug)) return type;
  }
  return "site";
}

/**
 * Resolves a page ref synchronously when an explicit type is known or slug is listed.
 *
 * @param slug - Page slug
 * @param type - Optional explicit page type from DB/admin
 */
export function getPageRef(slug: string, type?: PageType): PageRef {
  return { slug, type: type ?? inferPageType(slug) };
}

/**
 * Returns page type for a slug using dedicated lists, defaulting to site.
 *
 * @param slug - Page slug
 */
export function getPageType(slug: string): PageType {
  return inferPageType(slug);
}

/**
 * Whether a page type uses a dedicated route segment.
 *
 * @param type - CMS page type
 */
export function isDedicatedPageType(type: PageType): boolean {
  return type !== "site";
}

/**
 * Whether a slug is routed via a dedicated segment (course, retreat, etc.).
 *
 * @param slug - Page slug
 */
export function isDedicatedRouteSlug(slug: string): boolean {
  return DEDICATED_SLUGS.has(slug);
}

export {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";
