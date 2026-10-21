import { getImageProps } from "next/image";

/** Next/Image quality for photography. The loader maps this to `q_auto:best`. */
export const PHOTO_IMAGE_QUALITY = 85;

/** Full-bleed hero posters. */
export const HERO_POSTER_SIZES = "100vw";

/** Mobile hero poster media query. Kept in sync with the desktop query below. */
export const HERO_POSTER_MOBILE_MEDIA = "(max-width: 767px)";

/** Desktop hero poster media query. */
export const HERO_POSTER_DESKTOP_MEDIA = "(min-width: 768px)";

/** Homepage and venue masonry: 2 columns, then 4, then 5. */
export const MASONRY_TILE_SIZES =
  "(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 20vw";

/** Course and retreat room gallery stage. */
export const ACCOMMODATION_STAGE_SIZES = "(max-width: 1024px) 100vw, 45vw";

export type ResponsiveImageAttrs = {
  src: string;
  srcSet: string | undefined;
  sizes: string;
};

export type ResponsiveImageRequest = {
  /** Original image URL */
  src: string;
  /** CSS sizes matching the rendered box */
  sizes: string;
  /** Next/Image quality. Omit to use {@link PHOTO_IMAGE_QUALITY}. */
  quality?: number;
};

/**
 * Builds the same `src` / `srcSet` / `sizes` `next/image` will request.
 * Shared by the document-head preload and by scroll prefetch so both hit one CDN URL.
 *
 * @param src - Original image URL
 * @param sizes - CSS `sizes` matching the rendered box
 * @param quality - Next/Image quality (default {@link PHOTO_IMAGE_QUALITY})
 */
export function responsiveImageAttrs(
  src: string,
  sizes = HERO_POSTER_SIZES,
  quality = PHOTO_IMAGE_QUALITY,
): ResponsiveImageAttrs | null {
  const trimmed = src.trim();
  if (!trimmed) return null;

  const { props } = getImageProps({
    src: trimmed,
    alt: "",
    fill: true,
    sizes,
    quality,
  });

  return {
    src: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes ?? sizes,
  };
}
