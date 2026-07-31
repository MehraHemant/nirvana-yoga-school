"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  ChatConversationRecord,
  ChatMessageRecord,
} from "@/content/types/chat";
import { Close, Comment, Send } from "@/icons";

const SESSION_KEY = "nirvana_chat_session";
const CONVERSATION_KEY = "nirvana_chat_conversation";

type ChatStreamEvent =
  | { type: "start"; conversationId: string }
  | { type: "status"; phase: "retrieving" | "generating" }
  | { type: "delta"; text: string }
  | { type: "done"; conversation: ChatConversationRecord }
  | { type: "error"; message: string };

type ChatApiResponse = {
  conversation?: ChatConversationRecord;
  error?: string;
};

/**
 * Creates or reuses an anonymous browser session id for chat history.
 *
 * @returns Stable session id string
 */
function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/**
 * Stabilize markdown while streaming so incomplete `[label](url` syntax
 * never flashes as raw text — show a real link (or just the label) instead.
 *
 * @param content - Partial or complete markdown body
 */
function prepareStreamingMarkdown(content: string): string {
  let text = content;

  // Incomplete image: ![alt](url… or ![alt
  if (/!\[[^\]]*\]\([^)]*$/.test(text)) {
    text = text.replace(/!\[([^\]]*)\]\([^)]*$/, "$1");
  } else if (/!\[[^\]]*$/.test(text)) {
    text = text.replace(/!\[([^\]]*)$/, "$1");
  }

  // Incomplete link with a usable http(s) URL — close it for the parser so
  // it renders as <a> while the remaining URL characters still arrive.
  if (/\[[^\]]+\]\(https?:\/\/[^)\s]*$/.test(text)) {
    text = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]*)$/,
      (_full, label: string, url: string) => {
        if (url.length < 8) return label;
        return `[${label}](${url})`;
      },
    );
  } else if (/\[[^\]]*\]\([^)]*$/.test(text)) {
    // [label](… without a full URL yet — show label only
    text = text.replace(/\[([^\]]*)\]\([^)]*$/, "$1");
  } else if (/\[[^\]]*$/.test(text)) {
    // Incomplete [label without ]
    text = text.replace(/\[([^\]]*)$/, "$1");
  }

  // Incomplete autolink <https://…>
  if (/<https?:[^>\s]*$/.test(text)) {
    text = text.replace(/<(https?:\/\/[^>\s]*)$/, "$1");
  }

  return text;
}

/**
 * Renders assistant markdown (links, bold, lists) without raw HTML.
 *
 * @param content - Markdown message body
 * @param streaming - When true, stabilize incomplete link syntax mid-stream
 */
function ChatMarkdown({
  content,
  streaming = false,
}: {
  content: string;
  streaming?: boolean;
}) {
  const source = streaming ? prepareStreamingMarkdown(content) : content;

  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Floating public-site AI chat widget (brand primary, not a purple AI look).
 */
export default function ChatWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamTextRef = useRef("");
  /** When true, new stream chunks keep the list pinned to the latest message. */
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    try {
      const saved = localStorage.getItem(CONVERSATION_KEY);
      if (saved) setConversationId(saved);
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    if (!open || !sessionId || !conversationId || messages.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat?sessionId=${encodeURIComponent(sessionId)}&conversationId=${encodeURIComponent(conversationId)}`,
        );
        if (!res.ok) {
          if (res.status === 404) {
            localStorage.removeItem(CONVERSATION_KEY);
            if (!cancelled) setConversationId(null);
          }
          return;
        }
        const data = (await res.json()) as ChatApiResponse;
        if (!cancelled && data.conversation) {
          setMessages(data.conversation.messages);
        }
      } catch {
        // history load is best-effort
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, sessionId, conversationId, messages.length]);

  /**
   * Track whether the user is near the bottom so streaming can auto-follow
   * without fighting manual scroll-up.
   */
  function handleListScroll() {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: follow stream only while pinned to bottom
  useEffect(() => {
    if (!open) return;
    if (!stickToBottomRef.current) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, sending]);

  useEffect(() => {
    if (!open) return;
    stickToBottomRef.current = true;
    inputRef.current?.focus();
  }, [open]);

  /**
   * Clear local messages and delete the server conversation for this session.
   */
  async function handleClear() {
    if (sending) return;

    const previousConversationId = conversationId;
    setMessages([]);
    setError(null);
    setConversationId(null);
    try {
      localStorage.removeItem(CONVERSATION_KEY);
    } catch {
      // ignore storage failures
    }

    if (!sessionId || !previousConversationId) return;

    try {
      await fetch(
        `/api/chat?sessionId=${encodeURIComponent(sessionId)}&conversationId=${encodeURIComponent(previousConversationId)}`,
        { method: "DELETE" },
      );
    } catch {
      // server clear is best-effort; UI is already reset
    }
  }

  /**
   * Submit the current draft message and paint SSE deltas as they arrive.
   */
  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !sessionId) return;

    setSending(true);
    setError(null);
    setInput("");
    streamTextRef.current = "";
    stickToBottomRef.current = true;

    const optimisticUser: ChatMessageRecord = {
      id: `local_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const activeStreamId = `stream_${Date.now()}`;
    setStreamingId(activeStreamId);
    setMessages((prev) => [
      ...prev,
      optimisticUser,
      {
        id: activeStreamId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          sessionId,
          message: text,
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      if (!res.ok || !res.body) {
        let message = "Could not send message";
        try {
          const data = (await res.json()) as ChatApiResponse;
          if (data.error) message = data.error;
        } catch {
          // non-JSON error body
        }
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawDone = false;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part
            .split("\n")
            .map((entry) => entry.trim())
            .find((entry) => entry.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;

          let event: ChatStreamEvent;
          try {
            event = JSON.parse(payload) as ChatStreamEvent;
          } catch {
            continue;
          }

          if (event.type === "start") {
            setConversationId(event.conversationId);
            try {
              localStorage.setItem(CONVERSATION_KEY, event.conversationId);
            } catch {
              // ignore
            }
          } else if (event.type === "delta") {
            streamTextRef.current += event.text;
            const nextContent = streamTextRef.current;
            // Flush each piece so React does not batch the whole reply.
            flushSync(() => {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === activeStreamId
                    ? { ...message, content: nextContent }
                    : message,
                ),
              );
            });
          } else if (event.type === "done") {
            sawDone = true;
            setConversationId(event.conversation.id);
            setMessages(event.conversation.messages);
            try {
              localStorage.setItem(CONVERSATION_KEY, event.conversation.id);
            } catch {
              // ignore
            }
          } else if (event.type === "error") {
            streamError = event.message || "Failed to send chat message";
          }
        }
      }

      if (streamError) {
        throw new Error(streamError);
      }

      if (!sawDone) {
        const keptContent = streamTextRef.current.trim();
        if (keptContent) {
          // Stream ended early (proxy/timeout) but deltas arrived — keep them.
          return;
        }
        setMessages((prev) =>
          prev.filter(
            (message) =>
              message.id !== activeStreamId && message.id !== optimisticUser.id,
          ),
        );
        throw new Error("Could not send message");
      }
    } catch (err) {
      const keptContent = streamTextRef.current.trim();
      if (!keptContent) {
        setMessages((prev) =>
          prev.filter(
            (message) =>
              message.id !== activeStreamId && message.id !== optimisticUser.id,
          ),
        );
        setInput(text);
      }
      setError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSending(false);
      setStreamingId(null);
      streamTextRef.current = "";
    }
  }

  return (
    /* Sit above mobile sticky bar; on md+ sit above the Book Now FAB (bottom-5). */
    <div className="chat-fab-dock fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3 md:bottom-23 md:right-5">
      {open ? (
        <section
          id={panelId}
          aria-label="Chat with Nirvana Yoga School"
          className="chat-fab-panel flex h-[min(70vh,28rem)] w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white"
        >
          <header className="flex items-center justify-between gap-3 bg-primary px-4 py-3.5 text-white">
            <div className="min-w-0">
              <p className="type-eyebrow text-white/75">Nirvana Yoga School</p>
              <h2 className="font-serif text-lg leading-tight tracking-tight">
                Ask us
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {messages.length > 0 || conversationId ? (
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  disabled={sending}
                  className="rounded-full px-2.5 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="Clear chat"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Close chat"
              >
                <Close size={18} />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface px-3 py-3 scrollbar-thin-primary"
          >
            {messages.length === 0 ? (
              <p className="rounded-xl bg-white px-3 py-2.5 text-sm text-muted shadow-sm">
                Ask about our YTT programs, retreats, or booking — we typically
                reply in a few seconds.
              </p>
            ) : null}
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isStreamingAssistant =
                !isUser && message.id === streamingId && sending;

              if (!isUser && !message.content && isStreamingAssistant) {
                return (
                  <div
                    key={message.id}
                    className="flex justify-start"
                    aria-live="polite"
                    aria-label="Assistant is typing"
                  >
                    <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-ink/8 bg-white px-3 py-2.5 shadow-sm">
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot chat-typing-dot--delay-1" />
                      <span className="chat-typing-dot chat-typing-dot--delay-2" />
                    </div>
                  </div>
                );
              }
              if (!message.content) return null;
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-white rounded-br-md whitespace-pre-wrap"
                        : "bg-white text-ink border border-ink/8 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      message.content
                    ) : (
                      <ChatMarkdown
                        content={message.content}
                        streaming={isStreamingAssistant}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {error ? (
              <p className="rounded-lg bg-primary/8 px-3 py-2 text-xs text-primary-dark">
                {error}
              </p>
            ) : null}
          </div>

          <form
            className="border-t border-ink/10 bg-white p-2.5"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask a question…"
                disabled={sending || !sessionId}
                className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-ink/12 bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || !sessionId}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="chat-fab-trigger group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition duration-200 hover:bg-primary-dark hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <Close size={22} /> : <Comment size={22} />}
        {!open ? (
          <span className="pointer-events-none absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white ring-2 ring-primary" />
          </span>
        ) : null}
      </button>
    </div>
  );
}
