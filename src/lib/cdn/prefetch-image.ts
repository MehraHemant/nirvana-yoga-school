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
 * @param loader - Optional loader so the warmed URL matches a cropped tile
 */
export function prefetchResponsiveImage(
  src: string,
  sizes: string,
  quality = PHOTO_IMAGE_QUALITY,
  loader?: ResponsiveImageRequest["loader"],
): void {
  void preloadResponsiveImage(src, sizes, quality, loader);
}

/**
 * Loads the same URL `next/image` will paint and resolves when it can decode.
 *
 * @param src - Original image URL
 * @param sizes - CSS `sizes` matching the rendered box
 * @param quality - Next/Image quality (default {@link PHOTO_IMAGE_QUALITY})
 * @param loader - Optional loader so the warmed URL matches a cropped tile
 * @param priority - `high` for the next photos on screen; `low` for background warming
 */
export function preloadResponsiveImage(
  src: string,
  sizes: string,
  quality = PHOTO_IMAGE_QUALITY,
  loader?: ResponsiveImageRequest["loader"],
  priority: "high" | "low" = "low",
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const attrs = responsiveImageAttrs(src, sizes, quality, loader);
  if (!attrs) return Promise.resolve();

  return new Promise((resolve) => {
    const prefetched = new window.Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const finish = () => {
      const decoded = prefetched.decode?.();
      if (!decoded) {
        done();
        return;
      }
      void decoded.then(done, done);
    };
    prefetched.decoding = "async";
    prefetched.fetchPriority = priority;
    prefetched.onload = finish;
    prefetched.onerror = done;
    prefetched.sizes = attrs.sizes;
    if (attrs.srcSet) prefetched.srcset = attrs.srcSet;
    prefetched.src = attrs.src;
    if (prefetched.complete) finish();
  });
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
    prefetchResponsiveImage(
      image.src,
      image.sizes,
      image.quality,
      image.loader,
    );
  }
}
