import type { ImageLoaderProps } from "next/image";

/**
 * Builds a width-limited Cloudinary delivery URL.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param url - Original media URL
 * @param width - Max width in pixels (default 320)
 * @param quality - Cloudinary `q_` value (default `auto`)
 */
export function cloudinarySizedUrl(
  url: string,
  width = 320,
  quality = "auto",
): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const imageMarker = "/image/upload/";
  const imageIdx = trimmed.indexOf(imageMarker);
  if (imageIdx !== -1) {
    const insertAt = imageIdx + imageMarker.length;
    // Avoid double-transforming an already-transformed URL.
    const after = trimmed.slice(insertAt);
    if (/^(c_|w_|h_|f_|q_|fl_)/.test(after)) return trimmed;
    return `${trimmed.slice(0, insertAt)}c_limit,w_${width},f_auto,q_${quality}/${after}`;
  }

  const videoMarker = "/video/upload/";
  const videoIdx = trimmed.indexOf(videoMarker);
  if (videoIdx !== -1) {
    const insertAt = videoIdx + videoMarker.length;
    const after = trimmed.slice(insertAt);
    if (/^(so_|c_|w_|h_|f_|q_)/.test(after)) return trimmed;
    return `${trimmed.slice(0, insertAt)}so_0,c_limit,w_${width},f_jpg,q_${quality}/${after}`.replace(
      /\.[^.]+$/i,
      ".jpg",
    );
  }

  return trimmed;
}

/** @deprecated Use {@link cloudinarySizedUrl} */
export const cloudinaryThumbUrl = cloudinarySizedUrl;

/** Largest width the Cloudinary loader requests (retina hero main stage). */
export const CLOUDINARY_HERO_MAIN_WIDTH = 2400;

/**
 * True when `url` is an untransformed Cloudinary image that can be resized per width.
 *
 * @param url - Original media URL
 */
export function isResizableCloudinaryImage(url: string): boolean {
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return false;
  return !/^(c_|w_|h_|f_|q_|fl_)/.test(url.slice(idx + marker.length));
}

/**
 * `next/image` loader that lets Cloudinary resize directly (no Vercel re-encode).
 * Widths are capped at the hero main width; quality ≥ 85 maps to `q_auto:good`.
 *
 * @param props - Loader props from `next/image`
 */
export function cloudinaryImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  return cloudinarySizedUrl(
    src,
    Math.min(width, CLOUDINARY_HERO_MAIN_WIDTH),
    quality != null && quality >= 85 ? "auto:good" : "auto",
  );
}
