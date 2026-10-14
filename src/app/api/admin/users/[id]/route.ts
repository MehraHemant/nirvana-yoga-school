import { jsonNotFound, jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getSiteUserDetail } from "@/lib/cms/users";
import { isDbEnabled } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load one site user with their full activity history.
 */
export async function GET(
  _request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(_request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonOk({ dbEnabled: true, user: null });
  }

  const { id } = await context.params;
  const user = await getSiteUserDetail(id);

  if (!user) {
    return jsonNotFound("User not found");
  }

  return jsonOk({ dbEnabled: true, user });
}
