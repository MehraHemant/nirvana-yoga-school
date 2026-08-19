import { roomDisplayTitle } from "@/content/lodging/room-catalog";
import { hasResidentialLifeContent } from "@/content/mappers/residential-life-utils";
import type {
  ResidentialLifeContent,
  RetreatAccommodationContent,
  RoomCatalog,
  RoomRecord,
  SharedFacility,
  SharedFoodContent,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import {
  createDefaultCourseFood,
  createEmptyResidentialLife,
  createEmptySharedFood,
} from "@/lib/cms/structural-defaults";

/**
 * Maps a room into the Accommodation gallery tab shape.
 *
 * @param room - Shared room record
 */
function roomToGallery(room: RoomRecord) {
  return {
    id: room.id,
    label: roomDisplayTitle(room),
    description: room.description,
    images: room.images,
    live: room.live !== false,
    eyebrow: room.eyebrow?.trim() || undefined,
  };
}

/** Stay intro + facilities stored beside the rooms catalog. */
export type SharedAccommodationMeta = {
  live?: boolean;
  /** Section eyebrow above the lodging H2 on product pages. */
  eyebrow?: string;
  /** Section H2 above the lodging gallery on product pages. */
  title?: string;
  stay: { title: string; description: string };
  facilities: SharedFacility[];
};

/**
 * True when JSON already uses the nested course `residentialLife` shape.
 *
 * @param raw - Unknown CMS document
 */
export function isResidentialLifeShape(
  raw: unknown,
): raw is ResidentialLifeContent {
  if (!raw || typeof raw !== "object") return false;
  const accommodation = (raw as { accommodation?: unknown }).accommodation;
  return (
    !!accommodation &&
    typeof accommodation === "object" &&
    "stay" in accommodation
  );
}

/**
 * Fills missing nested fields so admin editors never read undefined paths.
 *
 * @param raw - Partial or sparse residential-life JSON
 */
export function normalizeResidentialLife(
  raw: Partial<ResidentialLifeContent> | null | undefined,
): ResidentialLifeContent {
  const empty = createEmptyResidentialLife();
  if (!raw) return empty;
  return {
    live: raw.live !== false,
    accommodation: {
      _id: raw.accommodation?._id,
      live: raw.accommodation?.live !== false,
      title: raw.accommodation?.title ?? "",
      eyebrow: raw.accommodation?.eyebrow ?? "",
      catalog: raw.accommodation?.catalog,
      stay: {
        title: raw.accommodation?.stay?.title ?? "",
        description: raw.accommodation?.stay?.description ?? "",
      },
      galleries: raw.accommodation?.galleries ?? [],
      extraRooms: raw.accommodation?.extraRooms ?? [],
      roomIds: raw.accommodation?.roomIds,
    },
    food: {
      _id: raw.food?._id,
      live: raw.food?.live !== false,
      content: {
        title: raw.food?.content?.title ?? "",
        description: raw.food?.content?.description ?? "",
        points: raw.food?.content?.points ?? [],
        dietaryNote: raw.food?.content?.dietaryNote ?? "",
      },
      gallery: raw.food?.gallery ?? [],
      extraPoints: raw.food?.extraPoints ?? [],
      extraGallery: raw.food?.extraGallery ?? [],
    },
    facilities: raw.facilities ?? [],
  };
}

/**
 * Normalizes shared accommodation meta (stay + facilities).
 *
 * @param raw - Partial meta document
 */
export function normalizeSharedAccommodationMeta(
  raw: Partial<SharedAccommodationMeta> | null | undefined,
): SharedAccommodationMeta {
  return {
    live: raw?.live !== false,
    eyebrow: raw?.eyebrow ?? "",
    title: raw?.title ?? "",
    stay: {
      title: raw?.stay?.title ?? "",
      description: raw?.stay?.description ?? "",
    },
    facilities: raw?.facilities ?? [],
  };
}

/**
 * Extracts stay + facilities from legacy residential / retreat shared docs.
 *
 * @param raw - Stored shared settings value
 */
export function coerceSharedAccommodationMeta(
  raw: unknown,
): SharedAccommodationMeta {
  if (!raw || typeof raw !== "object") {
    return normalizeSharedAccommodationMeta(null);
  }
  if (isResidentialLifeShape(raw)) {
    const doc = normalizeResidentialLife(raw);
    return normalizeSharedAccommodationMeta({
      live: doc.live,
      eyebrow: doc.accommodation.eyebrow,
      title: doc.accommodation.title,
      stay: doc.accommodation.stay,
      facilities: doc.facilities,
    });
  }
  if ("roomGalleries" in raw) {
    const lodging = normalizeRetreatAccommodation(
      raw as RetreatAccommodationContent,
    );
    return normalizeSharedAccommodationMeta({
      live: lodging.live,
      stay: {
        title: "",
        description: "",
      },
      facilities: lodging.defaultFacilities.map((label) => {
        const base = label.split(" — ")[0]?.trim() ?? label;
        const note = label.includes(" — ")
          ? label.split(" — ").slice(1).join(" — ").trim()
          : undefined;
        return { label: base, iconKey: "leaf", note };
      }),
    });
  }
  if ("stay" in raw) {
    return normalizeSharedAccommodationMeta(raw as SharedAccommodationMeta);
  }
  return normalizeSharedAccommodationMeta(null);
}

/**
 * Normalizes shared food documents.
 *
 * @param raw - Partial food JSON
 */
export function normalizeSharedFood(
  raw: Partial<SharedFoodContent> | null | undefined,
): SharedFoodContent {
  const empty = createEmptySharedFood();
  if (!raw) return empty;
  return {
    live: raw.live !== false,
    content: {
      title: raw.content?.title ?? "",
      description: raw.content?.description ?? "",
      points: raw.content?.points ?? [],
      dietaryNote: raw.content?.dietaryNote ?? "",
    },
    gallery: raw.gallery ?? [],
  };
}

/**
 * Whether shared food has usable copy or images.
 *
 * @param food - Shared food document
 */
export function hasSharedFoodContent(
  food: SharedFoodContent | null | undefined,
): boolean {
  if (!food) return false;
  return Boolean(
    food.content.title.trim() ||
      food.content.description.trim() ||
      food.content.points.length > 0 ||
      food.gallery.length > 0,
  );
}

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
 * Maps course-shaped lodging back to the legacy retreat shared-settings shape.
 *
 * @param doc - Normalized residential-life document
 */
export function residentialLifeToRetreatAccommodation(
  doc: ResidentialLifeContent,
): RetreatAccommodationContent {
  const lodgingLive = doc.accommodation.live !== false;
  const foodLive = doc.food.live !== false;
  return {
    live: doc.live !== false,
    lodgingLive,
    foodLive,
    accommodation: { live: lodgingLive },
    food: { live: foodLive },
    roomGalleries: doc.accommodation.galleries ?? [],
    foodGallery: doc.food.gallery ?? [],
    mealHighlights: doc.food.content.points ?? [],
    defaultFacilities: (doc.facilities ?? []).map((facility) =>
      facility.note?.trim()
        ? `${facility.label} — ${facility.note.trim()}`
        : facility.label,
    ),
  };
}

/**
 * Maps shared accommodation meta into a persistable residentialLife shell.
 *
 * @param meta - Stay + facilities
 */
export function sharedMetaToResidentialLife(
  meta: SharedAccommodationMeta,
): ResidentialLifeContent {
  return normalizeResidentialLife({
    live: meta.live !== false,
    accommodation: {
      live: true,
      title: meta.title?.trim() ?? "",
      eyebrow: meta.eyebrow?.trim() ?? "",
      stay: meta.stay,
      galleries: [],
    },
    food: createEmptyResidentialLife().food,
    facilities: meta.facilities,
  });
}

/**
 * Maps shared accommodation meta into legacy retreatAccommodation shape.
 *
 * @param meta - Stay + facilities
 */
export function sharedMetaToRetreatAccommodation(
  meta: SharedAccommodationMeta,
): RetreatAccommodationContent {
  return {
    live: meta.live !== false,
    lodgingLive: true,
    foodLive: true,
    accommodation: { live: true },
    food: { live: true },
    roomGalleries: [],
    foodGallery: [],
    mealHighlights: [],
    defaultFacilities: meta.facilities.map((facility) =>
      facility.note?.trim()
        ? `${facility.label} — ${facility.note.trim()}`
        : facility.label,
    ),
  };
}

/**
 * Maps legacy retreat lodging into the course `residentialLife` shape so
 * retreats can reuse Accommodation / Food components and admin fields.
 *
 * @param raw - Stored retreat accommodation JSON
 */
export function retreatAccommodationToResidentialLife(
  raw: RetreatAccommodationContent,
): ResidentialLifeContent {
  const lodging = normalizeRetreatAccommodation(raw);
  return normalizeResidentialLife({
    live: lodging.live !== false,
    accommodation: {
      live: lodging.accommodation?.live !== false,
      stay: {
        title: "",
        description: "",
      },
      galleries: lodging.roomGalleries,
    },
    food: {
      live: lodging.food?.live !== false,
      content: {
        title: "",
        description: "",
        points: lodging.mealHighlights,
        dietaryNote: "",
      },
      gallery: lodging.foodGallery,
    },
    facilities: lodging.defaultFacilities.map((label) => {
      const base = label.split(" — ")[0]?.trim() ?? label;
      const note = label.includes(" — ")
        ? label.split(" — ").slice(1).join(" — ").trim()
        : undefined;
      return { label: base, iconKey: "leaf", note };
    }),
  });
}

/**
 * Coerces shared lodging JSON (legacy retreat or course shape) into
 * `ResidentialLifeContent` for admin editors.
 *
 * @param raw - Shared settings value for residentialLife / retreatAccommodation
 */
export function coerceToResidentialLife(raw: unknown): ResidentialLifeContent {
  if (isResidentialLifeShape(raw)) {
    return normalizeResidentialLife(raw);
  }
  if (raw && typeof raw !== "object") {
    return normalizeResidentialLife(null);
  }
  if (raw && typeof raw === "object" && "roomGalleries" in raw) {
    return retreatAccommodationToResidentialLife(
      raw as RetreatAccommodationContent,
    );
  }
  if (
    raw &&
    typeof raw === "object" &&
    "stay" in raw &&
    !("accommodation" in raw)
  ) {
    return sharedMetaToResidentialLife(
      normalizeSharedAccommodationMeta(raw as SharedAccommodationMeta),
    );
  }
  return normalizeResidentialLife(
    raw as Partial<ResidentialLifeContent> | null | undefined,
  );
}

/**
 * Merges shared rooms + food with per-page Live flags and extras.
 *
 * @param input - Catalog, page overrides, shared rooms/food/meta
 */
export function mergeSharedResidentialLife(input: {
  catalog: RoomCatalog;
  page?: ResidentialLifeContent | null;
  rooms: RoomRecord[];
  food: SharedFoodContent;
  meta: SharedAccommodationMeta;
}): ResidentialLifeContent {
  const page = normalizeResidentialLife(input.page);
  const food = normalizeSharedFood(input.food);
  const meta = normalizeSharedAccommodationMeta(input.meta);

  const pageRoomIds = page.accommodation.roomIds;
  const visibleRooms =
    pageRoomIds === undefined
      ? input.rooms
      : input.rooms.filter((room) => pageRoomIds.includes(room.id));
  const sharedGalleries = visibleRooms.map(roomToGallery);
  const extras = page.accommodation.extraRooms ?? [];
  const legacyGalleries = page.accommodation.galleries ?? [];

  const galleries =
    sharedGalleries.length > 0
      ? [...sharedGalleries, ...extras]
      : pageRoomIds === undefined && legacyGalleries.length > 0
        ? [...legacyGalleries, ...extras]
        : extras;

  const useSharedFood = hasSharedFoodContent(food);
  const legacyFood = page.food;
  const baseContent = useSharedFood
    ? food.content
    : (legacyFood.content ?? createEmptySharedFood().content);
  const baseGallery: SharedGalleryImage[] = useSharedFood
    ? food.gallery
    : (legacyFood.gallery ?? []);

  return {
    live: page.live !== false && meta.live !== false,
    accommodation: {
      _id: page.accommodation._id,
      live: page.accommodation.live !== false,
      title:
        page.accommodation.title?.trim() ||
        meta.title?.trim() ||
        "",
      eyebrow: meta.eyebrow?.trim() || "",
      catalog: input.catalog,
      stay: {
        title: meta.stay.title.trim(),
        description: meta.stay.description.trim(),
      },
      galleries,
      extraRooms: extras,
      roomIds: pageRoomIds,
    },
    food: {
      _id: page.food._id,
      live: page.food.live !== false && food.live !== false,
      content: {
        ...baseContent,
        title:
          legacyFood.content.title?.trim() ||
          baseContent.title?.trim() ||
          "",
        points: [...baseContent.points, ...(legacyFood.extraPoints ?? [])],
      },
      gallery: [...baseGallery, ...(legacyFood.extraGallery ?? [])],
      extraPoints: legacyFood.extraPoints ?? [],
      extraGallery: legacyFood.extraGallery ?? [],
    },
    facilities: meta.facilities,
  };
}

/**
 * Resolves per-page accommodation for a YTT course (sync legacy helper).
 * Prefer {@link mergeSharedResidentialLife} with shared rooms/food on public pages.
 *
 * @param moduleResidentialLife - Optional per-page accommodation module
 * @param globalResidentialLife - Global shared course accommodation content
 */
export function resolveCourseAccommodation(
  moduleResidentialLife: ResidentialLifeContent | undefined | null,
  globalResidentialLife: ResidentialLifeContent | null,
): ResidentialLifeContent {
  if (hasResidentialLifeContent(moduleResidentialLife)) {
    return normalizeResidentialLife(moduleResidentialLife);
  }
  return normalizeResidentialLife(
    globalResidentialLife ?? createEmptyResidentialLife(),
  );
}

/**
 * Resolves per-page accommodation for a retreat (course-compatible shape).
 * Prefer {@link mergeSharedResidentialLife} on public pages.
 *
 * @param moduleResidentialLife - Page modules residential life, if any
 * @param moduleRetreatLodging - Legacy retreat lodging module, if any
 * @param globalRetreatLodging - Global retreat accommodation fallback
 */
export function resolveRetreatAccommodation(
  moduleResidentialLife: ResidentialLifeContent | undefined | null,
  moduleRetreatLodging: RetreatAccommodationContent | undefined | null,
  globalRetreatLodging: RetreatAccommodationContent | null,
): ResidentialLifeContent {
  if (hasResidentialLifeContent(moduleResidentialLife)) {
    return normalizeResidentialLife(moduleResidentialLife);
  }
  if (moduleRetreatLodging) {
    return coerceToResidentialLife(moduleRetreatLodging);
  }
  if (globalRetreatLodging) {
    return coerceToResidentialLife(globalRetreatLodging);
  }
  return createEmptyResidentialLife();
}

/**
 * Pulls food content from a legacy residentialLife document for seeding.
 *
 * @param raw - Legacy residential life JSON
 */
export function extractFoodFromResidentialLife(
  raw: unknown,
): SharedFoodContent | null {
  if (!isResidentialLifeShape(raw)) return null;
  const food = normalizeResidentialLife(raw).food;
  const doc = normalizeSharedFood({
    live: food.live,
    content: food.content,
    gallery: food.gallery,
  });
  return hasSharedFoodContent(doc) ? doc : null;
}

/**
 * Default course food when shared settings are missing.
 */
export function fallbackCourseFood(): SharedFoodContent {
  return createDefaultCourseFood();
}
