import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking";
import { getCourseBookingCatalog } from "@/lib/booking/catalog";
import { getPayPalClientId } from "@/lib/payments/paypal";

export const metadata: Metadata = {
  title: "Book Yoga Teacher Training | Nirvana Yoga School",
  description:
    "Reserve your residential yoga teacher training in Rishikesh. Pay 20% deposit or full fee securely via PayPal.",
};

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
  const programs = await getCourseBookingCatalog();

  return (
    <BookingFlow
      type="course"
      programs={programs}
      paypalClientId={getPayPalClientId()}
      initialProgramSlug={params.course ?? ""}
      initialRoomType={params.room ?? ""}
      initialBatchDate={params.date ?? ""}
    />
  );
}
