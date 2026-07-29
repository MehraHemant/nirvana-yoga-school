/** Persisted chat message roles. */
export type ChatMessageRole = "user" | "assistant" | "system";

/** Public chat message shape returned by the API. */
export type ChatMessageRecord = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

/** Public conversation summary. */
export type ChatConversationRecord = {
  id: string;
  sessionId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageRecord[];
};

/** Incoming public chat POST body. */
export type ChatPostInput = {
  sessionId: string;
  conversationId?: string;
  message: string;
};

/** A snippet of site knowledge injected into the chat prompt (RAG). */
export type RetrievedChunk = {
  title: string;
  content: string;
  sourceType: string;
  sourcePath?: string;
};
