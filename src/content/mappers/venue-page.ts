import type { MappedSitePage } from "@/content/mappers/site-page";
import { mapSitePage } from "@/content/mappers/site-page";
import type { SitePageDocument } from "@/content/types";
import type { SharedFaq } from "@/content/types/shared-sections";

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
 * @param faqs - FAQs from `/api/content/venue-faqs` (MySQL)
 */
export function mapVenuePage(
  page: SitePageDocument,
  faqs: SharedFaq[] = [],
): MappedSitePage {
  const partial = {
    ...mapSitePage(page),
    showWhyNirvana: true,
    showTravelGuide: false,
    showMap: true,
    faqs,
  };

  return {
    ...partial,
    navItems: [
      { id: "#gallery", label: "Gallery", shortLabel: "Gallery" },
      ...(partial.faqs.length > 0
        ? [{ id: "#faq" as const, label: "FAQ", shortLabel: "FAQ" }]
        : []),
    ],
  };
}
