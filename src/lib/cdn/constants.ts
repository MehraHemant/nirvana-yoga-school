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

/** Maximum chat-knowledge PDF upload size in bytes (20MB). */
export const MAX_PDF_UPLOAD_BYTES = 20_971_520;

/** Human-readable PDF upload limit label for admin UI and errors. */
export const MAX_PDF_UPLOAD_LABEL = "20MB";

/** Allowed MIME types for chat RAG PDF uploads. */
export const ALLOWED_PDF_MIME = ["application/pdf"] as const;
