import { getSessionFromRequest } from "@/lib/cms/auth";
import { prisma } from "@/lib/db";

/**
 * List residential and online courses for the admin dashboard.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.page.findMany({
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

  return Response.json({ courses: pages });
}
