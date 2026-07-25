import {
  isCdnConfigured,
  maxUploadBytes,
  maxVideoUploadBytes,
  resourceTypeFromMime,
  uploadToCloudinary,
  validateMediaUpload,
} from "@/lib/cdn/cloudinary";
import { normalizeMediaTags, parseMediaTagsFromDb } from "@/lib/cdn/media-tags";
import {
  jsonBadRequest,
  jsonError,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { db } from "@/lib/db";
import { HTTP } from "@/lib/types/api";

const uploadCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count += 1;
  return true;
}

/**
 * Parse tags from multipart form field (JSON array or comma-separated).
 *
 * @param raw - Form field value
 */
function parseTagsFromForm(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string" || !raw.trim()) return [];
  try {
    if (raw.startsWith("[")) {
      return normalizeMediaTags(JSON.parse(raw) as string[]);
    }
  } catch {
    // fall through to comma-separated
  }
  return normalizeMediaTags(raw);
}

/**
 * Upload an image (max 1MB) or video (max 100MB) to Cloudinary with optional
 * caption, description, and tags.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isCdnConfigured()) {
    return jsonUnavailable("CDN not configured. Set CLOUDINARY_* env vars.");
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return jsonError("Rate limit exceeded", 429);
  }

  const form = await request.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim() || null;
  const description = String(form.get("description") ?? "").trim() || null;
  const alt = String(form.get("alt") ?? caption ?? "").trim() || null;
  const tags = parseTagsFromForm(form.get("tags"));

  if (!(file instanceof File)) {
    return jsonBadRequest("file field required");
  }

  const resourceType = resourceTypeFromMime(file.type);
  const validationError = validateMediaUpload({
    size: file.size,
    type: file.type,
  });
  if (validationError) {
    const maxBytes =
      resourceType === "video" ? maxVideoUploadBytes() : maxUploadBytes();
    const status = file.size > maxBytes ? 413 : 415;
    return jsonError(validationError, status);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToCloudinary(buffer, {
    mime: file.type,
    filename: file.name,
    resourceType: resourceType ?? "image",
  });

  const asset = await db.mediaAsset.create({
    data: {
      url: uploaded.url,
      cdnKey: uploaded.cdnKey,
      mime: uploaded.mime,
      sizeBytes: uploaded.sizeBytes,
      alt,
      caption,
      description,
      tags,
    },
  });

  return jsonOk(
    {
      id: asset.id,
      url: asset.url,
      cdnKey: asset.cdnKey,
      sizeBytes: asset.sizeBytes,
      mime: asset.mime,
      caption: asset.caption,
      description: asset.description,
      tags: parseMediaTagsFromDb(asset.tags),
      durationSeconds: uploaded.durationSeconds ?? null,
    },
    { status: HTTP.CREATED },
  );
}
