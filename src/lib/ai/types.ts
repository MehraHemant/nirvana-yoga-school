/** Chat roles exchanged with an AI provider. */
export type AiChatRole = "user" | "assistant" | "system";

/** Single message in a provider conversation. */
export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

/** Options for a chat completion request. */
export type AiChatOptions = {
  /** Optional system instruction override */
  system?: string;
  /** Max output tokens when the provider supports it */
  maxOutputTokens?: number;
  /** Sampling temperature when the provider supports it */
  temperature?: number;
};

/**
 * AI chat provider used by the public site chatbot.
 */
export interface AiProvider {
  /** Stable provider id for logging / config */
  readonly id: string;

  /**
   * Stream assistant text deltas from conversation history.
   *
   * @param messages - Prior turns (newest last)
   * @param options - Optional generation controls
   */
  chatStream(
    messages: AiChatMessage[],
    options?: AiChatOptions,
  ): AsyncGenerator<string, void, unknown>;
}
