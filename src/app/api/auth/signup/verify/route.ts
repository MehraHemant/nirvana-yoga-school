import { verifySignupCode } from "@/lib/auth/signup-otp";
import {
  createSiteSessionToken,
  siteSessionSetCookie,
} from "@/lib/auth/site-session";
import {
  jsonBadRequest,
  jsonError,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";

/**
 * Public signup step two — checks the emailed code, creates the account,
 * and sets the site session cookie.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    code?: string;
  } | null;
  if (!body?.email || !body.code) {
    return jsonBadRequest("Email and code are required");
  }

  const result = await verifySignupCode(body.email, body.code);
  if (!result.ok) return jsonError(result.error, result.status ?? 400);

  const token = await createSiteSessionToken(result.session);
  const response = jsonOk({
    user: { name: result.session.name, email: result.session.email },
  });
  response.headers.append("Set-Cookie", siteSessionSetCookie(token));
  return response;
}
