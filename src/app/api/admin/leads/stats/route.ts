import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { getLeadStats } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * Dashboard metrics for enquiries and contact queries.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonOk({
      dbEnabled: false,
      stats: null,
    });
  }

  const stats = await getLeadStats();
  return jsonOk({ dbEnabled: true, stats });
}
