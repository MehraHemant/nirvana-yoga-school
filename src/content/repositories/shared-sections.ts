import {
  coerceSharedAccommodationMeta,
  coerceToResidentialLife,
  extractFoodFromResidentialLife,
  isResidentialLifeShape,
  mergeSharedResidentialLife,
  normalizeRetreatAccommodation,
  normalizeSharedFood,
  residentialLifeToRetreatAccommodation,
  resolveCourseAccommodation,
  resolveRetreatAccommodation,
  retreatAccommodationToResidentialLife,
  type SharedAccommodationMeta,
  sharedMetaToResidentialLife,
  sharedMetaToRetreatAccommodation,
} from "@/content/mappers/residential-life";
import type { BookingAddonsContent } from "@/content/types/booking";
import type {
  ExamCertificationContent,
  HomeFaqsContent,
  InstagramFeedContent,
  ResidentialLifeContent,
  RetreatAccommodationContent,
  ReviewsContent,
  RoomCatalog,
  SharedFoodContent,
  SiteMapContent,
  TravelGuideContent,
  VenueFaqsContent,
  WhyNirvanaContent,
  YttHubContent,
} from "@/content/types/shared-sections";
import { fetchGlobalSettingsFromDb } from "@/lib/cms/cache";
import { hasExamCertificationContent } from "@/lib/cms/section-visibility";
import {
  createDefaultCourseFood,
  createDefaultExamCertification,
  createDefaultRetreatFood,
  createEmptyBookingAddons,
  createEmptyHomePageContent,
  createEmptyInstagramFeed,
  createEmptySharedFood,
  createEmptyTravelGuide,
  normalizeExamCertification,
} from "@/lib/cms/structural-defaults";
import { requireDb } from "./db-fallback";
import { getHomePageContent } from "./dedicated-pages";
import type { ContentResult, RepositoryOptions } from "./fetch";
import { requireGlobalSetting } from "./global-settings";
import {
  getFoodMenu,
  getPageIdBySlug,
  getPageRoomOffers,
  getPageSectionFlags,
} from "./lodging";
import { getRooms } from "./rooms";

export {
  coerceSharedAccommodationMeta,
  coerceToResidentialLife,
  isResidentialLifeShape,
  mergeSharedResidentialLife,
  normalizeRetreatAccommodation,
  normalizeSharedFood,
  resolveCourseAccommodation,
  resolveRetreatAccommodation,
  residentialLifeToRetreatAccommodation,
  retreatAccommodationToResidentialLife,
  sharedMetaToResidentialLife,
  sharedMetaToRetreatAccommodation,
  type SharedAccommodationMeta,
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
 * Course accommodation meta (stay + facilities) from shared settings.
 * Prefer shared rooms table + courseFood for public pages.
 *
 * @param options - Optional repository options
 */
export async function getResidentialLife(
  options?: RepositoryOptions,
): Promise<ContentResult<ResidentialLifeContent>> {
  return requireDb(async () => {
    const raw =
      await requireGlobalSetting<ResidentialLifeContent>("residentialLife");
    return coerceToResidentialLife(raw);
  }, options);
}

/**
 * Shared course accommodation meta (stay + facilities).
 *
 * @param options - Repository options
 */
export async function getCourseAccommodationMeta(
  options?: RepositoryOptions,
): Promise<ContentResult<SharedAccommodationMeta>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("residentialLife");
    return coerceSharedAccommodationMeta(stored);
  }, options);
}

/**
 * Shared retreat accommodation meta (stay + facilities).
 *
 * @param options - Repository options
 */
export async function getRetreatAccommodationMeta(
  options?: RepositoryOptions,
): Promise<ContentResult<SharedAccommodationMeta>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("retreatAccommodation");
    return coerceSharedAccommodationMeta(stored);
  }, options);
}

/**
 * Maps a relational food menu into SharedFoodContent.
 *
 * @param menu - Food menu record or null
 */
function foodMenuToShared(
  menu: {
    title: string;
    description: string;
    dietaryNote: string;
    live: boolean;
    points: string[];
    gallery: SharedFoodContent["gallery"];
  } | null,
): SharedFoodContent | null {
  if (!menu) return null;
  if (
    !menu.title.trim() &&
    menu.points.length === 0 &&
    menu.gallery.length === 0
  ) {
    return null;
  }
  return {
    live: menu.live,
    content: {
      title: menu.title,
      description: menu.description,
      points: menu.points,
      dietaryNote: menu.dietaryNote,
    },
    gallery: menu.gallery,
  };
}

/**
 * Shared course food — prefers `global_settings.courseFood` from Admin, falls back to `food_menus`.
 *
 * @param options - Repository options
 */
export async function getCourseFood(
  options?: RepositoryOptions,
): Promise<ContentResult<SharedFoodContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("courseFood");
    if (stored && typeof stored === "object") {
      const food = normalizeSharedFood(stored as SharedFoodContent);
      if (
        food.content.title.trim() ||
        food.content.description.trim() ||
        food.content.points.length > 0 ||
        food.gallery.length > 0
      ) {
        return food;
      }
    }

    const menuResult = await getFoodMenu("course", options);
    const fromTable = foodMenuToShared(menuResult.data);
    if (fromTable) return fromTable;

    const legacy = await fetchGlobalSettingsFromDb("residentialLife");
    const extracted = extractFoodFromResidentialLife(legacy);
    if (extracted) return extracted;
    return createEmptySharedFood();
  }, options);
}

/**
 * Shared retreat food — prefers `global_settings.retreatFood` from Admin, falls back to `food_menus`.
 *
 * @param options - Repository options
 */
export async function getRetreatFood(
  options?: RepositoryOptions,
): Promise<ContentResult<SharedFoodContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("retreatFood");
    if (stored && typeof stored === "object") {
      const food = normalizeSharedFood(stored as SharedFoodContent);
      if (
        food.content.title.trim() ||
        food.content.description.trim() ||
        food.content.points.length > 0 ||
        food.gallery.length > 0
      ) {
        return food;
      }
    }

    const menuResult = await getFoodMenu("retreat", options);
    const fromTable = foodMenuToShared(menuResult.data);
    if (fromTable) return fromTable;

    const legacy = await fetchGlobalSettingsFromDb("retreatAccommodation");
    if (legacy && typeof legacy === "object") {
      const asLife = coerceToResidentialLife(legacy);
      const extracted = extractFoodFromResidentialLife(asLife);
      if (extracted) return extracted;
    }
    return createEmptySharedFood();
  }, options);
}

export type ResolveResidentialLifeOptions = RepositoryOptions & {
  /** Page slug — loads offers / section flags when present */
  pageSlug?: string;
};

/**
 * Builds public AccommodationFood content from shared catalogs + page Live/extras.
 * When `pageSlug` is set, Live room allowlist and section flags come from
 * `page_room_offers` / `page_section_flags`.
 *
 * Missing offers → all shared catalog rooms Live (legacy). Catalog loaders are
 * isolated so one failure (e.g. food menus) cannot blank the whole section.
 *
 * @param catalog - Course or retreat rooms/food catalog
 * @param page - Per-page Live flags + extras
 * @param options - Repository options + optional pageSlug
 */
export async function resolveProductResidentialLife(
  catalog: RoomCatalog,
  page?: ResidentialLifeContent | null,
  options?: ResolveResidentialLifeOptions,
): Promise<ResidentialLifeContent> {
  const pageSlug = options?.pageSlug?.trim();
  let pageOverrides = page ?? null;

  if (pageSlug) {
    const pageId = await getPageIdBySlug(pageSlug).catch(() => null);
    if (pageId) {
      const [offersResult, flagsResult] = await Promise.all([
        getPageRoomOffers(pageId, false, options).catch(() => ({
          data: [] as Awaited<ReturnType<typeof getPageRoomOffers>>["data"],
        })),
        getPageSectionFlags(pageId, options).catch(() => ({
          data: [] as Awaited<ReturnType<typeof getPageSectionFlags>>["data"],
        })),
      ]);
      const offers = offersResult.data ?? [];
      const flags = flagsResult.data ?? [];
      if (offers.length > 0 || flags.length > 0) {
        const accommodationLive =
          flags.find((f) => f.sectionKey === "accommodation")?.live ??
          pageOverrides?.accommodation?.live;
        const foodLive =
          flags.find((f) => f.sectionKey === "food")?.live ??
          pageOverrides?.food?.live;
        const liveRoomIds = offers.filter((o) => o.live).map((o) => o.roomId);
        // No offers yet → omit allowlist (all shared catalog rooms Live).
        // When offers exist, Live rows are the source of truth (may be empty).
        const roomIds =
          offers.length > 0
            ? liveRoomIds
            : pageOverrides?.accommodation?.roomIds;
        pageOverrides = {
          live: pageOverrides?.live,
          accommodation: {
            _id: pageOverrides?.accommodation?._id,
            live: accommodationLive,
            catalog,
            stay: pageOverrides?.accommodation?.stay ?? {
              title: "",
              description: "",
            },
            galleries: pageOverrides?.accommodation?.galleries ?? [],
            extraRooms: pageOverrides?.accommodation?.extraRooms,
            roomIds,
          },
          food: {
            _id: pageOverrides?.food?._id,
            live: foodLive,
            content: pageOverrides?.food?.content ?? {
              title: "",
              description: "",
              points: [],
              dietaryNote: "",
            },
            gallery: pageOverrides?.food?.gallery ?? [],
            extraPoints: pageOverrides?.food?.extraPoints,
            extraGallery: pageOverrides?.food?.extraGallery,
          },
          facilities: pageOverrides?.facilities ?? [],
        };
      }
    }
  }

  const emptyMeta = {
    live: true,
    stay: { title: "", description: "" },
    facilities: [] as SharedAccommodationMeta["facilities"],
  };

  const [roomsResult, foodResult, metaResult] = await Promise.all([
    getRooms(catalog, options, true).catch(() => ({
      data: [] as Awaited<ReturnType<typeof getRooms>>["data"],
    })),
    (catalog === "retreat"
      ? getRetreatFood(options)
      : getCourseFood(options)
    ).catch(() => ({ data: createEmptySharedFood() })),
    (catalog === "retreat"
      ? getRetreatAccommodationMeta(options)
      : getCourseAccommodationMeta(options)
    ).catch(() => ({ data: emptyMeta })),
  ]);

  return mergeSharedResidentialLife({
    catalog,
    page: pageOverrides,
    rooms: roomsResult.data ?? [],
    food: foodResult.data ?? createEmptySharedFood(),
    meta: metaResult.data ?? emptyMeta,
  });
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
 * Shared exam and certification content from Postgres (`global_settings.examCertification`).
 * Empty scaffolds fall back to site defaults in-memory (no writes during render —
 * persistence/healing happens in the admin settings route).
 *
 * @param options - Optional repository options
 */
export async function getExamCertification(
  options?: RepositoryOptions,
): Promise<ContentResult<ExamCertificationContent>> {
  return requireDb(async () => {
    const stored = await fetchGlobalSettingsFromDb("examCertification");
    if (stored && typeof stored === "object") {
      const content = normalizeExamCertification(
        stored as Partial<ExamCertificationContent>,
      );
      if (hasExamCertificationContent(content)) {
        return content;
      }
      // Blank scaffold in DB/cache — serve defaults so Live pages still render.
      return {
        ...createDefaultExamCertification(),
        live: content.live !== false,
      };
    }
    return createDefaultExamCertification();
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
 * Prefer shared rooms + retreatFood via {@link resolveProductResidentialLife}.
 *
 * @param options - Optional repository options
 */
export async function getRetreatAccommodation(
  options?: RepositoryOptions,
): Promise<ContentResult<RetreatAccommodationContent>> {
  return requireDb(async () => {
    const raw = await requireGlobalSetting<
      RetreatAccommodationContent | ResidentialLifeContent
    >("retreatAccommodation");
    if (isResidentialLifeShape(raw)) {
      return residentialLifeToRetreatAccommodation(
        coerceToResidentialLife(raw),
      );
    }
    return normalizeRetreatAccommodation(raw as RetreatAccommodationContent);
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
