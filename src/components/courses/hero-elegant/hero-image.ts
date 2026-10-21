import {
  PHOTO_IMAGE_QUALITY,
  responsiveImageAttrs,
} from "@/lib/cdn/responsive-image";

/**
 * Shared hero image config. No `"use client"` so the server page can build the
 * same LCP preload `srcset` the client stage renders.
 */

/** Next/Image quality for hero photos (maps to Cloudinary `q_auto:best`). */
export const HERO_IMAGE_QUALITY = PHOTO_IMAGE_QUALITY;

/** `sizes` for the Gallery Feature main stage. */
export const HERO_STAGE_SIZES = "(max-width: 768px) 100vw, min(75vw, 1100px)";

/**
 * Responsive `src` / `srcSet` / `sizes` for a hero main-stage photo — used for
 * the head preload and for warming neighbouring photos.
 *
 * @param url - Original CMS image URL
 * @param sizes - `sizes` attribute matching the rendered stage
 */
export function heroStageImageProps(url: string, sizes = HERO_STAGE_SIZES) {
  const attrs = responsiveImageAttrs(url, sizes, HERO_IMAGE_QUALITY);
  if (!attrs) return { src: url, srcSet: undefined, sizes };
  return attrs;
}
