import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking";
import { getSitePage } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { getBookingAddons } from "@/content/repositories/shared-sections";
import { getRetreatBookingCatalog } from "@/lib/booking/catalog";
import { getPayPalClientId } from "@/lib/payments/paypal";
import { metadataFromPageSeo } from "../_shared/metadata";

/**
 * Retreat booking SEO from CMS modules/page meta only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [modulesResult, pageResult] = await Promise.all([
    getPageModules("retreat-booking").catch(() => null),
    getSitePage("retreat-booking").catch(() => null),
  ]);
  return metadataFromPageSeo(
    modulesResult?.data?.meta ?? pageResult?.data?.meta,
  );
}

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
  const [programs, addonsResult] = await Promise.all([
    getRetreatBookingCatalog(),
    getBookingAddons().catch(() => null),
  ]);

  return (
    <BookingFlow
      type="retreat"
      programs={programs}
      addons={addonsResult?.data ?? null}
      paypalClientId={getPayPalClientId()}
      initialProgramSlug={params.course ?? ""}
      initialRoomType={params.room ?? ""}
      initialBatchDate={params.date ?? ""}
    />
  );
}
