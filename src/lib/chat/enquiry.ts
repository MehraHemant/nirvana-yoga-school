import "server-only";

import type { LeadSubmissionInput } from "@/content/types/lead";

/** Fields collected from chat before submitting an enquiry. */
export type ChatEnquiryDraft = {
  name?: string;
  email?: string;
  phone?: string;
  program?: string;
  message?: string;
};

/** Outcome of attempting a chat-driven enquiry submit. */
export type ChatEnquirySubmitResult =
  | { status: "submitted"; leadId: string }
  | { status: "incomplete"; missing: string[] }
  | { status: "skipped" }
  | { status: "error"; message: string };

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const EMAIL_FULL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/;

const CONFIRM_RE =
  /^(yes|yep|yeah|sure|ok|okay|please\s+(send|submit|do)|send\s+it|submit(\s+it)?|go\s+ahead|confirm(ed)?|that's\s+(right|correct)|looks\s+good)\b/i;

const EXPLICIT_SUBMIT_RE =
  /\b(send|submit)\b.{0,40}\b(enquir|inquir|enquiry|inquiry|message|details)\b|\b(enquir|inquir|enquiry|inquiry)\b.{0,20}\b(send|submit)\b/i;

const AWAITING_CONFIRM_RE =
  /shall i (send|submit)|send this (enquiry|inquiry|message)|submit (this|your) (enquiry|inquiry|message)|ready to (send|submit)|confirm (and i('ll| will) send|to send)/i;

const ASKED_NAME_RE =
  /\b(your (full )?name|may i (have|get) your name|what('s| is) your name|name(,|\s+please)?\b)/i;
const ASKED_EMAIL_RE = /\b(e-?mail|email address)\b/i;
const ASKED_MESSAGE_RE =
  /\b(message|what would you like|what are you (interested|enquir|inquir)|tell me (more|what)|how can we help|what can i help|your (enquiry|inquiry|interest))\b/i;

/** Short intent-only lines that should not become name or message. */
const START_ENQUIRY_ONLY_RE =
  /^(hi|hello|hey[,!]?\s+)?(i('d| would)? like to (enquire|inquire|ask)|i want to (enquire|inquire|ask)|can i (enquire|inquire)|enquiry|inquiry|contact( you)?|get in touch)\s*\.?$/i;

/** Opening “please create an enquiry…” style phrases — never a person name. */
const ENQUIRY_INTENT_RE =
  /\b((can|could)\s+(you|i)\s+)?(please\s+)?(create|make|start|open|send|submit)\s+(a\s+|an\s+)?(query|enquir(?:y|ies)?|inquir(?:y|ies)?)\b|\b(i\s+want\s+to|i(?:'d| would)?\s+like\s+to)\s+(enquire|inquire|make\s+a\s+query|create\s+(a\s+|an\s+)?(query|enquiry|inquiry))\b|\b(enquire|inquire)\s+(about|now)\b/i;

/**
 * Whether a string is a plausible contact email.
 *
 * @param value - Candidate email
 */
export function isValidEnquiryEmail(value: string): boolean {
  return EMAIL_FULL_RE.test(value.trim());
}

/**
 * Whether text is an enquiry-intent / “create a query” style phrase.
 *
 * @param text - Candidate text
 */
function isEnquiryIntentPhrase(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (START_ENQUIRY_ONLY_RE.test(t)) return true;
  if (ENQUIRY_INTENT_RE.test(t)) return true;
  return /^(hi|hello|hey[,!]?\s+)?(please\s+)?(create|make|start)\s+(a\s+|an\s+)?(query|enquiry|inquiry)\s*\.?$/i.test(
    t,
  );
}

/**
 * Whether the latest user turn looks like confirmation to submit.
 *
 * @param message - Latest user message
 */
export function isEnquiryConfirmMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (CONFIRM_RE.test(trimmed)) return true;
  return EXPLICIT_SUBMIT_RE.test(trimmed);
}

/**
 * Whether a recent assistant turn asked the visitor to confirm sending.
 *
 * @param assistantTexts - Recent assistant message bodies
 */
export function wasAwaitingEnquiryConfirmation(
  assistantTexts: string[],
): boolean {
  return assistantTexts.some((text) => AWAITING_CONFIRM_RE.test(text));
}

/**
 * Strip light markdown emphasis from a captured label value.
 *
 * @param value - Raw captured value
 */
function cleanLabeledCapture(value: string): string {
  return value
    .replace(/^\*{1,2}\s*/, "")
    .replace(/\s*\*{1,2}$/, "")
    .replace(/[.,;]+$/, "")
    .trim();
}

/**
 * Pull a labeled field value from free text (supports **Name:** markdown).
 *
 * @param text - Source text
 * @param labels - Label alternatives (e.g. name, full name)
 */
function labeledValue(text: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const re = new RegExp(
      `(?:^|\\n)\\s*\\*{0,2}\\s*${label}\\s*\\*{0,2}\\s*[:\\-]\\s*(.+)$`,
      "im",
    );
    const match = text.match(re);
    const value = match?.[1] ? cleanLabeledCapture(match[1]) : undefined;
    if (value) return value;
  }
  return undefined;
}

const NAME_STOPWORD_RE =
  /\b(interested|looking|enquir|inquir|want|would|about|teacher|training|course|retreat|yoga|hour|please|thanks?|hello|from|here|email|message|phone|whatsapp|create|query|make|ask|can|could|know|prices?)\b/i;

/**
 * Whether text looks like a bare person name (stepwise reply).
 *
 * @param text - Candidate name
 */
function looksLikePersonName(text: string): boolean {
  const t = text.trim();
  if (t.length < 2 || t.length > 80) return false;
  if (EMAIL_RE.test(t) || CONFIRM_RE.test(t) || /[?]/.test(t)) return false;
  if (isEnquiryIntentPhrase(t) || NAME_STOPWORD_RE.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length > 5) return false;
  // Reject sentence-like intent even when stopwords were sparse.
  if (words.length >= 3 && /^(create|make|start|can|could|please|i)\b/i.test(t)) {
    return false;
  }
  return /^[A-Za-z][A-Za-z .'-]{0,78}$/.test(t);
}

/**
 * Whether a user turn is only an email address (optional trailing punct).
 *
 * @param text - User message
 */
function isEmailOnlyMessage(text: string): boolean {
  const t = text.trim().replace(/[.,;]+$/, "");
  return isValidEnquiryEmail(t);
}

/**
 * Normalize chat history into role/content rows for extraction.
 *
 * @param messages - Role-aware messages or plain text bodies
 */
function normalizeMessages(
  messages: Array<{ role?: string; content: string }> | string[],
): Array<{ role: string; content: string }> {
  return messages.map((row) => {
    if (typeof row === "string") {
      return { role: "user", content: row };
    }
    return {
      role: row.role ?? "user",
      content: row.content,
    };
  });
}

/**
 * Pull fields from the assistant's latest recap block (Name / Email / Message).
 * Matches what the visitor confirmed in the UI.
 *
 * @param assistantTexts - Assistant message bodies, oldest-first
 */
function extractDraftFromAssistantRecap(
  assistantTexts: string[],
): ChatEnquiryDraft {
  for (let i = assistantTexts.length - 1; i >= 0; i--) {
    const text = assistantTexts[i];
    const name = labeledValue(text, ["name", "full name"]);
    const emailRaw = labeledValue(text, ["email", "e-mail", "email address"]);
    const message = labeledValue(text, ["message", "details", "note"]);
    const phone = labeledValue(text, [
      "phone",
      "whatsapp",
      "phone / whatsapp",
      "mobile",
    ]);
    const program = labeledValue(text, [
      "program",
      "course",
      "interest",
      "training",
    ]);

    const hasRecap = Boolean(
      (name && looksLikePersonName(name)) ||
        (emailRaw && isValidEnquiryEmail(emailRaw)) ||
        (message && message.length >= 5),
    );
    if (!hasRecap) continue;

    const draft: ChatEnquiryDraft = {};
    if (name && looksLikePersonName(name)) draft.name = name.slice(0, 120);
    if (emailRaw && isValidEnquiryEmail(emailRaw)) draft.email = emailRaw;
    if (message && message.length >= 5 && !isEnquiryIntentPhrase(message)) {
      draft.message = message.slice(0, 2000);
    }
    if (phone) draft.phone = phone.slice(0, 40);
    if (program) draft.program = program.slice(0, 200);
    return draft;
  }
  return {};
}

/**
 * Extract enquiry fields from conversation text without inventing values.
 * Prefers the assistant recap the user confirmed, then stepwise answers after prompts.
 *
 * @param messages - Recent messages (role + content), or plain text bodies oldest-first
 */
export function extractEnquiryDraft(
  messages: Array<{ role?: string; content: string }> | string[],
): ChatEnquiryDraft {
  const rows = normalizeMessages(messages);
  const assistantTexts = rows
    .filter((row) => row.role === "assistant")
    .map((row) => row.content);
  const joined = rows.map((row) => row.content).join("\n");
  const draft: ChatEnquiryDraft = {};

  const emailMatch = joined.match(EMAIL_RE);
  if (emailMatch && isValidEnquiryEmail(emailMatch[0])) {
    draft.email = emailMatch[0];
  }

  const labeledName = labeledValue(joined, ["name", "full name"]);
  if (
    labeledName &&
    !EMAIL_RE.test(labeledName) &&
    looksLikePersonName(labeledName)
  ) {
    draft.name = labeledName.slice(0, 120);
  } else {
    // Prefer "my name is …"; only use "I'm / I am …" when it still looks like a name.
    const spoken =
      joined.match(
        /\bmy name is\s+([A-Za-z][A-Za-z .'-]{1,80})/i,
      ) ??
      joined.match(
        /\bi(?:'m| am)\s+([A-Za-z][A-Za-z'-]{1,40}(?:\s+[A-Za-z][A-Za-z'-]{1,40}){0,3})\b/i,
      );
    const spokenName = spoken?.[1]?.trim().replace(/[.,;]+$/, "");
    if (spokenName && looksLikePersonName(spokenName)) {
      draft.name = spokenName.slice(0, 120);
    }
  }

  const labeledPhone = labeledValue(joined, [
    "phone",
    "whatsapp",
    "phone / whatsapp",
    "mobile",
  ]);
  if (labeledPhone) {
    draft.phone = labeledPhone.slice(0, 40);
  } else {
    const phoneMatch = joined.match(
      new RegExp(
        `(?:phone|whatsapp|mobile)\\s*[:\\-]?\\s*(${PHONE_RE.source})`,
        "i",
      ),
    );
    if (phoneMatch?.[1]) draft.phone = phoneMatch[1].trim();
  }

  const program =
    labeledValue(joined, ["program", "course", "interest", "training"]) ??
    undefined;
  if (program && !isEnquiryIntentPhrase(program)) {
    draft.program = program.slice(0, 200);
  }

  const labeledMessage =
    labeledValue(joined, ["message", "details", "note", "about"]) ?? undefined;
  if (
    labeledMessage &&
    labeledMessage.length >= 5 &&
    !isEnquiryIntentPhrase(labeledMessage)
  ) {
    draft.message = labeledMessage.slice(0, 2000);
  } else {
    const interest = joined.match(
      /\b(?:i(?:'m| am) interested in|interested in)\s+([^\n.]{5,200})/i,
    );
    const interestText = interest?.[1]?.trim();
    if (interestText && !isEnquiryIntentPhrase(interestText)) {
      draft.message = `Interested in ${interestText}`.slice(0, 2000);
      if (!draft.program) draft.program = interestText.slice(0, 200);
    } else if (draft.program && draft.program.length >= 5) {
      draft.message = `Interested in ${draft.program}`;
    }
  }

  // Stepwise replies: latest answer after the bot asked for that field wins.
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.role !== "user") continue;

    const content = row.content.trim();
    if (!content || CONFIRM_RE.test(content)) continue;
    if (isEnquiryIntentPhrase(content)) continue;

    const prevAssistant = [...rows.slice(0, i)]
      .reverse()
      .find((r) => r.role === "assistant")?.content;

    if (isEmailOnlyMessage(content)) {
      draft.email = content.replace(/[.,;]+$/, "").trim();
      continue;
    }

    // Invalid email attempt — do not treat as name/message.
    if (/@/.test(content) && !EMAIL_RE.test(content)) {
      continue;
    }

    const askedName = Boolean(prevAssistant && ASKED_NAME_RE.test(prevAssistant));
    const askedMessage = Boolean(
      prevAssistant && ASKED_MESSAGE_RE.test(prevAssistant),
    );

    // Only accept bare names after the bot asked for name (latest wins).
    if (askedName && looksLikePersonName(content)) {
      draft.name = content.slice(0, 120);
      continue;
    }

    // Prefer enquiry body after the bot asked for message (latest wins).
    if (
      askedMessage &&
      content.length >= 5 &&
      !isEmailOnlyMessage(content) &&
      !looksLikePersonName(content)
    ) {
      draft.message = content.slice(0, 2000);
      continue;
    }
  }

  // Assistant recap is what the visitor confirmed — highest priority.
  const fromRecap = extractDraftFromAssistantRecap(assistantTexts);
  if (fromRecap.name) draft.name = fromRecap.name;
  if (fromRecap.email) draft.email = fromRecap.email;
  if (fromRecap.message) draft.message = fromRecap.message;
  if (fromRecap.phone) draft.phone = fromRecap.phone;
  if (fromRecap.program) draft.program = fromRecap.program;

  // Drop a name that failed person-name validation (e.g. leftover intent).
  if (draft.name && !looksLikePersonName(draft.name)) {
    delete draft.name;
  }

  return draft;
}

/**
 * List required enquiry fields still missing from a draft.
 * Program defaults to "General enquiry" when omitted.
 *
 * @param draft - Partial enquiry fields
 */
export function missingEnquiryFields(draft: ChatEnquiryDraft): string[] {
  const missing: string[] = [];
  if (!draft.name || !looksLikePersonName(draft.name)) missing.push("name");
  if (!draft.email || !isValidEnquiryEmail(draft.email)) missing.push("email");
  if (
    !draft.message ||
    draft.message.length < 5 ||
    isEnquiryIntentPhrase(draft.message)
  ) {
    missing.push("message");
  }
  return missing;
}

/**
 * Build a short ENQUIRY_STATE line so the model asks for one missing field at a time.
 *
 * @param draft - Partial enquiry fields from the conversation so far
 */
export function formatEnquiryStateForPrompt(draft: ChatEnquiryDraft): string {
  const have: string[] = [];
  if (draft.name && looksLikePersonName(draft.name)) have.push("name");
  if (draft.email && isValidEnquiryEmail(draft.email)) have.push("email");
  if (
    draft.message &&
    draft.message.length >= 5 &&
    !isEnquiryIntentPhrase(draft.message)
  ) {
    have.push("message");
  }
  if (draft.phone) have.push("phone");
  if (draft.program) have.push("program");

  const missing = missingEnquiryFields(draft);
  // Keep normal Q&A uncluttered; only steer once collection has started.
  if (have.length === 0) return "";

  if (missing.length === 0) {
    return [
      `ENQUIRY_STATE: have ${have.join(", ")}.`,
      "All required fields present.",
      'Briefly recap and ask exactly: "Shall I send this enquiry?"',
      "Do not invent values.",
    ].join(" ");
  }

  const next = missing[0];
  const nextHint =
    next === "name"
      ? "Ask for their name next."
      : next === "email"
        ? "Ask for a valid email next; if invalid, ask again."
        : "Ask for their message / what they want to enquire about next.";

  return [
    `ENQUIRY_STATE: have ${have.join(", ")}; need ${missing.join(", ")}.`,
    nextHint,
    "Ask only one question. Skip fields already collected. Do not invent values.",
  ].join(" ");
}

/**
 * Build a lead payload from a complete chat draft.
 *
 * @param draft - Complete enquiry draft
 */
export function draftToLeadInput(draft: ChatEnquiryDraft): LeadSubmissionInput {
  return {
    type: "enquiry",
    name: draft.name!.trim(),
    email: draft.email!.trim(),
    phone: draft.phone?.trim() || undefined,
    program: (draft.program ?? "General enquiry").trim(),
    message: draft.message!.trim(),
    source: "chatbot",
  };
}

/**
 * Attempt to submit a chat enquiry when the visitor confirms and fields exist.
 *
 * @param latestUserMessage - Current user turn
 * @param recentMessages - Recent conversation texts (role + content)
 */
export async function maybeSubmitChatEnquiry(params: {
  latestUserMessage: string;
  recentMessages: Array<{ role: string; content: string }>;
}): Promise<ChatEnquirySubmitResult> {
  const { latestUserMessage, recentMessages } = params;
  const wantsSubmit = isEnquiryConfirmMessage(latestUserMessage);
  if (!wantsSubmit) return { status: "skipped" };

  const assistantTexts = recentMessages
    .filter((row) => row.role === "assistant")
    .map((row) => row.content);
  const awaiting = wasAwaitingEnquiryConfirmation(assistantTexts);
  const hasEmailInLatest = EMAIL_RE.test(latestUserMessage);
  const explicit = EXPLICIT_SUBMIT_RE.test(latestUserMessage);

  if (!awaiting && !hasEmailInLatest && !explicit) {
    return { status: "skipped" };
  }

  const draft = extractEnquiryDraft([
    ...recentMessages,
    { role: "user", content: latestUserMessage },
  ]);
  if (!draft.program?.trim()) {
    draft.program = "General enquiry";
  }

  const missing = missingEnquiryFields(draft);
  if (missing.length > 0) {
    return { status: "incomplete", missing };
  }

  try {
    // Lazy-load leads/mail so nodemailer is not pulled into every chat cold start.
    const { createLeadSubmission, parseLeadInput } = await import(
      "@/lib/cms/leads"
    );
    const parsed = parseLeadInput(draftToLeadInput(draft));
    if (!parsed.ok) {
      return { status: "error", message: parsed.error };
    }
    const leadId = await createLeadSubmission(parsed.data);
    return { status: "submitted", leadId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save enquiry";
    return { status: "error", message };
  }
}

/**
 * Format enquiry submit outcome for the chat system prompt.
 *
 * @param result - Submit attempt result
 */
export function formatEnquiryResultForPrompt(
  result: ChatEnquirySubmitResult,
): string {
  if (result.status === "skipped") return "";
  if (result.status === "submitted") {
    return [
      "ENQUIRY_RESULT: submitted successfully.",
      "Tell the visitor their enquiry was sent, the team will reply by email,",
      "and briefly thank them. Do not ask them to fill the website form again",
      "unless they want to add more details.",
    ].join(" ");
  }
  if (result.status === "incomplete") {
    return [
      "ENQUIRY_RESULT: not submitted.",
      `Still missing: ${result.missing.join(", ")}.`,
      "Ask only for the missing fields. Do not claim the enquiry was sent.",
    ].join(" ");
  }
  return [
    "ENQUIRY_RESULT: not submitted due to an error.",
    "Apologize briefly and suggest Enquire Now or WhatsApp on the website.",
    "Do not invent a confirmation.",
  ].join(" ");
}
