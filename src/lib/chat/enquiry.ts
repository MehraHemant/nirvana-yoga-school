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
const PHONE_RE =
  /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/;

const CONFIRM_RE =
  /^(yes|yep|yeah|sure|ok|okay|please\s+(send|submit|do)|send\s+it|submit(\s+it)?|go\s+ahead|confirm(ed)?|that's\s+(right|correct)|looks\s+good)\b/i;

const EXPLICIT_SUBMIT_RE =
  /\b(send|submit)\b.{0,40}\b(enquir|inquir|enquiry|inquiry|message|details)\b|\b(enquir|inquir|enquiry|inquiry)\b.{0,20}\b(send|submit)\b/i;

const AWAITING_CONFIRM_RE =
  /shall i (send|submit)|send this (enquiry|inquiry|message)|submit (this|your) (enquiry|inquiry|message)|ready to (send|submit)|confirm (and i('ll| will) send|to send)/i;

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
 * Pull a labeled field value from free text.
 *
 * @param text - Source text
 * @param labels - Label alternatives (e.g. name, full name)
 */
function labeledValue(text: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const re = new RegExp(
      `(?:^|\\n)\\s*${label}\\s*[:\\-]\\s*(.+)`,
      "i",
    );
    const match = text.match(re);
    const value = match?.[1]?.trim();
    if (value) return value.replace(/[.,;]+$/, "").trim();
  }
  return undefined;
}

/**
 * Extract enquiry fields from conversation text without inventing values.
 *
 * @param texts - Recent user/assistant message bodies (oldest first)
 */
export function extractEnquiryDraft(texts: string[]): ChatEnquiryDraft {
  const joined = texts.join("\n");
  const draft: ChatEnquiryDraft = {};

  const emailMatch = joined.match(EMAIL_RE);
  if (emailMatch) draft.email = emailMatch[0];

  const labeledName = labeledValue(joined, ["name", "full name"]);
  if (labeledName && !EMAIL_RE.test(labeledName)) {
    draft.name = labeledName.slice(0, 120);
  } else {
    const spoken = joined.match(
      /\b(?:my name is|i(?:'m| am))\s+([A-Za-z][A-Za-z .'-]{1,80})/i,
    );
    const spokenName = spoken?.[1]?.trim();
    if (spokenName && !EMAIL_RE.test(spokenName)) {
      draft.name = spokenName.replace(/[.,;]+$/, "").trim();
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
  if (program) draft.program = program.slice(0, 200);

  const message =
    labeledValue(joined, ["message", "details", "note", "about"]) ?? undefined;
  if (message && message.length >= 5) {
    draft.message = message.slice(0, 2000);
  } else {
    const interest = joined.match(
      /\b(?:i(?:'m| am) interested in|interested in)\s+([^\n.]{5,200})/i,
    );
    const interestText = interest?.[1]?.trim();
    if (interestText) {
      draft.message = `Interested in ${interestText}`.slice(0, 2000);
      if (!draft.program) draft.program = interestText.slice(0, 200);
    } else if (draft.program && draft.program.length >= 5) {
      // Interest line can stand in as the message body for enquiry forms.
      draft.message = `Interested in ${draft.program}`;
    }
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
  if (!draft.name || draft.name.length < 2) missing.push("name");
  if (!draft.email || !draft.email.includes("@")) missing.push("email");
  if (!draft.message || draft.message.length < 5) missing.push("message");
  return missing;
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

  const texts = [
    ...recentMessages.map((row) => row.content),
    latestUserMessage,
  ];
  const draft = extractEnquiryDraft(texts);
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
