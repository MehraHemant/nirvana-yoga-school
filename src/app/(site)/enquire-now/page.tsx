import type { Metadata } from "next";
import { getEnquirePageContent } from "@/content/repositories/dedicated-pages";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { buildEnquireProgramOptions } from "@/lib/enquire-programs.server";
import { metadataForSlug } from "../_shared/metadata";
import EnquireNowPageClient from "./EnquireNowPageClient";

/**
 * Enquire page SEO from CMS meta only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getEnquirePageContent().catch(() => null);
  return metadataForSlug("enquire-now", result?.data?.meta);
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
  const [result, siteMapResult, programOptions] = await Promise.all([
    getEnquirePageContent().catch(() => null),
    getSiteMap().catch(() => null),
    buildEnquireProgramOptions(),
  ]);

  return (
    <EnquireNowPageClient
      initialProgram={params.program ?? ""}
      initialAccommodation={params.accommodation ?? ""}
      content={result?.data}
      siteMap={siteMapResult?.data ?? null}
      programOptions={programOptions}
    />
  );
}
