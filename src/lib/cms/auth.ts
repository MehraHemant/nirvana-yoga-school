import bcrypt from "bcryptjs";
import { isDbEnabled, db } from "@/lib/db";
import type { AdminSession } from "./auth-session";

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
