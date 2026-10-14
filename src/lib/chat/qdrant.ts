import { createHash } from "node:crypto";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { RetrievedChunk } from "@/content/types/chat";
import { embeddingDimensions } from "@/lib/ai/embeddings";

/** Payload stored on each Qdrant point for chat RAG. */
export type QdrantChunkPayload = {
  title: string;
  content: string;
  sourceType: string;
  sourcePath?: string;
  sourceId?: string;
  /** Stable chunk identity used to derive the point id. */
  chunkKey?: string;
  /** Hash of indexable fields; used to skip unchanged re-embeds. */
  contentHash?: string;
};

/** Lightweight point summary for incremental sync. */
export type QdrantPointSummary = {
  id: string;
  contentHash?: string;
  chunkKey?: string;
};

let client: QdrantClient | null = null;

/**
 * Whether Qdrant is configured for chat RAG.
 */
export function isQdrantConfigured(): boolean {
  return Boolean(process.env.QDRANT_URL?.trim());
}

/**
 * Qdrant collection name for site knowledge chunks.
 */
export function qdrantCollection(): string {
  return process.env.QDRANT_COLLECTION?.trim() || "nirvana_chat_chunks";
}

/**
 * Shared Qdrant REST client (lazy).
 */
export function getQdrantClient(): QdrantClient {
  if (client) return client;
  const url = process.env.QDRANT_URL?.trim();
  if (!url) {
    throw new Error("QDRANT_URL is not configured");
  }
  const apiKey = process.env.QDRANT_API_KEY?.trim();
  client = new QdrantClient({
    url,
    ...(apiKey ? { apiKey } : {}),
  });
  return client;
}

/**
 * Deterministic UUID for a chunk key (Qdrant point id).
 *
 * @param key - Stable chunk identity string
 */
export function chunkPointId(key: string): string {
  const hex = createHash("sha256").update(key).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Ensure the chat collection exists with the expected vector size.
 *
 * @returns Whether the collection was newly created, plus name/size
 */
export async function ensureQdrantCollection(): Promise<{
  created: boolean;
  name: string;
  vectorSize: number;
}> {
  const qdrant = getQdrantClient();
  const name = qdrantCollection();
  const vectorSize = embeddingDimensions();
  const exists = await qdrant.collectionExists(name);
  if (exists.exists) {
    return { created: false, name, vectorSize };
  }

  await qdrant.createCollection(name, {
    vectors: {
      size: vectorSize,
      distance: "Cosine",
    },
  });
  return { created: true, name, vectorSize };
}

/**
 * Upsert embedded chunks into Qdrant.
 *
 * @param points - Points with vectors and payloads
 */
export async function upsertQdrantChunks(
  points: Array<{
    id: string;
    vector: number[];
    payload: QdrantChunkPayload;
  }>,
): Promise<number> {
  if (points.length === 0) return 0;
  await ensureQdrantCollection();
  const qdrant = getQdrantClient();
  await qdrant.upsert(qdrantCollection(), {
    wait: true,
    points: points.map((point) => ({
      id: point.id,
      vector: point.vector,
      payload: point.payload,
    })),
  });
  return points.length;
}

/**
 * Scroll all point ids + content hashes from the chat collection.
 *
 * @returns Point summaries for sync comparison
 */
export async function listQdrantPointSummaries(): Promise<
  QdrantPointSummary[]
> {
  if (!isQdrantConfigured()) return [];

  const qdrant = getQdrantClient();
  const name = qdrantCollection();
  const exists = await qdrant.collectionExists(name);
  if (!exists.exists) return [];

  const summaries: QdrantPointSummary[] = [];
  let offset: string | number | undefined | null;

  for (;;) {
    const page = await qdrant.scroll(name, {
      limit: 256,
      with_payload: ["contentHash", "chunkKey"],
      with_vector: false,
      ...(offset !== undefined && offset !== null ? { offset } : {}),
    });

    for (const point of page.points) {
      const id = String(point.id);
      const payload = (point.payload ?? {}) as Partial<QdrantChunkPayload>;
      summaries.push({
        id,
        ...(typeof payload.contentHash === "string"
          ? { contentHash: payload.contentHash }
          : {}),
        ...(typeof payload.chunkKey === "string"
          ? { chunkKey: payload.chunkKey }
          : {}),
      });
    }

    offset = page.next_page_offset as string | number | null | undefined;
    if (offset === null || offset === undefined) break;
  }

  return summaries;
}

/**
 * Empty the chat collection by deleting and recreating it.
 *
 * Used after PDF removal so remaining sources can be re-indexed cleanly.
 *
 * @returns Whether a collection existed and was wiped
 */
export async function emptyQdrantCollection(): Promise<{
  wiped: boolean;
  name: string;
}> {
  if (!isQdrantConfigured()) {
    return { wiped: false, name: qdrantCollection() };
  }

  const qdrant = getQdrantClient();
  const name = qdrantCollection();
  const exists = await qdrant.collectionExists(name);
  if (exists.exists) {
    await qdrant.deleteCollection(name);
  }
  await ensureQdrantCollection();
  return { wiped: exists.exists, name };
}

/**
 * Delete points by id from the chat collection.
 *
 * @param ids - Qdrant point ids
 * @returns Number of ids requested for deletion
 */
export async function deleteQdrantPoints(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const qdrant = getQdrantClient();
  const name = qdrantCollection();
  const exists = await qdrant.collectionExists(name);
  if (!exists.exists) return 0;

  const BATCH = 64;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await qdrant.delete(name, {
      wait: true,
      points: batch,
    });
  }
  return ids.length;
}

/**
 * Vector-search Qdrant for chunks similar to the query embedding.
 *
 * @param vector - Query embedding
 * @param limit - Max results
 * @returns Retrieved chunks for the chat prompt
 */
export async function searchQdrantChunks(
  vector: number[],
  limit: number,
): Promise<RetrievedChunk[]> {
  if (!isQdrantConfigured()) return [];

  try {
    const qdrant = getQdrantClient();
    const name = qdrantCollection();
    const exists = await qdrant.collectionExists(name);
    if (!exists.exists) return [];

    const results = await qdrant.search(name, {
      vector,
      limit,
      with_payload: true,
    });

    return results
      .map((hit) => {
        const payload = (hit.payload ?? {}) as Partial<QdrantChunkPayload>;
        const title = typeof payload.title === "string" ? payload.title : "";
        const content =
          typeof payload.content === "string" ? payload.content : "";
        if (!title && !content) return null;
        const sourcePath =
          typeof payload.sourcePath === "string"
            ? payload.sourcePath
            : undefined;
        return {
          title: title || "Site knowledge",
          content,
          sourceType:
            typeof payload.sourceType === "string"
              ? payload.sourceType
              : "qdrant",
          ...(sourcePath ? { sourcePath } : {}),
        } satisfies RetrievedChunk;
      })
      .filter((item): item is RetrievedChunk => item !== null);
  } catch {
    // Misconfigured / unreachable Qdrant — caller falls back to KB/CMS.
    return [];
  }
}
