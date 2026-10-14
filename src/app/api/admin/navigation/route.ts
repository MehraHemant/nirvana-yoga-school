import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { db } from "@/lib/db";

/**
 * Read navigation groups and items.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const groups = await db.navigationGroup.findMany({
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { key: "asc" },
  });

  return jsonOk({ groups });
}
