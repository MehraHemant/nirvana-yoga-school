/** Maximum image upload size in bytes (1MB). */
export const MAX_UPLOAD_BYTES = 1_048_576;

/** Human-readable upload limit label for admin UI and errors. */
export const MAX_UPLOAD_LABEL = "1MB";

/** Maximum video upload size in bytes (100MB). */
export const MAX_VIDEO_UPLOAD_BYTES = 104_857_600;

/** Human-readable video upload limit label for admin UI and errors. */
export const MAX_VIDEO_UPLOAD_LABEL = "100MB";

/** Allowed image MIME types for CMS uploads. */
export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Allowed video MIME types for CMS Cloudinary uploads. */
export const ALLOWED_VIDEO_MIME = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;
