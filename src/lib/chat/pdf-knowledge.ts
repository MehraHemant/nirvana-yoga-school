import {
  deleteFromCloudinary,
  uploadPdfToCloudinary,
  validatePdfUpload,
} from "@/lib/cdn/cloudinary";
/** Node DB entry (no `server-only`) so CLI indexing works. */
import { db } from "@/lib/db/node";
import { chunkPdfText, extractPdfText, hashPdfBytes } from "./pdf-text";

export type ChatKnowledgePdfStatus = "pending" | "indexed" | "error";

export type ChatKnowledgePdfRecord = {
  id: string;
  title: string;
  filename: string;
  storageUrl: string;
  cdnKey: string | null;
  mime: string;
  sizeBytes: number;
  contentHash: string | null;
  status: ChatKnowledgePdfStatus;
  chunkCount: number;
  errorMessage: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PdfIndexChunkDraft = {
  key: string;
  title: string;
  content: string;
  sourceType: "pdf";
  sourcePath: string;
  sourceId: string;
};

type PdfRow = {
  id: string;
  title: string;
  filename: string;
  storage_url: string;
  cdn_key: string | null;
  mime: string;
  size_bytes: number;
  content_hash: string | null;
  extracted_text: string | null;
  status: string;
  chunk_count: number;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

/**
 * Map a DB row to the admin-facing PDF record (no extracted text).
 *
 * @param row - Raw SQL row
 */
function toRecord(row: PdfRow): ChatKnowledgePdfRecord {
  const status =
    row.status === "indexed" || row.status === "error" ? row.status : "pending";
  return {
    id: row.id,
    title: row.title || row.filename,
    filename: row.filename,
    storageUrl: row.storage_url,
    cdnKey: row.cdn_key,
    mime: row.mime,
    sizeBytes: Number(row.size_bytes) || 0,
    contentHash: row.content_hash,
    status,
    chunkCount: Number(row.chunk_count) || 0,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List uploaded chat knowledge PDFs (newest first).
 */
export async function listChatKnowledgePdfs(): Promise<
  ChatKnowledgePdfRecord[]
> {
  try {
    const rows = await db.$queryRawUnsafe<PdfRow[]>(
      `SELECT "id", "title", "filename", "storage_url", "cdn_key", "mime",
              "size_bytes", "content_hash", "extracted_text", "status",
              "chunk_count", "error_message", "created_at", "updated_at"
       FROM "chat_knowledge_pdfs"
       ORDER BY "created_at" DESC
       LIMIT 200`,
    );
    return rows.map(toRecord);
  } catch {
    return [];
  }
}

/**
 * Load one PDF knowledge row by id.
 *
 * @param id - Document id
 */
export async function getChatKnowledgePdf(
  id: string,
): Promise<ChatKnowledgePdfRecord | null> {
  const rows = await db.$queryRawUnsafe<PdfRow[]>(
    `SELECT "id", "title", "filename", "storage_url", "cdn_key", "mime",
            "size_bytes", "content_hash", "extracted_text", "status",
            "chunk_count", "error_message", "created_at", "updated_at"
     FROM "chat_knowledge_pdfs"
     WHERE "id" = $1
     LIMIT 1`,
    id,
  );
  const row = rows[0];
  return row ? toRecord(row) : null;
}

/**
 * Upload a PDF to Cloudinary, extract text, and store metadata.
 *
 * @param file - Uploaded File from multipart form
 * @param title - Optional display title
 */
export async function createChatKnowledgePdf(
  file: File,
  title?: string,
): Promise<ChatKnowledgePdfRecord> {
  const filename =
    (typeof file.name === "string" && file.name.trim()) || "document.pdf";
  const validationError = validatePdfUpload({
    size: file.size,
    type: file.type || "application/pdf",
    name: filename,
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentHash = hashPdfBytes(buffer);
  const displayTitle = (title ?? filename.replace(/\.pdf$/i, "")).trim() || filename;

  // Skip duplicate file bodies — reuse existing row.
  const existing = await db.$queryRawUnsafe<PdfRow[]>(
    `SELECT "id", "title", "filename", "storage_url", "cdn_key", "mime",
            "size_bytes", "content_hash", "extracted_text", "status",
            "chunk_count", "error_message", "created_at", "updated_at"
     FROM "chat_knowledge_pdfs"
     WHERE "content_hash" = $1
     LIMIT 1`,
    contentHash,
  );
  if (existing[0]) {
    return toRecord(existing[0]);
  }

  let extractedText = "";
  let status: ChatKnowledgePdfStatus = "pending";
  let errorMessage: string | null = null;
  let chunkCount = 0;

  try {
    extractedText = await extractPdfText(buffer);
    chunkCount = chunkPdfText(extractedText).length;
    if (!extractedText || chunkCount === 0) {
      status = "error";
      errorMessage = "No extractable text found in PDF";
    }
  } catch (error) {
    status = "error";
    errorMessage =
      error instanceof Error ? error.message : "PDF text extraction failed";
  }

  const uploaded = await uploadPdfToCloudinary(buffer, {
    filename,
    mime: file.type || "application/pdf",
  });

  const row = await db.chatKnowledgePdf.create({
    data: {
      title: displayTitle,
      filename,
      storageUrl: uploaded.url,
      cdnKey: uploaded.cdnKey,
      mime: uploaded.mime,
      sizeBytes: uploaded.sizeBytes,
      contentHash,
      extractedText: extractedText || null,
      status,
      chunkCount,
      errorMessage,
    },
  });

  return {
    id: String(row.id),
    title: String(row.title ?? displayTitle),
    filename: String(row.filename ?? filename),
    storageUrl: String(row.storageUrl ?? uploaded.url),
    cdnKey: row.cdnKey ? String(row.cdnKey) : null,
    mime: String(row.mime ?? "application/pdf"),
    sizeBytes: Number(row.sizeBytes) || 0,
    contentHash: row.contentHash ? String(row.contentHash) : contentHash,
    status: (row.status as ChatKnowledgePdfStatus) || status,
    chunkCount: Number(row.chunkCount) || chunkCount,
    errorMessage: row.errorMessage ? String(row.errorMessage) : errorMessage,
    createdAt: row.createdAt as Date | string,
    updatedAt: row.updatedAt as Date | string,
  };
}

/**
 * Build indexable PDF chunk drafts for syncChatIndex (stable keys).
 * Keys: `pdf:{documentId}:chunk:{n}`
 */
export async function buildPdfIndexChunkDrafts(): Promise<PdfIndexChunkDraft[]> {
  type TextRow = {
    id: string;
    title: string;
    filename: string;
    storage_url: string;
    extracted_text: string | null;
    status: string;
  };

  let rows: TextRow[] = [];
  try {
    rows = await db.$queryRawUnsafe<TextRow[]>(
      `SELECT "id", "title", "filename", "storage_url", "extracted_text", "status"
       FROM "chat_knowledge_pdfs"
       WHERE "status" <> 'error'
         AND COALESCE("extracted_text", '') <> ''
       ORDER BY "created_at" ASC
       LIMIT 100`,
    );
  } catch {
    return [];
  }

  const drafts: PdfIndexChunkDraft[] = [];
  const globalTextHashes = new Set<string>();

  for (const row of rows) {
    const title = row.title || row.filename || "PDF";
    const chunks = chunkPdfText(String(row.extracted_text ?? ""));
    let kept = 0;
    for (const chunk of chunks) {
      // Cross-document dedup: skip identical chunk text already queued.
      if (globalTextHashes.has(chunk.textHash)) continue;
      globalTextHashes.add(chunk.textHash);
      const key = `pdf:${row.id}:chunk:${chunk.index}`;
      drafts.push({
        key,
        title: `${title} (chunk ${chunk.index + 1})`,
        content: chunk.text,
        sourceType: "pdf",
        sourcePath: row.storage_url,
        sourceId: row.id,
      });
      kept += 1;
    }

    try {
      await db.chatKnowledgePdf.update({
        where: { id: row.id },
        data: {
          chunkCount: kept,
          ...(kept === 0
            ? {
                status: "error",
                errorMessage: "No indexable chunks after dedup",
              }
            : {}),
        },
      });
    } catch {
      // Non-fatal status update.
    }
  }

  return drafts;
}

/**
 * Mark PDF documents as indexed after a successful Qdrant sync.
 *
 * @param documentIds - PDF ids that contributed live chunks
 */
export async function markPdfsIndexed(documentIds: string[]): Promise<void> {
  const unique = [...new Set(documentIds)];
  for (const id of unique) {
    try {
      await db.chatKnowledgePdf.update({
        where: { id },
        data: { status: "indexed", errorMessage: null },
      });
    } catch {
      // Row may have been deleted mid-sync.
    }
  }
}

/**
 * Delete a PDF row and its Cloudinary raw asset (does not touch Qdrant).
 *
 * @param id - PDF document id
 */
export async function deleteChatKnowledgePdf(
  id: string,
): Promise<ChatKnowledgePdfRecord> {
  const existing = await getChatKnowledgePdf(id);
  if (!existing) {
    throw new Error("PDF not found");
  }

  if (existing.cdnKey) {
    await deleteFromCloudinary(existing.cdnKey, "raw").catch(() => undefined);
  }

  await db.chatKnowledgePdf.delete({ where: { id } });
  return existing;
}
