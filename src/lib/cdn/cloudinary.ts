import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import {
  ALLOWED_IMAGE_MIME,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
} from "@/lib/cdn/constants";

export type CdnUploadResult = {
  url: string;
  cdnKey: string;
  mime: string;
  sizeBytes: number;
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
 * Maximum allowed upload size in bytes (1MB).
 */
export function maxUploadBytes(): number {
  return MAX_UPLOAD_BYTES;
}

/**
 * Whether Cloudinary credentials are configured.
 */
export function isCdnConfigured(): boolean {
  return cloudinaryConfig() !== null;
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
 * Upload a validated image buffer to Cloudinary.
 *
 * @param buffer - File bytes
 * @param options - MIME type and optional filename hint
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: { mime: string; filename?: string },
): Promise<CdnUploadResult> {
  if (!ensureCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }

  const safeName = (options.filename ?? "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 48);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "nirvana-cms",
        public_id: `${safeName}-${Date.now()}`,
        resource_type: "image",
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

  return {
    url: result.secure_url,
    cdnKey: result.public_id,
    mime: options.mime,
    sizeBytes: result.bytes,
  };
}

/**
 * Delete an image from Cloudinary by public ID.
 *
 * @param publicId - Cloudinary `public_id` stored in `media_assets.cdn_key`
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!ensureCloudinary()) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export { cdnPublicHostname } from "@/lib/cdn/cdn-env";
