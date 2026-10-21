import type { ImageLoaderProps } from "next/image";

/**
 * Cloudinary `q_` token. Large deliveries and explicit high Next/Image quality
 * stay on `auto:best` so photography remains sharp. Small thumbnails use
 * `auto:good` so they do not dominate the page weight.
 *
 * @param width - Requested delivery width in pixels
 * @param quality - Next/Image quality (1–100), when the caller set one
 */
export function cloudinaryQualityToken(
  width: number,
  quality: number | undefined,
): string {
  if (quality != null && quality < 60) return "auto:eco";
  if (width >= 640 || (quality != null && quality >= 85)) return "auto:best";
  return "auto:good";
}

/**
 * Builds a width-limited Cloudinary delivery URL.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param url - Original media URL
 * @param width - Max width in pixels (default 320)
 * @param quality - Cloudinary `q_` value (default `auto`, i.e. `auto:good`). Commas in the transform are encoded as `%2C` so `srcset` stays one URL.
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
    // Commas must be %2C or HTML srcset splits the URL and the browser
    // falls back to the largest `src`. Encoded commas also stop `f_auto`
    // from negotiating, so the format is fixed to AVIF (what `f_auto`
    // selects in current browsers) and stays sharp at `q_auto:best`.
    const transform = `c_limit,w_${width},f_avif,q_${quality}`.replaceAll(
      ",",
      "%2C",
    );
    return `${trimmed.slice(0, insertAt)}${transform}/${after}`;
  }

  const videoMarker = "/video/upload/";
  const videoIdx = trimmed.indexOf(videoMarker);
  if (videoIdx !== -1) {
    const insertAt = videoIdx + videoMarker.length;
    const after = trimmed.slice(insertAt);
    if (/^(so_|c_|w_|h_|f_|q_)/.test(after)) return trimmed;
    const transform = `so_0,c_limit,w_${width},f_jpg,q_${quality}`.replaceAll(
      ",",
      "%2C",
    );
    return `${trimmed.slice(0, insertAt)}${transform}/${after}`.replace(
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
 * Widths are capped at the hero main width. Delivery is AVIF so `srcset`
 * can encode commas without losing `f_auto` negotiation.
 * {@link cloudinaryQualityToken} picks `q_auto:best` or `q_auto:good`.
 *
 * @param props - Loader props from `next/image`
 */
export function cloudinaryImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const capped = Math.min(width, CLOUDINARY_HERO_MAIN_WIDTH);
  return cloudinarySizedUrl(
    src,
    capped,
    cloudinaryQualityToken(capped, quality),
  );
}
