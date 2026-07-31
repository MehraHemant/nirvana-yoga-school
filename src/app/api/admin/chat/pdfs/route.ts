import {
  createChatKnowledgePdf,
  listChatKnowledgePdfs,
} from "@/lib/chat/pdf-knowledge";
import { isCdnConfigured, maxPdfUploadBytes } from "@/lib/cdn/cloudinary";
import { MAX_PDF_UPLOAD_LABEL } from "@/lib/cdn/constants";
import {
  jsonBadRequest,
  jsonError,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { HTTP } from "@/lib/types/api";

export const runtime = "nodejs";
export const maxDuration = 120;

const uploadCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Whether a FormData entry is an uploaded file (File or Blob-like).
 * Next/undici sometimes yields Blob-shaped values that fail `instanceof File`.
 *
 * @param entry - FormData value
 */
function isMultipartFile(entry: FormDataEntryValue): entry is File {
  if (typeof entry === "string" || entry == null) return false;
  if (entry instanceof File) return entry.size > 0;
  const blob = entry as Blob & { name?: string };
  return (
    typeof blob.arrayBuffer === "function" &&
    typeof blob.size === "number" &&
    blob.size > 0
  );
}

/**
 * Coerce a multipart Blob/File into a File instance for upload handlers.
 *
 * @param entry - Uploaded blob (may not pass `instanceof File` under undici)
 */
function ensureUploadFile(entry: Blob & { name?: string }): File {
  if (entry instanceof File) return entry;
  return new File([entry], entry.name || "document.pdf", {
    type: entry.type || "application/pdf",
  });
}

/**
 * Simple per-IP rate limit for PDF uploads.
 *
 * @param ip - Client IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count += 1;
  return true;
}

/**
 * List chat knowledge PDFs for the admin CMS.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const pdfs = await listChatKnowledgePdfs();
  return jsonOk({
    pdfs: pdfs.map((pdf) => ({
      ...pdf,
      createdAt:
        pdf.createdAt instanceof Date
          ? pdf.createdAt.toISOString()
          : String(pdf.createdAt),
      updatedAt:
        pdf.updatedAt instanceof Date
          ? pdf.updatedAt.toISOString()
          : String(pdf.updatedAt),
    })),
  });
}

/**
 * Upload one or more PDFs for chat RAG knowledge.
 *
 * Multipart fields: `file` (or repeated `files`), optional `title`.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  if (!isCdnConfigured()) {
    return jsonUnavailable("CDN not configured. Set CLOUDINARY_* env vars.");
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return jsonError("Rate limit exceeded", 429);
  }

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim() || undefined;
  const files = [
    ...form.getAll("file"),
    ...form.getAll("files"),
  ].filter(isMultipartFile);

  if (files.length === 0) {
    return jsonBadRequest("file field required (multipart field: files)");
  }

  const created = [];
  const errors: string[] = [];

  for (const entry of files) {
    const file = ensureUploadFile(entry);
    const filename = file.name || "document.pdf";
    try {
      if (file.size > maxPdfUploadBytes()) {
        errors.push(`${filename}: exceeds ${MAX_PDF_UPLOAD_LABEL} limit`);
        continue;
      }
      const pdf = await createChatKnowledgePdf(file, title);
      created.push({
        ...pdf,
        createdAt:
          pdf.createdAt instanceof Date
            ? pdf.createdAt.toISOString()
            : String(pdf.createdAt),
        updatedAt:
          pdf.updatedAt instanceof Date
            ? pdf.updatedAt.toISOString()
            : String(pdf.updatedAt),
      });
    } catch (error) {
      errors.push(
        `${filename}: ${error instanceof Error ? error.message : "Upload failed"}`,
      );
    }
  }

  if (created.length === 0) {
    return jsonError(errors.join("; ") || "Upload failed", 400);
  }

  return jsonOk(
    {
      pdfs: created,
      errors,
    },
    { status: HTTP.CREATED },
  );
}
