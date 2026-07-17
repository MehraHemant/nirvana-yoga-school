import type { Metadata } from "next";
import { getEnquirePageContent } from "@/content/repositories/dedicated-pages";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { mergePageMetadata } from "../_shared/metadata";
import EnquireNowPageClient from "./EnquireNowPageClient";

/**
 * Enquire page SEO from CMS meta, with static fallbacks when fields are empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getEnquirePageContent().catch(() => null);
  return mergePageMetadata(
    {
      title: "Enquire Now | Nirvana Yoga School Rishikesh India",
      description:
        "Submit an enquiry for residential yoga teacher training, online courses, or yoga retreats at Nirvana Yoga School in Rishikesh. Our ashram team replies within 24 hours.",
    },
    result?.data?.meta,
  );
}

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
  const [result, siteMapResult] = await Promise.all([
    getEnquirePageContent().catch(() => null),
    getSiteMap().catch(() => null),
  ]);

  return (
    <EnquireNowPageClient
      initialProgram={params.program ?? ""}
      initialAccommodation={params.accommodation ?? ""}
      content={result?.data}
      siteMap={siteMapResult?.data ?? null}
    />
  );
}
