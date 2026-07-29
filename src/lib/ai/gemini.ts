import type { AiChatMessage, AiChatOptions, AiProvider } from "./types";

type GeminiPart = { text?: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
  error?: { message?: string };
};

const DEFAULT_TEMPERATURE = 0.35;
const DEFAULT_MAX_OUTPUT_TOKENS = 512;

/** Default primary chat model when `GEMINI_MODEL` is unset. */
export const DEFAULT_GEMINI_CHAT_MODEL = "gemini-flash-lite-latest";

/**
 * Free-tier friendly chat models tried after the primary (2026 Gemini API).
 * Override with `GEMINI_MODEL_FALLBACKS=model1,model2`.
 */
const DEFAULT_GEMINI_CHAT_FALLBACKS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
] as const;

/**
 * Ordered Gemini chat models: primary first, then unique fallbacks.
 *
 * Primary: `GEMINI_MODEL` or {@link DEFAULT_GEMINI_CHAT_MODEL}.
 * Fallbacks: `GEMINI_MODEL_FALLBACKS` (comma-separated) or built-in defaults.
 *
 * @returns Deduplicated model ids to try in order
 */
export function resolveGeminiChatModels(): string[] {
  const primary =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_CHAT_MODEL;
  const rawFallbacks = process.env.GEMINI_MODEL_FALLBACKS?.trim();
  const fallbacks = rawFallbacks
    ? rawFallbacks
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [...DEFAULT_GEMINI_CHAT_FALLBACKS];

  const seen = new Set<string>();
  const models: string[] = [];
  for (const model of [primary, ...fallbacks]) {
    if (seen.has(model)) continue;
    seen.add(model);
    models.push(model);
  }
  return models;
}

/**
 * Whether a Gemini HTTP failure is a quota / rate-limit error worth retrying.
 * Auth failures and other client errors are not retryable.
 *
 * @param status - HTTP status from Gemini
 * @param message - Error message body (no secrets expected)
 */
export function isRetryableGeminiError(
  status: number,
  message: string,
): boolean {
  const lower = message.toLowerCase();

  if (status === 401 || status === 403) return false;
  if (
    lower.includes("api key not valid") ||
    lower.includes("api_key_invalid") ||
    lower.includes("permission denied") ||
    lower.includes("unauthenticated") ||
    lower.includes("consumer_invalid")
  ) {
    return false;
  }

  if (status === 429) return true;

  return (
    lower.includes("quota") ||
    lower.includes("resource exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    /\bexceeded\b/.test(lower)
  );
}

/**
 * Maps internal chat roles to Gemini content roles.
 *
 * @param role - Internal message role
 */
function toGeminiRole(role: AiChatMessage["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

/**
 * Build Gemini request contents + optional system instruction.
 *
 * @param messages - Conversation turns
 * @param options - Generation options
 */
function buildGeminiBody(
  messages: AiChatMessage[],
  options: AiChatOptions,
): Record<string, unknown> {
  const system =
    options.system ??
    messages.find((message) => message.role === "system")?.content;
  const history = messages.filter((message) => message.role !== "system");

  const contents: GeminiContent[] = history.map((message) => ({
    role: toGeminiRole(message.role),
    parts: [{ text: message.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      maxOutputTokens: options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
    },
  };

  if (system) {
    body.systemInstruction = {
      parts: [{ text: system }],
    };
  }

  return body;
}

/**
 * Open a Gemini streamGenerateContent SSE response for one model.
 * Throws on non-OK responses (caller decides whether to fall back).
 *
 * @param apiKey - Gemini API key
 * @param model - Model id
 * @param messages - Conversation turns
 * @param options - Generation options
 */
async function openGeminiChatStream(
  apiKey: string,
  model: string,
  messages: AiChatMessage[],
  options: AiChatOptions,
): Promise<Response> {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`,
  );
  url.searchParams.set("alt", "sse");
  url.searchParams.set("key", apiKey);

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGeminiBody(messages, options)),
  });
}

/**
 * Yield text deltas from an open Gemini SSE response body.
 *
 * @param body - Readable stream from a successful streamGenerateContent call
 */
async function* readGeminiSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n");
    buffer = events.pop() ?? "";

    for (const line of events) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const data = JSON.parse(payload) as GeminiResponse;
        const delta = data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("");
        if (delta) yield delta;
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

/**
 * Gemini AI provider using the Generative Language REST API.
 * Retries with the next model when the initial request hits quota/rate limits
 * (before any tokens are yielded). Mid-stream failures are not retried.
 */
export class GeminiProvider implements AiProvider {
  readonly id = "gemini";

  private readonly apiKey: string;
  private readonly models: string[];

  /**
   * @param apiKey - Gemini API key
   * @param models - Ordered model ids (primary first); string = single model
   */
  constructor(
    apiKey: string,
    models: string | string[] = DEFAULT_GEMINI_CHAT_MODEL,
  ) {
    this.apiKey = apiKey;
    this.models = Array.isArray(models)
      ? models.filter(Boolean)
      : [models || DEFAULT_GEMINI_CHAT_MODEL];
    if (this.models.length === 0) {
      this.models = [DEFAULT_GEMINI_CHAT_MODEL];
    }
  }

  /**
   * Stream assistant text via Gemini streamGenerateContent (SSE).
   * On quota/429 before the first token, tries the next configured model.
   *
   * @param messages - Conversation turns
   * @param options - Optional system prompt and generation controls
   */
  async *chatStream(
    messages: AiChatMessage[],
    options: AiChatOptions = {},
  ): AsyncGenerator<string, void, unknown> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i]!;
      const response = await openGeminiChatStream(
        this.apiKey,
        model,
        messages,
        options,
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as GeminiResponse;
        const detail =
          data.error?.message ?? `request failed (${response.status})`;
        const error = new Error(`Gemini ${detail}`);
        lastError = error;

        const hasNext = i < this.models.length - 1;
        if (hasNext && isRetryableGeminiError(response.status, detail)) {
          const next = this.models[i + 1]!;
          console.warn(
            `[ai] Gemini quota/rate limit on ${model}; falling back to ${next}`,
          );
          continue;
        }
        throw error;
      }

      if (!response.body) {
        throw new Error("Gemini stream returned no body");
      }

      yield* readGeminiSseStream(response.body);
      return;
    }

    throw lastError ?? new Error("Gemini chat failed with no models configured");
  }
}
