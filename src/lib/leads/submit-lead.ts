import type { LeadSubmissionInput } from "@/content/types/lead";

/**
 * Submit a contact or enquiry form to the CMS lead store.
 *
 * @param input - Lead payload
 * @returns Whether the submission was stored in the database
 */
export async function submitLead(
  input: LeadSubmissionInput,
): Promise<{ stored: boolean }> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      return { stored: true };
    }
  } catch {
    // Fall through to mailto fallback in the form handler
  }

  return { stored: false };
}

/**
 * Open the user's email client as a fallback when DB storage is unavailable.
 *
 * @param params - Mailto fields
 */
export function openMailtoFallback(params: {
  to: string;
  subject: string;
  body: string;
}) {
  const mailtoUrl = `mailto:${params.to}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.body)}`;
  window.location.href = mailtoUrl;
}
