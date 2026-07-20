import {
  createEmptyBookingAddons,
  createEmptyExamCertification,
  createEmptyHomePageContent,
  createEmptyTravelGuide,
} from "@/lib/cms/structural-defaults";
import {
  normalizeRetreatAccommodation,
  retreatAccommodationToResidentialLife,
} from "@/content/mappers/residential-life";
import type { BookingAddonsContent } from "@/content/types/booking";
import type {
  ExamCertificationContent,
  HomeFaqsContent,
  InstagramFeedContent,
  ResidentialLifeContent,
  RetreatAccommodationContent,
  ReviewsContent,
  SiteMapContent,
  TravelGuideContent,
  VenueFaqsContent,
  WhyNirvanaContent,
  YttHubContent,
} from "@/content/types/shared-sections";
import { fetchGlobalSettingsFromDb } from "@/lib/cms/cache";
import { createEmptyInstagramFeed } from "@/lib/cms/structural-defaults";
import { requireDb } from "./db-fallback";
import { getHomePageContent } from "./dedicated-pages";
import type { ContentResult, RepositoryOptions } from "./fetch";
import { requireGlobalSetting } from "./global-settings";

export {
  normalizeRetreatAccommodation,
  retreatAccommodationToResidentialLife,
};

/**
 * Builds a SiteMapContent from homepage map fields (legacy fallback).
 *
 * @param map - Homepage map section
 */
function siteMapFromHomeMap(map: {
  live?: boolean;
  show?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  embedUrl: string;
  iframeTitle: string;
}): SiteMapContent {
  return {
    live: map.live !== false && map.show !== false,
    eyebrow: map.eyebrow,
    title: map.title,
    description: map.description,
    embedUrl: map.embedUrl,
    iframeTitle: map.iframeTitle,
  };
}

/**
 * Residential life block (accommodation, food, facilities) from MySQL.
 * Prefer per-page `page_modules.residentialLife` on the frontend.
 *
 * @param options - Optional repository options
 */
export async function getResidentialLife(
  options?: RepositoryOptions,
): Promise<ContentResult<ResidentialLifeContent>> {
  return requireDb(
    () => requireGlobalSetting<ResidentialLifeContent>("residentialLife"),
    options,
  );
}

/**
 * Homepage / shared student reviews from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getReviews(
  options?: RepositoryOptions,
): Promise<ContentResult<ReviewsContent>> {
  return requireDb(
    () => requireGlobalSetting<ReviewsContent>("reviews"),
    options,
  );
}

/**
 * Homepage FAQ cards from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getHomeFaqs(
  options?: RepositoryOptions,
): Promise<ContentResult<HomeFaqsContent>> {
  return requireDb(
    () => requireGlobalSetting<HomeFaqsContent>("homeFaqs"),
    options,
  );
}

/**
 * Why Nirvana highlights + closing copy from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getWhyNirvana(
  options?: RepositoryOptions,
): Promise<ContentResult<WhyNirvanaContent>> {
  return requireDb(
    () => requireGlobalSetting<WhyNirvanaContent>("whyNirvana"),
    options,
  );
}

/**
 * Shared exam and certification content from MySQL (`global_settings.examCertification`).
 *
 * @param options - Optional repository options
 */
export async function getExamCertification(
  options?: RepositoryOptions,
): Promise<ContentResult<ExamCertificationContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("examCertification");
    if (stored && typeof stored === "object") {
      const content = stored as Partial<ExamCertificationContent>;
      if (
        Array.isArray(content.steps) &&
        content.steps.length > 0 &&
        Array.isArray(content.certificates) &&
        content.certificates.length > 0
      ) {
        return {
          ...createEmptyExamCertification(),
          ...content,
          live: content.live !== false,
          steps: content.steps,
          certificates: content.certificates,
        };
      }
    }
    return { ...createEmptyExamCertification() };
  }, options);
}

/**
 * Venue page FAQs from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getVenueFaqs(
  options?: RepositoryOptions,
): Promise<ContentResult<VenueFaqsContent>> {
  return requireDb(
    () => requireGlobalSetting<VenueFaqsContent>("venueFaqs"),
    options,
  );
}

/**
 * Legacy retreat lodging / food galleries from MySQL.
 * Prefer per-page `page_modules.residentialLife` (same as courses).
 *
 * @param options - Optional repository options
 */
export async function getRetreatAccommodation(
  options?: RepositoryOptions,
): Promise<ContentResult<RetreatAccommodationContent>> {
  return requireDb(async () => {
    const raw = await requireGlobalSetting<RetreatAccommodationContent>(
      "retreatAccommodation",
    );
    return normalizeRetreatAccommodation(raw);
  }, options);
}

/**
 * Shared Google Maps embed used on home and product pages.
 * Prefers `global_settings.siteMap`, then homepage map, then defaults.
 *
 * @param options - Optional repository options
 */
export async function getSiteMap(
  options?: RepositoryOptions,
): Promise<ContentResult<SiteMapContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("siteMap");
    if (stored && typeof stored === "object") {
      const map = stored as SiteMapContent;
      if (map.embedUrl?.trim()) {
        return {
          ...map,
          live: map.live !== false,
          iframeTitle:
            map.iframeTitle?.trim() ||
            createEmptyHomePageContent().map.iframeTitle,
        };
      }
    }

    try {
      const home = await getHomePageContent();
      if (home.data.map.embedUrl?.trim()) {
        return siteMapFromHomeMap(home.data.map);
      }
    } catch {
      /* fall through to defaults */
    }

    return siteMapFromHomeMap(createEmptyHomePageContent().map);
  }, options);
}

/**
 * Shared Instagram feed from MySQL (`global_settings.instagram`).
 *
 * @param options - Optional repository options
 */
export async function getInstagramFeed(
  options?: RepositoryOptions,
): Promise<ContentResult<InstagramFeedContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("instagram");
    if (stored && typeof stored === "object") {
      const feed = stored as InstagramFeedContent;
      if (Array.isArray(feed.media) && feed.media.length > 0) {
        return {
          ...feed,
          live: feed.live !== false,
          profileUrl:
            feed.profileUrl?.trim() || createEmptyInstagramFeed().profileUrl,
        };
      }
    }
    return {
      live: true,
      ...createEmptyInstagramFeed(),
    };
  }, options);
}

/**
 * Shared travel guide from MySQL (`global_settings.travel`).
 *
 * @param options - Optional repository options
 */
export async function getTravelGuide(
  options?: RepositoryOptions,
): Promise<ContentResult<TravelGuideContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("travel");
    if (stored && typeof stored === "object") {
      const guide = stored as TravelGuideContent;
      if (Array.isArray(guide.topics) && guide.topics.length > 0) {
        return {
          ...createEmptyTravelGuide(),
          ...guide,
          live: guide.live !== false,
          topics: guide.topics,
          quickFacts: guide.quickFacts?.length
            ? guide.quickFacts
            : createEmptyTravelGuide().quickFacts,
        };
      }
    }
    return { ...createEmptyTravelGuide() };
  }, options);
}

/**
 * YTT hub page content from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getYttHub(
  options?: RepositoryOptions,
): Promise<ContentResult<YttHubContent>> {
  return requireDb(
    () => requireGlobalSetting<YttHubContent>("yttHub"),
    options,
  );
}

/**
 * Optional booking add-ons from `global_settings.bookingAddons`.
 *
 * @param options - Optional repository options
 */
export async function getBookingAddons(
  options?: RepositoryOptions,
): Promise<ContentResult<BookingAddonsContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("bookingAddons");
    if (stored && typeof stored === "object") {
      const doc = stored as BookingAddonsContent;
      if (Array.isArray(doc.items)) {
        return {
          ...createEmptyBookingAddons(),
          ...doc,
          live: doc.live !== false,
          items: doc.items,
        };
      }
    }
    return createEmptyBookingAddons();
  }, options);
}

