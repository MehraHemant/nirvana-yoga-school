import bcrypt from "bcryptjs";
import { db, isDbEnabled } from "@/lib/db";
import { MIN_ADMIN_PASSWORD_LENGTH } from "./auth-constants";
import type { AdminSession } from "./auth-session";

export { MIN_ADMIN_PASSWORD_LENGTH } from "./auth-constants";

export type { AdminSession } from "./auth-session";
export {
  adminSessionCookieName,
  createSessionToken,
  getServerSession,
  getSessionFromNextRequest,
  getSessionFromRequest,
  verifySessionToken,
} from "./auth-session";

/**
 * Hash a plaintext password for storage.
 *
 * @param password - Plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 *
 * @param password - Plaintext password
 * @param hash - Stored bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate admin credentials against the database.
 *
 * @param email - Admin email
 * @param password - Plaintext password
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  if (!isDbEnabled()) return null;

  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return { userId: user.id, email: user.email, role: user.role };
}

/**
 * Require admin session; throws if missing.
 *
 * @param session - Session or null
 */
export function requireAdmin(session: AdminSession | null): AdminSession {
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * Require admin role for destructive operations.
 *
 * @param session - Active admin session
 */
export function requireAdminRole(session: AdminSession): void {
  if (session.role !== "admin") throw new Error("Forbidden");
}

/**
 * Change the authenticated admin user's password after verifying the current one.
 *
 * @param userId - Session user id (must match the account being updated)
 * @param currentPassword - Existing plaintext password
 * @param newPassword - New plaintext password
 */
export async function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDbEnabled()) {
    return { ok: false, error: "Database not configured" };
  }

  if (newPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `New password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`,
    };
  }

  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect" };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.adminUser.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { ok: true };
}
