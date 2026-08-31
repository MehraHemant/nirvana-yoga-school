import { requireDb } from "@/content/repositories/db-fallback";
import {
  getDateBatchesByPageSlugs,
  getPricedRoomOffersByPageSlugs,
  isAllowedMediaUrl,
} from "@/content/repositories/lodging";
import type { CourseDocument } from "@/content/types/course";
import type {
  PageDateBatchRecord,
  PageRoomOfferRecord,
} from "@/content/types/lodging";
import type {
  ResolvedYttHubCourse,
  YttHubCourse,
} from "@/content/types/shared-sections";
import { db } from "@/lib/db";
import {
  mapCourseDocumentToYttHubCard,
  placementCourseSlug,
} from "./ytt-hub-courses";

/** Accommodation tier shown in the blog programs rail. */
export type BlogRailPricingTier = {
  roomType: string;
  price: string;
  originalPrice?: string;
  /** First room gallery image when available */
  image?: string;
  /** Earliest upcoming batch start label (e.g. "2nd Jul 2026") */
  fromDate?: string;
  /** Full CMS batch range for booking deep-links */
  batchDates?: string;
};

/** Resolved hub course plus optional lodging tiers and room thumbs for the blog aside. */
export type BlogRailCourse = ResolvedYttHubCourse & {
  pricing: BlogRailPricingTier[];
  roomImages: string[];
  /** Earliest upcoming course start (shared across room cards) */
  fromDate?: string;
  /** Full CMS range for the fromDate batch */
  batchDates?: string;
};

type CourseEntityRow = {
  slug: string;
  type: "course" | "online";
  document: CourseDocument;
};

type UpcomingBatch = {
  fromDate: string;
  batchDates: string;
};

/**
 * Parses the start calendar date from a CMS batch range string.
 *
 * @param dates - e.g. "2nd Jul to 26th Jul 2026"
 */
export function parseBatchStartDate(dates: string): Date | null {
  const trimmed = dates.trim();
  if (!trimmed) return null;

  const startPart = trimmed.split(/\s+(?:to|–|—|-)\s+/i)[0]?.trim();
  if (!startPart) return null;

  let normalized = startPart.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  if (!/\b20\d{2}\b/.test(normalized)) {
    const yearMatch = trimmed.match(/\b(20\d{2})\b/);
    if (yearMatch?.[1]) normalized = `${normalized} ${yearMatch[1]}`;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats the start portion of a batch range for "From …" display.
 *
 * @param dates - Full CMS batch range
 */
function fromDateLabelFromBatch(dates: string): string {
  const startPart = dates.trim().split(/\s+(?:to|–|—|-)\s+/i)[0]?.trim();
  if (!startPart) return dates.trim();
  if (/\b20\d{2}\b/.test(startPart)) return startPart;
  const yearMatch = dates.match(/\b(20\d{2})\b/);
  return yearMatch?.[1] ? `${startPart} ${yearMatch[1]}` : startPart;
}

/**
 * Picks the earliest upcoming batch (or the soonest overall if all are past).
 *
 * @param batches - Page date batches from CMS
 */
export function earliestUpcomingBatch(
  batches: Array<Pick<PageDateBatchRecord, "dates">>,
): UpcomingBatch | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scored = batches
    .map((batch) => {
      const dates = batch.dates.trim();
      if (!dates) return null;
      const start = parseBatchStartDate(dates);
      if (!start) return null;
      return { dates, start };
    })
    .filter((row): row is { dates: string; start: Date } => row != null)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (scored.length === 0) return null;

  const upcoming =
    scored.find((row) => row.start.getTime() >= today.getTime()) ?? scored[0];

  return {
    fromDate: fromDateLabelFromBatch(upcoming.dates),
    batchDates: upcoming.dates,
  };
}

/**
 * Loads published course/online entity documents (no page_modules / residentialLife).
 *
 * @param slugs - Course page slugs
 */
async function loadCourseEntitiesBySlug(
  slugs: string[],
): Promise<Map<string, CourseEntityRow>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();

  const result = await requireDb(async () => {
    const pages = await db.page.findMany({
      where: {
        slug: { in: unique },
        type: { in: ["course", "online"] },
        published: true,
      },
      include: { courseDoc: true },
    });

    const map = new Map<string, CourseEntityRow>();
    for (const page of pages) {
      if (page.type !== "course" && page.type !== "online") continue;
      const document = page.courseDoc?.document;
      if (!document || typeof document !== "object") continue;
      const record = document as CourseDocument;
      if (typeof record.title !== "string") continue;
      map.set(page.slug, {
        slug: page.slug,
        type: page.type,
        document: {
          ...record,
          slug: typeof record.slug === "string" ? record.slug : page.slug,
        },
      });
    }
    return map;
  });

  return result.data;
}

/**
 * Builds pricing tiers from priced page room offers (all fees, not lodging-only).
 *
 * @param offers - Offers with non-empty price
 * @param upcoming - Shared upcoming batch for from-date / booking
 */
function pricingTiersFromOffers(
  offers: PageRoomOfferRecord[],
  upcoming: UpcomingBatch | null,
): BlogRailPricingTier[] {
  const tiers: BlogRailPricingTier[] = [];
  const seen = new Set<string>();
  for (const offer of offers) {
    const roomType = offer.roomName?.trim() || "";
    const price = offer.price.trim();
    if (!roomType || !price) continue;
    const key = `${roomType}::${price}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const originalPrice = offer.originalPrice.trim();
    const image = offer.roomImages
      ?.map((img) => img.url.trim())
      .find((url) => url && isAllowedMediaUrl(url));

    tiers.push({
      roomType,
      price,
      ...(originalPrice ? { originalPrice } : {}),
      ...(image ? { image } : {}),
      ...(upcoming?.fromDate ? { fromDate: upcoming.fromDate } : {}),
      ...(upcoming?.batchDates ? { batchDates: upcoming.batchDates } : {}),
    });
  }
  return tiers;
}

/**
 * Collects room gallery URLs from priced offers (room_images → media).
 *
 * @param offers - Offers with joined roomImages
 */
function roomImagesFromOffers(offers: PageRoomOfferRecord[]): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const offer of offers) {
    for (const image of offer.roomImages ?? []) {
      const url = image.url.trim();
      if (!url || !isAllowedMediaUrl(url) || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

/**
 * Maps an entity row + lodging offers into a blog rail course card.
 *
 * @param row - Course document
 * @param offers - Priced offers for this page (may be empty; includes non-lodging rooms)
 * @param batches - Date batches for from-date
 * @param descriptionOverride - Optional placement description
 */
function mapEntityToBlogRailCourse(
  row: CourseEntityRow,
  offers: PageRoomOfferRecord[],
  batches: PageDateBatchRecord[],
  descriptionOverride?: string,
): BlogRailCourse {
  const card = mapCourseDocumentToYttHubCard(
    row.document,
    row.type,
    descriptionOverride,
  );
  const upcoming = earliestUpcomingBatch(batches);
  const roomImages = roomImagesFromOffers(offers);
  const heroFallback = card.image?.trim();

  return {
    ...card,
    pricing: pricingTiersFromOffers(offers, upcoming),
    roomImages:
      roomImages.length > 0 ? roomImages : heroFallback ? [heroFallback] : [],
    ...(upcoming?.fromDate ? { fromDate: upcoming.fromDate } : {}),
    ...(upcoming?.batchDates ? { batchDates: upcoming.batchDates } : {}),
  };
}

/**
 * Loads all published course/online entity documents directly from the database.
 */
async function loadAllPublishedCourseEntities(): Promise<CourseEntityRow[]> {
  const result = await requireDb(async () => {
    const pages = await db.page.findMany({
      where: {
        type: { in: ["course", "online"] },
        published: true,
      },
      include: { courseDoc: true },
      orderBy: { createdAt: "asc" },
    });

    const rows: CourseEntityRow[] = [];
    for (const page of pages) {
      if (page.type !== "course" && page.type !== "online") continue;
      const document = page.courseDoc?.document;
      if (!document || typeof document !== "object") continue;
      const record = document as CourseDocument;
      if (typeof record.title !== "string" || !record.title.trim()) continue;
      rows.push({
        slug: page.slug,
        type: page.type,
        document: {
          ...record,
          slug: typeof record.slug === "string" ? record.slug : page.slug,
        },
      });
    }
    return rows;
  });

  return result.data ?? [];
}

/**
 * Loads priced offers + date batches for a set of page slugs.
 *
 * @param slugs - Course page slugs
 */
async function loadOffersAndBatches(slugs: string[]): Promise<{
  offersBySlug: Map<string, PageRoomOfferRecord[]>;
  batchesBySlug: Map<string, PageDateBatchRecord[]>;
}> {
  const [offersResult, batchesResult] = await Promise.all([
    getPricedRoomOffersByPageSlugs(slugs, { liveOnly: false }).catch(() => ({
      data: new Map<string, PageRoomOfferRecord[]>(),
    })),
    getDateBatchesByPageSlugs(slugs).catch(() => ({
      data: new Map<string, PageDateBatchRecord[]>(),
    })),
  ]);

  return {
    offersBySlug: offersResult.data ?? new Map(),
    batchesBySlug: batchesResult.data ?? new Map(),
  };
}

/**
 * Resolves blog rail cards with all priced room tiers (not lodging-gallery-only)
 * plus earliest upcoming from-date from `page_date_batches`.
 *
 * @param courses - Optional stored `yttHub.courses` placements
 */
export async function resolveBlogRailCourses(
  courses?: YttHubCourse[],
): Promise<BlogRailCourse[]> {
  const hasPlacements = Array.isArray(courses) && courses.length > 0;

  if (hasPlacements) {
    const slugs = courses.flatMap((course) => {
      const slug = placementCourseSlug(course);
      return slug ? [slug] : [];
    });

    if (slugs.length > 0) {
      const [entities, { offersBySlug, batchesBySlug }] = await Promise.all([
        loadCourseEntitiesBySlug(slugs),
        loadOffersAndBatches(slugs),
      ]);

      const resolved = courses.flatMap((course) => {
        const slug = placementCourseSlug(course);
        const placementDescription =
          "description" in course && typeof course.description === "string"
            ? course.description
            : undefined;

        if (slug) {
          const entity = entities.get(slug);
          if (entity) {
            return [
              mapEntityToBlogRailCourse(
                entity,
                offersBySlug.get(slug) ?? [],
                batchesBySlug.get(slug) ?? [],
                placementDescription,
              ),
            ];
          }
        }
        return [];
      });

      if (resolved.length > 0) {
        return resolved;
      }
    }
  }

  // Fallback: Load all published database courses directly
  const dbEntities = await loadAllPublishedCourseEntities().catch(() => []);
  if (dbEntities.length === 0) return [];

  const dbSlugs = dbEntities.map((e) => e.slug);
  const { offersBySlug, batchesBySlug } = await loadOffersAndBatches(dbSlugs);

  return dbEntities.map((entity) =>
    mapEntityToBlogRailCourse(
      entity,
      offersBySlug.get(entity.slug) ?? [],
      batchesBySlug.get(entity.slug) ?? [],
    ),
  );
}
