import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking";
import { getRetreatBookingCatalog } from "@/lib/booking/catalog";
import { getPayPalClientId } from "@/lib/payments/paypal";

export const metadata: Metadata = {
  title: "Retreat Booking | Nirvana Yoga School",
  description:
    "Book your yoga retreat in Rishikesh. Select dates and accommodation, then pay your 20% deposit via PayPal.",
};

type RetreatBookingPageProps = {
  searchParams: Promise<{
    course?: string;
    room?: string;
    date?: string;
  }>;
};

/**
 * Retreat booking page — mirrors live site /retreat-booking flow.
 */
export default async function RetreatBookingPage({
  searchParams,
}: RetreatBookingPageProps) {
  const params = await searchParams;
  const programs = await getRetreatBookingCatalog();

  return (
    <BookingFlow
      type="retreat"
      programs={programs}
      paypalClientId={getPayPalClientId()}
      initialProgramSlug={params.course ?? ""}
      initialRoomType={params.room ?? ""}
      initialBatchDate={params.date ?? ""}
    />
  );
}
