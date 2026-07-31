import { isAiProviderConfigured } from "@/lib/ai";
import {
  deleteConversationForSession,
  getConversationForSession,
  parseChatPostInput,
  streamChatMessage,
  type ChatStreamEvent,
} from "@/lib/chat/service";
import {
  jsonBadRequest,
  jsonInternal,
  jsonNotFound,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth-session";
import { isDbEnabled } from "@/lib/db";

/** Node runtime required for Neon + Gemini streaming on Vercel. */
export const runtime = "nodejs";
/** Allow RAG + paced SSE on Vercel serverless (Hobby max is plan-capped). */
export const maxDuration = 60;

/**
 * Encode a chat stream event as an SSE data line.
 *
 * @param event - Stream event
 */
function toSse(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Map thrown errors to a visitor-safe SSE error message.
 *
 * @param error - Caught error from the chat stream
 */
function toPublicChatError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Failed to send chat message";

  if (/chat_conversations|chat_messages|does not exist/i.test(message)) {
    return "Chat storage is not ready. Apply the chat DB migration (npm run db:migrate:chat).";
  }
  if (message === "Conversation not found") return message;
  if (
    message.includes("GEMINI_API_KEY") ||
    message.includes("Gemini") ||
    message.toLowerCase().includes("quota")
  ) {
    return message;
  }
  if (/ECONNREFUSED|timeout|ENOTFOUND|connection/i.test(message)) {
    return "Chat temporarily unavailable. Please try again in a moment.";
  }

  console.error("[chat] stream failed:", message);
  return "Failed to send chat message";
}

/**
 * Load chat history for an anonymous session conversation.
 *
 * Query: `sessionId` (required), `conversationId` (required)
 */
export async function GET(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Chat storage unavailable");
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";

  if (!sessionId || !conversationId) {
    return jsonBadRequest("sessionId and conversationId are required");
  }

  try {
    const conversation = await getConversationForSession(
      conversationId,
      sessionId,
    );
    if (!conversation) {
      return jsonNotFound("Conversation not found");
    }
    return jsonOk({ conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/chat_conversations|chat_messages|does not exist/i.test(message)) {
      return jsonUnavailable(
        "Chat storage is not ready. Apply the chat DB migration.",
      );
    }
    return jsonInternal("Failed to load conversation");
  }
}

/**
 * Delete a chat conversation for an anonymous session.
 *
 * Query: `sessionId` (required), `conversationId` (required)
 */
export async function DELETE(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Chat storage unavailable");
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";

  if (!sessionId || !conversationId) {
    return jsonBadRequest("sessionId and conversationId are required");
  }

  try {
    const deleted = await deleteConversationForSession(
      conversationId,
      sessionId,
    );
    if (!deleted) {
      return jsonNotFound("Conversation not found");
    }
    return jsonOk({ ok: true, deleted: true });
  } catch {
    return jsonInternal("Failed to clear conversation");
  }
}

/**
 * Send a visitor message and stream the AI reply as SSE.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Chat storage unavailable");
  }
  if (!isAiProviderConfigured()) {
    return jsonUnavailable("Chat AI provider unavailable");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonBadRequest("Invalid JSON");
  }

  const parsed = parseChatPostInput(body);
  if (!parsed.ok) {
    return jsonBadRequest(parsed.error);
  }

  const adminSession = await getSessionFromRequest(request);
  /** Prefer the incoming request base URL for absolute RAG links. */
  const siteOrigin = new URL(request.url).origin;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        controller.enqueue(encoder.encode(toSse(event)));
      };

      try {
        for await (const event of streamChatMessage(
          parsed.data,
          adminSession?.userId ?? null,
          siteOrigin,
        )) {
          send(event);
          if (event.type === "error") {
            controller.close();
            return;
          }
        }
        controller.close();
      } catch (error) {
        send({ type: "error", message: toPublicChatError(error) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Prevent reverse proxies from buffering the whole reply.
      "X-Accel-Buffering": "no",
    },
  });
}
