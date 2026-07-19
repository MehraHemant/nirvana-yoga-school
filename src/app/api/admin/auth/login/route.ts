import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import {
  adminSessionCookieName,
  authenticateAdmin,
  createSessionToken,
} from "@/lib/cms/auth";
import { isDbEnabled } from "@/lib/db";

/**
 * Admin login — sets httpOnly session cookie.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Database not configured. Set NEON_DB_URL.");
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return jsonBadRequest("Email and password required");
  }

  const session = await authenticateAdmin(body.email, body.password);
  if (!session) {
    return jsonUnauthorized("Invalid credentials");
  }

  const token = await createSessionToken(session);
  const response = jsonOk({ user: session });
  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`,
  );
  return response;
}
