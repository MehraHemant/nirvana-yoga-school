/**
 * Builds a Cloudinary poster/thumbnail URL from a video delivery URL.
 * Uses the first frame (`so_0`) as a JPG still.
 *
 * @param videoUrl - Secure Cloudinary video URL
 */
export function cloudinaryVideoPosterUrl(videoUrl: string): string {
  if (!videoUrl.includes("/video/upload/")) return "";
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_0/")
    .replace(/\.[^.]+$/i, ".jpg");
}
