import { getBatchDates } from "@/components/courses/upcomingDatesShared";
import retreatsJson from "@/content/data/retreats/retreats.json";
import type { BookingProgram, BookingType } from "@/content/types/booking";
import { COURSES_DATA } from "@/data/coursesData";
import { parseUsdAmount } from "@/lib/booking/pricing";

const RETREAT_SLUGS = [
  "3-day-yoga-retreat-in-rishikesh-india",
  "5-day-yoga-retreat-in-rishikesh-india",
  "7-day-yoga-retreat-in-rishikesh-india",
] as const;

/**
 * Build residential course catalog for the booking form.
 */
export function getCourseBookingCatalog(): BookingProgram[] {
  return Object.values(COURSES_DATA).map((course) => ({
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
  }));
}

/**
 * Build retreat catalog for the booking form.
 */
export function getRetreatBookingCatalog(): BookingProgram[] {
  return retreatsJson.retreats
    .filter((retreat) =>
      (RETREAT_SLUGS as readonly string[]).includes(retreat.slug),
    )
    .map((retreat) => ({
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
    }));
}

/**
 * Resolve a single program from the catalog by slug and type.
 *
 * @param type - Course or retreat booking
 * @param slug - Program slug
 */
export function getBookingProgram(
  type: BookingType,
  slug: string,
): BookingProgram | null {
  const catalog =
    type === "course" ? getCourseBookingCatalog() : getRetreatBookingCatalog();
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
