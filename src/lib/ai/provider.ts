import "server-only";

import {
  DEFAULT_GEMINI_CHAT_MODEL,
  GeminiProvider,
  resolveGeminiChatModels,
} from "./gemini";
import type { AiProvider } from "./types";

export type {
  AiChatMessage,
  AiChatOptions,
  AiChatRole,
  AiProvider,
} from "./types";

/**
 * Resolve the configured AI chat provider (Gemini).
 * Uses `GEMINI_MODEL` plus optional `GEMINI_MODEL_FALLBACKS` for quota retries.
 *
 * @returns Configured {@link AiProvider}
 */
export function getAiProvider(): AiProvider {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const models = resolveGeminiChatModels();
  return new GeminiProvider(
    apiKey,
    models.length > 0 ? models : [DEFAULT_GEMINI_CHAT_MODEL],
  );
}

/**
 * Whether a chat provider can be constructed from env.
 *
 * @returns True when `GEMINI_API_KEY` is set
 */
export function isAiProviderConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
