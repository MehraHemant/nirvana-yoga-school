import {
  isCdnConfigured,
  maxUploadBytes,
  uploadToCloudinary,
  validateImageUpload,
} from "@/lib/cdn/cloudinary";
import { normalizeMediaTags } from "@/lib/cdn/media-tags";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { prisma } from "@/lib/db";

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
 * Upload an image to Cloudinary (max 1MB) with optional caption, description, and tags.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCdnConfigured()) {
    return Response.json(
      { error: "CDN not configured. Set CLOUDINARY_* env vars." },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim() || null;
  const description = String(form.get("description") ?? "").trim() || null;
  const alt = String(form.get("alt") ?? caption ?? "").trim() || null;
  const tags = parseTagsFromForm(form.get("tags"));

  if (!(file instanceof File)) {
    return Response.json({ error: "file field required" }, { status: 400 });
  }

  const validationError = validateImageUpload({
    size: file.size,
    type: file.type,
  });
  if (validationError) {
    const status = file.size > maxUploadBytes() ? 413 : 415;
    return Response.json({ error: validationError }, { status });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToCloudinary(buffer, {
    mime: file.type,
    filename: file.name,
  });

  const asset = await prisma.mediaAsset.create({
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

  return Response.json(
    {
      id: asset.id,
      url: asset.url,
      sizeBytes: asset.sizeBytes,
      mime: asset.mime,
      caption: asset.caption,
      description: asset.description,
      tags: asset.tags,
    },
    { status: 201 },
  );
}
