import "server-only";

import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Whether SMTP credentials are configured for outbound mail.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.MAIL_FROM_EMAIL?.trim(),
  );
}

/**
 * Admin inbox for lead/booking notifications.
 */
export function getMailAdminEmail(): string {
  return (
    process.env.MAIL_ADMIN_EMAIL?.trim() ||
    process.env.MAIL_FROM_EMAIL?.trim() ||
    ""
  );
}

/**
 * Send an email via SMTP when configured. No-ops (returns false) if unset.
 *
 * @param params - Recipient, subject, and body
 */
export async function sendMail(params: SendMailParams): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[mail] SMTP is not configured; skipping email send");
    return false;
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const fromEmail = process.env.MAIL_FROM_EMAIL!.trim();
  const fromName = process.env.MAIL_FROM_NAME?.trim() || "Nirvana Yoga School";

  const transporter = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });

  return true;
}
