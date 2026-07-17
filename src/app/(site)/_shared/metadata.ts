import type { Metadata } from "next";
import type { PageSeoMeta } from "@/content/types/page-seo";

/**
 * Builds Next.js metadata from optional CMS page SEO fields.
 * Empty fields fall through to root layout / site-config defaults.
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
 * Merges product/page fallback fields with optional CMS `meta` overrides.
 * CMS `meta` wins per field when set; otherwise falls back to product/page values.
 *
 * @param fallback - Title / description / image from the product or page doc
 * @param meta - Optional CMS page SEO
 */
export function mergePageMetadata(
  fallback: { title?: string; description?: string; image?: string },
  meta?: PageSeoMeta | null,
): Metadata {
  const title = meta?.title?.trim() || fallback.title?.trim() || "";
  const description =
    meta?.description?.trim() || fallback.description?.trim() || "";
  const image = meta?.ogImage?.trim() || fallback.image?.trim() || "";
  const keywords = meta?.keywords?.trim();

  if (!title && !description && !image && !keywords && !meta?.noIndex) {
    return {};
  }

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    ...(meta?.noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(title || description || image
      ? {
          openGraph: {
            ...(title ? { title: `${title} | Nirvana Yoga School` } : {}),
            ...(description ? { description } : {}),
            ...(image
              ? {
                  images: [
                    { url: image, width: 1200, height: 630, alt: title },
                  ],
                }
              : {}),
          },
        }
      : {}),
  };
}

/**
 * Classic product metadata helper (title + description + OG image).
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
  return mergePageMetadata({ title, description, image });
}
