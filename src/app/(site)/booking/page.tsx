import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking";
import { getBookingPageContent } from "@/content/repositories/dedicated-pages";
import { getBookingAddons } from "@/content/repositories/shared-sections";
import { getCourseBookingCatalog } from "@/lib/booking/catalog";
import { getPayPalClientId } from "@/lib/payments/paypal";
import { metadataForSlug } from "../_shared/metadata";

/**
 * Booking page SEO from CMS meta only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getBookingPageContent().catch(() => null);
  return metadataForSlug("booking", result?.data?.meta);
}

type BookingPageProps = {
  searchParams: Promise<{
    course?: string;
    room?: string;
    date?: string;
  }>;
};

/**
 * Residential course booking page — mirrors live site /booking flow.
 */
export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const [programs, contentResult, addonsResult] = await Promise.all([
    getCourseBookingCatalog(),
    getBookingPageContent().catch(() => null),
    getBookingAddons().catch(() => null),
  ]);

  return (
    <BookingFlow
      type="course"
      programs={programs}
      content={contentResult?.data}
      addons={addonsResult?.data ?? null}
      paypalClientId={getPayPalClientId()}
      initialProgramSlug={params.course ?? ""}
      initialRoomType={params.room ?? ""}
      initialBatchDate={params.date ?? ""}
    />
  );
}
