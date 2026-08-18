import type { Metadata } from "next";
import { getContactPageContent } from "@/content/repositories/dedicated-pages";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { metadataForSlug } from "../_shared/metadata";
import ContactPageClient from "./ContactPageClient";

/**
 * Contact page SEO from CMS meta only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getContactPageContent().catch(() => null);
  return metadataForSlug("contact", result?.data?.meta);
}

/**
 * Contact page — loads CMS content_data and shared map for the location band.
 */
export default async function ContactPage() {
  const [result, siteMapResult] = await Promise.all([
    getContactPageContent().catch(() => null),
    getSiteMap().catch(() => null),
  ]);

  return (
    <ContactPageClient
      content={result?.data}
      siteMap={siteMapResult?.data ?? null}
    />
  );
}
