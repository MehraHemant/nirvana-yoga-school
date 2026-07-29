import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";

/** Target chunk size in characters (~800–1500). */
export const PDF_CHUNK_CHARS = 1200;
/** Overlap between consecutive chunks. */
export const PDF_CHUNK_OVERLAP = 150;
/** Minimum non-empty chunk length after trim. */
const MIN_CHUNK_CHARS = 40;

export type PdfTextChunk = {
  index: number;
  text: string;
  /** SHA-256 prefix of normalized chunk text (dedup). */
  textHash: string;
};

/**
 * Hash file bytes for skipping re-extraction of identical PDFs.
 *
 * @param buffer - Raw PDF bytes
 */
export function hashPdfBytes(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 32);
}

/**
 * Hash normalized chunk text for duplicate detection.
 *
 * @param text - Chunk body
 */
export function hashChunkText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

/**
 * Extract plain text from a PDF buffer (skips empty pages).
 *
 * @param buffer - PDF file bytes
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const pages = Array.isArray(result.pages) ? result.pages : [];
    if (pages.length > 0) {
      const parts = pages
        .map((page) => String(page.text ?? "").replace(/\s+/g, " ").trim())
        .filter((text) => text.length > 0);
      if (parts.length > 0) return parts.join("\n\n");
    }
    return String(result.text ?? "")
      .replace(/\s+/g, " ")
      .trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

/**
 * Split extracted PDF text into overlapping chunks; skip empties and
 * identical consecutive duplicates (by text hash).
 *
 * @param text - Full extracted document text
 * @param options - Chunk size / overlap overrides
 */
export function chunkPdfText(
  text: string,
  options?: { chunkChars?: number; overlap?: number },
): PdfTextChunk[] {
  const chunkChars = options?.chunkChars ?? PDF_CHUNK_CHARS;
  const overlap = Math.min(
    options?.overlap ?? PDF_CHUNK_OVERLAP,
    Math.max(0, chunkChars - 1),
  );
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];

  const chunks: PdfTextChunk[] = [];
  const seenHashes = new Set<string>();
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkChars, normalized.length);
    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf(" "),
      );
      if (breakAt > chunkChars * 0.5) {
        end = start + breakAt + 1;
      }
    }

    const piece = normalized.slice(start, end).replace(/\s+/g, " ").trim();
    if (piece.length >= MIN_CHUNK_CHARS) {
      const textHash = hashChunkText(piece);
      if (!seenHashes.has(textHash)) {
        seenHashes.add(textHash);
        chunks.push({ index, text: piece, textHash });
        index += 1;
      }
    }

    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}
