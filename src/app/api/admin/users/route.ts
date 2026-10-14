import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { listSiteUsers } from "@/lib/cms/users";
import { isDbEnabled } from "@/lib/db";

/**
 * List all registered site users for the admin CMS.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonOk({ users: [], dbEnabled: false });
  }

  const users = await listSiteUsers();
  return jsonOk({ users, dbEnabled: true });
}
