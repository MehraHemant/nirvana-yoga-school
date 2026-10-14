import { getImageProps, type ImageLoader } from "next/image";
import {
  cloudinaryImageLoader,
  isResizableCloudinaryImage,
} from "@/lib/cdn/cloudinary-thumb-url";

/**
 * Shared hero image config. No `"use client"` so the server page can build the
 * same LCP preload `srcset` the client stage renders.
 */

/** Next/Image quality for hero photos (maps to Cloudinary `q_auto:good`). */
export const HERO_IMAGE_QUALITY = 85;

/** `sizes` for the Gallery Feature main stage. */
export const HERO_STAGE_SIZES = "(max-width: 768px) 100vw, min(75vw, 1100px)";

/**
 * Cloudinary loader for resizable Cloudinary URLs; other hosts fall back to
 * the built-in Next optimizer.
 *
 * @param url - Original CMS image URL
 */
export function heroImageLoader(url: string): ImageLoader | undefined {
  return isResizableCloudinaryImage(url) ? cloudinaryImageLoader : undefined;
}

/**
 * Responsive `src` / `srcSet` / `sizes` for a hero main-stage photo — used for
 * the head preload and for warming neighbouring photos.
 *
 * @param url - Original CMS image URL
 * @param sizes - `sizes` attribute matching the rendered stage
 */
export function heroStageImageProps(url: string, sizes = HERO_STAGE_SIZES) {
  const { props } = getImageProps({
    src: url,
    alt: "",
    fill: true,
    sizes,
    quality: HERO_IMAGE_QUALITY,
    loader: heroImageLoader(url),
  });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}
