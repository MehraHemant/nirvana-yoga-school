import {
  deleteChatKnowledgePdf,
  getChatKnowledgePdf,
} from "@/lib/chat/pdf-knowledge";
import { syncChatIndex } from "@/lib/chat/index-cms";
import { emptyQdrantCollection, isQdrantConfigured } from "@/lib/chat/qdrant";
import {
  jsonInternal,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";

export const runtime = "nodejs";
/** Wipe + full re-index can take a while. */
export const maxDuration = 300;

/**
 * Fetch one chat knowledge PDF.
 *
 * @param _request - Incoming request
 * @param context - Route params with PDF id
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(_request);
  if (!session) return jsonUnauthorized();

  const { id } = await context.params;
  const pdf = await getChatKnowledgePdf(id);
  if (!pdf) return jsonNotFound("PDF not found");

  return jsonOk({
    pdf: {
      ...pdf,
      createdAt:
        pdf.createdAt instanceof Date
          ? pdf.createdAt.toISOString()
          : String(pdf.createdAt),
      updatedAt:
        pdf.updatedAt instanceof Date
          ? pdf.updatedAt.toISOString()
          : String(pdf.updatedAt),
    },
  });
}

/**
 * Delete a PDF, empty the Qdrant collection, then re-index remaining sources.
 *
 * @param request - Incoming request
 * @param context - Route params with PDF id
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  if (!session) return jsonUnauthorized();

  const { id } = await context.params;

  try {
    await deleteChatKnowledgePdf(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    if (message === "PDF not found") return jsonNotFound(message);
    return jsonInternal(message);
  }

  let wiped = false;
  let reindex: {
    upserted: number;
    deleted: number;
    skipped: number;
    total: number;
    durationMs: number;
    mode: string;
    collection: string;
  } | null = null;

  try {
    if (isQdrantConfigured()) {
      await emptyQdrantCollection();
      wiped = true;
      if (process.env.GEMINI_API_KEY?.trim()) {
        const result = await syncChatIndex({
          mode: "full",
          siteOrigin:
            process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
            process.env.SITE_URL?.trim() ||
            undefined,
        });
        reindex = {
          upserted: result.upserted,
          deleted: result.deleted,
          skipped: result.skipped,
          total: result.total,
          durationMs: result.durationMs,
          mode: result.mode,
          collection: result.collection,
        };
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Re-index after delete failed";
    return jsonOk({
      success: true,
      deletedId: id,
      wiped,
      reindex: null,
      warning: message,
    });
  }

  return jsonOk({
    success: true,
    deletedId: id,
    wiped,
    reindex,
  });
}
