import { embeddingDimensions } from "../src/lib/ai/embeddings";
import { syncChatIndex } from "../src/lib/chat/index-cms";
import {
  ensureQdrantCollection,
  getQdrantClient,
  isQdrantConfigured,
  qdrantCollection,
} from "../src/lib/chat/qdrant";

/**
 * Create the Qdrant collection (if needed), then sync live CMS/KB chunks.
 *
 * Requires:
 * - NEON_DB_POSTGRES_URL
 * - GEMINI_API_KEY
 * - QDRANT_URL
 * - optional QDRANT_API_KEY, QDRANT_COLLECTION, QDRANT_VECTOR_SIZE
 *
 * Run: npm run db:index:chat
 * Full re-embed: npm run db:index:chat -- --full
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is required for embeddings.");
  }
  if (!isQdrantConfigured()) {
    throw new Error("QDRANT_URL is required.");
  }

  const mode = process.argv.includes("--full") ? "full" : "incremental";
  const name = qdrantCollection();
  const vectorSize = embeddingDimensions();

  console.log(
    `Ensuring collection "${name}" (vector size ${vectorSize}, Cosine)…`,
  );
  const ensured = await ensureQdrantCollection();
  if (ensured.created) {
    console.log(`Created collection "${ensured.name}".`);
  } else {
    console.log(`Collection "${ensured.name}" already exists.`);
  }

  console.log(`Syncing live CMS/KB/PDF chunks (${mode})…`);
  const result = await syncChatIndex({
    mode,
    siteOrigin:
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.SITE_URL?.trim() ||
      undefined,
  });
  console.log(
    `Done. total=${result.total} upserted=${result.upserted} skipped=${result.skipped} deleted=${result.deleted} durationMs=${result.durationMs}`,
  );

  const info = await getQdrantClient().getCollection(name);
  const points =
    typeof info.points_count === "number" ? info.points_count : "unknown";
  console.log(`Verified collection "${name}": ${points} points.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
