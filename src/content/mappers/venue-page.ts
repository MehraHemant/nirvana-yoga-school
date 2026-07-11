import { VENUE_FAQS } from "@/content/data/venue-faqs";
import type { MappedSitePage } from "@/content/mappers/site-page";
import { buildNavItems, mapSitePage } from "@/content/mappers/site-page";
import type { SitePageDocument } from "@/content/types";

const VENUE_SLUGS = new Set(["course-venue", "retreat-venue"]);

/**
 * Whether the slug is a dedicated venue route.
 *
 * @param slug - Site page slug
 */
export function isVenuePage(slug: string): boolean {
  return VENUE_SLUGS.has(slug);
}

/**
 * Enrich venue pages with Why Nirvana, FAQs, and sticky-nav targets.
 *
 * @param page - Venue site page document
 */
export function mapVenuePage(page: SitePageDocument): MappedSitePage {
  const partial = {
    ...mapSitePage(page),
    showWhyNirvana: true,
    showTravelGuide: false,
    faqs: VENUE_FAQS,
  };

  return {
    ...partial,
    navItems: buildNavItems(partial),
  };
}
