import { createHash } from "node:crypto";
import { TEACHER_PAGE_SLUG, teacherSlug } from "@/content/teachers-slug";
import type { RetrievedChunk } from "@/content/types/chat";
import { embedText } from "@/lib/ai/embeddings";
import { publicViewHref } from "@/lib/cms/page-layout-registry";
/** Node DB entry (no `server-only`) so `tsx` CLI indexing works. */
import { db } from "@/lib/db/node";
import {
  extractContentDataBlocks,
  extractGlobalSettingBlocks,
  extractPageModulesBlocks,
  extractTeacherProfileBlock,
  INDEXABLE_GLOBAL_SETTING_KEYS,
} from "./extract-page-text";
import { buildPdfIndexChunkDrafts, markPdfsIndexed } from "./pdf-knowledge";
import {
  chunkPointId,
  deleteQdrantPoints,
  ensureQdrantCollection,
  listQdrantPointSummaries,
  type QdrantChunkPayload,
  upsertQdrantChunks,
} from "./qdrant";
import { getChatSiteOrigin, toPublicUrl } from "./site-url";

const CONTENT_MAX = 1200;
const EMBED_BATCH_PAUSE_MS = 80;
/** Cap published pages per sync to keep embed runs bounded. */
const PUBLISHED_PAGE_LIMIT = 400;

type PageRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string | null;
  fee: string | null;
  duration: string | null;
  document: unknown;
  content_data: unknown;
  page_modules: unknown;
};

type IndexableChunk = {
  key: string;
  payload: QdrantChunkPayload;
};

export type ChatIndexSyncMode = "full" | "incremental";

export type ChatIndexSyncResult = {
  mode: ChatIndexSyncMode;
  total: number;
  upserted: number;
  skipped: number;
  deleted: number;
  durationMs: number;
  collection: string;
};

/**
 * Truncate text for embedding / payload storage.
 *
 * @param content - Raw text
 */
function clip(content: string): string {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= CONTENT_MAX) return trimmed;
  return `${trimmed.slice(0, CONTENT_MAX - 1)}…`;
}

/**
 * Stable content hash so incremental sync can skip unchanged chunks.
 *
 * @param fields - Indexable payload fields (without hash/key)
 */
export function chunkContentHash(fields: {
  title: string;
  content: string;
  sourceType: string;
  sourcePath?: string;
  sourceId?: string;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        title: fields.title,
        content: fields.content,
        sourceType: fields.sourceType,
        sourcePath: fields.sourcePath ?? "",
        sourceId: fields.sourceId ?? "",
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

/**
 * Build a payload with chunk key + content hash.
 *
 * @param key - Stable chunk identity
 * @param fields - Indexable fields
 */
function makePayload(
  key: string,
  fields: {
    title: string;
    content: string;
    sourceType: string;
    sourcePath?: string;
    sourceId?: string;
  },
): QdrantChunkPayload {
  return {
    title: fields.title,
    content: fields.content,
    sourceType: fields.sourceType,
    ...(fields.sourcePath ? { sourcePath: fields.sourcePath } : {}),
    ...(fields.sourceId ? { sourceId: fields.sourceId } : {}),
    chunkKey: key,
    contentHash: chunkContentHash(fields),
  };
}

/**
 * Pull FAQ pairs from a course document blob.
 *
 * @param document - Parsed course document
 */
function extractFaqs(
  document: unknown,
): Array<{ question: string; answer: string }> {
  if (!document || typeof document !== "object") return [];
  const faqs = (document as Record<string, unknown>).faqs;
  if (!Array.isArray(faqs)) return [];
  return faqs
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question =
        typeof record.question === "string" ? record.question.trim() : "";
      const answer =
        typeof record.answer === "string" ? record.answer.trim() : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(
      (item): item is { question: string; answer: string } => item !== null,
    );
}

/**
 * Whether a KB metadata blob marks an auto-mirrored CMS index row.
 *
 * @param metadata - JSON metadata from knowledge_base_chunks
 */
function isCmsMirrorKb(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  return (metadata as Record<string, unknown>).indexedTo === "qdrant";
}

/**
 * Build indexable chunks from published CMS pages (except blogs), faculty,
 * shared global settings, valid manual KB rows, and PDFs.
 *
 * Live means: `pages.published = true` and `pages.type <> 'blog'`.
 * Also indexes teacher profiles (`page_people` on `/teacher`), selected
 * `global_settings` rows (contact, FAQs, travel, residential life, …),
 * `content_data` / live `page_modules`, and PDFs from `chat_knowledge_pdfs`.
 * Blog posts (`pages.type = 'blog'` and `blog_posts`) are never indexed.
 *
 * @param siteOrigin - Absolute URL origin for payload paths
 */
export async function buildCmsIndexChunks(
  siteOrigin?: string,
): Promise<IndexableChunk[]> {
  const origin = getChatSiteOrigin(siteOrigin);
  const rows = await db.$queryRawUnsafe<PageRow[]>(
    `SELECT p."id", p."slug", p."type", p."title", p."description", p."fee",
            p."duration", p."content_data", p."page_modules", cd."document"
     FROM "pages" p
     LEFT JOIN "course_documents" cd ON cd."page_id" = p."id"
     WHERE p."published" = true
       AND p."type" <> 'blog'
     ORDER BY p."title" ASC
     LIMIT ${PUBLISHED_PAGE_LIMIT}`,
  );

  const chunks: IndexableChunk[] = [];

  for (const row of rows) {
    const path = publicViewHref(row.type, row.slug);
    const pageUrl = toPublicUrl(path, origin) ?? path;
    const parts = [
      row.title,
      row.description ?? "",
      row.fee ? `Fee: ${row.fee}` : "",
      row.duration ? `Duration: ${row.duration}` : "",
    ].filter(Boolean);
    const pageContent = clip(parts.join("\n"));
    if (pageContent.length >= 20) {
      const pageKey = `page:${row.id}`;
      chunks.push({
        key: pageKey,
        payload: makePayload(pageKey, {
          title: row.title,
          content: pageContent,
          sourceType: row.type || "page",
          sourcePath: pageUrl,
          sourceId: row.id,
        }),
      });
    }

    for (const block of extractContentDataBlocks(row.content_data)) {
      const content = clip(block.content);
      if (content.length < 20) continue;
      const key = `page:${row.id}:${block.keySuffix}`;
      chunks.push({
        key,
        payload: makePayload(key, {
          title: `${row.title} — ${block.label}`,
          content,
          sourceType: row.slug === "contact" ? "contact" : row.type || "page",
          sourcePath: pageUrl,
          sourceId: row.id,
        }),
      });
    }

    for (const block of extractPageModulesBlocks(row.page_modules)) {
      const content = clip(block.content);
      if (content.length < 20) continue;
      const key = `page:${row.id}:${block.keySuffix}`;
      chunks.push({
        key,
        payload: makePayload(key, {
          title: `${row.title} — ${block.label}`,
          content,
          sourceType: block.keySuffix.startsWith("modules-faq")
            ? "faq"
            : row.type || "page",
          sourcePath: pageUrl,
          sourceId: row.id,
        }),
      });
    }

    for (const [index, faq] of extractFaqs(row.document).entries()) {
      const faqContent = clip(`Q: ${faq.question}\nA: ${faq.answer}`);
      const faqKey = `faq:${row.id}:${index}`;
      chunks.push({
        key: faqKey,
        payload: makePayload(faqKey, {
          title: `${row.title} — FAQ`,
          content: faqContent,
          sourceType: "faq",
          sourcePath: pageUrl,
          sourceId: row.id,
        }),
      });
    }
  }

  // Faculty profiles from the published teachers page (`page_people`).
  try {
    type TeacherRow = {
      id: string;
      name: string;
      summary: string | null;
      bio: string | null;
      education: unknown;
      experience: unknown;
      expertise: unknown;
    };
    const teachers = await db.$queryRawUnsafe<TeacherRow[]>(
      `SELECT pp."id", pp."name", pp."summary", pp."bio",
              pp."education", pp."experience", pp."expertise"
       FROM "page_people" pp
       INNER JOIN "pages" p ON p."id" = pp."page_id"
       WHERE p."slug" = ?
         AND p."published" = true
         AND p."type" <> 'blog'
       ORDER BY pp."sort_order" ASC`,
      TEACHER_PAGE_SLUG,
    );
    const teacherPath =
      toPublicUrl(`/${TEACHER_PAGE_SLUG}`, origin) ?? `/${TEACHER_PAGE_SLUG}`;
    const seenTeacherKeys = new Set<string>();
    for (const person of teachers) {
      const block = extractTeacherProfileBlock(person);
      if (!block) continue;
      const slug = teacherSlug(person.name) || person.id;
      const key = `teacher:${slug}`;
      if (seenTeacherKeys.has(key)) continue;
      seenTeacherKeys.add(key);
      const content = clip(block.content);
      if (content.length < 20) continue;
      chunks.push({
        key,
        payload: makePayload(key, {
          title: `Teacher — ${block.label}`,
          content,
          sourceType: "teacher",
          sourcePath: `${teacherPath}#${slug}`,
          sourceId: person.id,
        }),
      });
    }
  } catch {
    // page_people may be missing on older DBs.
  }

  // Shared / global CMS content (contact, FAQs, travel, residential life, …).
  try {
    type SettingsRow = { key: string; value: unknown };
    const keyList = INDEXABLE_GLOBAL_SETTING_KEYS.map((k) => `'${k}'`).join(
      ", ",
    );
    const settingsRows = await db.$queryRawUnsafe<SettingsRow[]>(
      `SELECT gs."key", gs."value"
       FROM "global_settings" gs
       WHERE gs."key" IN (${keyList})`,
    );
    for (const row of settingsRows) {
      for (const block of extractGlobalSettingBlocks(row.key, row.value)) {
        const content = clip(block.content);
        if (content.length < 20) continue;
        const key = `global:${row.key}:${block.keySuffix}`;
        const isFaq = block.keySuffix.startsWith("faq-");
        chunks.push({
          key,
          payload: makePayload(key, {
            title: block.label,
            content,
            sourceType: isFaq
              ? "faq"
              : row.key === "siteConfig" || row.key === "footer"
                ? "contact"
                : row.key,
            sourceId: row.key,
          }),
        });
      }
    }
  } catch {
    // global_settings may be missing — page/teacher chunks alone are enough.
  }

  // Manual KB enrichment only (skip CMS mirrors written by prior index runs).
  try {
    type KbRow = {
      id: string;
      title: string;
      content: string;
      source_type: string;
      source_path: string | null;
      source_id: string | null;
      metadata: unknown;
      page_published: boolean | null;
      page_type: string | null;
    };
    const kbRows = await db.$queryRawUnsafe<KbRow[]>(
      `SELECT kb."id", kb."title", kb."content", kb."source_type",
              kb."source_path", kb."source_id", kb."metadata",
              p."published" AS page_published,
              p."type" AS page_type
       FROM "knowledge_base_chunks" kb
       LEFT JOIN "pages" p ON p."id" = kb."source_id"
       WHERE COALESCE(kb."metadata"->>'indexedTo', '') <> 'qdrant'
         AND (p."id" IS NULL OR (p."published" = true AND p."type" <> 'blog'))
       LIMIT 500`,
    );
    for (const row of kbRows) {
      if (isCmsMirrorKb(row.metadata)) continue;
      const content = clip(String(row.content ?? ""));
      if (content.length < 20) continue;
      const sourcePath = toPublicUrl(row.source_path ?? undefined, origin);
      const kbKey = `kb:${row.id}`;
      chunks.push({
        key: kbKey,
        payload: makePayload(kbKey, {
          title: String(row.title ?? "Knowledge"),
          content,
          sourceType: String(row.source_type ?? "kb"),
          ...(sourcePath ? { sourcePath } : {}),
          ...(row.source_id ? { sourceId: row.source_id } : {}),
        }),
      });
    }
  } catch {
    // KB table may be missing — CMS chunks alone are enough.
  }

  // Chat knowledge PDFs (extracted text → stable pdf:{id}:chunk:{n} keys).
  try {
    const pdfDrafts = await buildPdfIndexChunkDrafts();
    for (const draft of pdfDrafts) {
      const content = clip(draft.content);
      if (content.length < 20) continue;
      chunks.push({
        key: draft.key,
        payload: makePayload(draft.key, {
          title: draft.title,
          content,
          sourceType: draft.sourceType,
          sourcePath: draft.sourcePath,
          sourceId: draft.sourceId,
        }),
      });
    }
  } catch {
    // PDF table may be missing — CMS/KB chunks alone are enough.
  }

  return chunks;
}

/**
 * Best-effort Neon mirror for admin/debug (same id as Qdrant point).
 *
 * @param pointId - Qdrant / KB row id
 * @param payload - Chunk payload
 * @param vector - Embedding vector
 */
async function mirrorChunkToNeon(
  pointId: string,
  payload: QdrantChunkPayload,
  vector: number[],
): Promise<void> {
  try {
    await db.knowledgeBaseChunk.upsert({
      where: { id: pointId },
      create: {
        id: pointId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId ?? null,
        sourcePath: payload.sourcePath ?? null,
        title: payload.title,
        content: payload.content,
        metadata: {
          indexedTo: "qdrant",
          chunkKey: payload.chunkKey ?? null,
          contentHash: payload.contentHash ?? null,
        },
        embedding: vector,
      },
      update: {
        sourceType: payload.sourceType,
        sourceId: payload.sourceId ?? null,
        sourcePath: payload.sourcePath ?? null,
        title: payload.title,
        content: payload.content,
        metadata: {
          indexedTo: "qdrant",
          chunkKey: payload.chunkKey ?? null,
          contentHash: payload.contentHash ?? null,
        },
        embedding: vector,
      },
    });
  } catch {
    // Non-fatal if Neon KB write fails.
  }
}

/**
 * Delete Neon mirror rows for removed Qdrant points (best-effort).
 *
 * @param ids - Point / KB ids
 */
async function deleteNeonMirrors(ids: string[]): Promise<void> {
  for (const id of ids) {
    try {
      await db.knowledgeBaseChunk.delete({ where: { id } });
    } catch {
      // Row may not exist or KB table missing.
    }
  }
}

/**
 * Sync live CMS/KB/PDF chunks into Qdrant (upsert + delete orphans).
 *
 * Incremental mode skips embed/upsert when `contentHash` matches.
 * Full mode re-embeds every live chunk, then deletes orphans.
 *
 * @param options - Sync mode and optional site origin
 */
export async function syncChatIndex(options?: {
  mode?: ChatIndexSyncMode;
  siteOrigin?: string;
}): Promise<ChatIndexSyncResult> {
  const mode: ChatIndexSyncMode = options?.mode ?? "incremental";
  const started = Date.now();
  const ensured = await ensureQdrantCollection();

  const chunks = await buildCmsIndexChunks(options?.siteOrigin);
  const liveById = new Map(
    chunks.map((chunk) => [chunkPointId(chunk.key), chunk] as const),
  );
  const liveIds = new Set(liveById.keys());

  const existing = await listQdrantPointSummaries();
  const existingById = new Map(existing.map((point) => [point.id, point]));

  const toDelete = existing
    .map((point) => point.id)
    .filter((id) => !liveIds.has(id));

  let upserted = 0;
  let skipped = 0;

  for (const [pointId, chunk] of liveById) {
    const prior = existingById.get(pointId);
    const unchanged =
      mode === "incremental" &&
      prior?.contentHash &&
      prior.contentHash === chunk.payload.contentHash;

    if (unchanged) {
      skipped += 1;
      continue;
    }

    const vector = await embedText(
      `${chunk.payload.title}\n${chunk.payload.content}`,
    );
    await upsertQdrantChunks([
      {
        id: pointId,
        vector,
        payload: chunk.payload,
      },
    ]);
    await mirrorChunkToNeon(pointId, chunk.payload, vector);
    upserted += 1;
    await new Promise((resolve) => setTimeout(resolve, EMBED_BATCH_PAUSE_MS));
  }

  const deleted = await deleteQdrantPoints(toDelete);
  if (toDelete.length > 0) {
    await deleteNeonMirrors(toDelete);
  }

  const pdfSourceIds = [
    ...new Set(
      chunks
        .filter((chunk) => chunk.payload.sourceType === "pdf")
        .map((chunk) => chunk.payload.sourceId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (pdfSourceIds.length > 0) {
    await markPdfsIndexed(pdfSourceIds);
  }

  return {
    mode,
    total: chunks.length,
    upserted,
    skipped,
    deleted,
    durationMs: Date.now() - started,
    collection: ensured.name,
  };
}

/**
 * Embed CMS/KB chunks and upsert them into Qdrant (incremental sync).
 *
 * @param siteOrigin - Optional public origin for absolute URLs
 * @returns Counts of indexed points
 */
export async function indexCmsToQdrant(siteOrigin?: string): Promise<{
  chunks: number;
  upserted: number;
  deleted: number;
  skipped: number;
  durationMs: number;
}> {
  const result = await syncChatIndex({ mode: "incremental", siteOrigin });
  return {
    chunks: result.total,
    upserted: result.upserted,
    deleted: result.deleted,
    skipped: result.skipped,
    durationMs: result.durationMs,
  };
}

/**
 * Map RetrievedChunk helpers for tests / callers.
 *
 * @param payload - Qdrant payload
 */
export function payloadToChunk(payload: QdrantChunkPayload): RetrievedChunk {
  return {
    title: payload.title,
    content: payload.content,
    sourceType: payload.sourceType,
    ...(payload.sourcePath ? { sourcePath: payload.sourcePath } : {}),
  };
}
