import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "nirvana_site_session";
const SESSION_TTL = "7d";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SiteSession = {
  userId: string;
  email: string;
  name: string;
};

/**
 * Returns the JWT signing secret as bytes.
 */
function jwtSecret(): Uint8Array {
  const secret =
    process.env.SITE_JWT_SECRET ??
    process.env.ADMIN_JWT_SECRET ??
    "dev-only-change-me";
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT for a public site account.
 *
 * @param session - Site user payload
 */
export async function createSiteSessionToken(
  session: SiteSession,
): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    email: session.email,
    name: session.name,
    kind: "site",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(jwtSecret());
}

/**
 * Verify a site session JWT.
 *
 * @param token - JWT string
 */
export async function verifySiteSessionToken(
  token: string,
): Promise<SiteSession | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (
      payload.kind !== "site" ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/**
 * Read the public site session from Next.js server cookies.
 */
export async function getSiteServerSession(): Promise<SiteSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySiteSessionToken(token);
}

/**
 * Set-Cookie header for a site session, or a cleared cookie when token is null.
 *
 * @param token - Signed JWT, or null to log out
 */
export function siteSessionSetCookie(token: string | null): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!token) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  }
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}
