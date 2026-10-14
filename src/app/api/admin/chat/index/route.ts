import { type ChatIndexSyncMode, syncChatIndex } from "@/lib/chat/index-cms";
import { isQdrantConfigured } from "@/lib/chat/qdrant";
import {
  jsonInternal,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";

export const runtime = "nodejs";
/** Indexing embeds many chunks; allow a longer serverless window. */
export const maxDuration = 300;

/**
 * Sync live CMS/KB/PDF content into the Qdrant chat collection.
 *
 * Body (optional): `{ "mode": "incremental" | "full" }`
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return jsonUnavailable("GEMINI_API_KEY is not configured");
  }
  if (!isQdrantConfigured()) {
    return jsonUnavailable("QDRANT_URL is not configured");
  }

  let mode: ChatIndexSyncMode = "incremental";
  try {
    const body = (await request.json().catch(() => null)) as {
      mode?: unknown;
    } | null;
    if (body?.mode === "full" || body?.mode === "incremental") {
      mode = body.mode;
    }
  } catch {
    // Empty / non-JSON body → default incremental.
  }

  try {
    const result = await syncChatIndex({
      mode,
      siteOrigin:
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        process.env.SITE_URL?.trim() ||
        undefined,
    });
    return jsonOk({
      success: true,
      upserted: result.upserted,
      deleted: result.deleted,
      skipped: result.skipped,
      total: result.total,
      durationMs: result.durationMs,
      mode: result.mode,
      collection: result.collection,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat index sync failed";
    return jsonInternal(message);
  }
}
