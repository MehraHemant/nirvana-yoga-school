/** Stable text embedding model (replaces shut-down text-embedding-004). */
const DEFAULT_EMBED_MODEL = "gemini-embedding-001";
/** Match Qdrant collection size; gemini-embedding-001 defaults to 3072. */
const DEFAULT_VECTOR_SIZE = 768;

type GeminiEmbedResponse = {
  embedding?: { values?: number[] };
  error?: { message?: string };
};

/**
 * Resolve the Gemini embedding model id.
 */
function embedModel(): string {
  return process.env.GEMINI_EMBED_MODEL?.trim() || DEFAULT_EMBED_MODEL;
}

/**
 * Expected embedding vector size for the configured model / Qdrant collection.
 *
 * @returns Dimension count (default 768)
 */
export function embeddingDimensions(): number {
  const raw = process.env.QDRANT_VECTOR_SIZE?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return DEFAULT_VECTOR_SIZE;
}

/**
 * Embed a single text string with Gemini.
 *
 * @param text - Text to embed
 * @param taskType - Gemini embedding task type (document vs query)
 * @returns Embedding vector
 */
export async function embedText(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT",
): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    throw new Error("Cannot embed empty text");
  }

  const model = embedModel();
  const dimensions = embeddingDimensions();
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`,
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text: trimmed.slice(0, 8000) }] },
      outputDimensionality: dimensions,
      taskType,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GeminiEmbedResponse;
  if (!response.ok) {
    throw new Error(
      `Gemini embed ${data.error?.message ?? `failed (${response.status})`}`,
    );
  }

  const values = data.embedding?.values;
  if (!values?.length) {
    throw new Error("Gemini embed returned an empty vector");
  }
  if (values.length !== dimensions) {
    throw new Error(
      `Gemini embed returned ${values.length} dims; expected ${dimensions}`,
    );
  }
  return values;
}
