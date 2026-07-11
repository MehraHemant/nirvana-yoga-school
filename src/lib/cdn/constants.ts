/** Maximum image upload size in bytes (1MB). */
export const MAX_UPLOAD_BYTES = 1_048_576;

/** Human-readable upload limit label for admin UI and errors. */
export const MAX_UPLOAD_LABEL = "1MB";

/** Allowed image MIME types for CMS uploads. */
export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
