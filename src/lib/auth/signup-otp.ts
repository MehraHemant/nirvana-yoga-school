import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { hashPassword } from "@/lib/cms/auth";
import { db, isDbEnabled } from "@/lib/db";
import { createId } from "@/lib/db/ids";
import { isSmtpConfigured, sendMail } from "@/lib/mail/smtp";
import {
  ensureSiteUsersTable,
  isValidEmail,
  MIN_SITE_PASSWORD_LENGTH,
  normalizeEmail,
} from "./site-auth";
import type { SiteSession } from "./site-session";

/** Digits in a signup code. */
export const SIGNUP_OTP_LENGTH = 6;
/** Minutes a signup code stays valid. */
const OTP_TTL_MINUTES = 10;
/** Seconds before another code can be sent to the same email. */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
/** Wrong guesses allowed before the code is burned. */
const OTP_MAX_ATTEMPTS = 5;
/** Codes one pending signup may send before the visitor must start over. */
const OTP_MAX_SENDS = 5;

let otpTableReady: Promise<void> | null = null;

/**
 * Creates the pending-signup table when it is missing.
 * One row per email; the account is only created once the code is verified.
 */
function ensureSignupOtpTable(): Promise<void> {
  if (!otpTableReady) {
    otpTableReady = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "site_signup_otps" (
          "email" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "code_hash" TEXT NOT NULL,
          "attempts" INTEGER NOT NULL DEFAULT 0,
          "sends" INTEGER NOT NULL DEFAULT 1,
          "expires_at" TIMESTAMPTZ NOT NULL,
          "last_sent_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    })().catch((error: unknown) => {
      otpTableReady = null;
      throw error;
    });
  }
  return otpTableReady;
}

type PendingSignupRow = {
  email: string;
  name: string;
  password_hash: string;
  code_hash: string;
  attempts: number;
  sends: number;
  expires_at: Date;
  last_sent_at: Date;
};

/**
 * Keyed hash of a code so a database leak does not reveal live codes.
 *
 * @param email - Normalized email the code belongs to
 * @param code - Plain digits
 */
function hashCode(email: string, code: string): string {
  const secret =
    process.env.SITE_JWT_SECRET ??
    process.env.ADMIN_JWT_SECRET ??
    "dev-only-change-me";
  return createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
}

/**
 * Random zero-padded numeric code.
 */
function generateCode(): string {
  return String(randomInt(0, 10 ** SIGNUP_OTP_LENGTH)).padStart(
    SIGNUP_OTP_LENGTH,
    "0",
  );
}

/**
 * Seconds until another code may be sent.
 *
 * @param lastSentAt - When the previous code went out
 */
function cooldownLeft(lastSentAt: Date): number {
  const elapsed = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed));
}

/**
 * Emails the code. Without SMTP in development the code is logged instead.
 *
 * @param email - Recipient
 * @param name - Recipient name for the greeting
 * @param code - Plain digits
 */
async function deliverCode(
  email: string,
  name: string,
  code: string,
): Promise<boolean> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[signup-otp] SMTP not configured; code for ${email}: ${code}`,
      );
      return true;
    }
    return false;
  }

  const first = name.split(/\s+/)[0] || name;
  await sendMail({
    to: email,
    subject: `${code} is your Nirvana Yoga School code`,
    text: `Namaste ${first},\n\nYour verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.\n\nIf you did not try to create an account, you can ignore this email.\n\nNirvana Yoga School, Rishikesh`,
    html: `<div style="font-family:Arial,sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1c1917">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a32432">Nirvana Yoga School</p>
  <h1 style="margin:0 0 16px;font-size:22px">Namaste ${escapeHtml(first)}</h1>
  <p style="margin:0 0 20px;line-height:1.6">Use this code to finish creating your account:</p>
  <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:10px;color:#a32432">${code}</p>
  <p style="margin:0 0 8px;line-height:1.6;color:#57534e">It expires in ${OTP_TTL_MINUTES} minutes.</p>
  <p style="margin:0;line-height:1.6;color:#78716c;font-size:13px">If you did not try to create an account, you can ignore this email.</p>
</div>`,
  });
  return true;
}

/**
 * Escapes text for the HTML email body.
 *
 * @param value - Raw text
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type OtpResult<T = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string; status?: number };

/**
 * Validates signup details, stores them as pending, and emails a code.
 *
 * @param input - Name, email, and plaintext password
 */
export async function startSignup(input: {
  name: string;
  email: string;
  password: string;
}): Promise<OtpResult<{ email: string; resendIn: number }>> {
  if (!isDbEnabled()) return { ok: false, error: "Database not configured" };

  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);

  if (name.length < 1 || name.length > 80) {
    return { ok: false, error: "Name must be between 1 and 80 characters" };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address" };
  }
  if (input.password.length < MIN_SITE_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_SITE_PASSWORD_LENGTH} characters`,
    };
  }

  await Promise.all([ensureSiteUsersTable(), ensureSignupOtpTable()]);

  const existing = await db.siteUser.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "An account with this email already exists" };
  }

  const [pending] = await db.$queryRawUnsafe<PendingSignupRow[]>(
    `SELECT * FROM "site_signup_otps" WHERE "email" = ?`,
    email,
  );
  if (pending) {
    const wait = cooldownLeft(pending.last_sent_at);
    if (wait > 0) {
      return {
        ok: false,
        error: `Please wait ${wait}s before requesting another code`,
        status: 429,
      };
    }
  }

  const code = generateCode();
  const passwordHash = await hashPassword(input.password);
  await db.$executeRawUnsafe(
    `INSERT INTO "site_signup_otps"
       ("email", "name", "password_hash", "code_hash", "attempts", "sends", "expires_at", "last_sent_at")
     VALUES (?, ?, ?, ?, 0, 1, NOW() + (? || ' minutes')::interval, NOW())
     ON CONFLICT ("email") DO UPDATE SET
       "name" = EXCLUDED."name",
       "password_hash" = EXCLUDED."password_hash",
       "code_hash" = EXCLUDED."code_hash",
       "attempts" = 0,
       "sends" = 1,
       "expires_at" = EXCLUDED."expires_at",
       "last_sent_at" = NOW()`,
    email,
    name,
    passwordHash,
    hashCode(email, code),
    String(OTP_TTL_MINUTES),
  );

  if (!(await deliverCode(email, name, code))) {
    return {
      ok: false,
      error: "We could not send the code right now. Please try again later.",
      status: 503,
    };
  }
  return { ok: true, email, resendIn: OTP_RESEND_COOLDOWN_SECONDS };
}

/**
 * Sends a fresh code for a pending signup.
 *
 * @param rawEmail - Email used at signup
 */
export async function resendSignupCode(
  rawEmail: string,
): Promise<OtpResult<{ resendIn: number }>> {
  if (!isDbEnabled()) return { ok: false, error: "Database not configured" };
  await ensureSignupOtpTable();

  const email = normalizeEmail(rawEmail);
  const [pending] = await db.$queryRawUnsafe<PendingSignupRow[]>(
    `SELECT * FROM "site_signup_otps" WHERE "email" = ?`,
    email,
  );
  if (!pending) {
    return { ok: false, error: "Start the signup again", status: 404 };
  }
  const wait = cooldownLeft(pending.last_sent_at);
  if (wait > 0) {
    return {
      ok: false,
      error: `Please wait ${wait}s before requesting another code`,
      status: 429,
    };
  }
  if (pending.sends >= OTP_MAX_SENDS) {
    await deletePending(email);
    return {
      ok: false,
      error: "Too many codes requested. Start the signup again.",
      status: 429,
    };
  }

  const code = generateCode();
  await db.$executeRawUnsafe(
    `UPDATE "site_signup_otps" SET
       "code_hash" = ?, "attempts" = 0, "sends" = "sends" + 1,
       "expires_at" = NOW() + (? || ' minutes')::interval, "last_sent_at" = NOW()
     WHERE "email" = ?`,
    hashCode(email, code),
    String(OTP_TTL_MINUTES),
    email,
  );

  if (!(await deliverCode(email, pending.name, code))) {
    return {
      ok: false,
      error: "We could not send the code right now. Please try again later.",
      status: 503,
    };
  }
  return { ok: true, resendIn: OTP_RESEND_COOLDOWN_SECONDS };
}

/**
 * Removes a pending signup.
 *
 * @param email - Normalized email
 */
async function deletePending(email: string) {
  await db.$executeRawUnsafe(
    `DELETE FROM "site_signup_otps" WHERE "email" = ?`,
    email,
  );
}

/**
 * Checks a code and, when it matches, creates the verified account.
 *
 * @param rawEmail - Email used at signup
 * @param rawCode - Digits the visitor typed
 */
export async function verifySignupCode(
  rawEmail: string,
  rawCode: string,
): Promise<OtpResult<{ session: SiteSession }>> {
  if (!isDbEnabled()) return { ok: false, error: "Database not configured" };
  await Promise.all([ensureSiteUsersTable(), ensureSignupOtpTable()]);

  const email = normalizeEmail(rawEmail);
  const code = rawCode.replace(/\D/g, "");
  if (code.length !== SIGNUP_OTP_LENGTH) {
    return { ok: false, error: `Enter the ${SIGNUP_OTP_LENGTH}-digit code` };
  }

  return db.$transaction(async () => {
    const [pending] = await db.$queryRawUnsafe<PendingSignupRow[]>(
      `SELECT * FROM "site_signup_otps" WHERE "email" = ? FOR UPDATE`,
      email,
    );
    if (!pending) {
      return { ok: false, error: "Start the signup again", status: 404 };
    }
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      return {
        ok: false,
        error: "This code has expired. Send a new one.",
        status: 410,
      };
    }
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      return {
        ok: false,
        error: "Too many wrong attempts. Send a new code.",
        status: 429,
      };
    }

    const expected = Buffer.from(pending.code_hash, "hex");
    const actual = Buffer.from(hashCode(email, code), "hex");
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      await db.$executeRawUnsafe(
        `UPDATE "site_signup_otps" SET "attempts" = "attempts" + 1 WHERE "email" = ?`,
        email,
      );
      const left = OTP_MAX_ATTEMPTS - pending.attempts - 1;
      return {
        ok: false,
        error:
          left > 0
            ? `That code is not right. ${left} ${left === 1 ? "try" : "tries"} left.`
            : "Too many wrong attempts. Send a new code.",
      };
    }

    const existing = await db.siteUser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      await deletePending(email);
      return { ok: false, error: "An account with this email already exists" };
    }

    const id = createId();
    await db.$executeRawUnsafe(
      `INSERT INTO "site_users"
         ("id", "name", "email", "password_hash", "email_verified_at")
       VALUES (?, ?, ?, ?, NOW())`,
      id,
      pending.name,
      email,
      pending.password_hash,
    );
    await deletePending(email);

    return {
      ok: true,
      session: { userId: id, email, name: pending.name },
    };
  });
}
