import { authenticateSiteUser } from "@/lib/auth/site-auth";
import {
  createSiteSessionToken,
  siteSessionSetCookie,
} from "@/lib/auth/site-session";
import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";

/**
 * Public login — sets the site session cookie.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return jsonBadRequest("Email and password are required");
  }

  const session = await authenticateSiteUser(body.email, body.password);
  if (!session) {
    return jsonUnauthorized("Invalid email or password");
  }

  const token = await createSiteSessionToken(session);
  const response = jsonOk({
    user: { name: session.name, email: session.email },
  });
  response.headers.append("Set-Cookie", siteSessionSetCookie(token));
  return response;
}
