import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "nirvana_admin_session";
const SESSION_TTL = "8h";

/** Admin role stored in the session JWT (kept Edge-safe — no Neon import). */
export type AdminSessionRole = "admin" | "editor";

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminSessionRole;
};

/**
 * Returns the JWT signing secret as bytes.
 */
function jwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET ?? "dev-only-change-me";
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT session token.
 *
 * @param session - Admin session payload
 */
export async function createSessionToken(
  session: AdminSession,
): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    email: session.email,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(jwtSecret());
}

/**
 * Verify a session JWT and return the payload.
 *
 * @param token - JWT string
 */
export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as AdminSessionRole,
    };
  } catch {
    return null;
  }
}

/**
 * Read the admin session from cookie header on any Request.
 *
 * @param request - Incoming request (Request or NextRequest)
 */
export async function getSessionFromRequest(
  request: Request | NextRequest,
): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Read session from NextRequest cookies (Edge-safe — no Neon).
 *
 * @param request - Next.js middleware / edge request
 */
export async function getSessionFromNextRequest(
  request: NextRequest,
): Promise<AdminSession | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Read the admin session from Next.js server cookies.
 */
export async function getServerSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Cookie name used for admin sessions.
 */
export function adminSessionCookieName(): string {
  return COOKIE_NAME;
}
