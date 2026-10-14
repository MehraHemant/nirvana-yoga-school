import "server-only";

import type { LeadSubmissionInput } from "@/content/types/lead";
import { getMailAdminEmail, sendMail } from "@/lib/mail/smtp";

/**
 * Build a plain-text summary of a lead for email bodies.
 *
 * @param input - Lead payload
 */
function formatLeadDetails(input: LeadSubmissionInput): string {
  return [
    `Type: ${input.type}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.subject ? `Subject: ${input.subject}` : null,
    input.program ? `Program: ${input.program}` : null,
    input.accommodation ? `Accommodation: ${input.accommodation}` : null,
    input.startDate ? `Preferred start: ${input.startDate}` : null,
    input.source ? `Source: ${input.source}` : null,
    "",
    `Message: ${input.message}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Email admin + visitor after a lead is stored. No-ops when SMTP is unset.
 *
 * @param input - Stored lead payload
 */
export async function sendLeadNotificationEmails(
  input: LeadSubmissionInput,
): Promise<{ admin: boolean; user: boolean }> {
  const adminTo = getMailAdminEmail();
  const label =
    input.type === "enquiry"
      ? input.program?.trim() || "Enquiry"
      : input.subject?.trim() || "Contact";

  const adminSubject =
    input.type === "enquiry"
      ? `New enquiry — ${label}`
      : `New contact query — ${label}`;

  const adminText = [
    "A new website submission was received.",
    "",
    formatLeadDetails(input),
  ].join("\n");

  const userSubject =
    input.type === "enquiry"
      ? "We received your enquiry — Nirvana Yoga School"
      : "We received your message — Nirvana Yoga School";

  const userText = [
    `Hi ${input.name},`,
    "",
    "Thank you for contacting Nirvana Yoga School. We have received your message and will reply by email or WhatsApp soon.",
    "",
    "Here is a copy of what you sent:",
    formatLeadDetails(input),
    "",
    "— Nirvana Yoga School",
  ].join("\n");

  const [admin, user] = await Promise.all([
    adminTo
      ? sendMail({ to: adminTo, subject: adminSubject, text: adminText })
      : Promise.resolve(false),
    sendMail({ to: input.email, subject: userSubject, text: userText }),
  ]);

  return { admin, user };
}
