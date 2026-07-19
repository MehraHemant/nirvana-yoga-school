import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { db } from "@/lib/db";

/**
 * List residential and online courses for the admin dashboard.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const pages = await db.page.findMany({
    where: { type: { in: ["course", "online"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      type: true,
      title: true,
      published: true,
      updatedAt: true,
    },
  });

  return jsonOk({ courses: pages });
}
