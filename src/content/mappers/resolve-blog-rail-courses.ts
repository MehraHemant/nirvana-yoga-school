import { requireDb } from "@/content/repositories/db-fallback";
import {
  getLivePricedRoomOffersByPageSlugs,
  isAllowedMediaUrl,
} from "@/content/repositories/lodging";
import type { CourseDocument } from "@/content/types/course";
import type { PageRoomOfferRecord } from "@/content/types/lodging";
import type {
  ResolvedYttHubCourse,
  YttHubCourse,
} from "@/content/types/shared-sections";
import { db } from "@/lib/db";
import {
  isYttHubCourseEmbedded,
  mapCourseDocumentToYttHubCard,
  mapEmbeddedYttHubCourse,
  placementCourseSlug,
} from "./ytt-hub-courses";

/** Accommodation tier shown in the blog programs rail. */
export type BlogRailPricingTier = {
  roomType: string;
  price: string;
  originalPrice?: string;
};

/** Resolved hub course plus optional lodging tiers and room thumbs for the blog aside. */
export type BlogRailCourse = ResolvedYttHubCourse & {
  pricing: BlogRailPricingTier[];
  roomImages: string[];
};

type CourseEntityRow = {
  slug: string;
  type: "course" | "online";
  document: CourseDocument;
};

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
 * Builds pricing tiers from live, priced page room offers.
 *
 * @param offers - Offers already filtered to live + non-empty price
 */
function pricingTiersFromOffers(
  offers: PageRoomOfferRecord[],
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
    tiers.push({
      roomType,
      price,
      ...(originalPrice ? { originalPrice } : {}),
    });
  }
  return tiers;
}

/**
 * Collects room gallery URLs from live priced offers (room_images → media).
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
 * @param offers - Live priced offers for this page (may be empty)
 * @param descriptionOverride - Optional placement description
 */
function mapEntityToBlogRailCourse(
  row: CourseEntityRow,
  offers: PageRoomOfferRecord[],
  descriptionOverride?: string,
): BlogRailCourse {
  const card = mapCourseDocumentToYttHubCard(
    row.document,
    row.type,
    descriptionOverride,
  );
  const roomImages = roomImagesFromOffers(offers);
  const heroFallback = card.image?.trim();

  return {
    ...card,
    pricing: pricingTiersFromOffers(offers),
    roomImages:
      roomImages.length > 0 ? roomImages : heroFallback ? [heroFallback] : [],
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
 * Resolves blog rail cards with lodging tiers and room images exclusively from database entities.
 * Courses come from database pages/documents; lodging is enriched via live room offers JOIN.
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
      const [entities, offersResult] = await Promise.all([
        loadCourseEntitiesBySlug(slugs),
        getLivePricedRoomOffersByPageSlugs(slugs).catch(() => ({
          data: new Map<string, PageRoomOfferRecord[]>(),
        })),
      ]);
      const offersBySlug = offersResult.data ?? new Map();

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
  const offersResult = await getLivePricedRoomOffersByPageSlugs(dbSlugs).catch(
    () => ({ data: new Map<string, PageRoomOfferRecord[]>() }),
  );
  const offersBySlug = offersResult.data ?? new Map();

  return dbEntities.map((entity) =>
    mapEntityToBlogRailCourse(entity, offersBySlug.get(entity.slug) ?? []),
  );
}
