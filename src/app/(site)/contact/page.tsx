import type { Metadata } from "next";
import { getContactPageContent } from "@/content/repositories/dedicated-pages";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { mergePageMetadata } from "../_shared/metadata";
import ContactPageClient from "./ContactPageClient";

/**
 * Contact page SEO from CMS meta, with static fallbacks when fields are empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getContactPageContent().catch(() => null);
  return mergePageMetadata(
    {
      title: "Contact Us | Nirvana Yoga School Rishikesh India",
      description:
        "Reach out to Nirvana Yoga School in Rishikesh, India. Get in touch with our ashram team to ask about residential yoga teacher training, retreats, and airport taxi transfers.",
    },
    result?.data?.meta,
  );
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
