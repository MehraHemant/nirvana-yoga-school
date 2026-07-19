import { getBatchDates } from "@/components/courses/upcomingDatesShared";
import type { ResidentialCourseDocument } from "@/content/types";
import type { BookingProgram, BookingType } from "@/content/types/booking";
import type { RetreatDocument } from "@/content/types/retreat-page";
import { parseUsdAmount } from "@/lib/booking/pricing";
import { isDbEnabled, db } from "@/lib/db";

const BOOKABLE_RETREAT_SLUGS = new Set([
  "3-day-yoga-retreat-in-rishikesh-india",
  "5-day-yoga-retreat-in-rishikesh-india",
  "7-day-yoga-retreat-in-rishikesh-india",
]);

/**
 * Map a residential course document into a booking catalog entry.
 *
 * @param course - Course document from Neon Postgres
 */
function courseToBookingProgram(
  course: ResidentialCourseDocument,
): BookingProgram {
  return {
    slug: course.slug,
    title: course.title,
    duration: course.duration,
    rooms: course.pricing.map((option) => ({
      roomType: option.roomType,
      priceUsd: parseUsdAmount(option.price),
      originalPriceUsd: option.originalPrice
        ? parseUsdAmount(option.originalPrice)
        : undefined,
    })),
    batches: getBatchDates(course.duration).map((batch) => batch.dates),
  };
}

/**
 * Map a retreat document into a booking catalog entry.
 *
 * @param retreat - Retreat document from Neon Postgres
 */
function retreatToBookingProgram(retreat: RetreatDocument): BookingProgram {
  return {
    slug: retreat.slug,
    title: retreat.title,
    duration: retreat.duration,
    rooms: retreat.packages.map((pkg) => ({
      roomType: pkg.title,
      priceUsd: parseUsdAmount(pkg.price),
      originalPriceUsd: pkg.originalPrice
        ? parseUsdAmount(pkg.originalPrice)
        : undefined,
    })),
    batches: retreat.dates?.map((date) => date.range) ?? [],
  };
}

/**
 * Build residential course catalog for the booking form from Neon Postgres.
 *
 * @returns Bookable course programs
 */
export async function getCourseBookingCatalog(): Promise<BookingProgram[]> {
  if (!isDbEnabled()) {
    throw new Error("NEON_DB_URL is required for the booking catalog.");
  }

  const pages = await db.page.findMany({
    where: { type: "course", published: true },
    include: { courseDoc: true },
    orderBy: { title: "asc" },
  });

  return pages
    .map((page) => page.courseDoc?.document)
    .filter((doc): doc is ResidentialCourseDocument => {
      if (!doc || typeof doc !== "object") return false;
      const record = doc as Record<string, unknown>;
      return (
        typeof record.slug === "string" &&
        typeof record.title === "string" &&
        typeof record.duration === "string" &&
        Array.isArray(record.pricing)
      );
    })
    .map(courseToBookingProgram);
}

/**
 * Build retreat catalog for the booking form from Neon Postgres.
 *
 * @returns Bookable retreat programs
 */
export async function getRetreatBookingCatalog(): Promise<BookingProgram[]> {
  if (!isDbEnabled()) {
    throw new Error("NEON_DB_URL is required for the booking catalog.");
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

  return pages
    .map((page) => page.courseDoc?.document)
    .filter((doc): doc is RetreatDocument => {
      if (!doc || typeof doc !== "object") return false;
      const record = doc as Record<string, unknown>;
      return (
        typeof record.slug === "string" &&
        typeof record.title === "string" &&
        typeof record.duration === "string" &&
        Array.isArray(record.packages)
      );
    })
    .map(retreatToBookingProgram);
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
