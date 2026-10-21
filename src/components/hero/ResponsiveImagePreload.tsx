import {
  HERO_POSTER_DESKTOP_MEDIA,
  HERO_POSTER_MOBILE_MEDIA,
  HERO_POSTER_SIZES,
  responsiveImageAttrs,
} from "@/lib/cdn/responsive-image";

type ResponsiveImagePreloadProps = {
  /** Original image URL */
  src: string;
  /** Media query so only the matching poster preloads */
  media?: string;
  /** CSS sizes matching the painted image */
  sizes?: string;
};

/**
 * Preloads one responsive image with the same srcset `next/image` will request.
 *
 * @param props - Source URL, optional media query, and sizes
 */
export function ResponsiveImagePreload({
  src,
  media,
  sizes = HERO_POSTER_SIZES,
}: ResponsiveImagePreloadProps) {
  const attrs = responsiveImageAttrs(src, sizes);
  if (!attrs?.src) return null;

  return (
    <link
      rel="preload"
      as="image"
      href={attrs.src}
      imageSrcSet={attrs.srcSet}
      imageSizes={attrs.sizes}
      media={media}
      fetchPriority="high"
    />
  );
}

type HeroPosterPreloadsProps = {
  /** Poster used at phone widths. Skipped when empty. */
  mobileSrc?: string;
  /** Poster used from 768px up. Skipped when empty. */
  desktopSrc?: string;
};

/**
 * Preloads the mobile and desktop hero posters with non-overlapping media queries.
 *
 * @param props - Raw poster URLs from CMS
 */
export function HeroPosterPreloads({
  mobileSrc,
  desktopSrc,
}: HeroPosterPreloadsProps) {
  return (
    <>
      {mobileSrc?.trim() ? (
        <ResponsiveImagePreload
          src={mobileSrc}
          media={HERO_POSTER_MOBILE_MEDIA}
        />
      ) : null}
      {desktopSrc?.trim() ? (
        <ResponsiveImagePreload
          src={desktopSrc}
          media={HERO_POSTER_DESKTOP_MEDIA}
        />
      ) : null}
    </>
  );
}
