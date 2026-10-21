/** Sharp on-screen video: 1080p cap, Cloudinary's best quality ladder. */
const CLOUDINARY_VIDEO_PLAYBACK = "c_limit,w_1920,q_auto:best";

/**
 * True when the path after `/video/upload/` already carries a delivery transform.
 *
 * @param afterUpload - URL path following `/video/upload/`
 */
function videoAlreadyTransformed(afterUpload: string): boolean {
  return /^(so_|c_|w_|h_|f_|q_|sp_|vc_|br_|fl_|e_)/.test(afterUpload);
}

/**
 * High-quality Cloudinary playback URL. Non-Cloudinary sources are unchanged.
 * Untransformed uploads get a 1920px `q_auto:best` profile so the file that
 * stays on screen is sharp, not a preview encode. Already-transformed URLs
 * are left alone.
 *
 * @param url - Original video URL
 */
export function cloudinaryVideoPlaybackUrl(url: string): string {
  const trimmed = url.trim();
  const marker = "/video/upload/";
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return trimmed;

  const insertAt = idx + marker.length;
  const after = trimmed.slice(insertAt);
  if (videoAlreadyTransformed(after)) return trimmed;

  const extension = after.match(/\.([^./?#]+)(?:[?#]|$)/i)?.[1]?.toLowerCase();
  const format = extension && extension !== "mp4" ? ",f_mp4" : "";
  return `${trimmed.slice(0, insertAt)}${CLOUDINARY_VIDEO_PLAYBACK}${format}/${after}`;
}

/**
 * Builds a sharp Cloudinary poster from a video delivery URL.
 * Uses the first frame (`so_0`) as a high-quality JPG still, capped at 1600px.
 * Non-Cloudinary URLs return an empty string.
 *
 * @param videoUrl - Secure Cloudinary video URL
 */
export function cloudinaryVideoPosterUrl(videoUrl: string): string {
  const trimmed = videoUrl.trim();
  const marker = "/video/upload/";
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return "";

  const insertAt = idx + marker.length;
  const after = trimmed.slice(insertAt);
  if (videoAlreadyTransformed(after)) {
    if (after.startsWith("so_")) {
      return trimmed.replace(/\.[^.]+$/i, ".jpg");
    }
    return `${trimmed.slice(0, insertAt)}so_0,f_jpg,${after}`.replace(
      /\.[^.]+$/i,
      ".jpg",
    );
  }

  const transform = "so_0,c_limit,w_1600,f_jpg,q_auto:best";
  return `${trimmed.slice(0, insertAt)}${transform}/${after}`.replace(
    /\.[^.]+$/i,
    ".jpg",
  );
}
