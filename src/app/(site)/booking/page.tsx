import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking";
import { getBookingPageContent } from "@/content/repositories/dedicated-pages";
import { getCourseBookingCatalog } from "@/lib/booking/catalog";
import { getPayPalClientId } from "@/lib/payments/paypal";
import { mergePageMetadata } from "../_shared/metadata";

/**
 * Booking page SEO from CMS meta, with static fallbacks when fields are empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getBookingPageContent().catch(() => null);
  return mergePageMetadata(
    {
      title: "Book Yoga Teacher Training | Nirvana Yoga School",
      description:
        "Reserve your residential yoga teacher training in Rishikesh. Pay 20% deposit or full fee securely via PayPal.",
    },
    result?.data?.meta,
  );
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
  const [programs, contentResult] = await Promise.all([
    getCourseBookingCatalog(),
    getBookingPageContent().catch(() => null),
  ]);

  return (
    <BookingFlow
      type="course"
      programs={programs}
      content={contentResult?.data}
      paypalClientId={getPayPalClientId()}
      initialProgramSlug={params.course ?? ""}
      initialRoomType={params.room ?? ""}
      initialBatchDate={params.date ?? ""}
    />
  );
}
