import type { Metadata } from "next";
import {
  getHomepageSeo,
  getPageSeo,
  getPageSeoContext,
  HOME_PAGE_SLUG,
} from "@/content/repositories/page-seo";
import type { PageSeoMeta } from "@/content/types/page-seo";
import { publicPathForPage } from "@/lib/cms/cache";
import { mergePageSeo } from "@/lib/cms/page-seo-utils";
import {
  clampDescription,
  isSizedSocialImage,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  socialImageUrl,
} from "@/lib/seo/site";

/** Options that shape canonical URLs and Open Graph for one page. */
export type PageMetadataOptions = {
  /** Public path (e.g. `/course/200-hour-…`). Sets canonical + og:url. */
  path?: string;
  /** Open Graph type (default `website`). */
  ogType?: "website" | "article";
  /** Article publish time (ISO) when `ogType` is `article`. */
  publishedTime?: string | null;
  /** Article modified time (ISO). */
  modifiedTime?: string | null;
  /** Article section / category. */
  section?: string;
  /**
   * When true, `legacyMeta` is the only page source (no `pages` / `page_seo`
   * lookup by slug). Used for blog posts, whose slugs live in `blog_posts`.
   */
  standalone?: boolean;
};

/**
 * Builds Next.js metadata from resolved page SEO fields.
 *
 * Open Graph is emitted in full on every page because Next.js replaces (not
 * merges) the parent `openGraph` object. Titles that already contain the brand
 * name opt out of the root `%s · Nirvana Yoga School` template.
 *
 * @param meta - Resolved page SEO
 * @param options - Canonical path and Open Graph type
 */
export function metadataFromPageSeo(
  meta?: PageSeoMeta | null,
  options: PageMetadataOptions = {},
): Metadata {
  const title = meta?.title?.trim();
  const description = meta?.description?.trim()
    ? clampDescription(meta.description)
    : undefined;
  const rawImage = meta?.ogImage?.trim();
  const keywords = meta?.keywords?.trim();
  const { path } = options;

  const branded = title
    ? title.toLowerCase().includes(SITE_NAME.toLowerCase())
    : false;
  const socialTitle = title
    ? branded
      ? title
      : `${title} · ${SITE_NAME}`
    : undefined;
  const image = rawImage ? socialImageUrl(rawImage) : undefined;
  const ogImages = image
    ? [
        {
          url: image,
          ...(isSizedSocialImage(image)
            ? { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }
            : {}),
          alt: title ?? SITE_NAME,
        },
      ]
    : undefined;

  const isArticle = options.ogType === "article";

  return {
    ...(title ? { title: branded ? { absolute: title } : title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(meta?.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_US",
      ...(path ? { url: path } : {}),
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      ...(ogImages ? { images: ogImages } : {}),
      ...(isArticle
        ? {
            type: "article" as const,
            ...(options.publishedTime
              ? { publishedTime: options.publishedTime }
              : {}),
            ...(options.modifiedTime
              ? { modifiedTime: options.modifiedTime }
              : {}),
            ...(options.section ? { section: options.section } : {}),
            authors: [SITE_NAME],
          }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Resolves page SEO for a slug and builds metadata.
 *
 * Fallback order per field: `page_seo` row → legacy JSON meta → the page's
 * own title / description / image → homepage SEO (image only, so pages never
 * share the homepage title or description).
 *
 * @param slug - Page slug
 * @param legacyMeta - Optional JSON meta (backward compat), or explicit meta for non-page routes such as blog posts
 * @param options - Canonical path / Open Graph overrides
 */
export async function metadataForSlug(
  slug: string,
  legacyMeta?: PageSeoMeta | null,
  options: PageMetadataOptions = {},
): Promise<Metadata> {
  const [dbMeta, context, homeMeta] = await Promise.all([
    options.standalone ? null : getPageSeo(slug).catch(() => null),
    options.standalone ? null : getPageSeoContext(slug),
    slug === HOME_PAGE_SLUG
      ? Promise.resolve(null)
      : getHomepageSeo().catch(() => null),
  ]);

  const pageFallback: PageSeoMeta | null = context
    ? {
        title: context.title || undefined,
        description: context.description || undefined,
        ogImage: context.image || undefined,
      }
    : null;

  let meta = mergePageSeo(mergePageSeo(dbMeta, legacyMeta), pageFallback);
  if (!meta?.ogImage && homeMeta?.ogImage) {
    meta = { ...meta, ogImage: homeMeta.ogImage };
  }

  const path =
    options.path ??
    (context ? publicPathForPage(slug, context.type) : `/${slug}`);

  return metadataFromPageSeo(meta, { ...options, path });
}
