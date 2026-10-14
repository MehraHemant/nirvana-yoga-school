import type { MappedSitePage } from "@/content/mappers/site-page";
import { mapSitePage } from "@/content/mappers/site-page";
import type { PageModulesDocument, SitePageDocument } from "@/content/types";
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
 * Whether this venue page is the retreat campus gallery.
 *
 * @param slug - Site page slug
 */
export function isRetreatVenuePage(slug: string): boolean {
  return slug === "retreat-venue";
}

/**
 * Drops venue playlist (`page_modules.videos`) and gallery YouTube clips.
 * Course/home YouTube fields are not touched.
 *
 * @param modules - Page modules document
 */
export function stripVenueYoutubeModules(
  modules: PageModulesDocument,
): PageModulesDocument {
  const { videos: _videos, ...rest } = modules;
  if (!rest.gallery) return rest;
  const { videos: _galleryVideos, ...gallery } = rest.gallery;
  return { ...rest, gallery };
}

/**
 * Enrich venue pages with gallery nav, and FAQs/map only on course venue.
 *
 * @param page - Venue site page document
 * @param faqs - FAQs from `/api/content/venue-faqs` (MySQL)
 */
export function mapVenuePage(
  page: SitePageDocument,
  faqs: SharedFaq[] = [],
): MappedSitePage {
  const isRetreatVenue = isRetreatVenuePage(page.slug);
  const venueFaqs = isRetreatVenue ? [] : faqs;
  const partial = {
    ...mapSitePage(page),
    showWhyNirvana: false,
    showTravelGuide: false,
    showMap: !isRetreatVenue,
    faqs: venueFaqs,
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
