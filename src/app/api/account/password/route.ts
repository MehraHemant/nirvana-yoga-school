import { changeSiteUserPassword } from "@/lib/auth/site-auth";
import { getSiteServerSession } from "@/lib/auth/site-session";
import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";

/**
 * Changes the signed-in account's password.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) return jsonUnavailable("Database not configured");

  const session = await getSiteServerSession();
  if (!session) return jsonUnauthorized();

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: string;
    newPassword?: string;
  } | null;
  if (!body?.currentPassword || !body.newPassword) {
    return jsonBadRequest("Current and new password are required");
  }

  const result = await changeSiteUserPassword(
    session.userId,
    body.currentPassword,
    body.newPassword,
  );
  if (!result.ok) return jsonBadRequest(result.error);

  return jsonOk({ ok: true });
}
