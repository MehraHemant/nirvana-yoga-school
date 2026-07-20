import type { Metadata } from "next";
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
 * @deprecated Prefer {@link metadataFromPageSeo}. Kept for any remaining callers.
 *
 * @param fallback - Ignored product/page fallbacks (CMS-only policy)
 * @param meta - Optional CMS page SEO
 */
export function mergePageMetadata(
  _fallback: { title?: string; description?: string; image?: string },
  meta?: PageSeoMeta | null,
): Metadata {
  return metadataFromPageSeo(meta);
}

/**
 * Classic product metadata helper — maps fields into CMS SEO shape.
 *
 * @param title - Page title
 * @param description - Meta description
 * @param image - OG image URL
 */
export function courseMetadata(
  title: string,
  description: string,
  image: string,
): Metadata {
  return metadataFromPageSeo({
    title,
    description,
    ogImage: image,
  });
}
