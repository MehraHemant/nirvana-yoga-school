/**
 * Builds a width-limited Cloudinary delivery URL.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param url - Original media URL
 * @param width - Max width in pixels (default 320)
 */
export function cloudinarySizedUrl(url: string, width = 320): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const imageMarker = "/image/upload/";
  const imageIdx = trimmed.indexOf(imageMarker);
  if (imageIdx !== -1) {
    const insertAt = imageIdx + imageMarker.length;
    // Avoid double-transforming an already-transformed URL.
    const after = trimmed.slice(insertAt);
    if (/^(c_|w_|h_|f_|q_|fl_)/.test(after)) return trimmed;
    return `${trimmed.slice(0, insertAt)}c_limit,w_${width},f_auto,q_auto/${after}`;
  }

  const videoMarker = "/video/upload/";
  const videoIdx = trimmed.indexOf(videoMarker);
  if (videoIdx !== -1) {
    const insertAt = videoIdx + videoMarker.length;
    const after = trimmed.slice(insertAt);
    if (/^(so_|c_|w_|h_|f_|q_)/.test(after)) return trimmed;
    return `${trimmed.slice(0, insertAt)}so_0,c_limit,w_${width},f_jpg,q_auto/${after}`.replace(
      /\.[^.]+$/i,
      ".jpg",
    );
  }

  return trimmed;
}

/** @deprecated Use {@link cloudinarySizedUrl} */
export const cloudinaryThumbUrl = cloudinarySizedUrl;

/** Hero main stage — large enough for LCP without full-resolution originals. */
export function cloudinaryHeroUrl(url: string, width = 1280): string {
  return cloudinarySizedUrl(url, width);
}
