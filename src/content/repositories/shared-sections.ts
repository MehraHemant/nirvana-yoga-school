import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type {
  HomeFaqsContent,
  ResidentialLifeContent,
  RetreatAccommodationContent,
  ReviewsContent,
  SiteMapContent,
  VenueFaqsContent,
  WhyNirvanaContent,
  YttHubContent,
} from "@/content/types/shared-sections";
import { fetchGlobalSettingsFromDb } from "@/lib/cms/cache";
import { requireDb } from "./db-fallback";
import { getHomePageContent } from "./dedicated-pages";
import type { ContentResult, RepositoryOptions } from "./fetch";
import { requireGlobalSetting } from "./global-settings";

/**
 * Normalizes retreat lodging docs so nested live flags always exist.
 *
 * @param raw - Stored retreat accommodation JSON
 */
export function normalizeRetreatAccommodation(
  raw: RetreatAccommodationContent,
): RetreatAccommodationContent {
  const lodgingLive =
    raw.accommodation?.live !== false && raw.lodgingLive !== false;
  const foodLive = raw.food?.live !== false && raw.foodLive !== false;
  return {
    ...raw,
    live: raw.live !== false,
    accommodation: { live: lodgingLive },
    food: { live: foodLive },
    roomGalleries: raw.roomGalleries ?? [],
    foodGallery: raw.foodGallery ?? [],
    mealHighlights: raw.mealHighlights ?? [],
    defaultFacilities: raw.defaultFacilities ?? [],
  };
}

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
 * Retreat lodging / food galleries from MySQL.
 *
 * @param options - Optional repository options
 */
export async function getRetreatAccommodation(
  options?: RepositoryOptions,
): Promise<ContentResult<RetreatAccommodationContent>> {
  return requireDb(async () => {
    const raw =
      await requireGlobalSetting<RetreatAccommodationContent>(
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
            DEFAULT_HOME_PAGE_CONTENT.map.iframeTitle,
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

    return siteMapFromHomeMap(DEFAULT_HOME_PAGE_CONTENT.map);
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
