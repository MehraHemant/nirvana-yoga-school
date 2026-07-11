import { getSessionFromRequest } from "@/lib/cms/auth";
import { getLeadStats } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * Dashboard metrics for enquiries and contact queries.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbEnabled()) {
    return Response.json({
      dbEnabled: false,
      stats: null,
    });
  }

  const stats = await getLeadStats();
  return Response.json({ dbEnabled: true, stats });
}
