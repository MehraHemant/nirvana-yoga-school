import {
  PHOTO_IMAGE_QUALITY,
  type ResponsiveImageRequest,
  responsiveImageAttrs,
} from "./responsive-image";

/**
 * Warms one responsive image in the HTTP cache using the same URL as `next/image`.
 *
 * @param src - Original image URL
 * @param sizes - CSS `sizes` matching the rendered box
 * @param quality - Next/Image quality (default {@link PHOTO_IMAGE_QUALITY})
 */
export function prefetchResponsiveImage(
  src: string,
  sizes: string,
  quality = PHOTO_IMAGE_QUALITY,
): void {
  if (typeof window === "undefined") return;
  const attrs = responsiveImageAttrs(src, sizes, quality);
  if (!attrs) return;

  const prefetched = new window.Image();
  prefetched.decoding = "async";
  prefetched.sizes = attrs.sizes;
  if (attrs.srcSet) prefetched.srcset = attrs.srcSet;
  prefetched.src = attrs.src;
}

/**
 * Warms the first `limit` images, skipping empty or repeated URLs.
 *
 * @param images - Candidates in priority order
 * @param limit - Maximum images to start
 */
export function prefetchResponsiveImages(
  images: ResponsiveImageRequest[],
  limit: number,
): void {
  const seen = new Set<string>();
  let started = 0;

  for (const image of images) {
    if (started >= limit) return;
    const src = image.src.trim();
    if (!src || seen.has(`${src}|${image.sizes}`)) continue;
    seen.add(`${src}|${image.sizes}`);
    started += 1;
    prefetchResponsiveImage(image.src, image.sizes, image.quality);
  }
}
