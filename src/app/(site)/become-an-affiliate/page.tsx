import type { Metadata } from "next";
import {
  AFFILIATE_SLUG,
  getAffiliatePageContent,
} from "@/content/repositories/dedicated-pages";
import { getSiteConfig } from "@/content/repositories/global-settings";
import { getReviews } from "@/content/repositories/shared-sections";
import { metadataForSlug } from "../_shared/metadata";
import AffiliatePageClient from "./AffiliatePageClient";

/**
 * Affiliate programme SEO from CMS meta.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getAffiliatePageContent().catch(() => null);
  return metadataForSlug(AFFILIATE_SLUG, result?.data?.meta);
}

/**
 * Become-an-affiliate page — CMS content_data plus shared reviews.
 */
export default async function BecomeAnAffiliatePage() {
  const [result, reviewsResult, siteConfigResult] = await Promise.all([
    getAffiliatePageContent().catch(() => null),
    getReviews().catch(() => null),
    getSiteConfig().catch(() => null),
  ]);

  return (
    <AffiliatePageClient
      content={result?.data}
      reviews={reviewsResult?.data ?? null}
      siteConfig={siteConfigResult?.data ?? null}
    />
  );
}
