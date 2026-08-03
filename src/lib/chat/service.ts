import "server-only";

import type {
  ChatConversationRecord,
  ChatMessageRecord,
  ChatMessageRole,
  ChatPostInput,
} from "@/content/types/chat";
import { type AiChatMessage, getAiProvider } from "@/lib/ai";
import { db } from "@/lib/db";
import type { ParseResult } from "@/lib/types/api";
import {
  extractEnquiryDraft,
  formatEnquiryResultForPrompt,
  formatEnquiryStateForPrompt,
  maybeSubmitChatEnquiry,
} from "./enquiry";
import {
  formatRetrievedContext,
  getChatSiteOrigin,
  retrieveChatContext,
} from "./retrieve";
import { CHAT_SYSTEM_PROMPT } from "./system-prompt";

const SESSION_ID_MAX = 64;
const MESSAGE_MAX = 4000;
/** Recent turns sent to the model (keeps latency/cost down). */
const HISTORY_LIMIT = 8;
const MAX_OUTPUT_TOKENS = 512;
const TEMPERATURE = 0.35;

/** SSE event shapes emitted by {@link streamChatMessage}. */
export type ChatStreamEvent =
  | { type: "start"; conversationId: string }
  | { type: "status"; phase: "retrieving" | "generating" }
  | { type: "delta"; text: string }
  | { type: "done"; conversation: ChatConversationRecord }
  | { type: "error"; message: string };

/** Characters per streamed paint (smaller = smoother typewriter). */
const STREAM_PIECE_CHARS = 3;
/** Delay between pieces in ms (higher = slower; keep low for Vercel maxDuration). */
const STREAM_PIECE_DELAY_MS = 12;

/**
 * Remove bare numeric footnote markers like [1] without touching Markdown links.
 *
 * @param text - Assistant reply text
 */
function stripBareCitationMarkers(text: string): string {
  return text
    .replace(/ ?\[\d+\](?!\()/g, "")
    .replace(/ +([.,;:!?])/g, "$1");
}

/**
 * Stream-safe citation strip (no space/punct rewrites that shrink prior output).
 *
 * @param text - Cumulative raw model text
 */
function stripBareCitationMarkersForStream(text: string): string {
  return text.replace(/\[\d+\](?!\()/g, "").replace(/ {2,}/g, " ");
}

/**
 * Prefix safe to emit while streaming; holds back incomplete `[n]` / `[n](` ambiguity.
 *
 * @param text - Cumulative raw model text
 */
function citationSafePrefix(text: string): string {
  const hold = text.match(/(\[\d*\]?)$/);
  if (!hold) return text;
  return text.slice(0, text.length - hold[1].length);
}

/**
 * Split a model chunk into small pieces so the UI can type text out
 * smoothly even when the provider delivers large buffered deltas.
 *
 * @param text - Raw delta from the model
 * @param pieceSize - Characters per yielded piece
 */
function* paceStreamText(
  text: string,
  pieceSize = STREAM_PIECE_CHARS,
): Generator<string, void, unknown> {
  if (!text) return;
  if (text.length <= pieceSize) {
    yield text;
    return;
  }
  for (let i = 0; i < text.length; i += pieceSize) {
    yield text.slice(i, i + pieceSize);
  }
}

/**
 * Validate a public chat POST body.
 *
 * @param body - Raw JSON body
 */
export function parseChatPostInput(body: unknown): ParseResult<ChatPostInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body" };
  }

  const record = body as Record<string, unknown>;
  const sessionId =
    typeof record.sessionId === "string" ? record.sessionId.trim() : "";
  const message =
    typeof record.message === "string" ? record.message.trim() : "";
  const conversationId =
    typeof record.conversationId === "string"
      ? record.conversationId.trim()
      : undefined;

  if (!sessionId || sessionId.length > SESSION_ID_MAX) {
    return { ok: false, error: "sessionId is required" };
  }
  if (!message || message.length > MESSAGE_MAX) {
    return {
      ok: false,
      error: `message is required (max ${MESSAGE_MAX} characters)`,
    };
  }

  return {
    ok: true,
    data: {
      sessionId,
      message,
      ...(conversationId ? { conversationId } : {}),
    },
  };
}

/**
 * Map a DB message row to the public API record.
 *
 * @param row - Chat message row
 */
function toMessageRecord(row: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}): ChatMessageRecord {
  return {
    id: row.id,
    role: row.role as ChatMessageRole,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Load a conversation owned by the given anonymous session.
 *
 * @param conversationId - Conversation id
 * @param sessionId - Client session id
 */
export async function getConversationForSession(
  conversationId: string,
  sessionId: string,
): Promise<ChatConversationRecord | null> {
  const conversation = await db.chatConversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation || conversation.sessionId !== sessionId) {
    return null;
  }

  const messages = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  return {
    id: conversation.id,
    sessionId: conversation.sessionId,
    title: conversation.title ?? undefined,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: messages.map(toMessageRecord),
  };
}

/**
 * Delete a conversation owned by the given anonymous session.
 * Messages are removed via ON DELETE CASCADE.
 *
 * @param conversationId - Conversation id
 * @param sessionId - Client session id
 * @returns true when deleted, false when missing or not owned
 */
export async function deleteConversationForSession(
  conversationId: string,
  sessionId: string,
): Promise<boolean> {
  const conversation = await db.chatConversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation || conversation.sessionId !== sessionId) {
    return false;
  }

  await db.chatConversation.delete({
    where: { id: conversationId },
  });
  return true;
}

/**
 * Ensure a conversation exists for the session and return its id.
 *
 * @param input - Validated chat input
 * @param adminUserId - Optional admin user id
 */
async function ensureConversation(
  input: ChatPostInput,
  adminUserId?: string | null,
): Promise<string> {
  if (input.conversationId) {
    const existing = await db.chatConversation.findUnique({
      where: { id: input.conversationId },
    });
    if (!existing || existing.sessionId !== input.sessionId) {
      throw new Error("Conversation not found");
    }
    return existing.id as string;
  }

  const created = await db.chatConversation.create({
    data: {
      sessionId: input.sessionId,
      adminUserId: adminUserId ?? null,
      title: input.message.slice(0, 80),
    },
  });
  return created.id as string;
}

/**
 * Build system prompt + recent provider messages for a turn (includes RAG).
 * May submit a website enquiry when the visitor confirms collected details.
 *
 * @param conversationId - Conversation id
 * @param userMessage - Latest user message
 * @param siteOrigin - Optional request origin for absolute RAG links
 */
async function prepareChatTurn(
  conversationId: string,
  userMessage: string,
  siteOrigin?: string,
): Promise<{ system: string; messages: AiChatMessage[] }> {
  const priorRows = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  const prior = [...priorRows].reverse();

  const recentForEnquiry = prior
    .filter((row) => row.role === "user" || row.role === "assistant")
    .map((row) => ({ role: row.role, content: row.content }));

  const enquiryResult = await maybeSubmitChatEnquiry({
    latestUserMessage: userMessage,
    recentMessages: recentForEnquiry,
  });
  const enquiryNote = formatEnquiryResultForPrompt(enquiryResult);
  const enquiryDraft = extractEnquiryDraft([
    ...recentForEnquiry,
    { role: "user", content: userMessage },
  ]);
  const enquiryState = formatEnquiryStateForPrompt(enquiryDraft);

  await db.chatMessage.create({
    data: {
      conversationId,
      role: "user",
      content: userMessage,
    },
  });

  const [historyRows, chunks] = await Promise.all([
    db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
    }),
    retrieveChatContext(userMessage, siteOrigin),
  ]);

  const recent = [...historyRows].reverse();
  const messages: AiChatMessage[] = recent
    .filter((row) => row.role === "user" || row.role === "assistant")
    .map((row) => ({
      role: row.role as "user" | "assistant",
      content: row.content,
    }));

  const origin = getChatSiteOrigin(siteOrigin);
  const enquiryParts = [enquiryState, enquiryNote].filter(Boolean);
  const enquiryBlock =
    enquiryParts.length > 0 ? `\n\n---\n${enquiryParts.join("\n")}` : "";
  const system = `${CHAT_SYSTEM_PROMPT}\n\nPublic site origin: ${origin}${enquiryBlock}\n\n---\nSITE KNOWLEDGE\n${formatRetrievedContext(chunks, siteOrigin)}`;

  return { system, messages };
}

/**
 * Stream an assistant reply as SSE-friendly events (persist when complete).
 *
 * @param input - Validated chat input
 * @param adminUserId - Optional admin user id when an admin session is present
 * @param siteOrigin - Optional request origin for absolute RAG links
 */
export async function* streamChatMessage(
  input: ChatPostInput,
  adminUserId?: string | null,
  siteOrigin?: string,
): AsyncGenerator<ChatStreamEvent, void, unknown> {
  const conversationId = await ensureConversation(input, adminUserId);
  yield { type: "start", conversationId };
  yield { type: "status", phase: "retrieving" };

  const { system, messages } = await prepareChatTurn(
    conversationId,
    input.message,
    siteOrigin,
  );

  yield { type: "status", phase: "generating" };

  const provider = getAiProvider();
  let fullText = "";
  let emittedClean = "";

  try {
    for await (const delta of provider.chatStream(messages, {
      system,
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    })) {
      // Pace large Gemini chunks for a smoother, slightly slower typewriter.
      for (const piece of paceStreamText(delta)) {
        fullText += piece;
        const cleaned = stripBareCitationMarkersForStream(
          citationSafePrefix(fullText),
        );
        if (!cleaned.startsWith(emittedClean) || cleaned.length === emittedClean.length) {
          continue;
        }
        const out = cleaned.slice(emittedClean.length);
        emittedClean = cleaned;
        yield { type: "delta", text: out };
        await new Promise((resolve) =>
          setTimeout(resolve, STREAM_PIECE_DELAY_MS),
        );
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to stream chat reply";
    yield { type: "error", message };
    return;
  }

  const cleanedFull = stripBareCitationMarkersForStream(fullText);
  if (cleanedFull.startsWith(emittedClean) && cleanedFull.length > emittedClean.length) {
    yield {
      type: "delta",
      text: cleanedFull.slice(emittedClean.length),
    };
  }

  const content = stripBareCitationMarkers(fullText).trim();
  if (!content) {
    yield { type: "error", message: "AI returned an empty response" };
    return;
  }

  await db.chatMessage.create({
    data: {
      conversationId,
      role: "assistant",
      content,
    },
  });

  await db.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const conversation = await getConversationForSession(
    conversationId,
    input.sessionId,
  );
  if (!conversation) {
    yield {
      type: "error",
      message: "Failed to load conversation after reply",
    };
    return;
  }

  yield { type: "done", conversation };
}
