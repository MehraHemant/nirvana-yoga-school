import "server-only";

import type { RetrievedChunk } from "@/content/types/chat";
import { embedText } from "@/lib/ai/embeddings";
import { db } from "@/lib/db";
import { isQdrantConfigured, searchQdrantChunks } from "./qdrant";
import { getChatSiteOrigin, toPublicUrl } from "./site-url";

export type { RetrievedChunk };
export { getChatSiteOrigin, toPublicUrl };

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "what",
  "which",
  "who",
  "how",
  "when",
  "where",
  "why",
  "your",
  "you",
  "me",
  "my",
  "i",
  "we",
  "our",
  "about",
  "please",
  "tell",
  "need",
  "want",
  "have",
  "has",
  "this",
  "that",
  "there",
  "from",
  "any",
  "also",
  "just",
  "hi",
  "hello",
  "hey",
  "namaste",
]);

/** Max chunks injected into the prompt. */
const TOP_K = 4;
/** Snippet length cap for prompt tokens. */
const CHUNK_CONTENT_MAX = 520;
/** Rows pulled from KB before scoring. */
const KB_FETCH_LIMIT = 20;
/** Rows pulled from CMS search before scoring. */
const CMS_FETCH_LIMIT = 16;
/** Baseline catalog rows when CMS search misses. */
const CMS_BASELINE_LIMIT = 10;
/** Skip CMS when KB already returned at least this many hits. */
const MIN_KB_TO_SKIP_CMS = 2;
/** In-memory retrieval cache TTL. */
const CACHE_TTL_MS = 90_000;
/** Max cached query fingerprints. */
const CACHE_MAX_ENTRIES = 100;

type CacheEntry = {
  chunks: RetrievedChunk[];
  expiresAt: number;
};

const retrievalCache = new Map<string, CacheEntry>();

/**
 * Extract searchable keywords from a user message.
 *
 * @param query - Raw user message
 */
function extractKeywords(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

  return [...new Set(tokens)].slice(0, 8);
}

/**
 * Build a stable cache key from stop-word-filtered tokens + site origin.
 *
 * @param query - Raw user message
 * @param keywords - Extracted keywords
 * @param siteOrigin - Optional request origin
 */
function queryFingerprint(
  query: string,
  keywords: string[],
  siteOrigin?: string,
): string {
  const tokenKey =
    keywords.length > 0
      ? [...keywords].sort().join(" ")
      : query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
  return `${getChatSiteOrigin(siteOrigin)}|${tokenKey}`;
}

/**
 * Read a non-expired cache entry, or undefined on miss.
 *
 * @param key - Fingerprint key
 */
function getCachedChunks(key: string): RetrievedChunk[] | undefined {
  const entry = retrievalCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    retrievalCache.delete(key);
    return undefined;
  }
  // Refresh insertion order for simple LRU eviction.
  retrievalCache.delete(key);
  retrievalCache.set(key, entry);
  return entry.chunks.map((chunk) => ({ ...chunk }));
}

/**
 * Store chunks under a fingerprint; evict oldest entries when over capacity.
 *
 * @param key - Fingerprint key
 * @param chunks - Retrieved snippets
 */
function setCachedChunks(key: string, chunks: RetrievedChunk[]): void {
  if (retrievalCache.has(key)) {
    retrievalCache.delete(key);
  }
  while (retrievalCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = retrievalCache.keys().next().value;
    if (oldest === undefined) break;
    retrievalCache.delete(oldest);
  }
  retrievalCache.set(key, {
    chunks: chunks.map((chunk) => ({ ...chunk })),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Score how well text matches the query keywords.
 *
 * @param text - Candidate text
 * @param keywords - Query keywords
 * @param fullQuery - Original lowercased query
 */
function relevanceScore(
  text: string,
  keywords: string[],
  fullQuery: string,
): number {
  const hay = text.toLowerCase();
  let score = 0;
  if (fullQuery.length >= 4 && hay.includes(fullQuery)) score += 10;
  for (const keyword of keywords) {
    if (hay.includes(keyword)) score += keyword.length >= 4 ? 3 : 1;
  }
  return score;
}

/**
 * Truncate chunk body for the prompt.
 *
 * @param content - Full content
 */
function clip(content: string): string {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= CHUNK_CONTENT_MAX) return trimmed;
  return `${trimmed.slice(0, CHUNK_CONTENT_MAX - 1)}…`;
}

/**
 * Deduplicate chunks by title + source path, keeping first occurrence.
 *
 * @param chunks - Candidate snippets
 */
function dedupeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  const out: RetrievedChunk[] = [];
  for (const chunk of chunks) {
    const key = `${chunk.title}\0${chunk.sourcePath ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chunk);
  }
  return out;
}

/**
 * Query indexed knowledge_base_chunks by simple text relevance.
 *
 * @param query - User message
 * @param keywords - Extracted keywords
 * @param siteOrigin - Optional request origin for absolute URLs
 */
async function retrieveFromKnowledgeBase(
  query: string,
  keywords: string[],
  siteOrigin?: string,
): Promise<RetrievedChunk[]> {
  const terms = keywords.length > 0 ? keywords : [query.trim().toLowerCase()];
  if (!terms[0]) return [];

  const likeParams = terms.map((term) => `%${term}%`);
  const titleClauses = likeParams.map(() => `"title" ILIKE ?`).join(" OR ");
  const contentClauses = likeParams.map(() => `"content" ILIKE ?`).join(" OR ");

  type KbRow = {
    title: string;
    content: string;
    source_type: string;
    source_path: string | null;
  };

  const rows = await db.$queryRawUnsafe<KbRow[]>(
    `SELECT "title", "content", "source_type", "source_path"
     FROM "knowledge_base_chunks"
     WHERE (${titleClauses}) OR (${contentClauses})
     LIMIT ${KB_FETCH_LIMIT}`,
    ...likeParams,
    ...likeParams,
  );

  if (rows.length === 0) return [];

  const fullQuery = query.trim().toLowerCase();
  return rows
    .map((row) => {
      const content = String(row.content ?? "");
      const title = String(row.title ?? "");
      const sourcePath = toPublicUrl(row.source_path ?? undefined, siteOrigin);
      return {
        chunk: {
          title,
          content: clip(content),
          sourceType: String(row.source_type ?? "kb"),
          ...(sourcePath ? { sourcePath } : {}),
        } satisfies RetrievedChunk,
        score: relevanceScore(`${title}\n${content}`, keywords, fullQuery),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K)
    .map((item) => item.chunk);
}

/**
 * Pull FAQ Q&A pairs from a course/retreat document JSON blob.
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
    )
    .slice(0, 6);
}

/**
 * Fall back to live CMS pages/courses when the KB table is empty or thin.
 *
 * @param query - User message
 * @param keywords - Extracted keywords
 * @param siteOrigin - Optional request origin for absolute URLs
 * @param limit - Max chunks to return
 */
async function retrieveFromCms(
  query: string,
  keywords: string[],
  siteOrigin?: string,
  limit: number = TOP_K,
): Promise<RetrievedChunk[]> {
  const terms = keywords.length > 0 ? keywords : [query.trim().toLowerCase()];
  const fullQuery = query.trim().toLowerCase();

  type PageRow = {
    id: string;
    slug: string;
    type: string;
    title: string;
    description: string | null;
    fee: string | null;
    duration: string | null;
    document: unknown;
  };

  let rows: PageRow[] = [];

  if (terms[0]) {
    const likeParams = terms.map((term) => `%${term}%`);
    const titleOr = likeParams.map(() => `p."title" ILIKE ?`).join(" OR ");
    const descOr = likeParams.map(() => `p."description" ILIKE ?`).join(" OR ");
    const slugOr = likeParams.map(() => `p."slug" ILIKE ?`).join(" OR ");

    rows = await db.$queryRawUnsafe<PageRow[]>(
      `SELECT p."id", p."slug", p."type", p."title", p."description", p."fee",
              p."duration", cd."document"
       FROM "pages" p
       LEFT JOIN "course_documents" cd ON cd."page_id" = p."id"
       WHERE p."published" = true
         AND ((${titleOr}) OR (${descOr}) OR (${slugOr}))
       ORDER BY p."title" ASC
       LIMIT ${CMS_FETCH_LIMIT}`,
      ...likeParams,
      ...likeParams,
      ...likeParams,
    );
  }

  // Always have a baseline catalog so program questions still get context.
  if (rows.length === 0) {
    rows = await db.$queryRawUnsafe<PageRow[]>(
      `SELECT p."id", p."slug", p."type", p."title", p."description", p."fee",
              p."duration", cd."document"
       FROM "pages" p
       LEFT JOIN "course_documents" cd ON cd."page_id" = p."id"
       WHERE p."published" = true
       ORDER BY
         CASE p."type"
           WHEN 'course' THEN 0
           WHEN 'online' THEN 1
           WHEN 'retreat' THEN 2
           WHEN 'venue' THEN 3
           ELSE 4
         END,
         p."title" ASC
       LIMIT ${CMS_BASELINE_LIMIT}`,
    );
  }

  const scored: Array<{ chunk: RetrievedChunk; score: number }> = [];

  for (const row of rows) {
    const pageUrl = toPublicUrl(`/${row.slug}`, siteOrigin) ?? `/${row.slug}`;
    const parts = [
      row.title,
      row.description ?? "",
      row.fee ? `Fee: ${row.fee}` : "",
      row.duration ? `Duration: ${row.duration}` : "",
      `URL: ${pageUrl}`,
    ].filter(Boolean);
    const pageText = parts.join("\n");
    const pageScore = relevanceScore(pageText, keywords, fullQuery);
    // Keep a few unmatched baseline catalog rows so the model still knows offerings.
    const keepBaseline =
      keywords.length === 0 || pageScore > 0 || scored.length < 6;
    if (keepBaseline) {
      scored.push({
        chunk: {
          title: row.title,
          content: clip(pageText),
          sourceType: row.type || "page",
          sourcePath: pageUrl,
        },
        score: pageScore + (row.type === "course" ? 1 : 0),
      });
    }

    for (const faq of extractFaqs(row.document)) {
      const faqText = `Q: ${faq.question}\nA: ${faq.answer}`;
      const faqScore = relevanceScore(faqText, keywords, fullQuery);
      if (faqScore <= 0) continue;
      scored.push({
        chunk: {
          title: `${row.title} — FAQ`,
          content: clip(faqText),
          sourceType: "faq",
          sourcePath: pageUrl,
        },
        score: faqScore + 2,
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

/**
 * Vector search via Qdrant (Gemini embeddings).
 *
 * @param query - User message
 */
async function retrieveFromQdrant(query: string): Promise<RetrievedChunk[]> {
  if (!isQdrantConfigured()) return [];
  const vector = await embedText(query, "RETRIEVAL_QUERY");
  const hits = await searchQdrantChunks(vector, TOP_K);
  return hits.map((chunk) => ({
    ...chunk,
    content: clip(chunk.content),
  }));
}

/**
 * Qdrant-first retrieval, then Neon KB text match, then live CMS fill-in.
 *
 * @param query - Current user message
 * @param keywords - Extracted keywords
 * @param siteOrigin - Optional request origin for absolute URLs
 */
async function retrieveUncached(
  query: string,
  keywords: string[],
  siteOrigin?: string,
): Promise<RetrievedChunk[]> {
  let fromVector: RetrievedChunk[] = [];
  try {
    fromVector = await retrieveFromQdrant(query);
  } catch {
    // Qdrant/embed unavailable — fall through to keyword paths.
  }

  if (fromVector.length >= MIN_KB_TO_SKIP_CMS) {
    return fromVector.slice(0, TOP_K);
  }

  let fromKb: RetrievedChunk[] = [];
  try {
    fromKb = await retrieveFromKnowledgeBase(query, keywords, siteOrigin);
  } catch {
    // KB table may be missing before migration — fall through to CMS.
  }

  const mergedSeed = dedupeChunks([...fromVector, ...fromKb]);
  if (mergedSeed.length >= MIN_KB_TO_SKIP_CMS) {
    return mergedSeed.slice(0, TOP_K);
  }

  try {
    const needed = TOP_K - mergedSeed.length;
    const fromCms = await retrieveFromCms(
      query,
      keywords,
      siteOrigin,
      needed > 0 ? needed + mergedSeed.length : TOP_K,
    );
    if (mergedSeed.length === 0) return fromCms;
    return dedupeChunks([...mergedSeed, ...fromCms]).slice(0, TOP_K);
  } catch {
    return mergedSeed.slice(0, TOP_K);
  }
}

/**
 * Retrieve top knowledge snippets for a chat turn.
 * Order: Qdrant vector search → Neon KB text match → live CMS fill-in.
 * Results are cached briefly by normalized query fingerprint.
 *
 * @param query - Current user message
 * @param siteOrigin - Optional request origin for absolute URLs
 */
export async function retrieveChatContext(
  query: string,
  siteOrigin?: string,
): Promise<RetrievedChunk[]> {
  const keywords = extractKeywords(query);
  const cacheKey = queryFingerprint(query, keywords, siteOrigin);
  const cached = getCachedChunks(cacheKey);
  if (cached) return cached;

  const chunks = await retrieveUncached(query, keywords, siteOrigin);
  setCachedChunks(cacheKey, chunks);
  return chunks;
}

/**
 * Format retrieved chunks into a prompt context block.
 *
 * @param chunks - Retrieved snippets
 * @param siteOrigin - Optional request origin for absolute URLs
 */
export function formatRetrievedContext(
  chunks: RetrievedChunk[],
  siteOrigin?: string,
): string {
  if (chunks.length === 0) {
    return "No site knowledge snippets were retrieved for this question. Answer briefly from general school knowledge and suggest Enquire Now / Book Now / WhatsApp for specifics.";
  }

  const blocks = chunks.map((chunk) => {
    const url = toPublicUrl(chunk.sourcePath, siteOrigin);
    const urlLine = url ? `\nURL: ${url}` : "";
    return `Source: ${chunk.title}${urlLine}\n${chunk.content}`;
  });

  return `Use the following site knowledge when answering. Prefer these facts over guesses. When you name a course or page that has a URL, include a Markdown link [title](url). Do not cite sources with numbers or footnotes. If something is missing, say so and point the visitor to Enquire Now, Book Now, or WhatsApp.\n\n${blocks.join("\n\n")}`;
}
