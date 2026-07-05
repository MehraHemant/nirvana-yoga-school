import sitePagesJson from "@/content/data/site-pages/site-pages.json";
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

function buildPages(): PageRef[] {
  const siteSlugs = Object.keys(sitePagesJson).filter(
    (slug) => !DEDICATED_SLUGS.has(slug),
  );

  return [
    ...RESIDENTIAL_COURSE_SLUGS.map(
      (slug): PageRef => ({ type: "course", slug }),
    ),
    ...ONLINE_COURSE_SLUGS.map((slug): PageRef => ({ type: "online", slug })),
    ...RETREAT_SLUGS.map((slug): PageRef => ({ type: "retreat", slug })),
    ...VENUE_SLUGS.map((slug): PageRef => ({ type: "venue", slug })),
    ...siteSlugs.map((slug): PageRef => ({ type: "site", slug })),
  ];
}

/** Every routable page — type + slug is the source of truth for URLs and data loading. */
export const PAGES: PageRef[] = buildPages();

const PAGE_BY_SLUG = new Map(PAGES.map((page) => [page.slug, page]));

export function getPageRef(slug: string): PageRef | null {
  return PAGE_BY_SLUG.get(slug) ?? null;
}

export function getPageType(slug: string): PageType | null {
  return getPageRef(slug)?.type ?? null;
}

export function getSlugsByType(type: PageType): string[] {
  return PAGES.filter((page) => page.type === type).map((page) => page.slug);
}

export function isDedicatedPageType(type: PageType): boolean {
  return type !== "site";
}

export function isDedicatedRouteSlug(slug: string): boolean {
  const type = getPageType(slug);
  return type !== null && isDedicatedPageType(type);
}

export {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";
