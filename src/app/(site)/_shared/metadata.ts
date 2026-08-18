import type { Metadata } from "next";
import { resolvePageSeo } from "@/content/repositories/page-seo";
import type { PageSeoMeta } from "@/content/types/page-seo";

/**
 * Builds Next.js metadata from CMS page SEO fields only.
 * Empty / missing fields fall through to root layout site-config defaults.
 *
 * @param meta - Optional page SEO edited in admin
 */
export function metadataFromPageSeo(meta?: PageSeoMeta | null): Metadata {
  if (!meta) return {};

  const title = meta.title?.trim();
  const description = meta.description?.trim();
  const ogImage = meta.ogImage?.trim();
  const keywords = meta.keywords?.trim();

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    ...(meta.noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(title || description || ogImage
      ? {
          openGraph: {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            ...(ogImage ? { images: [{ url: ogImage }] } : {}),
          },
          twitter: {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            ...(ogImage ? { images: [ogImage] } : {}),
          },
        }
      : {}),
  };
}

/**
 * Resolves page SEO from Postgres (with homepage defaults) and builds metadata.
 *
 * @param slug - Page slug
 * @param legacyMeta - Optional JSON meta for backward compatibility
 */
export async function metadataForSlug(
  slug: string,
  legacyMeta?: PageSeoMeta | null,
): Promise<Metadata> {
  const resolved = await resolvePageSeo(slug, legacyMeta);
  return metadataFromPageSeo(resolved);
}
