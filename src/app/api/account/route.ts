import { updateSiteUserName } from "@/lib/auth/site-auth";
import {
  createSiteSessionToken,
  getSiteServerSession,
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
 * Updates the signed-in account's name and reissues the session cookie,
 * since the name is carried in the session token.
 */
export async function PATCH(request: Request) {
  if (!isDbEnabled()) return jsonUnavailable("Database not configured");

  const session = await getSiteServerSession();
  if (!session) return jsonUnauthorized();

  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;
  if (typeof body?.name !== "string") return jsonBadRequest("Name is required");

  const result = await updateSiteUserName(session.userId, body.name);
  if (!result.ok) return jsonBadRequest(result.error);

  const token = await createSiteSessionToken({ ...session, name: result.name });
  const response = jsonOk({ name: result.name });
  response.headers.append("Set-Cookie", siteSessionSetCookie(token));
  return response;
}
