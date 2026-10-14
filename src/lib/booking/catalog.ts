import { getBatchDates } from "@/components/courses/upcomingDatesShared";
import {
  getPageDateBatches,
  getPageRoomOffers,
} from "@/content/repositories/lodging";
import {
  dateBatchesToPricingBatches,
  offersToPricingOptions,
  offersToRetreatPackages,
} from "@/content/repositories/lodging-sync";
import type { ResidentialCourseDocument } from "@/content/types";
import type { BookingProgram, BookingType } from "@/content/types/booking";
import type { RetreatDocument } from "@/content/types/retreat-page";
import { parseUsdAmount } from "@/lib/booking/pricing";
import { db, isDbEnabled } from "@/lib/db";

const BOOKABLE_RETREAT_SLUGS = new Set([
  "3-day-yoga-retreat-in-rishikesh-india",
  "5-day-yoga-retreat-in-rishikesh-india",
  "7-day-yoga-retreat-in-rishikesh-india",
]);

/**
 * Map a residential course document into a booking catalog entry.
 *
 * @param course - Course document from Neon Postgres
 * @param rooms - Optional offer-backed room fees
 * @param batchDates - Optional date batch strings
 */
function courseToBookingProgram(
  course: ResidentialCourseDocument,
  rooms?: BookingProgram["rooms"],
  batchDates?: string[],
): BookingProgram {
  return {
    slug: course.slug,
    title: course.title,
    duration: course.duration,
    rooms:
      rooms && rooms.length > 0
        ? rooms
        : course.pricing.map((option) => ({
            roomType: option.roomType,
            priceUsd: parseUsdAmount(option.price),
            originalPriceUsd: option.originalPrice
              ? parseUsdAmount(option.originalPrice)
              : undefined,
          })),
    batches:
      batchDates && batchDates.length > 0
        ? batchDates
        : getBatchDates(course.duration).map((batch) => batch.dates),
  };
}

/**
 * Map a retreat document into a booking catalog entry.
 *
 * @param retreat - Retreat document from Neon Postgres
 * @param rooms - Optional offer-backed room fees
 * @param batchDates - Optional date batch strings
 */
function retreatToBookingProgram(
  retreat: RetreatDocument,
  rooms?: BookingProgram["rooms"],
  batchDates?: string[],
): BookingProgram {
  return {
    slug: retreat.slug,
    title: retreat.title,
    duration: retreat.duration,
    rooms:
      rooms && rooms.length > 0
        ? rooms
        : retreat.packages.map((pkg) => ({
            roomType: pkg.title,
            priceUsd: parseUsdAmount(pkg.price),
            originalPriceUsd: pkg.originalPrice
              ? parseUsdAmount(pkg.originalPrice)
              : undefined,
          })),
    batches:
      batchDates && batchDates.length > 0
        ? batchDates
        : (retreat.dates?.map((date) => date.range) ?? []),
  };
}

/**
 * Loads live offers + date batches for a page into booking room/date shapes.
 *
 * @param pageId - Page id
 */
async function loadOfferRoomsAndBatches(pageId: string): Promise<{
  rooms: BookingProgram["rooms"];
  batches: string[];
}> {
  const [offersResult, batchesResult] = await Promise.all([
    getPageRoomOffers(pageId, true).catch(() => ({ data: [] })),
    getPageDateBatches(pageId).catch(() => ({ data: [] })),
  ]);
  const options = offersToPricingOptions(offersResult.data ?? []);
  const packages = offersToRetreatPackages(offersResult.data ?? []);
  const roomsFromOptions = options.map((option) => ({
    roomType: option.roomType,
    priceUsd: parseUsdAmount(option.price),
    originalPriceUsd: option.originalPrice
      ? parseUsdAmount(option.originalPrice)
      : undefined,
  }));
  const roomsFromPackages = packages.map((pkg) => ({
    roomType: pkg.title,
    priceUsd: parseUsdAmount(pkg.price),
    originalPriceUsd: pkg.originalPrice
      ? parseUsdAmount(pkg.originalPrice)
      : undefined,
  }));
  const pricingBatches = dateBatchesToPricingBatches(batchesResult.data ?? []);
  return {
    rooms: roomsFromOptions.length > 0 ? roomsFromOptions : roomsFromPackages,
    batches: pricingBatches.map((batch) => batch.dates).filter(Boolean),
  };
}

/**
 * Build residential course catalog for the booking form from Neon Postgres.
 * Prefers `page_room_offers` + `page_date_batches` when present.
 *
 * @returns Bookable course programs
 */
export async function getCourseBookingCatalog(): Promise<BookingProgram[]> {
  if (!isDbEnabled()) {
    throw new Error(
      "NEON_DB_POSTGRES_URL is required for the booking catalog.",
    );
  }

  const pages = await db.page.findMany({
    where: { type: "course", published: true },
    include: { courseDoc: true },
    orderBy: { title: "asc" },
  });

  const programs: BookingProgram[] = [];
  for (const page of pages) {
    const doc = page.courseDoc?.document;
    if (!doc || typeof doc !== "object") continue;
    const record = doc as Record<string, unknown>;
    if (
      typeof record.slug !== "string" ||
      typeof record.title !== "string" ||
      typeof record.duration !== "string" ||
      !Array.isArray(record.pricing)
    ) {
      continue;
    }
    const course = doc as ResidentialCourseDocument;
    const fromOffers = await loadOfferRoomsAndBatches(page.id);
    programs.push(
      courseToBookingProgram(course, fromOffers.rooms, fromOffers.batches),
    );
  }
  return programs;
}

/**
 * Build retreat catalog for the booking form from Neon Postgres.
 * Prefers `page_room_offers` + `page_date_batches` when present.
 *
 * @returns Bookable retreat programs
 */
export async function getRetreatBookingCatalog(): Promise<BookingProgram[]> {
  if (!isDbEnabled()) {
    throw new Error(
      "NEON_DB_POSTGRES_URL is required for the booking catalog.",
    );
  }

  const pages = await db.page.findMany({
    where: {
      type: "retreat",
      published: true,
      slug: { in: [...BOOKABLE_RETREAT_SLUGS] },
    },
    include: { courseDoc: true },
    orderBy: { title: "asc" },
  });

  const programs: BookingProgram[] = [];
  for (const page of pages) {
    const doc = page.courseDoc?.document;
    if (!doc || typeof doc !== "object") continue;
    const record = doc as Record<string, unknown>;
    if (
      typeof record.slug !== "string" ||
      typeof record.title !== "string" ||
      typeof record.duration !== "string" ||
      !Array.isArray(record.packages)
    ) {
      continue;
    }
    const retreat = doc as RetreatDocument;
    const fromOffers = await loadOfferRoomsAndBatches(page.id);
    programs.push(
      retreatToBookingProgram(retreat, fromOffers.rooms, fromOffers.batches),
    );
  }
  return programs;
}

/**
 * Resolve a single program from the catalog by slug and type.
 *
 * @param type - Course or retreat booking
 * @param slug - Program slug
 */
export async function getBookingProgram(
  type: BookingType,
  slug: string,
): Promise<BookingProgram | null> {
  const catalog =
    type === "course"
      ? await getCourseBookingCatalog()
      : await getRetreatBookingCatalog();
  return catalog.find((program) => program.slug === slug) ?? null;
}

/**
 * Build a pre-filled booking URL matching the live site query pattern.
 *
 * @param type - Course or retreat
 * @param slug - Program slug
 * @param roomType - Optional room pre-select
 * @param batchDate - Optional date pre-select
 */
export function buildBookingHref(
  type: BookingType,
  slug: string,
  roomType?: string,
  batchDate?: string,
): string {
  const base = type === "course" ? "/booking" : "/retreat-booking";
  const params = new URLSearchParams({ course: slug });
  if (roomType) params.set("room", roomType);
  if (batchDate) params.set("date", batchDate);
  return `${base}?${params.toString()}`;
}
