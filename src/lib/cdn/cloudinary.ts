import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_VIDEO_MIME,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_LABEL,
} from "@/lib/cdn/constants";

export type CdnResourceType = "image" | "video";

export type CdnUploadResult = {
  url: string;
  cdnKey: string;
  mime: string;
  sizeBytes: number;
  resourceType: CdnResourceType;
  /** Present for video uploads when Cloudinary reports duration */
  durationSeconds?: number;
};

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

function ensureCloudinary() {
  const config = cloudinaryConfig();
  if (!config) return null;

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return config;
}

/**
 * Maximum allowed image upload size in bytes (1MB).
 */
export function maxUploadBytes(): number {
  return MAX_UPLOAD_BYTES;
}

/**
 * Maximum allowed video upload size in bytes (100MB).
 */
export function maxVideoUploadBytes(): number {
  return MAX_VIDEO_UPLOAD_BYTES;
}

/**
 * Whether Cloudinary credentials are configured.
 */
export function isCdnConfigured(): boolean {
  return cloudinaryConfig() !== null;
}

/**
 * Infer Cloudinary resource type from a MIME type.
 *
 * @param mime - File MIME type
 */
export function resourceTypeFromMime(mime: string): CdnResourceType | null {
  if (
    ALLOWED_IMAGE_MIME.includes(mime as (typeof ALLOWED_IMAGE_MIME)[number])
  ) {
    return "image";
  }
  if (
    ALLOWED_VIDEO_MIME.includes(mime as (typeof ALLOWED_VIDEO_MIME)[number])
  ) {
    return "video";
  }
  return null;
}

/**
 * Validate an image upload before sending to Cloudinary.
 *
 * @param file - Uploaded file metadata
 */
export function validateImageUpload(file: {
  size: number;
  type: string;
}): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File exceeds ${MAX_UPLOAD_LABEL} limit`;
  }
  if (
    !ALLOWED_IMAGE_MIME.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME)[number],
    )
  ) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }
  return null;
}

/**
 * Validate a video upload before sending to Cloudinary.
 *
 * @param file - Uploaded file metadata
 */
export function validateVideoUpload(file: {
  size: number;
  type: string;
}): string | null {
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    return `File exceeds ${MAX_VIDEO_UPLOAD_LABEL} limit`;
  }
  if (
    !ALLOWED_VIDEO_MIME.includes(
      file.type as (typeof ALLOWED_VIDEO_MIME)[number],
    )
  ) {
    return "Only MP4, WebM, and QuickTime videos are allowed";
  }
  return null;
}

/**
 * Validate an image or video upload based on MIME type.
 *
 * @param file - Uploaded file metadata
 */
export function validateMediaUpload(file: {
  size: number;
  type: string;
}): string | null {
  const resourceType = resourceTypeFromMime(file.type);
  if (resourceType === "image") return validateImageUpload(file);
  if (resourceType === "video") return validateVideoUpload(file);
  return "Unsupported file type. Use JPEG/PNG/WebP images or MP4/WebM/MOV videos.";
}

/**
 * Upload a validated image or video buffer to Cloudinary.
 *
 * @param buffer - File bytes
 * @param options - MIME type, optional filename, and resource type
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    mime: string;
    filename?: string;
    resourceType?: CdnResourceType;
  },
): Promise<CdnUploadResult> {
  if (!ensureCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }

  const resourceType =
    options.resourceType ?? resourceTypeFromMime(options.mime) ?? "image";

  const safeName = (options.filename ?? resourceType)
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 48);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "nirvana-cms",
        public_id: `${safeName}-${Date.now()}`,
        resource_type: resourceType,
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(uploadResult);
      },
    );
    stream.end(buffer);
  });

  const duration =
    typeof result.duration === "number" && Number.isFinite(result.duration)
      ? Math.round(result.duration)
      : undefined;

  return {
    url: result.secure_url,
    cdnKey: result.public_id,
    mime: options.mime,
    sizeBytes: result.bytes,
    resourceType,
    durationSeconds: duration,
  };
}

/**
 * Delete a media asset from Cloudinary by public ID.
 *
 * @param publicId - Cloudinary `public_id` stored in `media_assets.cdn_key`
 * @param resourceType - Image or video resource type (defaults to image)
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: CdnResourceType = "image",
): Promise<void> {
  if (!ensureCloudinary()) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cdnPublicHostname } from "@/lib/cdn/cdn-env";
