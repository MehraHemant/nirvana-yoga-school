import type { Metadata } from "next";
import EnquireNowPageClient from "./EnquireNowPageClient";

export const metadata: Metadata = {
  title: "Enquire Now | Nirvana Yoga School Rishikesh India",
  description:
    "Submit an enquiry for residential yoga teacher training, online courses, or yoga retreats at Nirvana Yoga School in Rishikesh. Our ashram team replies within 24 hours.",
};

type EnquireNowPageProps = {
  searchParams: Promise<{
    program?: string;
    accommodation?: string;
  }>;
};

/**
 * Dedicated enquiry page — pre-fills program from `?program=` when linked from course CTAs.
 */
export default async function EnquireNowPage({
  searchParams,
}: EnquireNowPageProps) {
  const params = await searchParams;

  return (
    <EnquireNowPageClient
      initialProgram={params.program ?? ""}
      initialAccommodation={params.accommodation ?? ""}
    />
  );
}
