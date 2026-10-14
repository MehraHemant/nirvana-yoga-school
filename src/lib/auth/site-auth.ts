import { hashPassword, verifyPassword } from "@/lib/cms/auth";
import { db, isDbEnabled } from "@/lib/db";
import type { SiteSession } from "./site-session";

/** Minimum length for public site passwords. */
export const MIN_SITE_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let siteUsersReady: Promise<void> | null = null;

/**
 * Creates the public accounts table when it is missing.
 */
export function ensureSiteUsersTable(): Promise<void> {
  if (!siteUsersReady) {
    siteUsersReady = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "site_users" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "site_users_email_key"
        ON "site_users" ("email")
      `);
      await db.$executeRawUnsafe(`
        ALTER TABLE "site_users"
        ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ
      `);
    })().catch((error: unknown) => {
      siteUsersReady = null;
      throw error;
    });
  }
  return siteUsersReady;
}

/**
 * Normalizes an email for lookup and storage.
 *
 * @param email - Raw email
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Whether a string looks like an email address.
 *
 * @param email - Candidate email
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

type SiteUserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

/**
 * Authenticates a public account.
 *
 * @param email - Account email
 * @param password - Plaintext password
 */
export async function authenticateSiteUser(
  email: string,
  password: string,
): Promise<SiteSession | null> {
  if (!isDbEnabled()) return null;

  await ensureSiteUsersTable();

  const user = (await db.siteUser.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true, name: true, email: true, passwordHash: true },
  })) as SiteUserRow | null;
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return { userId: user.id, email: user.email, name: user.name };
}

export type SiteUserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerifiedAt: string | null;
};

/**
 * Account details for the profile page.
 *
 * @param userId - Site account id
 */
export async function getSiteUserProfile(
  userId: string,
): Promise<SiteUserProfile | null> {
  if (!isDbEnabled()) return null;
  await ensureSiteUsersTable();
  const [user] = await db.$queryRawUnsafe<
    {
      id: string;
      name: string;
      email: string;
      created_at: Date;
      email_verified_at: Date | null;
    }[]
  >(
    `SELECT "id", "name", "email", "created_at", "email_verified_at"
       FROM "site_users" WHERE "id" = ?`,
    userId,
  );
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.created_at).toISOString(),
    emailVerifiedAt: user.email_verified_at
      ? new Date(user.email_verified_at).toISOString()
      : null,
  };
}

/**
 * Renames an account.
 *
 * @param userId - Site account id
 * @param rawName - New display name
 */
export async function updateSiteUserName(
  userId: string,
  rawName: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 80) {
    return { ok: false, error: "Name must be between 1 and 80 characters" };
  }
  await ensureSiteUsersTable();
  await db.siteUser.update({ where: { id: userId }, data: { name } });
  return { ok: true, name };
}

/**
 * Changes an account password after checking the current one.
 *
 * @param userId - Site account id
 * @param currentPassword - Existing plaintext password
 * @param newPassword - Replacement plaintext password
 */
export async function changeSiteUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < MIN_SITE_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `New password must be at least ${MIN_SITE_PASSWORD_LENGTH} characters`,
    };
  }
  await ensureSiteUsersTable();
  const user = (await db.siteUser.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })) as { passwordHash: string } | null;
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false, error: "Current password is not right" };
  }
  await db.siteUser.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  return { ok: true };
}
